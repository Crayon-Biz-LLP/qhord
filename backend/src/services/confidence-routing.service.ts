import { prisma } from '../lib/prisma';
import { AiProviderFactory } from '../ai/providers/ai-provider.factory';

interface ProviderScore {
  provider: string;
  confidence: number;
  successRate: number;
  avgLatency: number;
  avgQuality: number;
  avgCost: number;
  totalCalls: number;
}

interface RoutingDecision {
  provider: string;
  confidence: number;
  reason: string;
  alternatives: { provider: string; confidence: number }[];
}

export class ConfidenceRoutingService {
  private static readonly PROVIDERS = ['groq', 'openai', 'anthropic'];

  async recordProviderPerformance(
    providerName: string,
    taskType: string,
    success: boolean,
    latencyMs: number,
    qualityScore?: number,
    costCredits?: number,
  ): Promise<void> {
    const existing = await prisma.providerPerformance.findUnique({
      where: { provider_name_task_type: { provider_name: providerName, task_type: taskType } },
    });

    if (existing) {
      const totalCalls = existing.total_calls + 1;
      const successCount = existing.success_count + (success ? 1 : 0);
      const failureCount = existing.failure_count + (success ? 0 : 1);

      const newAvgLatency = (existing.avg_latency_ms * existing.total_calls + latencyMs) / totalCalls;
      const newAvgQuality = qualityScore !== undefined
        ? (existing.avg_quality_score * existing.total_calls + qualityScore) / totalCalls
        : existing.avg_quality_score;
      const newAvgCost = costCredits !== undefined
        ? (existing.avg_cost_credits * existing.total_calls + costCredits) / totalCalls
        : existing.avg_cost_credits;

      const successRate = successCount / totalCalls;
      const newConfidence = this.calculateConfidence(successRate, totalCalls, newAvgLatency, newAvgQuality);

      await prisma.providerPerformance.update({
        where: { id: existing.id },
        data: {
          total_calls: totalCalls,
          success_count: successCount,
          failure_count: failureCount,
          avg_latency_ms: newAvgLatency,
          avg_quality_score: newAvgQuality,
          avg_cost_credits: newAvgCost,
          confidence: newConfidence,
          last_call_at: new Date(),
        },
      });
    } else {
      const confidence = this.calculateConfidence(success ? 1 : 0, 1, latencyMs, qualityScore || 0);

      await prisma.providerPerformance.create({
        data: {
          provider_name: providerName,
          task_type: taskType,
          total_calls: 1,
          success_count: success ? 1 : 0,
          failure_count: success ? 0 : 1,
          avg_latency_ms: latencyMs,
          avg_quality_score: qualityScore || 0,
          avg_cost_credits: costCredits || 0,
          confidence,
          last_call_at: new Date(),
        },
      });
    }
  }

  private calculateConfidence(
    successRate: number,
    totalCalls: number,
    avgLatency: number,
    avgQuality: number,
  ): number {
    const sampleSizeFactor = Math.min(totalCalls / 50, 1);
    const successFactor = successRate;
    const latencyFactor = avgLatency < 2000 ? 1 : avgLatency < 5000 ? 0.8 : 0.6;
    const qualityFactor = avgQuality > 0 ? avgQuality / 5 : 0.5;

    return Math.round((sampleSizeFactor * 0.3 + successFactor * 0.3 + latencyFactor * 0.2 + qualityFactor * 0.2) * 100) / 100;
  }

  async getProviderScores(taskType: string): Promise<ProviderScore[]> {
    const performances = await prisma.providerPerformance.findMany({
      where: { task_type: taskType },
      orderBy: { confidence: 'desc' },
    });

    return performances.map((p) => ({
      provider: p.provider_name,
      confidence: p.confidence,
      successRate: p.total_calls > 0 ? p.success_count / p.total_calls : 0,
      avgLatency: p.avg_latency_ms,
      avgQuality: p.avg_quality_score,
      avgCost: p.avg_cost_credits,
      totalCalls: p.total_calls,
    }));
  }

  async route(taskType: string): Promise<RoutingDecision> {
    const scores = await this.getProviderScores(taskType);

    if (scores.length === 0) {
      const effectiveProvider = AiProviderFactory['getEffectiveProvider']();
      return {
        provider: effectiveProvider,
        confidence: 0.5,
        reason: 'No performance data available, using default provider',
        alternatives: [],
      };
    }

    const bestProvider = scores[0];
    const alternatives = scores.slice(1).map((s) => ({
      provider: s.provider,
      confidence: s.confidence,
    }));

    let reason = '';
    if (bestProvider.confidence >= 0.8) {
      reason = `High confidence (${bestProvider.confidence}) based on ${bestProvider.totalCalls} calls with ${(bestProvider.successRate * 100).toFixed(0)}% success rate`;
    } else if (bestProvider.confidence >= 0.5) {
      reason = `Moderate confidence (${bestProvider.confidence}) - ${bestProvider.totalCalls} calls recorded`;
    } else {
      reason = `Low confidence (${bestProvider.confidence}) - limited data, may need more calls`;
    }

    return {
      provider: bestProvider.provider,
      confidence: bestProvider.confidence,
      reason,
      alternatives,
    };
  }

  async routeWithFallback(taskType: string): Promise<string> {
    const decision = await this.route(taskType);

    if (decision.confidence >= 0.3) {
      return decision.provider;
    }

    const availableProviders = ConfidenceRoutingService.PROVIDERS.filter((p) => {
      const envVarMap: Record<string, string> = {
        anthropic: 'ANTHROPIC_API_KEY',
        openai: 'OPENAI_API_KEY',
        groq: 'GROQ_API_KEY',
      };
      return process.env[envVarMap[p]];
    });

    return availableProviders[0] || 'mock';
  }

  async getPerformanceReport(taskType?: string): Promise<{
    providers: ProviderScore[];
    overallRecommendation: string;
    taskTypeBreakdown: Record<string, ProviderScore[]>;
  }> {
    const where = taskType ? { task_type: taskType } : {};
    const performances = await prisma.providerPerformance.findMany({
      where,
      orderBy: { confidence: 'desc' },
    });

    const providers: ProviderScore[] = performances.map((p) => ({
      provider: p.provider_name,
      confidence: p.confidence,
      successRate: p.total_calls > 0 ? p.success_count / p.total_calls : 0,
      avgLatency: p.avg_latency_ms,
      avgQuality: p.avg_quality_score,
      avgCost: p.avg_cost_credits,
      totalCalls: p.total_calls,
    }));

    const taskTypes = [...new Set(performances.map((p) => p.task_type))];
    const taskTypeBreakdown: Record<string, ProviderScore[]> = {};
    for (const tt of taskTypes) {
      taskTypeBreakdown[tt] = providers.filter((p) => {
        const perf = performances.find((pp) => pp.provider_name === p.provider && pp.task_type === tt);
        return !!perf;
      });
    }

    let overallRecommendation = 'No performance data available yet.';
    if (providers.length > 0) {
      const best = providers[0];
      overallRecommendation = `Best overall provider: ${best.provider} (confidence: ${best.confidence}, success rate: ${(best.successRate * 100).toFixed(0)}%, avg latency: ${best.avgLatency.toFixed(0)}ms)`;
    }

    return { providers, overallRecommendation, taskTypeBreakdown };
  }

  async resetPerformance(providerName?: string, taskType?: string): Promise<void> {
    const where: any = {};
    if (providerName) where.provider_name = providerName;
    if (taskType) where.task_type = taskType;

    await prisma.providerPerformance.deleteMany({ where });
  }
}

export const confidenceRoutingService = new ConfidenceRoutingService();
