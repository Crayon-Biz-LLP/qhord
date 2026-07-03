import { AiProviderFactory } from '../ai/providers/ai-provider.factory';
import { prisma } from '../lib/prisma';

interface GeneratedNode {
  node_type: 'source' | 'enrichment' | 'ai' | 'action' | 'condition' | 'delay' | 'event';
  tool: string;
  label: string;
  configuration: Record<string, unknown>;
}

interface GeneratedEdge {
  from: number; // index of source node
  to: number;   // index of target node
  condition?: string;
}

interface GeneratedWorkflow {
  name: string;
  description?: string;
  nodes: GeneratedNode[];
  edges: GeneratedEdge[];
}

const SYSTEM_PROMPT = `You are Qhord's AI workflow architect. Given a user's natural language request and their connected tools, you generate structured workflow plans.

Available node types:
- source: Start of workflow (tool: "manual")
- enrichment: Enrich lead data (tools: clay, bettercontact)
- ai: AI processing (tools: anthropic, claude)
- action: Execute an action (tools: smartlead, instantly, heyreach, apollo, calendly)
- condition: Branch based on a condition (tools: bettercontact, replied, linkedin)
- delay: Wait for a duration (tool: "delay")
- event: Wait for an external event (tools: smartlead, instantly, calendly)

Rules:
1. Every workflow starts with a source node
2. Connect nodes sequentially with edges
3. Choose tools that match available connected tools
4. Keep workflows simple and practical (3-7 nodes max)
5. Return ONLY valid JSON, no markdown, no explanation

Response format:
{
  "name": "Workflow name",
  "description": "Brief description",
  "nodes": [
    { "node_type": "source", "tool": "manual", "label": "...", "configuration": {} },
    { "node_type": "enrichment", "tool": "clay", "label": "...", "configuration": { ... } },
    { "node_type": "ai", "tool": "anthropic", "label": "...", "configuration": { "promptTemplate": "...", "targetOutputVariable": "..." } },
    { "node_type": "action", "tool": "smartlead", "label": "...", "configuration": { ... } }
  ],
  "edges": [
    { "from": 0, "to": 1 },
    { "from": 1, "to": 2 },
    { "from": 2, "to": 3 }
  ]
}`;

