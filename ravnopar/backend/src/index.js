import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { matchmakingRouter } from './routes/matchmaking.js';
import { authRouter } from './routes/auth.js';
import { paymentsRouter, handleStripeWebhook } from './routes/payments.js';
import { adminRouter } from './routes/admin.js';
import { prisma } from './lib/prisma.js';

const app = express();
const startedAt = new Date().toISOString();

const frontendBaseUrl = process.env.FRONTEND_BASE_URL?.replace(/\/$/, '');
const corsOrigins = [
  frontendBaseUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: corsOrigins.length ? corsOrigins : true,
  credentials: true
}));

app.post(
  '/api/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

app.use(express.json({ limit: '2mb' }));

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ok: true,
      service: 'ravnopar-backend',
      startedAt,
      database: 'ok'
    });
  } catch (_error) {
    res.status(503).json({
      ok: false,
      service: 'ravnopar-backend',
      startedAt,
      database: 'error'
    });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/matchmaking', matchmakingRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);

const port = Number(process.env.PORT || 4200);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Ravnopar backend running on ${port}`);
});
