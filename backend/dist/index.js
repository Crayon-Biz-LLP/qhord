"use strict";
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
const prisma_1 = require("./lib/prisma");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*', credentials: true }));
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
const port = parseInt(process.env.PORT || '4000', 10);
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${port}`);
});
