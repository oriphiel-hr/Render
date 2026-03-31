import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAdminApiKey } from '../lib/auth.js';
import {
  clientConfigurationCreateSchema,
  clientConfigurationUpdateSchema,
  clientCreateSchema,
  partnerInquiryAdminUpdateSchema
} from '../lib/validation.js';
import { getTechnologyCatalogSnapshot, refreshTechnologyCatalog } from '../lib/technology-catalog-service.js';

export const adminRouter = Router();
adminRouter.use(requireAdminApiKey);

adminRouter.get('/partner-inquiries', async (req, res) => {
  const status = req.query.status;
  const where = status ? { status } : {};

  const rows = await prisma.partnerInquiry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return res.json({ success: true, items: rows });
});

adminRouter.get('/partner-inquiries/:id', async (req, res) => {
  const row = await prisma.partnerInquiry.findUnique({
    where: { id: req.params.id }
  });

  if (!row) {
    return res.status(404).json({ error: 'Not found' });
  }

  return res.json({ success: true, item: row });
});

adminRouter.patch('/partner-inquiries/:id', async (req, res) => {
  try {
    const parsed = partnerInquiryAdminUpdateSchema.parse(req.body);
    const row = await prisma.partnerInquiry.update({
      where: { id: req.params.id },
      data: parsed
    });
    return res.json({ success: true, item: row });
  } catch (error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

adminRouter.get('/partner-inquiries/stats', async (_req, res) => {
  const grouped = await prisma.partnerInquiry.groupBy({
    by: ['status'],
    _count: { _all: true }
  });

  return res.json({ success: true, grouped });
});

adminRouter.get('/partner-inquiries/demo-insights', async (_req, res) => {
  const demoLeads = await prisma.partnerInquiry.findMany({
    where: { leadType: 'DEMO_CONFIG' },
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true,
      createdAt: true,
      fullName: true,
      email: true,
      strategySnapshot: true
    }
  });

  const trackCounts = { STARTER: 0, GROWTH: 0, PREMIUM: 0, UNKNOWN: 0 };
  const questionsCount = new Map();

  demoLeads.forEach((lead) => {
    const snapshot = lead.strategySnapshot;
    const offer = snapshot?.offerSnapshot;
    const track = offer?.recommendedTrack;
    if (track && trackCounts[track] !== undefined) {
      trackCounts[track] += 1;
    } else {
      trackCounts.UNKNOWN += 1;
    }

    const qaRows = offer?.predictedQA || [];
    qaRows.forEach((row) => {
      if (!row?.q) return;
      questionsCount.set(row.q, (questionsCount.get(row.q) || 0) + 1);
    });
  });

  const topQuestions = Array.from(questionsCount.entries())
    .map(([question, count]) => ({ question, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return res.json({
    success: true,
    totals: {
      demoLeads: demoLeads.length
    },
    byRecommendedTrack: trackCounts,
    topQuestions
  });
});

adminRouter.get('/technology-catalog/status', async (_req, res) => {
  const snapshot = getTechnologyCatalogSnapshot();
  return res.json({
    success: true,
    lastSyncAt: snapshot.lastSyncAt,
    items: snapshot.items
  });
});

adminRouter.post('/technology-catalog/refresh', async (_req, res) => {
  const snapshot = await refreshTechnologyCatalog();
  return res.json({
    success: true,
    lastSyncAt: snapshot.lastSyncAt,
    verifiedItems: snapshot.items.length,
    items: snapshot.items
  });
});

adminRouter.post('/clients', async (req, res) => {
  try {
    const parsed = clientCreateSchema.parse(req.body);
    const created = await prisma.client.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        companyName: parsed.companyName || null,
        phone: parsed.phone || null,
        notes: parsed.notes || null
      }
    });
    return res.status(201).json({ success: true, item: created });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

adminRouter.get('/clients', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { companyName: { contains: q, mode: 'insensitive' } }
        ]
      }
    : {};

  const items = await prisma.client.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  return res.json({ success: true, items });
});

adminRouter.get('/clients/:id/configurations', async (req, res) => {
  const client = await prisma.client.findUnique({
    where: { id: req.params.id }
  });
  if (!client) {
    return res.status(404).json({ success: false, error: 'Client not found' });
  }

  const items = await prisma.clientConfiguration.findMany({
    where: { clientId: req.params.id },
    orderBy: { version: 'desc' }
  });
  return res.json({ success: true, client, items });
});

adminRouter.post('/clients/:id/configurations', async (req, res) => {
  try {
    const parsed = clientConfigurationCreateSchema.parse(req.body);

    const latest = await prisma.clientConfiguration.findFirst({
      where: { clientId: req.params.id },
      orderBy: { version: 'desc' },
      select: { version: true }
    });
    const nextVersion = (latest?.version || 0) + 1;

    const created = await prisma.clientConfiguration.create({
      data: {
        clientId: req.params.id,
        version: nextVersion,
        title: parsed.title,
        status: parsed.status || 'DRAFT',
        sourceInquiryId: parsed.sourceInquiryId || null,
        strategySnapshot: parsed.strategySnapshot,
        pricingSnapshot: parsed.pricingSnapshot || null,
        createdBy: parsed.createdBy || null
      }
    });
    return res.status(201).json({ success: true, item: created });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

adminRouter.patch('/client-configurations/:id', async (req, res) => {
  try {
    const parsed = clientConfigurationUpdateSchema.parse(req.body);
    const updated = await prisma.clientConfiguration.update({
      where: { id: req.params.id },
      data: parsed
    });
    return res.json({ success: true, item: updated });
  } catch (_error) {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
});

adminRouter.post('/client-configurations/:id/duplicate', async (req, res) => {
  const existing = await prisma.clientConfiguration.findUnique({
    where: { id: req.params.id }
  });
  if (!existing) {
    return res.status(404).json({ success: false, error: 'Configuration not found' });
  }

  const latest = await prisma.clientConfiguration.findFirst({
    where: { clientId: existing.clientId },
    orderBy: { version: 'desc' },
    select: { version: true }
  });
  const nextVersion = (latest?.version || 0) + 1;

  const created = await prisma.clientConfiguration.create({
    data: {
      clientId: existing.clientId,
      version: nextVersion,
      title: `${existing.title} (v${nextVersion})`,
      status: 'DRAFT',
      sourceInquiryId: existing.sourceInquiryId,
      strategySnapshot: existing.strategySnapshot,
      pricingSnapshot: existing.pricingSnapshot,
      createdBy: existing.createdBy
    }
  });

  return res.status(201).json({ success: true, item: created });
});

adminRouter.post('/demo-configurations/:inquiryId/convert-to-client-config', async (req, res) => {
  const inquiry = await prisma.partnerInquiry.findUnique({
    where: { id: req.params.inquiryId }
  });
  if (!inquiry || inquiry.leadType !== 'DEMO_CONFIG') {
    return res.status(404).json({ success: false, error: 'Demo inquiry not found' });
  }

  const client =
    (await prisma.client.findFirst({
      where: { email: inquiry.email }
    })) ||
    (await prisma.client.create({
      data: {
        name: inquiry.fullName,
        email: inquiry.email,
        companyName: inquiry.companyName,
        phone: inquiry.phone
      }
    }));

  const latest = await prisma.clientConfiguration.findFirst({
    where: { clientId: client.id },
    orderBy: { version: 'desc' },
    select: { version: true }
  });
  const nextVersion = (latest?.version || 0) + 1;

  const createdConfig = await prisma.clientConfiguration.create({
    data: {
      clientId: client.id,
      version: nextVersion,
      title: `Konfiguracija iz demo upita (${inquiry.createdAt.toISOString().slice(0, 10)})`,
      status: 'DRAFT',
      sourceInquiryId: inquiry.id,
      strategySnapshot: inquiry.strategySnapshot || {},
      pricingSnapshot: null
    }
  });

  await prisma.partnerInquiry.update({
    where: { id: inquiry.id },
    data: { clientId: client.id }
  });

  return res.status(201).json({
    success: true,
    client,
    configuration: createdConfig
  });
});
