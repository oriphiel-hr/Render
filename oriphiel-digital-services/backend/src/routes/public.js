import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { demoConfigurationCreateSchema, partnerInquiryCreateSchema } from '../lib/validation.js';
import { getTechnologyCatalogSnapshot } from '../lib/technology-catalog-service.js';

export const publicRouter = Router();

publicRouter.get('/technology-catalog', async (_req, res) => {
  const snapshot = getTechnologyCatalogSnapshot();
  return res.json({
    success: true,
    updatedAt: snapshot.lastSyncAt || new Date().toISOString(),
    lastSyncAt: snapshot.lastSyncAt,
    items: snapshot.items,
    scenarios: snapshot.scenarios
  });
});

publicRouter.post('/partner-inquiries', async (req, res) => {
  try {
    const parsed = partnerInquiryCreateSchema.parse(req.body);

    // Honeypot: bots usually fill hidden website field.
    if (parsed.website && parsed.website.trim() !== '') {
      return res.status(200).json({ success: true, id: null });
    }

    const created = await prisma.partnerInquiry.create({
      data: {
        fullName: parsed.fullName,
        email: parsed.email,
        companyName: parsed.companyName || null,
        phone: parsed.phone || null,
        serviceType: parsed.serviceType,
        leadType: 'PARTNER_INQUIRY',
        message: parsed.message,
        source: parsed.source,
        strategySnapshot: parsed.strategySnapshot || null
      }
    });

    return res.status(201).json({ success: true, id: created.id });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid payload'
    });
  }
});

publicRouter.post('/demo-configurations', async (req, res) => {
  try {
    const parsed = demoConfigurationCreateSchema.parse(req.body);

    if (parsed.website && parsed.website.trim() !== '') {
      return res.status(200).json({ success: true, id: null });
    }

    const created = await prisma.partnerInquiry.create({
      data: {
        fullName: parsed.fullName,
        email: parsed.email,
        companyName: parsed.companyName || null,
        phone: parsed.phone || null,
        serviceType: 'MARKETING',
        leadType: 'DEMO_CONFIG',
        message: parsed.message,
        source: parsed.source,
        strategySnapshot: parsed.strategySnapshot
      }
    });

    return res.status(201).json({ success: true, id: created.id });
  } catch (_error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid payload'
    });
  }
});
