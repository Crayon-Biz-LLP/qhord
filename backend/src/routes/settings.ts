import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get settings and workspace
router.get('/', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    let operator = await (prisma as any).operator.findUnique({
      where: { id: req.user.id },
      include: {
        workspace: true,
        settings: true,
      },
    });

    if (!operator) {
      res.status(404).json({ message: 'Operator not found' });
      return;
    }

    // Lazy create defaults if not exist
    if (!(operator as any).settings) {
      operator = await (prisma as any).operator.update({
        where: { id: req.user.id },
        data: {
          settings: {
            create: {
              notifications: [
                { id: "replies", label: "New replies", email: true, slack: true, inapp: true },
                { id: "meeting", label: "Meeting booked", email: true, slack: true, inapp: true },
                { id: "errors", label: "Campaign errors", email: true, slack: true, inapp: true },
                { id: "deliverability", label: "Low deliverability", email: true, slack: true, inapp: false },
                { id: "intent", label: "High intent leads", email: false, slack: true, inapp: true },
                { id: "enrichment", label: "Enrichment complete", email: false, slack: true, inapp: false },
                { id: "weekly", label: "Weekly digest", email: true, slack: false, inapp: false },
              ]
            }
          }
        },
        include: {
          workspace: true,
          settings: true,
        }
      });
    }

    if (!(operator as any).workspace) {
        // Find if any workspace exists or create a default one
        const anyWorkspace = await (prisma as any).workspace.findFirst();
        if (anyWorkspace) {
            operator = await (prisma as any).operator.update({
                where: { id: req.user.id },
                data: { workspace_id: anyWorkspace.id },
                include: { workspace: true, settings: true }
            });
        } else {
            operator = await (prisma as any).operator.update({
                where: { id: req.user.id },
                data: {
                    workspace: {
                        create: {
                            name: 'Default Workspace',
                            domain: 'company.com'
                        }
                    }
                },
                include: { workspace: true, settings: true }
            });
        }
    }

    res.json({
      workspace: (operator as any).workspace,
      settings: (operator as any).settings,
      team: await (prisma as any).operator.findMany({
          where: { workspace_id: (operator as any).workspace_id },
          select: { id: true, name: true, email: true, role: true, created_at: true }
      }),
      integrations: await (prisma as any).clientToolAccount.findMany({
          where: { created_by_operator_id: req.user.id },
          include: { client: { select: { name: true } } }
      })
    });
  } catch (err) {
    console.error('Fetch settings error', err);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// Update settings and workspace
router.put('/', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const { workspace, settings } = req.body;

  try {
    const operator = await (prisma as any).operator.findUnique({
      where: { id: req.user.id },
    });

    if (!operator) {
      res.status(404).json({ message: 'Operator not found' });
      return;
    }

    // Update Workspace
    if (workspace && (operator as any).workspace_id) {
      await (prisma as any).workspace.update({
        where: { id: (operator as any).workspace_id },
        data: {
          name: workspace.name,
          domain: workspace.domain,
          timezone: workspace.timezone,
          logo_url: workspace.logo_url,
        },
      });
    }

    // Update Settings
    if (settings) {
      const settingsData: any = {
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
          const val = parseInt(settings.daily_send_limit);
          if (!isNaN(val)) settingsData.daily_send_limit = val;
      }
      if (settings.daily_connection_limit !== undefined) {
          const val = parseInt(settings.daily_connection_limit);
          if (!isNaN(val)) settingsData.daily_connection_limit = val;
      }
      if (settings.daily_message_limit !== undefined) {
          const val = parseInt(settings.daily_message_limit);
          if (!isNaN(val)) settingsData.daily_message_limit = val;
      }

      await (prisma as any).operatorSettings.update({
        where: { operator_id: req.user.id },
        data: settingsData,
      });
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Update settings error', err);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

export default router;
