import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import toolRoutes from './routes/tools';
import executionRoutes from './routes/executions';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Health check error', err);
    res.status(500).json({ status: 'error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/executions', executionRoutes);

const port = parseInt(process.env.PORT || '4000', 10);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${port}`);
});

