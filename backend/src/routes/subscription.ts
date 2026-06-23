import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const DEFAULT_CREDITS = 2000;

// Credit top-up packages: credits → { price in cents, display label }
const CREDIT_PACKAGES: Record<number, { amount_cents: number; label: string }> = {
  5000:  { amount_cents: 4900,  label: '5,000 Credits Pack' },
  10000: { amount_cents: 8900,  label: '10,000 Credits Pack' },
};

// Plan prices for Stripe Checkout (inline price_data, no pre-created Price ID needed)
const PLAN_CHECKOUT: Record<string, { name: string; amount_cents: number }> = {
  starter: { name: 'Starter Plan', amount_cents: 9900 },
  pro:     { name: 'Pro Plan',     amount_cents: 29900 },
};

async function getOrCreateCredit(clientId: string) {
  let credit = await prisma.clientCredit.findUnique({ where: { client_id: clientId } });
  if (!credit) {
    credit = await prisma.clientCredit.create({
      data: { client_id: clientId, balance: DEFAULT_CREDITS },
    });
  }
  return credit;
}

router.get('/status', async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: { created_by_operator_id: req.user!.id },
      select: { id: true },
    });
    const credits = client ? await getOrCreateCredit(client.id) : null;
    res.json({
      success: true,
      subscription: {
        plan: { name: 'Growth', level: 'pro', credits_per_month: DEFAULT_CREDITS, tools_available: ['Hunter', 'BetterContacts', 'Brevo', 'Calendly', 'Smartlead', 'HeyReach', 'Instantly', 'HubSpot', 'Salesforce'], features: ['Full pipeline', 'Lead generation', 'Enrichment', 'Email campaigns', 'CRM (HubSpot + Salesforce)', 'LinkedIn outreach'], price: 0 },
        credits: credits ? { total_credits: DEFAULT_CREDITS, used_credits: credits.total_used, remaining_credits: credits.balance, balance: credits.balance } : null,
        tools_available: ['Hunter', 'BetterContacts', 'Brevo', 'Calendly', 'Smartlead', 'HeyReach', 'Instantly', 'HubSpot', 'Salesforce'],
        can_perform_action: credits ? credits.balance > 0 : false,
      },
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

router.get('/credits', async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: { created_by_operator_id: req.user!.id },
      select: { id: true },
    });
    if (!client) return res.json({ success: true, balance: DEFAULT_CREDITS, credits: null });
    const credit = await getOrCreateCredit(client.id);
    res.json({ success: true, balance: credit.balance, credits: credit });
  } catch (error) {
    console.error('Credits error:', error);
    res.status(500).json({ error: 'Failed to get credits' });
  }
});

router.post('/top-up', async (req: Request, res: Response) => {
  try {
    const amount = parseInt(String(req.body?.amount || 0), 10);
    if (!amount || amount < 1) {
      res.status(400).json({ success: false, error: 'Valid amount is required' });
      return;
    }
    const client = await prisma.client.findFirst({
      where: { created_by_operator_id: req.user!.id },
      select: { id: true },
    });
    if (!client) { res.status(400).json({ success: false, error: 'No client found' }); return; }
    const credit = await getOrCreateCredit(client.id);
    const updated = await prisma.clientCredit.update({
      where: { id: credit.id },
      data: { balance: { increment: amount } },
    });
    await prisma.creditTransaction.create({
      data: { credit_id: credit.id, amount, type: 'credit', description: 'Top-up' },
    });
    res.json({ success: true, addedCredits: amount, newTotal: updated.balance, balance: updated.balance });
  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({ error: 'Failed to top up credits' });
  }
});

