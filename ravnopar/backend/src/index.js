import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { matchmakingRouter } from './routes/matchmaking.js';
import { authRouter } from './routes/auth.js';
import { paymentsRouter } from './routes/payments.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ravnopar-backend' });
});

app.use('/api/auth', authRouter);
app.use('/api/matchmaking', matchmakingRouter);
app.use('/api/payments', paymentsRouter);

const port = Number(process.env.PORT || 4200);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Ravnopar backend running on ${port}`);
});
