import { prisma } from '../lib/prisma';
import { AbTest } from '@prisma/client';
import { AiProviderFactory } from '../ai/providers/ai-provider.factory';

interface CreateAbTestParams {
  workspaceId: string;
  name: string;
  description?: string;
  variantAConfig: any;
  variantBConfig: any;
  variantAName?: string;
  variantBName?: string;
}

interface AbTestResult {
  id: string;
  name: string;
  status: string;
  variant_a: { name: string; config: any };
  variant_b: { name: string; config: any };
}

interface AbTestAnalysis {
  testId: string;
  name: string;
  status: string;
  winner: string | null;
  confidence: number | null;
  variantA: {
    name: string;
    metrics: {
      leadsAssigned: number;
      emailsSent: number;
      openRate: number;
      replyRate: number;
      conversionRate: number;
    };
  };
  variantB: {
    name: string;
    metrics: {
      leadsAssigned: number;
      emailsSent: number;
      openRate: number;
      replyRate: number;
      conversionRate: number;
    };
  };
  recommendation: string;
}

export class AbTestService {
  async createTest(params: CreateAbTestParams): Promise<AbTestResult> {
    const test = await prisma.abTest.create({
      data: {
        workspace_id: params.workspaceId,
        name: params.name,
        description: params.description,
        variant_a_name: params.variantAName || 'Variant A',
        variant_b_name: params.variantBName || 'Variant B',
        variant_a_config: params.variantAConfig,
        variant_b_config: params.variantBConfig,
      },
    });

    await prisma.abTestVariant.createMany({
      data: [
        {
          test_id: test.id,
          variant_key: 'a',
        },
        {
          test_id: test.id,
          variant_key: 'b',
        },
      ],
    });

    return {
      id: test.id,
      name: test.name,
      status: test.status,
      variant_a: { name: test.variant_a_name, config: test.variant_a_config },
      variant_b: { name: test.variant_b_name, config: test.variant_b_config },
    };
  }

  async startTest(testId: string): Promise<void> {
    const test = await prisma.abTest.findUnique({ where: { id: testId } });
    if (!test) throw new Error('A/B test not found');
    if (test.status !== 'draft') throw new Error('Test is not in draft status');

    await prisma.abTest.update({
      where: { id: testId },
      data: { status: 'running', started_at: new Date() },
    });
  }

  async recordMetric(
    testId: string,
    variantKey: string,
    metricName: string,
    metricValue: number,
    sampleSize: number,
  ): Promise<void> {
    await prisma.abTestMetric.create({
      data: {
        test_id: testId,
        variant_key: variantKey,
        metric_name: metricName,
        metric_value: metricValue,
        sample_size: sampleSize,
      },
    });

    const variant = await prisma.abTestVariant.findFirst({
      where: { test_id: testId, variant_key: variantKey },
    });

    if (!variant) return;

    const updateData: any = {};
    switch (metricName) {
      case 'open_rate':
        updateData.open_rate = metricValue;
        updateData.opens = Math.round(sampleSize * metricValue);
        break;
      case 'reply_rate':
        updateData.reply_rate = metricValue;
        updateData.replies = Math.round(sampleSize * metricValue);
        break;
      case 'conversion_rate':
        updateData.conversions = Math.round(sampleSize * metricValue);
        break;
    }

    await prisma.abTestVariant.update({
      where: { id: variant.id },
      data: updateData,
    });
  }

  async analyzeTest(testId: string): Promise<AbTestAnalysis> {
    const test = await prisma.abTest.findUnique({
      where: { id: testId },
      include: {
        variants: true,
        metrics: { orderBy: { recorded_at: 'desc' } },
      },
    });

    if (!test) throw new Error('A/B test not found');

    const variantA = test.variants.find((v) => v.variant_key === 'a');
    const variantB = test.variants.find((v) => v.variant_key === 'b');

    const getVariantMetrics = (variant: any) => ({
      leadsAssigned: variant?.leads_assigned || 0,
      emailsSent: variant?.emails_sent || 0,
      openRate: variant?.open_rate || 0,
      replyRate: variant?.reply_rate || 0,
      conversionRate: variant?.leads_assigned ? (variant.conversions / variant.leads_assigned) * 100 : 0,
    });

    let winner: string | null = null;
    let confidence: number | null = null;
    let recommendation = 'Insufficient data to determine winner.';

    if (variantA && variantB && variantA.leads_assigned >= 10 && variantB.leads_assigned >= 10) {
      const metricsA = getVariantMetrics(variantA);
      const metricsB = getVariantMetrics(variantB);

      const scoreA = metricsA.replyRate * 0.4 + metricsA.openRate * 0.3 + metricsA.conversionRate * 0.3;
      const scoreB = metricsB.replyRate * 0.4 + metricsB.openRate * 0.3 + metricsB.conversionRate * 0.3;

      const totalLeads = variantA.leads_assigned + variantB.leads_assigned;
      const pooledRate = (variantA.replies + variantB.replies) / totalLeads;
      const se = Math.sqrt(pooledRate * (1 - pooledRate) * (1 / variantA.leads_assigned + 1 / variantB.leads_assigned));

      if (se > 0) {
        const zScore = Math.abs((variantA.reply_rate - variantB.reply_rate) / se);
        confidence = Math.min(0.99, 1 - Math.exp(-0.5 * zScore * zScore));
      }

      if (scoreA > scoreB) {
        winner = 'a';
        recommendation = `Variant A (${test.variant_a_name}) performs better. Reply rate: ${(metricsA.replyRate * 100).toFixed(1)}% vs ${(metricsB.replyRate * 100).toFixed(1)}%. Consider using Variant A configuration for future campaigns.`;
      } else if (scoreB > scoreA) {
        winner = 'b';
        recommendation = `Variant B (${test.variant_b_name}) performs better. Reply rate: ${(metricsB.replyRate * 100).toFixed(1)}% vs ${(metricsA.replyRate * 100).toFixed(1)}%. Consider using Variant B configuration for future campaigns.`;
      } else {
        recommendation = 'Both variants perform equally. Consider testing with larger sample size.';
      }
    }

    return {
      testId: test.id,
      name: test.name,
      status: test.status,
      winner,
      confidence,
      variantA: {
        name: test.variant_a_name,
        metrics: getVariantMetrics(variantA),
      },
      variantB: {
        name: test.variant_b_name,
        metrics: getVariantMetrics(variantB),
      },
      recommendation,
    };
  }

  async completeTest(testId: string): Promise<AbTestAnalysis> {
    const analysis = await this.analyzeTest(testId);

    await prisma.abTest.update({
      where: { id: testId },
      data: {
        status: 'completed',
        winner: analysis.winner,
        confidence_level: analysis.confidence,
        completed_at: new Date(),
      },
    });

    return analysis;
  }

  async getTestsForWorkspace(workspaceId: string): Promise<AbTest[]> {
    return prisma.abTest.findMany({
      where: { workspace_id: workspaceId },
      include: { variants: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async deleteTest(testId: string): Promise<void> {
    await prisma.abTest.delete({ where: { id: testId } });
  }
}

export const abTestService = new AbTestService();
