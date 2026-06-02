"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const operator_bootstrap_1 = require("../lib/operator-bootstrap");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    try {
        const operator = await (0, operator_bootstrap_1.ensureOperatorBootstrap)(req.user.id);
        if (!operator) {
            res.status(404).json({ message: 'Operator not found' });
            return;
        }
        const team = operator.workspace_id
            ? await prisma_1.prisma.operator.findMany({
                where: { workspace_id: operator.workspace_id },
                select: { id: true, name: true, email: true, role: true, created_at: true },
            })
            : [];
        const integrations = await prisma_1.prisma.clientToolAccount.findMany({
            where: { created_by_operator_id: req.user.id },
            include: { client: { select: { name: true } } },
        });
        res.json({
            workspace: operator.workspace,
            settings: operator.settings,
            team,
            integrations,
        });
    }
    catch (err) {
        console.error('Fetch settings error', err);
        res.status(500).json({
            message: 'Failed to fetch settings',
            hint: 'Run: npx prisma db push (workspaces / operator_settings tables may be missing)',
            detail: err?.message,
        });
    }
});
router.put('/', auth_1.requireAuth, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    const { workspace, settings } = req.body;
    try {
        const operator = await (0, operator_bootstrap_1.ensureOperatorBootstrap)(req.user.id);
        if (!operator) {
            res.status(404).json({ message: 'Operator not found' });
            return;
        }
        if (workspace && operator.workspace_id) {
            await prisma_1.prisma.workspace.update({
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
            const settingsData = {
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
                if (!isNaN(val))
                    settingsData.daily_send_limit = val;
            }
            if (settings.daily_connection_limit !== undefined) {
                const val = parseInt(String(settings.daily_connection_limit), 10);
                if (!isNaN(val))
                    settingsData.daily_connection_limit = val;
            }
            if (settings.daily_message_limit !== undefined) {
                const val = parseInt(String(settings.daily_message_limit), 10);
                if (!isNaN(val))
                    settingsData.daily_message_limit = val;
            }
            await prisma_1.prisma.operatorSettings.upsert({
                where: { operator_id: req.user.id },
                create: {
                    operator_id: req.user.id,
                    ...settingsData,
                },
                update: settingsData,
            });
        }
        res.json({ message: 'Settings updated successfully' });
    }
    catch (err) {
        console.error('Update settings error', err);
        res.status(500).json({
            message: 'Failed to update settings',
            hint: 'Run: npx prisma db push',
            detail: err?.message,
        });
    }
});
exports.default = router;
