"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
router.post('/', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret || webhookSecret.startsWith('whsec_REPLACE')) {
        // Webhook secret not configured — accept but log
        console.warn('Stripe webhook secret not configured. Skipping signature verification.');
        res.json({ received: true, warning: 'webhook_secret_not_configured' });
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
    catch (err) {
        console.error('Stripe webhook signature verification failed:', err.message);
        res.status(400).json({ error: `Webhook Error: ${err.message}` });
        return;
    }
    try {
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const pi = event.data.object;
                if (pi.metadata?.type === 'top_up') {
                    await handleTopUpSucceeded(pi);
                }
                break;
            }
            case 'checkout.session.completed': {
                const session = event.data.object;
                console.log(`Checkout session completed: ${session.id}, plan: ${session.metadata?.plan}`);
                break;
            }
            case 'payment_intent.payment_failed': {
                const pi = event.data.object;
                console.warn(`Payment failed for intent ${pi.id}: ${pi.last_payment_error?.message}`);
                break;
            }
        }
        res.json({ received: true });
    }
    catch (err) {
        console.error('Stripe webhook handler error:', err);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});
async function handleTopUpSucceeded(pi) {
    // Idempotency check
    const existing = await prisma_1.prisma.$queryRaw `
    SELECT id FROM credit_transactions WHERE stripe_payment_id = ${pi.id} LIMIT 1
  `;
    if (existing.length > 0)
        return;
    const operatorId = pi.metadata?.operator_id;
    const credits = parseInt(pi.metadata?.credits || '0', 10);
    if (!operatorId || !credits)
        return;
    const client = await prisma_1.prisma.client.findFirst({
        where: { created_by_operator_id: operatorId },
        select: { id: true },
    });
    if (!client)
        return;
    const credit = await prisma_1.prisma.clientCredit.findUnique({
        where: { client_id: client.id },
    });
    if (!credit)
        return;
    await prisma_1.prisma.clientCredit.update({
        where: { id: credit.id },
        data: { balance: { increment: credits } },
    });
    await prisma_1.prisma.$executeRaw `
    INSERT INTO credit_transactions (id, credit_id, amount, type, description, stripe_payment_id, created_at)
    VALUES (gen_random_uuid(), ${credit.id}::uuid, ${credits}, 'credit',
            ${'Credit top-up via Stripe (webhook)'}, ${pi.id}, NOW())
  `;
}
exports.default = router;
