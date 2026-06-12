"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMockConversations = buildMockConversations;
exports.mockSend = mockSend;
// Deterministic mock data so that repeated "sync" calls are idempotent
// (external ids are stable). Phase 2 swaps these out for real API calls.
const SEED = [
    {
        contactName: 'Sarah Chen',
        contactEmail: 'sarah.chen@acme.io',
        companyName: 'Acme Inc',
        campaignName: 'Q3 Outbound',
        incoming: 'Thanks for reaching out — this looks interesting. Can you share pricing?',
    },
    {
        contactName: 'Marcus Reid',
        contactEmail: 'marcus@northwind.co',
        companyName: 'Northwind',
        campaignName: 'Enterprise ABM',
        incoming: 'We are evaluating a few vendors. What does onboarding look like?',
    },
    {
        contactName: 'Priya Nair',
        contactEmail: 'priya@brightlabs.com',
        companyName: 'Bright Labs',
        campaignName: 'Founder Outreach',
        incoming: 'Interested. Could we set up a quick call next week?',
    },
];
/**
 * Build a small, stable set of mock conversations for a tool.
 * Each conversation includes a seeded incoming message thread.
 */
function buildMockConversations(toolId) {
    const now = Date.now();
    return SEED.map((s, i) => {
        const externalConversationId = `${toolId}-conv-${i + 1}`;
        const sentAt = new Date(now - (i + 1) * 36e5).toISOString(); // hours ago
        return {
            externalConversationId,
            contactName: s.contactName,
            contactEmail: s.contactEmail,
            companyName: s.companyName,
            campaignName: s.campaignName,
            status: 'New Reply',
            lastMessage: s.incoming,
            lastMessageAt: sentAt,
            unreadCount: 1,
            messages: [
                {
                    externalMessageId: `${externalConversationId}-m1`,
                    direction: 'incoming',
                    sender: s.contactEmail,
                    recipient: 'you',
                    body: s.incoming,
                    status: 'Read',
                    sentAt,
                },
            ],
        };
    });
}
/**
 * Mock send — simulates a successful reply through the source platform.
 * Phase 2 replaces this with the real tool API call.
 */
function mockSend(toolId) {
    return {
        success: true,
        externalMessageId: `${toolId}-out-${Date.now()}`,
        status: 'Sent',
    };
}