export class WorkflowGeneratorService {
  async generateFromPrompt(prompt: string, clientId: string): Promise<GeneratedWorkflow> {
    // Get connected tools for this client
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        tool_accounts: true,
        brand_brain: true,
      },
    });

    if (!client) throw new Error('Client not found');

    const connectedTools = client.tool_accounts.map((t) => t.tool_name);
    const brandContext = client.brand_brain?.data_text
      ? `\nBrand context:\n${client.brand_brain.data_text.substring(0, 500)}`
      : '';

    const toolsContext = connectedTools.length > 0
      ? `\nConnected tools available: ${connectedTools.join(', ')}`
      : '\nNo tools connected yet. User may need to connect tools first.';

    const userMessage = `User request: "${prompt}"${toolsContext}${brandContext}\n\nGenerate an optimized workflow plan.`;

    // For mock mode, return a pre-built template
    const mode = process.env.EXECUTION_MODE || 'auto';
    if (mode === 'mock') {
      return this.generateMockWorkflow(prompt, connectedTools);
    }

    // Call AI provider to generate workflow
    const response = await AiProviderFactory.chat('auto', {
      messages: [{ role: 'user', content: userMessage }],
      system: SYSTEM_PROMPT,
      maxTokens: 2000,
      temperature: 0.3,
    });

    let workflow: GeneratedWorkflow;
    try {
      // Extract JSON from response (handle potential markdown wrapping)
      const cleaned = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      workflow = JSON.parse(cleaned) as GeneratedWorkflow;
    } catch {
      throw new Error('AI returned invalid workflow format. Please try again.');
    }

    if (!workflow.nodes || workflow.nodes.length < 2) {
      throw new Error('Generated workflow has insufficient nodes. Please be more specific.');
    }

    return workflow;
  }

  async saveWorkflow(
    workflow: GeneratedWorkflow,
    clientId: string,
    operatorId: string,
    campaignId?: string,
  ) {
    // Ensure a campaign exists for the workflow
    let targetCampaignId = campaignId;
    if (!targetCampaignId) {
      const campaign = await prisma.campaign.create({
        data: {
          client_id: clientId,
          name: workflow.name,
          description: workflow.description || 'AI-generated campaign',
          created_by_operator_id: operatorId,
          status: 'draft',
          approval_status: 'draft',
        },
      });
      targetCampaignId = campaign.id;
    }

    const dbWorkflow = await prisma.campaignWorkflow.create({
      data: {
        campaign_id: targetCampaignId,
        workflow_name: workflow.name,
        created_by: operatorId,
        status: 'draft',
      },
    });

    const nodeIdMap = new Map<number, string>();

    for (let i = 0; i < workflow.nodes.length; i++) {
      const n = workflow.nodes[i];
      const node = await prisma.workflowNode.create({
        data: {
          workflow_id: dbWorkflow.id,
          node_type: n.node_type,
          tool: n.tool,
          configuration_json: n.configuration as any,
          position: { x: i * 200, y: 100 },
        },
      });
      nodeIdMap.set(i, node.id);
    }

    for (const e of workflow.edges) {
      const sourceId = nodeIdMap.get(e.from);
      const targetId = nodeIdMap.get(e.to);
      if (sourceId && targetId) {
        await prisma.workflowEdge.create({
          data: {
            workflow_id: dbWorkflow.id,
            source_node_id: sourceId,
            target_node_id: targetId,
            condition_type: e.condition || 'default',
          },
        });
      }
    }

    return dbWorkflow;
  }

  private generateMockWorkflow(prompt: string, connectedTools: string[]): GeneratedWorkflow {
    const hasApollo = connectedTools.includes('apollo');
    const hasClay = connectedTools.includes('clay');
    const hasSmartlead = connectedTools.includes('smartlead') || connectedTools.includes('instantly');

    const nodes: GeneratedNode[] = [{ node_type: 'source', tool: 'manual', label: 'Start', configuration: {} }];
    const edges: GeneratedEdge[] = [];

    // Detect intent from prompt
    const lower = prompt.toLowerCase();

    if (lower.includes('find') || lower.includes('search') || lower.includes('discover')) {
      if (hasApollo) {
        nodes.push({
          node_type: 'action', tool: 'apollo',
          label: 'Search leads in Apollo', configuration: { action: 'search', query: prompt },
        });
        edges.push({ from: 0, to: 1 });
      }
    }

    if (lower.includes('enrich') || lower.includes('enrichment') || lower.includes('data')) {
      const idx = nodes.length;
      if (hasClay) {
        nodes.push({
          node_type: 'enrichment', tool: 'clay',
          label: 'Enrich lead data', configuration: { enrichment_type: 'company' },
        });
        edges.push({ from: edges.length > 0 ? edges[edges.length - 1].to : 0, to: idx });
      }
    }

    if (lower.includes('personalize') || lower.includes('icebreaker') || lower.includes('ai') || lower.includes('customize')) {
      const idx = nodes.length;
      nodes.push({
        node_type: 'ai', tool: 'anthropic',
        label: 'AI personalization', configuration: {
          promptTemplate: 'Write a personalized icebreaker for {{first_name}} at {{company_name}} highlighting relevant {{industry}} insights.',
          targetOutputVariable: 'ai_icebreaker',
        },
      });
      edges.push({ from: edges.length > 0 ? edges[edges.length - 1].to : 0, to: idx });
    }

    if (lower.includes('email') || lower.includes('campaign') || lower.includes('send') || lower.includes('outreach') || hasSmartlead) {
      const idx = nodes.length;
      const tool = hasSmartlead ? (connectedTools.includes('smartlead') ? 'smartlead' : 'instantly') : 'smartlead';
      nodes.push({
        node_type: 'action', tool,
        label: `Send email campaign via ${tool}`, configuration: { action: 'enroll' },
      });
      edges.push({ from: edges.length > 0 ? edges[edges.length - 1].to : 0, to: idx });
    }

    // If no specific intent matched, create a default pipeline
    if (nodes.length === 1) {
      if (hasApollo) {
        nodes.push({ node_type: 'action', tool: 'apollo', label: 'Search leads', configuration: { action: 'search' } });
        edges.push({ from: 0, to: 1 });
      }
      if (hasClay) {
        nodes.push({ node_type: 'enrichment', tool: 'clay', label: 'Enrich leads', configuration: {} });
        edges.push({ from: nodes.length - 2, to: nodes.length - 1 });
      }
      nodes.push({
        node_type: 'action', tool: hasSmartlead ? 'smartlead' : 'instantly',
        label: 'Send campaign', configuration: { action: 'enroll' },
      });
      edges.push({ from: nodes.length - 2, to: nodes.length - 1 });
    }

    return {
      name: `AI Generated: ${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}`,
      description: `Auto-generated workflow from: ${prompt}`,
      nodes,
      edges,
    };
  }
}

export const workflowGenerator = new WorkflowGeneratorService();
