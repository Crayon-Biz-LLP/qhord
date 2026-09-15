import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

// Gojiberry AI External API — https://ext.gojiberry.ai/documentation (OpenAPI spec at /openapi.json)
// Auth: Bearer token via `Authorization` header.

function parseJsonField(value: any, fieldLabel: string): { data?: any; error?: string } {
  if (value === undefined || value === null || value === '') {
    return { error: `${fieldLabel} is required.` };
  }
  if (typeof value !== 'string') {
    return { data: value };
  }
  try {
    return { data: JSON.parse(value) };
  } catch {
    return { error: `${fieldLabel} must be valid JSON.` };
  }
}

function splitIds(value: any): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

export class GojiberryProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      const creds = await this.getCredentials('Gojiberry', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      const gojiberryClient = axios.create({
        baseURL: 'https://ext.gojiberry.ai',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      switch (node.action) {
        case 'import_contacts': {
          const { data: contacts, error } = parseJsonField(config.contacts, 'Contacts (JSON array)');
          if (error) return { status: 'failed', error };
          if (!Array.isArray(contacts) || contacts.length === 0) {
            return { status: 'failed', error: 'Contacts must be a non-empty JSON array.' };
          }

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Gojiberry import_contacts execution.`);
            return { status: 'completed', output: { imported: contacts.length, contacts } };
          }

          const created: any[] = [];
          for (const contact of contacts) {
            const payload = { ...contact, listId: config.listId || contact.listId };
            const response = await gojiberryClient.post('/v1/contact', payload);
            created.push(response.data);
          }
          return { status: 'completed', output: { imported: created.length, contacts: created } };
        }

        case 'export_contacts': {
          if (!config.listId) {
            return { status: 'failed', error: 'Missing listId for Gojiberry export_contacts action.' };
          }

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Gojiberry export_contacts execution.`);
            return { status: 'completed', output: { contacts: [{ id: 1, firstName: 'Test', lastName: 'Contact' }] } };
          }

          const response = await gojiberryClient.get('/v1/contact', {
            params: {
              listId: config.listId,
              limit: config.limit ? Number(config.limit) : undefined
            }
          });
          return { status: 'completed', output: response.data };
        }

        case 'sync_leads': {
          if (!config.listId) {
            return { status: 'failed', error: 'Missing listId for Gojiberry sync_leads action.' };
          }
          const contactIds = splitIds(config.contactIds).map(Number).filter((n) => !Number.isNaN(n));
          if (contactIds.length === 0) {
            return { status: 'failed', error: 'contactIds must be a non-empty comma-separated list of contact IDs.' };
          }

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Gojiberry sync_leads execution.`);
            return { status: 'completed', output: { success: true, listId: config.listId, synced: contactIds.length } };
          }

          const response = await gojiberryClient.post(`/v1/contact/list/${config.listId}/contacts`, { contactIds });
          return { status: 'completed', output: response.data || { success: true, synced: contactIds.length } };
        }

        case 'update_contact': {
          if (!config.contactId) {
            return { status: 'failed', error: 'Missing contactId for Gojiberry update_contact action.' };
          }

          const payload: Record<string, any> = {};
          for (const field of ['email', 'phone', 'jobTitle', 'company', 'note'] as const) {
            if (config[field] !== undefined && config[field] !== '') payload[field] = config[field];
          }

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Gojiberry update_contact execution.`);
            return { status: 'completed', output: { id: config.contactId, ...payload } };
          }

          const response = await gojiberryClient.patch(`/v1/contact/${config.contactId}`, payload);
          return { status: 'completed', output: response.data };
        }

        case 'create_campaign': {
          if (!config.name) {
            return { status: 'failed', error: 'Missing campaign name for Gojiberry create_campaign action.' };
          }
          const listIds = splitIds(config.listIds);
          if (listIds.length === 0) {
            return { status: 'failed', error: 'listIds must be a non-empty comma-separated list of Gojiberry list IDs.' };
          }
          const { data: steps, error: stepsError } = parseJsonField(config.steps, 'Steps (JSON)');
          if (stepsError) return { status: 'failed', error: stepsError };

          const payload: Record<string, any> = { name: config.name, listIds, steps };
          if (config.language) payload.language = config.language;

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Gojiberry create_campaign execution.`);
            return { status: 'completed', output: { id: 'test_campaign_123', name: config.name, listIds, steps } };
          }

          const response = await gojiberryClient.post('/v1/campaign', payload);
          return { status: 'completed', output: response.data };
        }

        default:
          return {
            status: 'failed',
            error: `Action '${node.action}' is not supported yet for Gojiberry.`
          };
      }
    } catch (error: any) {
      console.error('[GojiberryProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Gojiberry');
    }
  }
}
