import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

const r = Router();

// GET /api/growth/favorites
r.get('/favorites', auth(true, ['USER', 'PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const rows = await prisma.favoriteProvider.findMany({
      where: { userId: req.user.id },
      include: {
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true,
            city: true,
            phone: true,
            providerProfile: {
              select: { id: true, ratingAvg: true, ratingCount: true, avgResponseTimeMinutes: true, companyName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

// POST /api/growth/favorites { providerId }
r.post('/favorites', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const { providerId } = req.body || {};
    if (!providerId) {
      return res.status(400).json({ error: 'providerId je obavezan' });
    }
    if (providerId === req.user.id) {
      return res.status(400).json({ error: 'Ne možete dodati sami sebe' });
    }
    const target = await prisma.user.findFirst({
      where: { id: providerId, role: 'PROVIDER' },
      select: { id: true }
    });
    if (!target) {
      return res.status(404).json({ error: 'Pružatelj nije pronađen' });
    }
    const row = await prisma.favoriteProvider.upsert({
      where: { userId_providerId: { userId: req.user.id, providerId } },
      create: { userId: req.user.id, providerId },
      update: {}
    });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

// DELETE /api/growth/favorites/:providerId
r.delete('/favorites/:providerId', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const { providerId } = req.params;
    await prisma.favoriteProvider.deleteMany({
      where: { userId: req.user.id, providerId }
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/growth/disputes
r.post('/disputes', auth(true), async (req, res, next) => {
  try {
    const { jobId, title, description } = req.body || {};
    if (!title || !description) {
      return res.status(400).json({ error: 'title i description su obavezni' });
    }
    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) return res.status(404).json({ error: 'Posao nije pronađen' });
      if (job.userId !== req.user.id && job.assignedProviderId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Niste povezani s ovim poslom' });
      }
    }
    const d = await prisma.disputeCase.create({
      data: { userId: req.user.id, jobId: jobId || null, title: String(title), description: String(description) }
    });
    res.status(201).json(d);
  } catch (e) {
    next(e);
  }
});

// GET /api/growth/disputes
r.get('/disputes', auth(true), async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') {
      const all = await prisma.disputeCase.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: { user: { select: { id: true, fullName: true, email: true } }, job: { select: { id: true, title: true } } }
      });
      return res.json(all);
    }
    const list = await prisma.disputeCase.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

// POST /api/growth/instant-bookings
r.post('/instant-bookings', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const { providerId, categoryId, requestedStart, message } = req.body || {};
    if (!providerId || !categoryId || !requestedStart) {
      return res.status(400).json({ error: 'providerId, categoryId, requestedStart su obavezni' });
    }
    const [cat, prov] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.user.findFirst({
        where: { id: providerId, role: 'PROVIDER' },
        include: { providerProfile: { include: { categories: true } } }
      })
    ]);
    if (!cat?.supportsInstantBooking) {
      return res.status(400).json({ error: 'Kategorija ne podržava trenutnu rezervaciju termina' });
    }
    if (!prov?.providerProfile?.categories?.some((c) => c.id === categoryId)) {
      return res.status(400).json({ error: 'Pružatelj nije u toj kategoriji' });
    }
    if (req.user.id === providerId) {
      return res.status(400).json({ error: 'Ne možete rezervirati sami sebi' });
    }
    const start = new Date(requestedStart);
    if (Number.isNaN(start.getTime()) || start.getTime() < Date.now() - 60_000) {
      return res.status(400).json({ error: 'Nevažeći termin' });
    }
    const created = await prisma.instantBookingRequest.create({
      data: {
        userId: req.user.id,
        providerId,
        categoryId,
        requestedStart: start,
        message: message ? String(message) : null
      }
    });
    try {
      await prisma.notification.create({
        data: {
          userId: providerId,
          type: 'SYSTEM',
          title: 'Novi zahtjev za termin',
          message: `Korisnik želi brzi termin u kategoriji: ${cat.name}. Otvorite Uslugar za detalje.`,
          jobId: null,
          offerId: null
        }
      });
    } catch (notifyErr) {
      console.warn('instant booking notify', notifyErr?.message);
    }
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

// GET /api/growth/instant-bookings (moji kao korisnik ili pružatelj)
r.get('/instant-bookings', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    if (req.user.role === 'PROVIDER') {
      const list = await prisma.instantBookingRequest.findMany({
        where: { providerId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { category: { select: { name: true } }, user: { select: { id: true, fullName: true, phone: true } } }
      });
      return res.json(list);
    }
    const list = await prisma.instantBookingRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { category: { select: { name: true } }, provider: { select: { id: true, fullName: true } } }
    });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

// POST /api/growth/reminders { categoryId, label?, periodMonths?, nextRemindAt? }
r.post('/reminders', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const { categoryId, label, periodMonths = 12, nextRemindAt } = req.body || {};
    if (!categoryId) {
      return res.status(400).json({ error: 'categoryId je obavezan' });
    }
    const cat = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!cat) return res.status(404).json({ error: 'Kategorija nije pronađena' });
    const nextAt = nextRemindAt
      ? new Date(nextRemindAt)
      : new Date(
          Date.now() + (Number(cat.seasonalDefaultMonths) || 12) * 30 * 24 * 60 * 60 * 1000
        );
    const created = await prisma.userSeasonalReminder.create({
      data: {
        userId: req.user.id,
        categoryId,
        label: label || cat.name,
        nextRemindAt: nextAt,
        periodMonths: Math.min(24, Math.max(1, Number(periodMonths) || 12))
      }
    });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

r.get('/reminders', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const list = await prisma.userSeasonalReminder.findMany({
      where: { userId: req.user.id, isActive: true },
      orderBy: { nextRemindAt: 'asc' },
      include: { category: { select: { name: true, icon: true } } }
    });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

r.delete('/reminders/:id', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    await prisma.userSeasonalReminder.deleteMany({
      where: { id: req.params.id, userId: req.user.id }
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default r;
