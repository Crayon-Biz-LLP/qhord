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

      // Check if any step is waiting
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
         } else {
           // Persist waiting state and halt execution
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
         // Check completed paths
         const inEdges = edges.filter(e => e.target_node_id === node.id);
         const completedSteps = await prisma.workflowRunStep.count({
           where: {
             run_id: runId,
             node_id: { in: inEdges.map(e => e.source_node_id) },
             status: 'completed'
           }
         });
         
         const isAny = config.mode === 'any';
         if (isTestMode) {
           testTrace.push(`✓ Merge node continuing in test mode.`);
         } else {
           if (isAny && completedSteps < 1) {
             return;
           }
           if (!isAny && completedSteps < inEdges.length) {
             // Not all paths have arrived yet
             return;
           }
           // Record merge completion so downstream doesn't fire multiple times if "all" 
           // In a real robust engine we'd check if this merge already ran for this execution pass.
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
