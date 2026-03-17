"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const clients_1 = __importDefault(require("./routes/clients"));
const tools_1 = __importDefault(require("./routes/tools"));
const executions_1 = __importDefault(require("./routes/executions"));
const db_1 = require("./config/db");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*', credentials: true }));
app.use(express_1.default.json({ limit: '1mb' }));
app.get('/api/health', async (_req, res) => {
    try {
        await db_1.pool.query('SELECT 1');
        res.json({ status: 'ok' });
    }
    catch {
        res.status(500).json({ status: 'error' });
    }
});
app.use('/api/auth', auth_1.default);
app.use('/api/clients', clients_1.default);
app.use('/api/tools', tools_1.default);
app.use('/api/executions', executions_1.default);
const port = parseInt(process.env.PORT || '4000', 10);
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${port}`);
});
