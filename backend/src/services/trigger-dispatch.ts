import { prisma } from '../lib/prisma';
import { workflowEngine } from './workflowEngine';

// The builder only ever creates one kind of trigger node (tool:
// "workflow_trigger") — what it actually triggers ON lives in the node's
// config (triggerType: 'schedule' | 'event', plus scheduleConfig /
// eventConfig), not in node.tool. This mirrors the same config shape
// ConfigPanel.tsx reads/writes for a trigger node.
const EVENTS_WITH_CAMPAIGN_CONTEXT = new Set([
  'email_sent', 'email_opened', 'email_clicked', 'email_replied', 'email_bounced', 'contact_enrolled_sequence'
]);

async function startRun(workflowId: string, triggerSource: string, triggerPayload: unknown) {
  const run = await prisma.workflowRun.create({
    data: { workflow_id: workflowId, status: 'pending', triggerSource, triggerPayload: triggerPayload as any }
  });
  await workflowEngine.executeRun(run.id).catch((err) =>
    console.error(`[trigger-dispatch] Run ${run.id} for workflow ${workflowId} failed:`, err)
  );
}

async function getActiveWorkflowsWithTrigger(clientId: string) {
  return prisma.workflow.findMany({
    where: { client_id: clientId, status: 'active', isActive: true },
    include: { nodes: true }
  });
}

/**
 * Fires every active workflow (for this client) whose trigger is configured
 * for this event — e.g. a deal being created/updated, or a campaign send
 * actually going out. Call this from the place in the app that owns that
 * event; nothing dispatches these automatically on its own.
 */
export async function fireEventTrigger(
  clientId: string,
  eventId: string,
  payload: unknown,
  opts: { campaignId?: string; senderOperatorId?: string } = {}
): Promise<void> {
  const workflows = await getActiveWorkflowsWithTrigger(clientId);

  for (const wf of workflows) {
    const triggerNode = wf.nodes.find((n) => n.node_type === 'trigger');
    if (!triggerNode) continue;

    const config = (triggerNode.configuration_json as any) || {};
    if (config.triggerType !== 'event') continue;

    const eventConfig = config.eventConfig || {};
    if (eventConfig.eventId !== eventId) continue;

    if (EVENTS_WITH_CAMPAIGN_CONTEXT.has(eventId)) {
      const campaignIds: string[] = eventConfig.campaignIds || [];
      if (campaignIds.length > 0 && opts.campaignId && !campaignIds.includes(opts.campaignId)) continue;

      const senderOperatorId = eventConfig.senderOperatorId;
      if (senderOperatorId && opts.senderOperatorId && senderOperatorId !== opts.senderOperatorId) continue;
    }

    await startRun(wf.id, eventId, payload);
  }
}

function msPerDay() { return 86_400_000; }

/** Computes whether a schedule-trigger workflow is due to fire right now,
 * given its scheduleConfig and the last time it actually fired (if ever).
 * Deliberately approximate for the weekly-active-days case — see note below
 * — rather than a full cron engine, matching what the builder UI exposes. */
function isScheduleDue(scheduleConfig: any, createdAt: Date, lastFiredAt: Date | null, now: Date): boolean {
  if (scheduleConfig.hasEndDate && scheduleConfig.endDateTime) {
    const end = new Date(scheduleConfig.endDateTime);
    if (!isNaN(end.getTime()) && now > end) return false;
  }

  const effectiveStart =
    scheduleConfig.startType === 'scheduled' && scheduleConfig.startDateTime
      ? new Date(scheduleConfig.startDateTime)
      : createdAt;
  if (!isNaN(effectiveStart.getTime()) && now < effectiveStart) return false;

  if (scheduleConfig.frequencyType !== 'recurring') {
    // 'once' — fire exactly one time, the first poll after it's due.
    return !lastFiredAt;
  }

  const intervalValue = Number(scheduleConfig.intervalValue) || 1;
  const intervalMs = intervalValue * (scheduleConfig.intervalUnit === 'weeks' ? 7 * msPerDay() : msPerDay());
  const activeDays: string[] = scheduleConfig.activeDays || [];

  if (!lastFiredAt) return true;

  const nextDue = new Date(lastFiredAt.getTime() + intervalMs);
  if (now < nextDue) return false;

  if (scheduleConfig.intervalUnit === 'weeks' && activeDays.length > 0) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = days[now.getDay()];
    if (!activeDays.includes(today)) return false;
    // Don't fire twice for the same calendar day once it's already run today.
    if (lastFiredAt.toDateString() === now.toDateString()) return false;
  }

  return true;
}

/** Scans active schedule-trigger workflows and fires the ones that are due.
 * Intended to be polled on a recurring interval (see queue/workflow-queue.ts). */
export async function runDueScheduledTriggers(): Promise<void> {
  const now = new Date();
  const workflows = await prisma.workflow.findMany({
    where: { status: 'active', isActive: true },
    include: { nodes: true }
  });

  for (const wf of workflows) {
    const triggerNode = wf.nodes.find((n) => n.node_type === 'trigger');
    if (!triggerNode) continue;

    const config = (triggerNode.configuration_json as any) || {};
    if (config.triggerType !== 'schedule') continue;
    const scheduleConfig = config.scheduleConfig || {};

    try {
      const lastRun = await prisma.workflowRun.findFirst({
        where: { workflow_id: wf.id, triggerSource: 'schedule' },
        orderBy: { startedAt: 'desc' }
      });
      const lastFiredAt = lastRun?.startedAt || null;

      if (isScheduleDue(scheduleConfig, wf.created_at, lastFiredAt, now)) {
        await startRun(wf.id, 'schedule', { schedule: { executed_at: now.toISOString() } });
      }
    } catch (err) {
      console.error(`[trigger-dispatch] Failed checking schedule for workflow ${wf.id}:`, err);
    }
  }
}
