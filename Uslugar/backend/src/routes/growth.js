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
    const respondByAt = new Date();
    respondByAt.setDate(respondByAt.getDate() + 7);
    const d = await prisma.disputeCase.create({
      data: {
        userId: req.user.id,
        jobId: jobId || null,
        title: String(title),
        description: String(description),
        respondByAt,
        lastTeamActionAt: new Date()
      }
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

// GET /api/growth/disputes/:id
r.get('/disputes/:id', auth(true), async (req, res, next) => {
  try {
    const row = await prisma.disputeCase.findUnique({
      where: { id: req.params.id },
      include: { job: { select: { id: true, title: true, status: true } } }
    });
    if (!row) return res.status(404).json({ error: 'Nije pronađeno' });
    if (req.user.role === 'ADMIN') return res.json(row);
    if (row.userId !== req.user.id) return res.status(403).json({ error: 'Pristup odbijen' });
    return res.json(row);
  } catch (e) {
    next(e);
  }
});

// PATCH /api/growth/disputes/:id (admin: status, napomene, isplata; korisnik: nema u ovom MVP-u)
r.patch('/disputes/:id', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { status, mediationNotes, payoutAmountCents, payoutCurrency, resolvedAt } = req.body || {};
    const data = {};
    if (status) data.status = status;
    if (mediationNotes != null) data.mediationNotes = String(mediationNotes);
    if (payoutAmountCents != null) data.payoutAmountCents = parseInt(payoutAmountCents, 10);
    if (payoutCurrency) data.payoutCurrency = String(payoutCurrency);
    if (resolvedAt) data.resolvedAt = new Date(resolvedAt);
    if (data.status === 'RESOLVED' || data.status === 'REJECTED') {
      if (!data.resolvedAt) data.resolvedAt = new Date();
    }
    data.lastTeamActionAt = new Date();
    const row = await prisma.disputeCase.update({ where: { id: req.params.id }, data });
    res.json(row);
  } catch (e) {
    next(e);
  }
});

// GET /api/growth/availability-slots/public?providerId=&categoryId=
r.get('/availability-slots/public', async (req, res, next) => {
  try {
    const { providerId, categoryId } = req.query;
    if (!providerId || !categoryId) {
      return res.status(400).json({ error: 'providerId i categoryId su obavezni' });
    }
    const now = new Date();
    const slots = await prisma.providerAvailabilitySlot.findMany({
      where: { providerId, categoryId, endAt: { gte: now } },
      orderBy: { startAt: 'asc' },
      take: 60
    });
    res.json(slots);
  } catch (e) {
    next(e);
  }
});