router.get('/tools', async (req: Request, res: Response) => {
    res.json({
      success: true,
      tools: [
        { name: 'Hunter', description: 'Find professional email addresses', category: 'Lead Generation', credit_cost: 2 },
        { name: 'BetterContacts', description: 'Enrich contact data', category: 'Enrichment', credit_cost: 1 },
        { name: 'Brevo', description: 'Send email campaigns', category: 'Email Marketing', credit_cost: 3 },
        { name: 'Calendly', description: 'Schedule meetings', category: 'Scheduling', credit_cost: 1 },
        { name: 'Smartlead', description: 'Email campaign automation', category: 'Email Marketing', credit_cost: 2 },
        { name: 'HeyReach', description: 'LinkedIn outreach automation', category: 'LinkedIn Outreach', credit_cost: 2 },
        { name: 'Instantly', description: 'Cold email platform', category: 'Email Marketing', credit_cost: 2 },
        { name: 'HubSpot', description: 'CRM platform', category: 'CRM', credit_cost: 1 },
        { name: 'Salesforce', description: 'Enterprise CRM platform', category: 'CRM', credit_cost: 1 },
      ],
    });
});

router.post('/check-tool-access', async (req: Request, res: Response) => {
  try {
    const { toolName } = req.body;
    const client = await prisma.client.findFirst({
      where: { created_by_operator_id: req.user!.id },
      select: { id: true },
    });
    const credit = client ? await getOrCreateCredit(client.id) : null;
    res.json({ success: true, access: { allowed: credit ? credit.balance > 0 : false, toolName, remaining_credits: credit?.balance ?? 0 } });
  } catch (error) {
    console.error('Tool access error:', error);
    res.status(500).json({ error: 'Failed to check tool access' });
  }
});

router.get('/usage-history', async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: { created_by_operator_id: req.user!.id },
      select: { id: true },
    });
    if (!client) return res.json({ success: true, history: [] });
    const credit = await prisma.clientCredit.findUnique({ where: { client_id: client.id } });
    const history = credit ? await prisma.creditTransaction.findMany({
      where: { credit_id: credit.id },
      orderBy: { created_at: 'desc' },
      take: 100,
    }) : [];
    res.json({ success: true, history });
  } catch (error) {
    console.error('Usage history error:', error);
    res.status(500).json({ error: 'Failed to get usage history' });
  }
});

