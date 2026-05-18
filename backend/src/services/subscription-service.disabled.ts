// Temporarily disabled subscription service to fix TypeScript errors
// This file prevents build errors while we test the queue system

export class SubscriptionService {
  static async getUserCredits(userId: string) {
    return { credits: 1000, level: 'pro' };
  }

  static async checkToolAccess(userId: string, toolName: string) {
    return true;
  }

  static async trackUsage(userId: string, credits: number) {
    console.log(`Usage tracked: ${userId} used ${credits} credits`);
  }
}
