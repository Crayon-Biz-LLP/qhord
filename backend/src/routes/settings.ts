import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { ensureOperatorBootstrap } from '../lib/operator-bootstrap';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    const operator = await ensureOperatorBootstrap(req.user.id);

    if (!operator) {
      res.status(404).json({ message: 'Operator not found' });
      return;
    }

    const team = operator.workspace_id
      ? await prisma.operator.findMany({
          where: { workspace_id: operator.workspace_id },
          select: { id: true, name: true, email: true, role: true, created_at: true },
        })
      : [];

    const integrations = await prisma.clientToolAccount.findMany({
      where: { created_by_operator_id: req.user.id },
      include: { client: { select: { name: true } } },
    });

    res.json({
      workspace: operator.workspace,
      settings: operator.settings,
      team,
      integrations,
    });
  } catch (err: any) {
    console.error('Fetch settings error', err);
    res.status(500).json({
      message: 'Failed to fetch settings',
      hint: 'Run: npx prisma db push (workspaces / operator_settings tables may be missing)',
      detail: err?.message,
    });
  }
});

router.put('/', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const { workspace, settings } = req.body;

  try {
    const operator = await ensureOperatorBootstrap(req.user.id);

    if (!operator) {
      res.status(404).json({ message: 'Operator not found' });
      return;
    }

    if (workspace && operator.workspace_id) {
      await prisma.workspace.update({
        where: { id: operator.workspace_id },
        data: {
          name: workspace.name,
          domain: workspace.domain,
          timezone: workspace.timezone,
          logo_url: workspace.logo_url,
        },
      });
    }

    if (settings) {
      const settingsData: Record<string, unknown> = {
        ai_tone: settings.ai_tone,
        ai_personalization: settings.ai_personalization,
        auto_reply: settings.auto_reply,
        auto_pause: settings.auto_pause,
        auto_optimize: settings.auto_optimize,
        auto_score: settings.auto_score,
        notifications: settings.notifications,
        inbox_rotation: settings.inbox_rotation,
        auto_pause_threshold: settings.auto_pause_threshold,
        safety_mode: settings.safety_mode,
        linkedin_account: settings.linkedin_account,
        default_crm: settings.default_crm,
        two_factor_enabled: settings.two_factor_enabled,
      };

      if (settings.daily_send_limit !== undefined) {
        const val = parseInt(String(settings.daily_send_limit), 10);
        if (!isNaN(val)) settingsData.daily_send_limit = val;
      }
      if (settings.daily_connection_limit !== undefined) {
        const val = parseInt(String(settings.daily_connection_limit), 10);
        if (!isNaN(val)) settingsData.daily_connection_limit = val;
      }
      if (settings.daily_message_limit !== undefined) {
        const val = parseInt(String(settings.daily_message_limit), 10);
        if (!isNaN(val)) settingsData.daily_message_limit = val;
      }

      await prisma.operatorSettings.upsert({
        where: { operator_id: req.user.id },
        create: {
          operator_id: req.user.id,
          ...settingsData,
        } as any,
        update: settingsData,
      });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (err: any) {
    console.error('Update settings error', err);
    res.status(500).json({
      message: 'Failed to update settings',
      hint: 'Run: npx prisma db push',
      detail: err?.message,
    });
  }
});

export default router;
