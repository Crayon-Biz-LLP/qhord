import { prisma } from '../lib/prisma';
import { nodeProcessorFactory } from './nodes';
import { WorkflowNode, WorkflowEdge } from '@prisma/client';

export class WorkflowEngine {
  async executeRun(runId: string, isTestMode: boolean = false) {
    const run = await prisma.workflowRun.findUnique({
      where: { id: runId },
      include: { workflow: true }
    });

    if (!run) throw new Error('Run not found');

    const nodes = await prisma.workflowNode.findMany({ where: { workflow_id: run.workflow_id } });
    const edges = await prisma.workflowEdge.findMany({ where: { workflow_id: run.workflow_id } });

    // Mark run as running
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: 'running', startedAt: new Date() }
    });

    const testTrace: string[] = [];

    try {
      // Find trigger node
      const triggerNode = nodes.find(n => n.node_type === 'trigger');
      if (!triggerNode) throw new Error('No trigger node found');

      // State to hold outputs
      const previousOutputs: Record<string, any> = {};

      if (run.triggerPayload) {
        previousOutputs[triggerNode.id] = run.triggerPayload;
      }

      if (isTestMode) {
        let mockPayload = {};
        testTrace.push(`Processing trigger: ${triggerNode.tool}`);
        if (triggerNode.tool === 'webhook') {
            testTrace.push('Mocking Webhook payload');
            mockPayload = { body: { email: "test@example.com", first_name: "John", company: "Acme Corp" } };
        } else if (triggerNode.tool?.startsWith('campaign_')) {
            testTrace.push('Mocking Campaign payload');
            mockPayload = { campaign: { id: "camp_123", name: "Test Campaign" } };
        } else if (triggerNode.tool === 'reply_received') {
            testTrace.push('Mocking Reply payload');
            mockPayload = { reply: { email: "lead@example.com", text: "I am interested", contact_id: "cont_123" } };
        } else if (triggerNode.tool === 'meeting_booked') {
            testTrace.push('Mocking Meeting payload');
            mockPayload = { meeting: { id: "meet_123", email: "lead@example.com", start_time: new Date().toISOString() } };
        } else if (triggerNode.tool === 'run_on_schedule') {
            testTrace.push('Validating Schedule configuration (Test mode)');
            mockPayload = { schedule: { executed_at: new Date().toISOString() } };
        } else if (triggerNode.tool === 'deal_created' || triggerNode.tool === 'deal_updated') {
            testTrace.push('Mocking Deal payload');
            mockPayload = { deal: { id: "deal_123", amount: 5000, name: "Acme Q4 Expansion" } };
        } else if (triggerNode.tool === 'email_opened' || triggerNode.tool === 'email_clicked') {
            testTrace.push('Mocking Email event payload');
            mockPayload = { contact: { email: "lead@example.com", first_name: "Jane" } };
        } else if (triggerNode.tool === 'manual_trigger') {
            testTrace.push('Triggered manually');
            mockPayload = { manual: { executed_at: new Date().toISOString() } };
        }
        previousOutputs[triggerNode.id] = mockPayload;
      }

      previousOutputs['trigger'] = previousOutputs[triggerNode.id] || {};

      await this.processNode(triggerNode.id, nodes, edges, runId, run.workflow.client_id, previousOutputs, isTestMode, testTrace);

      await this.finalizeRun(runId);

      return { success: true, trace: testTrace };
    } catch (error: any) {
      console.error(`Run ${runId} failed:`, error);
      await prisma.workflowRun.update({
        where: { id: runId },
        data: { status: 'failed', completedAt: new Date(), error_message: error.message }
      });
      return { success: false, error: error.message, trace: testTrace };
    }
  }

  private async finalizeRun(runId: string): Promise<void> {
    const waitingSteps = await prisma.workflowRunStep.count({
      where: { run_id: runId, status: 'waiting_event' }
    });

    if (waitingSteps > 0) {
      await prisma.workflowRun.update({
        where: { id: runId },
        data: { status: 'held', completedAt: new Date() }
      });
    } else {
      await prisma.workflowRun.update({
        where: { id: runId },
        data: { status: 'completed', completedAt: new Date() }
      });
    }
  }

  // Computes the absolute time a Delay node should resume at, based on its configured mode.
  // Returns null if the config can't produce a valid time (caller should fail the run clearly
  // rather than silently parking it forever).
  private computeDelayResumeAt(config: any, previousOutputs: Record<string, any>): Date | null {
    const mode = config.mode || 'duration';
    const now = new Date();

    if (mode === 'duration') {
      const amount = Number(config.amount);
      if (!amount || amount <= 0) return null;
      const msPerUnit: Record<string, number> = { minutes: 60_000, hours: 3_600_000, days: 86_400_000, weeks: 604_800_000 };
      return new Date(now.getTime() + amount * (msPerUnit[config.unit] || msPerUnit.days));
    }

    if (mode === 'date_variable') {
      const raw = this.resolveVariable(config.dateVariable, previousOutputs);
      if (!raw) return null;
      const base = new Date(raw);
      if (isNaN(base.getTime())) return null;
      const offsetDays = Number(config.offsetDays) || 0;
      return new Date(base.getTime() + offsetDays * 86_400_000);
    }

    if (mode === 'recurring_day') {
      if (config.recurrence === 'monthly') {
        const dayOfMonth = Math.min(Math.max(parseInt(config.dayOfMonth, 10) || 1, 1), 28);
        let target = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, 0, 0, 0, 0);
        if (target <= now) target = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth, 0, 0, 0, 0);
        return target;
      }
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const targetDow = days.indexOf(config.dayOfWeek || 'Mon');
      if (targetDow < 0) return null;
      const target = new Date(now);
      target.setHours(0, 0, 0, 0);
      let diff = (targetDow - target.getDay() + 7) % 7;
      if (diff === 0) diff = 7; // next occurrence, not "today" again
      target.setDate(target.getDate() + diff);
      return target;
    }

    if (mode === 'specific_date') {
      if (!config.date) return null;
      const d = new Date(`${config.date}T${config.time || '00:00'}:00`);
      return isNaN(d.getTime()) ? null : d;
    }

    return null;
  }

  // Scans for parked Delay steps whose resume time has arrived and continues their run.
  // Intended to be called on a recurring schedule (see queue/workflow-queue.ts).
  async resumeDueDelays(): Promise<void> {
    const now = new Date();
    const dueSteps = await prisma.workflowRunStep.findMany({
      where: { status: 'waiting_event', node: { tool: 'delay' } },
      include: { run: { include: { workflow: true } } }
    });

    for (const step of dueSteps) {
      const resumeAtRaw = (step.input_json as any)?.resumeAt;
      if (!resumeAtRaw) continue;
      const resumeAt = new Date(resumeAtRaw);
      if (isNaN(resumeAt.getTime()) || resumeAt > now) continue;

      const runId = step.run_id;
      try {
        const nodes = await prisma.workflowNode.findMany({ where: { workflow_id: step.run.workflow_id } });
        const edges = await prisma.workflowEdge.findMany({ where: { workflow_id: step.run.workflow_id } });

        // Rebuild context from every step that has already completed in this run —
        // the in-memory previousOutputs from the original executeRun call is long gone.
        const completedSteps = await prisma.workflowRunStep.findMany({
          where: { run_id: runId, status: 'completed' }
        });
        const previousOutputs: Record<string, any> = {};
        for (const s of completedSteps) {
          previousOutputs[s.node_id] = s.output_json;
        }
        const triggerNode = nodes.find(n => n.node_type === 'trigger');
        if (triggerNode) {
          previousOutputs['trigger'] = previousOutputs[triggerNode.id] || step.run.triggerPayload || {};
        }

        await prisma.workflowRunStep.update({
          where: { id: step.id },
          data: { status: 'completed', completed_at: new Date() }
        });
        await prisma.workflowRun.update({ where: { id: runId }, data: { status: 'running' } });

        const testTrace: string[] = [];
        const outgoingEdges = edges.filter(e => e.source_node_id === step.node_id);
        for (const edge of outgoingEdges) {
          await this.processNode(edge.target_node_id, nodes, edges, runId, step.run.workflow.client_id, previousOutputs, false, testTrace);
        }

        await this.finalizeRun(runId);
      } catch (error: any) {
        console.error(`[WorkflowEngine] Failed to resume delayed step ${step.id}:`, error);
        await prisma.workflowRunStep.update({
          where: { id: step.id },
          data: { status: 'failed', error_message: error.message, completed_at: new Date() }
        });
        await prisma.workflowRun.update({
          where: { id: runId },
          data: { status: 'failed', completedAt: new Date(), error_message: error.message }
        });
      }
    }
  }

  private resolveVariable(field: string, context: Record<string, any>, testTrace?: string[]): any {
    if (!field || typeof field !== 'string') return field;
    
    // Check if it's actually a template variable like {{trigger.email}}
    if (!field.includes('{{') && !field.includes('}}')) {
      return field; // Treat as literal string
    }

    const path = field.replace(/[{}]/g, ''); 
    const parts = path.trim().split('.');
    let current: any = context;
    for (const part of parts) {
      if (current === undefined || current === null) {
        console.warn(`[WorkflowEngine] Variable ${field} could not be resolved. Missing property '${part}'.`);
        if (testTrace) testTrace.push(`s Warning: Could not resolve variable ${field} at '${part}'`);
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  private evaluateCondition(cond: any, context: Record<string, any>, testTrace?: string[]): boolean {
    const actualValue = this.resolveVariable(cond.field, context, testTrace);
    const expectedValue = cond.value;

    const actualStr = actualValue !== undefined && actualValue !== null ? String(actualValue).toLowerCase() : "";
    const expectedStr = expectedValue !== undefined && expectedValue !== null ? String(expectedValue).toLowerCase() : "";
    
    const actualNum = Number(actualValue);
    const expectedNum = Number(expectedValue);

    switch (cond.operator) {
      // Text
      case 'equals': return actualStr === expectedStr;
      case 'not_equals': return actualStr !== expectedStr;
      case 'contains': return actualStr.includes(expectedStr);
      case 'not_contains': return !actualStr.includes(expectedStr);
      case 'starts_with': return actualStr.startsWith(expectedStr);
      case 'ends_with': return actualStr.endsWith(expectedStr);
      case 'is_empty': return actualStr === "";
      case 'is_not_empty': return actualStr !== "";
      
      // Number
      case 'num_equals': return actualNum === expectedNum;
      case 'num_not_equals': return actualNum !== expectedNum;
      case 'greater_than': return actualNum > expectedNum;
      case 'greater_than_or_equal': return actualNum >= expectedNum;
      case 'less_than': return actualNum < expectedNum;
      case 'less_than_or_equal': return actualNum <= expectedNum;

      // Boolean
      case 'is_true': return actualValue === true || actualStr === 'true';
      case 'is_false': return actualValue === false || actualStr === 'false';

      // Exists
      case 'exists': return actualValue !== undefined && actualValue !== null && actualValue !== '';
      case 'not_exists': return actualValue === undefined || actualValue === null || actualValue === '';

      // Date (naive implementation)
      case 'before': return new Date(actualValue) < new Date(expectedValue);
      case 'after': return new Date(actualValue) > new Date(expectedValue);
      case 'on': return new Date(actualValue).toDateString() === new Date(expectedValue).toDateString();
      case 'between': {
        const [start, end] = String(expectedValue).split(',');
        const d = new Date(actualValue);
        return d >= new Date(start?.trim()) && d <= new Date(end?.trim());
      }

      default: return false;
    }
  }

  private evaluateConditionGroup(matchType: string, conditions: any[], context: Record<string, any>, testTrace?: string[]): boolean {
    if (!conditions || conditions.length === 0) return true;
    if (matchType === 'OR') {
      return conditions.some(c => this.evaluateCondition(c, context, testTrace));
    }
    return conditions.every(c => this.evaluateCondition(c, context, testTrace));
  }

  private async processNode(
    nodeId: string, 
    nodes: WorkflowNode[], 
    edges: WorkflowEdge[], 
    runId: string, 
    clientId: string,
    previousOutputs: Record<string, any>,
    isTestMode: boolean,
    testTrace: string[]
  ): Promise<void> {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (isTestMode) {
      testTrace.push(`Starting node: ${node.tool} / ${node.action}`);
    }

    const isLogicNode = [
      'if_else', 'branch', 'multi_split', 'filter', 
      'delay', 'wait', 'loop', 'merge', 'end_workflow'
    ].includes(node.tool);

    let outputJson: any = null;

    if (node.node_type !== 'trigger' && !isLogicNode) {
      // Execute standard action processor
      const step = await prisma.workflowRunStep.create({
        data: {
          run_id: runId,
          node_id: node.id,
          status: 'running',
          started_at: new Date(),
          input_json: previousOutputs
        }
      });

      const processor = nodeProcessorFactory.getProcessor(node.tool);
      
      try {
        const result = await processor.execute(node, previousOutputs, {
          prisma,
          runId,
          workflowId: node.workflow_id,
          clientId,
          previousOutputs,
          isTestMode,
          testTrace
        });

        await prisma.workflowRunStep.update({
          where: { id: step.id },
          data: {
            status: result.status,
            output_json: result.output,
            error_message: result.error,
            error_code: result.errorCode,
            completed_at: new Date()
          }
        });

        if (result.status === 'failed') {
          if (isTestMode) testTrace.push(`❌ Node failed: ${result.error}`);
          throw new Error(`Node ${node.id} failed: ${result.error}`);
        }

        if (isTestMode) testTrace.push(`✓ Node executed successfully.`);
        previousOutputs[node.id] = result.output;
      } catch (error: any) {
        await prisma.workflowRunStep.update({
          where: { id: step.id },
          data: {
            status: 'failed',
            error_message: error.message,
            completed_at: new Date()
          }
        });
        throw error;
      }
    } else if (isLogicNode) {
       // Logic Processing
       const config = node.configuration_json as any;
       
       if (node.tool === 'end_workflow') {
         if (isTestMode) testTrace.push(`✓ End Workflow reached. Stopping path.`);
         return; 
       }
       
       if (node.tool === 'delay' || node.tool === 'wait') {
         if (isTestMode) {
           testTrace.push(`✓ Simulated wait/delay for test mode.`);
         } else if (node.tool === 'delay') {
           // Delay nodes resume automatically once resumeAt has passed (see resumeDueDelays,
           // polled by a recurring queue job in queue/workflow-queue.ts).
           const resumeAt = this.computeDelayResumeAt(config, previousOutputs);
           if (!resumeAt) {
             throw new Error('Could not compute a valid resume time for this Delay node — check its configuration.');
           }
           await prisma.workflowRunStep.create({
              data: {
                run_id: runId,
                node_id: node.id,
                status: 'waiting_event',
                started_at: new Date(),
                input_json: { ...config, resumeAt: resumeAt.toISOString() }
              }
           });
           return;
         } else {
           // 'wait' (wait for condition / external event): resumption is not implemented yet —
           // the run parks in 'held' status until that's built.
           await prisma.workflowRunStep.create({
              data: {
                run_id: runId,
                node_id: node.id,
                status: 'waiting_event',
                started_at: new Date(),
                input_json: config
              }
           });
           return;
         }
       }

       if (node.tool === 'merge') {
         const isAny = config.mode === 'any';
         if (isTestMode) {
           testTrace.push(`✓ Merge node continuing in test mode.`);
         } else {
           // Guard against firing downstream more than once for this run: with "any" mode,
           // every branch that completes would otherwise re-satisfy the >=1 check and
           // re-trigger everything after the merge. Recording a completed step for the
           // merge node itself makes each branch's arrival idempotent.
           const alreadyMerged = await prisma.workflowRunStep.findFirst({
             where: { run_id: runId, node_id: node.id, status: 'completed' }
           });
           if (alreadyMerged) {
             return;
           }

           const inEdges = edges.filter(e => e.target_node_id === node.id);
           const completedSteps = await prisma.workflowRunStep.count({
             where: {
               run_id: runId,
               node_id: { in: inEdges.map(e => e.source_node_id) },
               status: 'completed'
             }
           });

           if (isAny && completedSteps < 1) {
             return;
           }
           if (!isAny && completedSteps < inEdges.length) {
             // Not all paths have arrived yet
             return;
           }

           await prisma.workflowRunStep.create({
             data: { run_id: runId, node_id: node.id, status: 'completed', started_at: new Date(), completed_at: new Date() }
           });
         }
       }

       if (node.tool === 'loop') {
         const collection = this.resolveVariable(config.collection, previousOutputs);
         if (!Array.isArray(collection)) {
           if (isTestMode) testTrace.push(`❌ Loop collection is not an array.`);
           throw new Error(`Loop collection is not an array: ${config.collection}`);
         }
         
         if (isTestMode) testTrace.push(`✓ Starting loop over ${collection.length} items.`);
         
         // In Test Mode we only process the first item to prevent infinite/massive traces
         const items = isTestMode ? collection.slice(0, 1) : collection;
         const outgoingEdges = edges.filter(e => e.source_node_id === node.id);
         
         for (let i = 0; i < items.length; i++) {
           const item = items[i];
           // Isolate context
           const isolatedContext = { ...previousOutputs, loop: { item, index: i, count: items.length } };
           
           for (const edge of outgoingEdges) {
             await this.processNode(edge.target_node_id, nodes, edges, runId, clientId, isolatedContext, isTestMode, testTrace);
           }
         }
         return; // Loop handles its own downstream routing
       }
    }

    // Branching Logic for Filter, If/Else, Branch, Multi Split
    const outgoingEdges = edges.filter(e => e.source_node_id === node.id);
    if (outgoingEdges.length === 0) return;

    const config = node.configuration_json as any;
    let selectedHandles: string[] = [];

    if (node.tool === 'filter') {
      const match = this.evaluateConditionGroup(config.matchType || 'AND', config.conditions || [], previousOutputs, testTrace);
      if (match) {
        if (isTestMode) testTrace.push(`✓ Filter passed.`);
        selectedHandles = ['default'];
      } else {
        if (isTestMode) testTrace.push(`⚠ Filter failed. Execution stopped.`);
        return;
      }
    } else if (node.tool === 'if_else') {
      const match = this.evaluateConditionGroup(config.matchType || 'AND', config.conditions || [], previousOutputs, testTrace);
      selectedHandles = [match ? 'true' : 'false'];
      if (isTestMode) {
        testTrace.push(`✓ If/Else evaluated to ${match ? 'TRUE' : 'FALSE'}.`);
        testTrace.push(`⚠ SKIPPED - condition branch not selected: ${match ? 'FALSE' : 'TRUE'}`);
      }
    } else if (node.tool === 'branch') {
      let matched = false;
      const branches = config.branches || [];
      for (const b of branches) {
        if (this.evaluateCondition(b, previousOutputs, testTrace)) {
          selectedHandles = [b.id];
          matched = true;
          if (isTestMode) testTrace.push(`✓ Branch matched: ${b.name}`);
          break;
        }
      }
      if (!matched) {
        selectedHandles = ['fallback'];
        if (isTestMode) testTrace.push(`✓ Branch matched: Fallback`);
      }
    } else if (node.tool === 'multi_split') {
      const actualValue = this.resolveVariable(config.evaluateField, previousOutputs);
      let matched = false;
      const cases = config.cases || [];
      for (const c of cases) {
        if (actualValue == c.value) {
          selectedHandles = [c.id];
          matched = true;
          if (isTestMode) testTrace.push(`✓ Multi Split matched case: ${c.label}`);
          break;
        }
      }
      if (!matched) {
        selectedHandles = ['fallback'];
        if (isTestMode) testTrace.push(`✓ Multi Split matched Fallback`);
      }
    } else {
      selectedHandles = ['default']; // normal nodes
    }

    for (const edge of outgoingEdges) {
      const handle = edge.branchKey || 'default';
      if (selectedHandles.includes(handle)) {
        await this.processNode(edge.target_node_id, nodes, edges, runId, clientId, previousOutputs, isTestMode, testTrace);
      }
    }
  }
}

export const workflowEngine = new WorkflowEngine();
