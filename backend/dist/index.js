"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const auth_1 = __importDefault(require("./routes/auth"));
const clients_1 = __importDefault(require("./routes/clients"));
const tools_1 = __importDefault(require("./routes/tools"));
const executions_1 = __importDefault(require("./routes/executions"));
const plans_1 = __importDefault(require("./routes/plans"));
const campaigns_1 = __importDefault(require("./routes/campaigns"));
const node_status_1 = __importDefault(require("./routes/node-status"));
const approvals_1 = __importDefault(require("./routes/approvals"));
const execution_1 = __importDefault(require("./routes/execution"));
const ai_metrics_1 = __importDefault(require("./routes/ai-metrics"));
const subscription_1 = __importDefault(require("./routes/subscription"));
const command_center_1 = __importDefault(require("./routes/command-center"));
const queue_1 = __importDefault(require("./routes/queue"));
const workflows_1 = __importDefault(require("./routes/workflows"));
const memory_1 = __importDefault(require("./routes/memory"));
const settings_1 = __importDefault(require("./routes/settings"));
const leads_1 = __importDefault(require("./routes/leads"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const playbooks_1 = __importDefault(require("./routes/playbooks"));
const deals_1 = __importDefault(require("./routes/deals"));
const inbox_1 = __importDefault(require("./routes/inbox"));
const unified_inbox_1 = __importDefault(require("./routes/unified-inbox"));
const inbox_webhooks_1 = __importDefault(require("./routes/inbox-webhooks"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const prisma_1 = require("./lib/prisma");
const app = (0, express_1.default)();
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://qhord.seenode.app',
    'http://localhost:3000'
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }
        const cleanOrigin = origin.replace(/\/$/, '');
        const cleanAllowedOrigins = allowedOrigins.map(o => o.replace(/\/$/, ''));
        if (cleanAllowedOrigins.includes(cleanOrigin)) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.get('/api/health', async (_req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({ status: 'ok' });
    }
    catch (err) {
        console.error('Health check error', err);
        res.status(500).json({ status: 'error' });
    }
});
app.use('/api/auth', auth_1.default);
app.use('/api/clients', clients_1.default);
app.use('/api/clients', unified_inbox_1.default);
app.use('/api/tools', tools_1.default);
app.use('/api/executions', executions_1.default);
app.use('/api/plans', plans_1.default);
app.use('/api/campaigns', campaigns_1.default);
app.use('/api/nodes', node_status_1.default);
app.use('/api/approvals', approvals_1.default);
app.use('/api/execution', execution_1.default);
app.use('/api/queue', queue_1.default);
app.use('/api/workflows', workflows_1.default);
app.use('/api/memory', memory_1.default);
app.use('/api', ai_metrics_1.default);
app.use('/api/subscription', subscription_1.default);
app.use('/api/command-center', command_center_1.default);
app.use('/api/settings', settings_1.default);
app.use('/api/leads', leads_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/playbooks', playbooks_1.default);
app.use('/api/deals', deals_1.default);
app.use('/api/inbox', inbox_1.default);
app.use('/api/webhooks/inbox', inbox_webhooks_1.default);
app.use('/api/webhooks', webhooks_1.default);
// Optional: background inbox sync (BullMQ + Redis). Off by default so the app
// runs without Redis; enable with INBOX_BACKGROUND_SYNC=true.
if (process.env.INBOX_BACKGROUND_SYNC === 'true') {
    void Promise.resolve().then(() => __importStar(require('./workers/inbox-sync.worker'))).then(({ inboxSyncWorker }) => {
        void inboxSyncWorker;
    });
    void Promise.resolve().then(() => __importStar(require('./queue/inbox-queue'))).then(({ scheduleInboxSync }) => scheduleInboxSync().catch((err) => console.error('Failed to schedule inbox background sync:', err)));
}
const port = parseInt(process.env.PORT || '4000', 10);
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${port}`);
});
