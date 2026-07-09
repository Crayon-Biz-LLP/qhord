import { Job } from 'bullmq';
import { prisma } from '../lib/prisma';

export async function trackWorkerError(job: Job, error: unknown) {
  const jobName = job.queueName || job.name;
  const errorMsg = error instanceof Error ? error.message : String(error);
  console.error(`[Recovery] ${jobName} job ${job.id} failed: ${errorMsg}`);

  // Log failed AI execution if this was an AI-based job
  if (job.data?.clientId || job.data?.client_id) {
    try {
      await prisma.aiExecutionLog.create({
        data: {
          provider: 'worker',
          model: jobName,
          prompt: JSON.stringify(job.data).substring(0, 1000),
          response: '',
          status: 'error',
          error_message: errorMsg,
          duration_ms: 0,
          cost_credits: 0,
          client_id: job.data?.clientId || job.data?.client_id,
          operator_id: job.data?.operatorId || job.data?.operator_id,
        } as any,
      });
    } catch (logErr) {
      console.error('[Recovery] Failed to log error to DB:', logErr);
    }
  }
}

export async function recoverFailedJob(job: Job, maxRetries = 3) {
  const attempts = job.attemptsMade || 0;
  if (attempts >= maxRetries) {
    console.log(`[Recovery] Job ${job.id} exhausted ${maxRetries} retries. Marking as dead.`);
    return false;
  }
  const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
  console.log(`[Recovery] Retrying job ${job.id} in ${delay}ms (attempt ${attempts + 1}/${maxRetries})`);
  await new Promise((r) => setTimeout(r, delay));
  await job.retry('failed');
  return true;
}
