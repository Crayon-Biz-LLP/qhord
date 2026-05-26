"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureOperatorBootstrap = ensureOperatorBootstrap;
const prisma_1 = require("./prisma");
const defaultNotifications = [
    { id: 'replies', label: 'New replies', email: true, slack: true, inapp: true },
    { id: 'meeting', label: 'Meeting booked', email: true, slack: true, inapp: true },
    { id: 'errors', label: 'Campaign errors', email: true, slack: true, inapp: true },
    { id: 'deliverability', label: 'Low deliverability', email: true, slack: true, inapp: false },
    { id: 'intent', label: 'High intent leads', email: false, slack: true, inapp: true },
    { id: 'enrichment', label: 'Enrichment complete', email: false, slack: true, inapp: false },
    { id: 'weekly', label: 'Weekly digest', email: true, slack: false, inapp: false },
];
/** Ensures operator has workspace + settings rows (for users created before merge). */
async function ensureOperatorBootstrap(operatorId) {
    let operator = await prisma_1.prisma.operator.findUnique({
        where: { id: operatorId },
        include: { workspace: true, settings: true },
    });
    if (!operator) {
        return null;
    }
    if (!operator.settings) {
        operator = await prisma_1.prisma.operator.update({
            where: { id: operatorId },
            data: {
                settings: {
                    create: { notifications: defaultNotifications },
                },
            },
            include: { workspace: true, settings: true },
        });
    }
    if (!operator.workspace) {
        const anyWorkspace = await prisma_1.prisma.workspace.findFirst();
        if (anyWorkspace) {
            operator = await prisma_1.prisma.operator.update({
                where: { id: operatorId },
                data: { workspace_id: anyWorkspace.id },
                include: { workspace: true, settings: true },
            });
        }
        else {
            operator = await prisma_1.prisma.operator.update({
                where: { id: operatorId },
                data: {
                    workspace: {
                        create: {
                            name: 'Default Workspace',
                            domain: 'company.com',
                        },
                    },
                },
                include: { workspace: true, settings: true },
            });
        }
    }
    return operator;
}