router.get('/usage-stats', async (req: Request, res: Response) => {
  try {
    const client = await prisma.client.findFirst({
      where: { created_by_operator_id: req.user!.id },
      select: { id: true },
    });
    if (!client) return res.json({ success: true, stats: { total_credits_used: 0, campaigns_run: 0 } });
    const credit = await prisma.clientCredit.findUnique({ where: { client_id: client.id } });
    const campaigns = await prisma.campaign.count({ where: { client_id: client.id, status: { not: 'workflow_template' } } });
    res.json({ success: true, stats: { total_credits_used: credit?.total_used ?? 0, campaigns_run: campaigns } });
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

router.get('/plans', async (_req: Request, res: Response) => {
    res.json({
      success: true,
      plans: [
        { name: 'Free Trial', level: 'free', credits_per_month: 1000, tools_available: ['Hunter'], features: ['Basic lead generation'], price: 0 },
        { name: 'Starter', level: 'starter', credits_per_month: 5000, tools_available: ['Hunter', 'BetterContacts', 'Brevo', 'Instantly', 'HubSpot'], features: ['Lead gen', 'Enrichment', 'Email campaigns', 'CRM'], price: 99 },
        { name: 'Pro', level: 'pro', credits_per_month: 20000, tools_available: ['Hunter', 'BetterContacts', 'Brevo', 'Calendly', 'Smartlead', 'HeyReach', 'Instantly', 'HubSpot', 'Salesforce'], features: ['All tools', 'Full pipeline', 'CRM (HubSpot + Salesforce)', 'LinkedIn outreach', 'Analytics', 'Priority support'], price: 299 },
      ],
    });
});

router.post('/upgrade', async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    if (!plan || !['starter', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Valid plan is required' });
    }
    res.json({ success: true, message: `Upgraded to ${plan} plan`, transaction_id: 'txn_' + Date.now() });
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Failed to upgrade' });
  }
});

// ── Stripe: create PaymentIntent for credit top-up ──────────────────────────
router.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const credits = parseInt(String(req.body?.credits || 0), 10);
    const pkg = CREDIT_PACKAGES[credits];
    if (!pkg) {
      res.status(400).json({ error: 'Invalid credits package. Valid options: 5000, 10000' });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.amount_cents,
      currency: 'usd',
      description: pkg.label,
      metadata: {
        operator_id: req.user!.id,
        credits: String(credits),
        type: 'top_up',
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment intent' });
  }
});

// ── Stripe: confirm top-up after client-side payment confirmation ─────────────
router.post('/confirm-top-up', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, credits } = req.body;
    if (!paymentIntentId) {
      res.status(400).json({ error: 'paymentIntentId is required' });
      return;
    }

    // Verify the payment actually succeeded with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      res.status(400).json({ error: `Payment not completed (status: ${paymentIntent.status})` });
      return;
    }

    // Idempotency guard — raw SQL to avoid dependency on regenerated Prisma client
    const existing = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM credit_transactions WHERE stripe_payment_id = ${paymentIntentId} LIMIT 1
    `;
    if (existing.length > 0) {
      res.json({ success: true, message: 'Payment already processed', alreadyProcessed: true });
      return;
    }

    const client = await prisma.client.findFirst({
      where: { created_by_operator_id: req.user!.id },
      select: { id: true },
    });
    if (!client) { res.status(400).json({ error: 'No client found' }); return; }

    const credit = await getOrCreateCredit(client.id);
    const creditsToAdd = parseInt(
      String(paymentIntent.metadata?.credits || credits || 0), 10
    );
    if (!creditsToAdd) { res.status(400).json({ error: 'Could not determine credits amount' }); return; }

    const updated = await prisma.clientCredit.update({
      where: { id: credit.id },
      data: { balance: { increment: creditsToAdd } },
    });

    // Insert with stripe_payment_id via raw SQL (Prisma client may not have the new column yet)
    await prisma.$executeRaw`
      INSERT INTO credit_transactions (id, credit_id, amount, type, description, stripe_payment_id, created_at)
      VALUES (gen_random_uuid(), ${credit.id}::uuid, ${creditsToAdd}, 'credit',
              ${'Credit top-up via Stripe'}, ${paymentIntentId}, NOW())
    `;

    res.json({
      success: true,
      addedCredits: creditsToAdd,
      newBalance: updated.balance,
    });
  } catch (error: any) {
    console.error('Confirm top-up error:', error);
    res.status(500).json({ error: error.message || 'Failed to confirm payment' });
  }
});

// ── Stripe: create Checkout Session for plan upgrades ─────────────────────────
router.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    const planConfig = PLAN_CHECKOUT[plan as string];
    if (!planConfig) {
      res.status(400).json({ error: `Invalid plan. Valid options: ${Object.keys(PLAN_CHECKOUT).join(', ')}` });
      return;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: planConfig.name },
          unit_amount: planConfig.amount_cents,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      success_url: `${frontendUrl}/dashboard/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${frontendUrl}/dashboard/billing?status=cancelled`,
      metadata: {
        operator_id: req.user!.id,
        plan,
        type: 'plan_upgrade',
      },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

router.post('/consume-credits', async (req: Request, res: Response) => {
  try {
    const { action, credits: cost, tool, campaign_id, execution_id } = req.body;
    if (!action || !cost || !tool) {
      return res.status(400).json({ error: 'Action, credits, and tool are required' });
    }
    const client = await prisma.client.findFirst({
      where: { created_by_operator_id: req.user!.id },
      select: { id: true },
    });
    if (!client) return res.status(400).json({ error: 'No client found' });
    const credit = await getOrCreateCredit(client.id);
    if (credit.balance < cost) {
      res.status(400).json({ success: false, error: 'Insufficient credits', balance: credit.balance, required: cost });
      return;
    }
    await prisma.clientCredit.update({
      where: { id: credit.id },
      data: { balance: { decrement: cost }, total_used: { increment: cost } },
    });
    await prisma.creditTransaction.create({
      data: { credit_id: credit.id, amount: cost, type: 'debit', description: action, tool_name: tool, action, campaign_id, execution_id },
    });
    const updated = await prisma.clientCredit.findUnique({ where: { id: credit.id } });
    res.json({ success: true, message: `Consumed ${cost} credits for ${action}`, remaining_credits: updated!.balance });
  } catch (error) {
    console.error('Consume credits error:', error);
    res.status(500).json({ error: 'Failed to consume credits' });
  }
});

export default router;
