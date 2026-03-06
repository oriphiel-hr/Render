import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';

const r = Router();

// list users (public - for displaying in dropdowns, limited info)
r.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '1000', 10), 1000);
    const users = await prisma.user.findMany({
      take: limit,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        city: true
      },
      orderBy: { fullName: 'asc' }
    });
    res.json(users);
  } catch (e) { next(e); }
});

// get current user info (requires auth) - MORA biti prije /:id rute!
r.get('/me', auth(true), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { providerProfile: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) { next(e); }
});

/**
 * GET /api/users/journey-status
 * Trenutni korak u user journey - za interaktivni "Vi ste ovdje" dijagram
 */
r.get('/journey-status', auth(true), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        providerProfile: true,
        jobs: {
          include: {
            offers: true
          },
          orderBy: { createdAt: 'desc' }
        },
        assignedJobs: true
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const role = user.role || 'USER';
    const isProvider = role === 'PROVIDER' || (role === 'USER' && user.providerProfile);

    if (isProvider) {
      const myJobs = user.assignedJobs || [];
      const myOffers = await prisma.offer.findMany({
        where: { userId },
        include: { job: true }
      });
      const leadPurchases = await prisma.leadPurchase.findMany({
        where: { providerId: userId },
        take: 1
      });
      const sub = await prisma.subscription.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      const hasCredits = (sub?.creditsBalance ?? 0) > 0;
      const hasActiveSub = sub && sub.status === 'ACTIVE';
      const hasLeads = leadPurchases.length > 0;
      const jobInProgress = myJobs.find((j) => j.status === 'IN_PROGRESS');
      const jobCompleted = myJobs.find((j) => j.status === 'COMPLETED');
      const offerPending = myOffers.find((o) => o.status === 'PENDING');
      const offerAccepted = myOffers.find((o) => o.status === 'ACCEPTED');

      let currentStep = 'reg';
      let waitingOn = null;
      if (!user.isVerified) {
        currentStep = 'email';
      } else if (!user.providerProfile) {
        currentStep = 'upgrade';
      } else if (!hasActiveSub && !hasCredits) {
        currentStep = 'subscription';
      } else if (!hasLeads && !offerAccepted && myOffers.length === 0) {
        currentStep = 'get_leads';
      } else if (offerPending && !offerAccepted) {
        currentStep = 'wait_accept';
        waitingOn = 'klijent';
      } else if (offerAccepted && !jobInProgress && !jobCompleted) {
        currentStep = 'start_work';
      } else if (jobInProgress) {
        currentStep = 'in_progress';
        waitingOn = 'klijent'; // čeka potvrdu završetka
      } else if (jobCompleted) {
        currentStep = 'completed';
      } else {
        currentStep = 'active';
      }

      const steps = [
        { id: 'reg', label: 'Registracija', done: true },
        { id: 'email', label: 'Potvrda emaila', done: user.isVerified },
        { id: 'upgrade', label: 'Nadogradnja na pružatelja', done: !!user.providerProfile },
        { id: 'subscription', label: 'Pretplata / Krediti', done: hasActiveSub || hasCredits },
        { id: 'get_leads', label: 'Kupi leadove ili pošalji ponude', done: hasLeads || offerAccepted || myOffers.length > 0 },
        { id: 'wait_accept', label: 'Čekaš prihvaćanje ponude', done: false, waitingOn: 'klijent' },
        { id: 'start_work', label: 'Započni rad', done: !!jobInProgress || !!jobCompleted },
        { id: 'in_progress', label: 'Rad u tijeku', done: false, waitingOn: 'klijent' },
        { id: 'completed', label: 'Završeno', done: !!jobCompleted }
      ];

      return res.json({
        role: 'PROVIDER',
        currentStep,
        waitingOn,
        steps
      });
    }

    const myJobs = user.jobs || [];
    const hasJob = myJobs.length > 0;
    const jobWithOffers = myJobs.find((j) => (j.offers?.length || 0) > 0);
    const jobWithAccepted = myJobs.find((j) => j.acceptedOfferId);
    const jobInProgress = myJobs.find((j) => j.status === 'IN_PROGRESS');
    const jobCompleted = myJobs.find((j) => j.status === 'COMPLETED');

    let currentStep = 'reg';
    let waitingOn = null;
    if (!user.isVerified) {
      currentStep = 'email';
    } else if (!hasJob) {
      currentStep = 'post_job';
    } else if (!jobWithOffers) {
      currentStep = 'wait_offers';
      waitingOn = 'pružatelji';
    } else if (!jobWithAccepted) {
      currentStep = 'choose_provider';
    } else if (!jobInProgress && !jobCompleted) {
      currentStep = 'provider_start';
      waitingOn = 'pružatelj';
    } else if (jobInProgress) {
      currentStep = 'in_progress';
      waitingOn = 'pružatelj';
    } else if (jobCompleted) {
      currentStep = 'completed';
    } else {
      currentStep = 'active';
    }

    const steps = [
      { id: 'reg', label: 'Registracija', done: true },
      { id: 'email', label: 'Potvrda emaila', done: user.isVerified },
      { id: 'post_job', label: 'Objava posla', done: hasJob },
      { id: 'wait_offers', label: 'Čekaš ponude od pružatelja', done: !!jobWithOffers, waitingOn: 'pružatelji' },
      { id: 'choose_provider', label: 'Odaberi pružatelja', done: !!jobWithAccepted },
      { id: 'provider_start', label: 'Čekaš da pružatelj započne', done: !!jobInProgress || !!jobCompleted, waitingOn: 'pružatelj' },
      { id: 'in_progress', label: 'Posao u tijeku', done: false, waitingOn: 'pružatelj' },
      { id: 'completed', label: 'Završeno', done: !!jobCompleted }
    ];

    return res.json({
      role: 'USER',
      currentStep,
      waitingOn,
      steps
    });
  } catch (e) {
    next(e);
  }
});

// update current user info (requires auth) - MORA biti prije /:id rute!
r.put('/me', auth(true), async (req, res, next) => {
  try {
    const { fullName, phone, city } = req.body;
    
    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: { providerProfile: true }
    });
    
    res.json(user);
  } catch (e) { next(e); }
});

// get single user (basic info)
r.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        city: true,
        createdAt: true
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) { next(e); }
});

export default r;

