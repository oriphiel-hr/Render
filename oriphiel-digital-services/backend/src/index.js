import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { refreshTechnologyCatalog } from './lib/technology-catalog-service.js';

const app = express();
const port = Number(process.env.PORT || 4100);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  })
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'oriphiel-digital-services-backend' });
});

app.use('/api', publicRouter);
app.use('/api/admin', adminRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

const syncMinutes = Number(process.env.CATALOG_SYNC_INTERVAL_MINUTES || 0);
if (syncMinutes > 0) {
  const intervalMs = syncMinutes * 60 * 1000;
  setInterval(() => {
    refreshTechnologyCatalog().catch(() => null);
  }, intervalMs);
}

refreshTechnologyCatalog().catch(() => null);