// GET /api/growth/availability-slots (moji slotovi – pružatelj)
r.get('/availability-slots', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const uid = req.user.role === 'ADMIN' && req.query.providerId ? req.query.providerId : req.user.id;
    const list = await prisma.providerAvailabilitySlot.findMany({
      where: { providerId: uid, endAt: { gte: new Date(Date.now() - 86400000) } },
      orderBy: { startAt: 'asc' },
      take: 80,
      include: { category: { select: { name: true } } }
    });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

// POST /api/growth/availability-slots { categoryId, startAt, endAt }
r.post('/availability-slots', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const { categoryId, startAt, endAt } = req.body || {};
    if (!categoryId || !startAt || !endAt) {
      return res.status(400).json({ error: 'categoryId, startAt, endAt su obavezni' });
    }
    const s = new Date(startAt);
    const e = new Date(endAt);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e <= s) {
      return res.status(400).json({ error: 'Nevažeći interval' });
    }
    const prov = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      include: { categories: true }
    });
    if (!prov?.categories?.some((c) => c.id === categoryId)) {
      return res.status(400).json({ error: 'Niste u toj kategoriji' });
    }
    const row = await prisma.providerAvailabilitySlot.create({
      data: { providerId: req.user.id, categoryId, startAt: s, endAt: e, capacity: 1 }
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

r.delete('/availability-slots/:id', auth(true, ['PROVIDER', 'ADMIN']), async (req, res, next) => {
  try {
    const n = await prisma.providerAvailabilitySlot.deleteMany({
      where: { id: req.params.id, providerId: req.user.id }
    });
    if (n.count === 0) return res.status(404).json({ error: 'Nije pronađeno' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// POST /api/growth/instant-bookings
r.post('/instant-bookings', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const { providerId, categoryId, requestedStart, message, slotId } = req.body || {};
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

    let st = 'PENDING';
    let boundSlot = null;
    if (slotId) {
      boundSlot = await prisma.providerAvailabilitySlot.findFirst({
        where: { id: slotId, providerId, categoryId, startAt: { lte: start }, endAt: { gte: start } }
      });
      if (boundSlot) st = 'SLOT_BOUND';
    }

    const created = await prisma.instantBookingRequest.create({
      data: {
        userId: req.user.id,
        providerId,
        categoryId,
        requestedStart: start,
        message: message ? String(message) : null,
        status: st,
        slotId: boundSlot ? boundSlot.id : null
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
// - default USER: moji odlazni zahtjevi (kao klijent)
// - default PROVIDER: dolazni zahtjevi (kao pružatelj)
// - ?view=client: moji odlazni zahtjevi (i za PROVIDER — npr. tražio sam tuđu uslugu)
r.get('/instant-bookings', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const asClientView = req.query.view === 'client' || req.query.mine === 'client';
    if (asClientView) {
      const list = await prisma.instantBookingRequest.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { category: { select: { name: true } }, provider: { select: { id: true, fullName: true } } }
      });
      return res.json(list);
    }
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

// PATCH /api/growth/instant-bookings/:id (pružatelj: potvrda / odbij / kontra-termin; klijent: odustanak / potvrda kontra-termina)
r.patch('/instant-bookings/:id', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const { action, counterOfferStart, declineReason } = req.body || {};
    if (!action) {
      return res.status(400).json({ error: 'action je obavezan' });
    }
    const row = await prisma.instantBookingRequest.findUnique({ where: { id: req.params.id } });
    if (!row) return res.status(404).json({ error: 'Nije pronađeno' });

    const isProvider = req.user.id === row.providerId;
    const isClient = req.user.id === row.userId;

    const data = {};
    if (isProvider) {
      if (action === 'confirm') {
        data.status = 'CONFIRMED';
        data.confirmedAt = new Date();
      } else if (action === 'decline') {
        data.status = 'DECLINED';
        if (declineReason) data.declineReason = String(declineReason);
      } else if (action === 'counter' && counterOfferStart) {
        data.status = 'COUNTER_PROPOSED';
        data.counterOfferStart = new Date(counterOfferStart);
      } else {
        return res.status(400).json({ error: 'Nepoznata akcija pružatelja' });
      }
    } else if (isClient) {
      if (action === 'cancel') {
        data.status = 'CANCELLED';
        data.clientCancelledAt = new Date();
      } else if (action === 'accept_counter' && row.counterOfferStart) {
        data.status = 'CONFIRMED';
        data.confirmedAt = new Date();
        data.requestedStart = row.counterOfferStart;
      } else {
        return res.status(400).json({ error: 'Nepoznata akcija klijenta' });
      }
    } else {
      return res.status(403).json({ error: 'Niste strana u ovom zahtjevu' });
    }

    const updated = await prisma.instantBookingRequest.update({ where: { id: row.id }, data });
    if (isProvider) {
      try {
        await prisma.notification.create({
          data: {
            userId: row.userId,
            type: 'SYSTEM',
            title: 'Ažuriranje brzog termina',
            message: 'Pružatelj je ažurirao vaš zahtjev. Otvorite Uslugar.',
            jobId: null,
            offerId: null
          }
        });
      } catch (err) {
        console.warn('instant patch notify', err?.message);
      }
    } else {
      try {
        await prisma.notification.create({
          data: {
            userId: row.providerId,
            type: 'SYSTEM',
            title: 'Ažuriranje brzog termina',
            message: 'Korisnik je ažurirao brzi zahtjev.',
            jobId: null,
            offerId: null
          }
        });
      } catch (err) {
        console.warn('instant patch notify', err?.message);
      }
    }
    res.json(updated);
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
