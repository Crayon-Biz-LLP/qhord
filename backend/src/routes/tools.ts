import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.use(requireAuth);

// GET /api/tools/discover — discover active tools for a client with capabilities
router.get('/discover', async (req: Request, res: Response) => {
  try {
    const clientId = req.query.clientId as string;
    if (!clientId) {
      res.status(400).json({ error: 'clientId query parameter is required' });
      return;
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { tool_accounts: true },
    });

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const capabilityMap: Record<string, string[]> = {
      apollo: ['lead_sourcing', 'b2b_search', 'email_enrichment', 'company_search', 'contact_discovery'],
      clay: ['lead_sourcing', 'waterfall_enrichment', 'data_enrichment', 'website_scraping', 'enrichment'],
      smartlead: ['email_delivery', 'email_sequencing', 'cold_outreach', 'campaign_execution'],
      instantly: ['cold_outreach', 'campaign_automation', 'sequence_management', 'email_delivery'],
      heyreach: ['linkedin_outreach', 'social_selling', 'linkedin_automation'],
      bettercontact: ['email_enrichment', 'contact_enrichment'],
      hunter: ['email_finding', 'domain_search', 'lead_sourcing'],
      brevo: ['email_marketing', 'transactional_email', 'sms', 'crm'],
      calendly: ['scheduling', 'meeting_booking'],
      salesforce: ['crm', 'lead_management', 'pipeline_tracking'],
      hubspot: ['crm', 'lead_management', 'marketing_hub'],
    };

    const activeTools: any[] = await Promise.all(
      (client.tool_accounts || []).map(async (account) => {
        const toolName = account.tool_name.toLowerCase();
        return {
          provider: toolName,
          toolAccountId: account.id,
          isActive: true,
          capabilities: capabilityMap[toolName] || [],
          executionNode: toolName === 'apollo' || toolName === 'clay' || toolName === 'hunter'
            ? 'source_fetch'
            : toolName === 'smartlead' || toolName === 'instantly' || toolName === 'heyreach'
            ? 'delivery_push'
            : toolName === 'bettercontact' || toolName === 'clay'
            ? 'enrichment'
            : 'other',
          connectedAt: account.created_at.toISOString(),
        };
      }),
    );

    // Also list available but unconnected tools
    const envTools = ['apollo', 'clay', 'smartlead', 'instantly', 'heyreach', 'bettercontact', 'hunter', 'brevo', 'calendly'];
    for (const tool of envTools) {
      if (!activeTools.find((t) => t.provider === tool)) {
        activeTools.push({
          provider: tool,
          toolAccountId: null,
          isActive: false,
          capabilities: capabilityMap[tool] || [],
          executionNode: tool === 'apollo' || tool === 'clay' || tool === 'hunter'
            ? 'source_fetch'
            : tool === 'smartlead' || tool === 'instantly' || tool === 'heyreach'
            ? 'delivery_push'
            : tool === 'bettercontact' || tool === 'clay'
            ? 'enrichment'
            : 'other',
          connectedAt: null,
        });
      }
    }

    res.json({
      clientId,
      clientName: client.name,
      activeTools,
      totalConnected: activeTools.filter((t) => t.isActive).length,
      totalAvailable: activeTools.length,
      aiProvider: process.env.EXECUTION_MODE === 'live' ? 'groq' : 'mock',
    });
  } catch (error: any) {
    console.error('Tool discovery error:', error);
    res.status(500).json({ error: error.message || 'Failed to discover tools' });
  }
});

export default router;
