"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const prisma_1 = require("../lib/prisma");
const tool_registry_1 = require("../ai/tools/tool-registry");
class SubscriptionService {
    static async getUserSubscription(userId) {
        try {
            // Get user's subscription plan
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: { subscription_plan: true }
            });
            const planName = user?.subscription_plan || 'free';
            const plan = tool_registry_1.ToolRegistry.getSubscriptionPlan(planName);
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
        }
        catch (error) {
            console.error('Error getting user subscription:', error);
            throw error;
        }
    }
    static async getUserCredits(userId) {
        try {
            const creditRecord = await prisma_1.prisma.userCredits.findUnique({
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
        }
        catch (error) {
            console.error('Error getting user credits:', error);
            throw error;
        }
    }
    static async initializeUserCredits(userId) {
        try {
            const plan = tool_registry_1.ToolRegistry.getSubscriptionPlan('free');
            if (!plan)
                throw new Error('Free plan not found');
            const now = new Date();
            const nextReset = new Date(now);
            nextReset.setMonth(nextReset.getMonth() + 1);
            const creditRecord = await prisma_1.prisma.userCredits.create({
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
        }
        catch (error) {
            console.error('Error initializing user credits:', error);
            throw error;
        }
    }
    static async resetUserCredits(userId) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: { subscription_plan: true }
            });
            const planName = user?.subscription_plan || 'free';
            const plan = tool_registry_1.ToolRegistry.getSubscriptionPlan(planName);
            if (!plan)
                throw new Error('Invalid subscription plan');
            const now = new Date();
            const nextReset = new Date(now);
            nextReset.setMonth(nextReset.getMonth() + 1);
            const creditRecord = await prisma_1.prisma.userCredits.update({
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
        }
        catch (error) {
            console.error('Error resetting user credits:', error);
            throw error;
        }
    }
    static async consumeCredits(userId, action, credits, tool, campaignId) {
        try {
            // Check if user has enough credits
            const userCredits = await this.getUserCredits(userId);
            if (userCredits.remaining_credits < credits) {
                return false;
            }
            // Record usage
            await prisma_1.prisma.usageRecord.create({
                data: {
                    user_id: userId,
                    action,
                    credits_consumed: credits,
                    tool_used: tool,
                    campaign_id: campaignId
                }
            });
            // Update credits
            await prisma_1.prisma.userCredits.update({
                where: { user_id: userId },
                data: {
                    used_credits: {
                        increment: credits
                    }
                }
            });
            return true;
        }
        catch (error) {
            console.error('Error consuming credits:', error);
            return false;
        }
    }
    static async checkToolAccess(userId, toolName) {
        try {
            const subscription = await this.getUserSubscription(userId);
            // Check if tool is available in user's plan
            if (!subscription.tools_available.includes(toolName)) {
                const tool = tool_registry_1.ToolRegistry.getTool(toolName);
                const requiredPlan = tool?.subscription_required || 'free';
                return {
                    allowed: false,
                    reason: `Tool ${toolName} requires ${requiredPlan} plan or higher`
                };
            }
            // Check if user has enough credits
            const tool = tool_registry_1.ToolRegistry.getTool(toolName);
            if (tool && subscription.credits.remaining_credits < tool.credit_cost) {
                return {
                    allowed: false,
                    reason: `Insufficient credits. Need ${tool.credit_cost} credits, have ${subscription.credits.remaining_credits}`
                };
            }
            return { allowed: true };
        }
        catch (error) {
            console.error('Error checking tool access:', error);
            return { allowed: false, reason: 'Error checking tool access' };
        }
    }
    static async upgradeSubscription(userId, newPlan) {
        try {
            // Update user's subscription plan
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { subscription_plan: newPlan }
            });
            // Reset credits with new plan
            await this.resetUserCredits(userId);
            return true;
        }
        catch (error) {
            console.error('Error upgrading subscription:', error);
            return false;
        }
    }
    static async getUsageHistory(userId, limit = 50) {
        try {
            const records = await prisma_1.prisma.usageRecord.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' },
                take: limit
            });
            return records;
        }
        catch (error) {
            console.error('Error getting usage history:', error);
            return [];
        }
    }
    static async getUsageStats(userId) {
        try {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const allUsage = await prisma_1.prisma.usageRecord.findMany({
                where: { user_id: userId }
            });
            const monthlyUsage = allUsage.filter(record => new Date(record.created_at) >= monthStart);
            const usage_by_tool = {};
            const usage_by_action = {};
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
        }
        catch (error) {
            console.error('Error getting usage stats:', error);
            return {
                total_usage: 0,
                usage_by_tool: {},
                usage_by_action: {},
                usage_this_month: 0
            };
        }
    }
    static async simulatePayment(userId, plan) {
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
            }
            else {
                return { success: false };
            }
        }
        catch (error) {
            console.error('Error simulating payment:', error);
            return { success: false };
        }
    }
}
exports.SubscriptionService = SubscriptionService;
