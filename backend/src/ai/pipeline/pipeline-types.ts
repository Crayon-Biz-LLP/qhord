import type { ToolName } from '../../types';

/** Normalized lead passed between Apollo → Clay → Smartlead steps */
export interface PipelineLead {
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string;
  title?: string;
  linkedin_url?: string;
  industry?: string;
}

export interface PipelineContext {
  leads: PipelineLead[];
  campaignId?: number | string;
  clayJobId?: string;
  metadata: Record<string, unknown>;
}

export interface ManifestStepLike {
  id?: string;
  order?: number;
  tool: string;
  action: string;
  params: Record<string, unknown>;
  dependencies?: string[];
}

export interface ResolvedExecutionStep {
  /** Original manifest step id (for logging) */
  manifestStepId?: string;
  tool: ToolName;
  action: string;
  payload: Record<string, unknown>;
  /** Human-readable label for progress UI */
  label: string;
  /** Skip ExecutionEngine (e.g. warmup wait) */
  skipExecution?: boolean;
  /** Simulated wait in ms when skipExecution */
  waitMs?: number;
}

export function emptyPipelineContext(): PipelineContext {
  return { leads: [], metadata: {} };
}

export function normalizeToolName(tool: string): ToolName | null {
  const key = tool.trim().toLowerCase();
  if (key === 'apollo') return 'apollo';
  if (key === 'clay') return 'clay';
  if (key === 'smartlead') return 'smartlead';
  if (key === 'heyreach') return 'heyreach';
  if (key === 'hunter') return 'hunter';
  if (key === 'brevo') return 'brevo';
  if (key === 'bettercontacts') return 'bettercontacts';
  if (key === 'calendly') return 'calendly';
  if (key === 'instantly') return 'instantly';
  if (key === 'hubspot') return 'hubspot';
  if (key === 'salesforce') return 'salesforce';
  return null;
}
