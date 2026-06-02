import { prisma } from '../lib/prisma';
import { ToolRegistry, SubscriptionPlan } from '../ai/tools/tool-registry';

export interface UserCredits {
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
  last_reset: Date;
  next_reset: Date;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  action: string;
  credits_consumed: number;
  tool_used: string;
  campaign_id?: string;
  created_at: Date;
}

export interface SubscriptionStatus {
  plan: SubscriptionPlan;
  credits: UserCredits;
  tools_available: string[];
  can_perform_action: boolean;
  upgrade_required: boolean;
}

export class SubscriptionService {
  static async getUserSubscription(userId: string): Promise<SubscriptionStatus> {
    try {
      // Get user's subscription plan
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscription_plan: true }
      });

      const planName = user?.subscription_plan || 'free';
      const plan = ToolRegistry.getSubscriptionPlan(planName as 'free' | 'starter' | 'pro');
      
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      // Get user's credits
      const credits = await this.getUserCredits(userId);
      
      // Get available tools for plan
      const tools_available = plan.tools_available;

      // Check if user can perform actions
      const can_perform_action = credits.remaining_credits > 0;
      const upgrade_required = !can_perform_action || plan.name === 'Free Trial';

      return {
        plan,
        credits,
        tools_available,
        can_perform_action,
        upgrade_required
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw error;
    }
  }

  static async getUserCredits(userId: string): Promise<UserCredits> {
    try {
      const creditRecord = await prisma.userCredits.findUnique({
        where: { user_id: userId }
      });

      if (!creditRecord) {
        // Create initial credits for new user
        return await this.initializeUserCredits(userId);
      }

      // Check if credits need reset (monthly)
      const now = new Date();
      const lastReset = new Date(creditRecord.last_reset);
      const nextReset = new Date(lastReset);
      nextReset.setMonth(nextReset.getMonth() + 1);

      if (now >= nextReset) {
        return await this.resetUserCredits(userId);
      }

      return {
        total_credits: creditRecord.total_credits,
        used_credits: creditRecord.used_credits,
        remaining_credits: creditRecord.total_credits - creditRecord.used_credits,
        last_reset: creditRecord.last_reset,
        next_reset: nextReset
      };
    } catch (error) {
      console.error('Error getting user credits:', error);
      throw error;
    }
  }

  static async initializeUserCredits(userId: string): Promise<UserCredits> {
    try {
      const plan = ToolRegistry.getSubscriptionPlan('free');
      if (!plan) throw new Error('Free plan not found');

      const now = new Date();
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);

      const creditRecord = await prisma.userCredits.create({
        data: {
          user_id: userId,
          total_credits: plan.credits_per_month,
          used_credits: 0,
          last_reset: now,
          next_reset: nextReset
        }
      });

      return {
        total_credits: creditRecord.total_credits,
        used_credits: creditRecord.used_credits,
        remaining_credits: creditRecord.total_credits - creditRecord.used_credits,
        last_reset: creditRecord.last_reset,
        next_reset: nextReset
      };
    } catch (error) {
      console.error('Error initializing user credits:', error);
      throw error;
    }
  }

  static async resetUserCredits(userId: string): Promise<UserCredits> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscription_plan: true }
      });

      const planName = user?.subscription_plan || 'free';
      const plan = ToolRegistry.getSubscriptionPlan(planName as 'free' | 'starter' | 'pro');
      
      if (!plan) throw new Error('Invalid subscription plan');

      const now = new Date();
      const nextReset = new Date(now);
      nextReset.setMonth(nextReset.getMonth() + 1);

      const creditRecord = await prisma.userCredits.update({
        where: { user_id: userId },
        data: {
          total_credits: plan.credits_per_month,
          used_credits: 0,
          last_reset: now,
          next_reset: nextReset
        }
      });

      return {
        total_credits: creditRecord.total_credits,
        used_credits: creditRecord.used_credits,
        remaining_credits: creditRecord.total_credits - creditRecord.used_credits,
        last_reset: creditRecord.last_reset,
        next_reset: nextReset
      };
    } catch (error) {
      console.error('Error resetting user credits:', error);
      throw error;
    }
  }

  static async consumeCredits(userId: string, action: string, credits: number, tool: string, campaignId?: string): Promise<boolean> {
    try {
      // Check if user has enough credits
      const userCredits = await this.getUserCredits(userId);
      
      if (userCredits.remaining_credits < credits) {
        return false;
      }

      // Record usage
      await prisma.usageRecord.create({
        data: {
          user_id: userId,
          action,
          credits_consumed: credits,
          tool_used: tool,
          campaign_id: campaignId
        }
      } as any);

      // Update credits
      await prisma.userCredits.update({
        where: { user_id: userId },
        data: {
          used_credits: {
            increment: credits
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Error consuming credits:', error);
      return false;
    }
  }

  static async checkToolAccess(userId: string, toolName: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      // Check if tool is available in user's plan
      if (!subscription.tools_available.includes(toolName)) {
        const tool = ToolRegistry.getTool(toolName);
        const requiredPlan = tool?.subscription_required || 'free';
        return {
          allowed: false,
          reason: `Tool ${toolName} requires ${requiredPlan} plan or higher`
        };
      }

      // Check if user has enough credits
      const tool = ToolRegistry.getTool(toolName);
      if (tool && subscription.credits.remaining_credits < tool.credit_cost) {
        return {
          allowed: false,
          reason: `Insufficient credits. Need ${tool.credit_cost} credits, have ${subscription.credits.remaining_credits}`
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking tool access:', error);
      return { allowed: false, reason: 'Error checking tool access' };
    }
  }

  static async upgradeSubscription(userId: string, newPlan: 'starter' | 'pro'): Promise<boolean> {
    try {
      // Update user's subscription plan
      await prisma.user.update({
        where: { id: userId },
        data: { subscription_plan: newPlan }
      });

      // Reset credits with new plan
      await this.resetUserCredits(userId);

      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return false;
    }
  }

  static async getUsageHistory(userId: string, limit: number = 50): Promise<UsageRecord[]> {
    try {
      const records = await prisma.usageRecord.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: limit
      } as any);

      return records;
    } catch (error) {
      console.error('Error getting usage history:', error);
      return [];
    }
  }

  static async getUsageStats(userId: string): Promise<{
    total_usage: number;
    usage_by_tool: Record<string, number>;
    usage_by_action: Record<string, number>;
    usage_this_month: number;
  }> {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const allUsage = await prisma.usageRecord.findMany({
        where: { user_id: userId }
      } as any);

      const monthlyUsage = allUsage.filter(record => 
        new Date(record.created_at) >= monthStart
      );

      const usage_by_tool: Record<string, number> = {};
      const usage_by_action: Record<string, number> = {};

      allUsage.forEach(record => {
        usage_by_tool[record.tool_used] = (usage_by_tool[record.tool_used] || 0) + record.credits_consumed;
        usage_by_action[record.action] = (usage_by_action[record.action] || 0) + record.credits_consumed;
      });

      return {
        total_usage: allUsage.reduce((sum, record) => sum + record.credits_consumed, 0),
        usage_by_tool,
        usage_by_action,
        usage_this_month: monthlyUsage.reduce((sum, record) => sum + record.credits_consumed, 0)
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        total_usage: 0,
        usage_by_tool: {},
        usage_by_action: {},
        usage_this_month: 0
      };
    }
  }

  static async simulatePayment(userId: string, plan: 'starter' | 'pro'): Promise<{ success: boolean; transaction_id?: string }> {
    // Simulate payment processing (no real payment gateway)
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate fake transaction ID
      const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Upgrade subscription
      const upgraded = await this.upgradeSubscription(userId, plan);
      
      if (upgraded) {
        return { success: true, transaction_id };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Error simulating payment:', error);
      return { success: false };
    }
  }
}
