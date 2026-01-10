import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import { notifyNewJob, notifyAcceptedOffer, notifyJobCompleted } from '../lib/notifications.js';
import { sendAnonymousJobConfirmationEmail } from '../lib/email.js';

const r = Router();

// list jobs with filters
r.get('/', auth(false), async (req, res, next) => {
  try {
    const { q, categoryId, city, latitude, longitude, distance = 50, urgency, jobSize, minBudget, maxBudget, myJobs } = req.query;
    
    // Ako je myJobs=true i korisnik je prijavljen, filtriraj po userId
    const userId = req.user?.id;
    
    const whereClause = {
      ...(myJobs && userId ? { userId } : { status: 'OPEN' }), // Ako je myJobs, prikaži sve poslove korisnika (svih statusa), inače samo otvorene
      ...(categoryId ? { categoryId } : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(urgency ? { urgency } : {}),
      ...(jobSize ? { jobSize } : {}),
      ...(minBudget ? { budgetMax: { gte: parseInt(minBudget) } } : {}),
      ...(maxBudget ? { budgetMin: { lte: parseInt(maxBudget) } } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {})
    };
    
    let jobs = await prisma.job.findMany({
      where: whereClause,
      include: { 
        category: true, 
        offers: {
          select: { id: true, userId: true, status: true }
        },
        user: {
          select: { id: true, fullName: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }).catch(err => {
      console.error('Error fetching jobs:', err);
      throw err;
    });
    
    // Filter by distance if coordinates provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      const maxDistance = parseFloat(distance);
      
      jobs = jobs.filter(job => {
        if (!job.latitude || !job.longitude) return false;
        const R = 6371; // Earth radius in km
        const dLat = (job.latitude - userLat) * Math.PI / 180;
        const dLon = (job.longitude - userLon) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userLat * Math.PI / 180) * Math.cos(job.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const dist = R * c;
        job.distance = Math.round(dist * 10) / 10; // Round to 1 decimal
        return dist <= maxDistance;
      }).sort((a, b) => a.distance - b.distance);
    }
    
    // Maskiraj kontakte dok ponuda nije prihvaćena
    const { maskUserContacts } = await import('../lib/contact-masking.js');
    const maskedJobs = jobs.map(job => ({
      ...job,
      user: maskUserContacts(job.user, job, req.user?.id)
    }));
    
    res.json(maskedJobs);
  } catch (e) { next(e); }
});

// Get jobs relevant to provider's categories (including subcategories)
r.get('/for-provider', auth(true, ['PROVIDER']), async (req, res, next) => {
  try {
    const { latitude, longitude, distance = 50 } = req.query;
    
    // Get provider's categories
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        categories: true
      }
    });

    if (!providerProfile) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }

    const categoryIds = providerProfile.categories.map(cat => cat.id);
    
    if (categoryIds.length === 0) {
      return res.json([]);
    }

    // For each category, find all subcategories
    const allCategoryIds = new Set(categoryIds);
    for (const catId of categoryIds) {
      const subcategories = await prisma.category.findMany({
        where: { parentId: catId },
        select: { id: true }
      });
      subcategories.forEach(sub => allCategoryIds.add(sub.id));
    }

    const finalCategoryIds = Array.from(allCategoryIds);
    
    // Get jobs in these categories
    let jobs = await prisma.job.findMany({
      where: {
        status: 'OPEN',
        categoryId: { in: finalCategoryIds }
      },
      include: { 
        category: true, 
        offers: {
          select: { id: true, userId: true, status: true }
        },
        user: {
          select: { id: true, fullName: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Filter by distance if coordinates provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      const maxDistance = parseFloat(distance);
      
      jobs = jobs.filter(job => {
        if (!job.latitude || !job.longitude) return false;
        const R = 6371; // Earth radius in km
        const dLat = (job.latitude - userLat) * Math.PI / 180;
        const dLon = (job.longitude - userLon) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(userLat * Math.PI / 180) * Math.cos(job.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const dist = R * c;
        job.distance = Math.round(dist * 10) / 10; // Round to 1 decimal
        return dist <= maxDistance;
      }).sort((a, b) => a.distance - b.distance);
    }
    
    // Maskiraj kontakte dok ponuda nije prihvaćena
    const { maskUserContacts } = await import('../lib/contact-masking.js');
    const maskedJobs = jobs.map(job => ({
      ...job,
      user: maskUserContacts(job.user, job, req.user.id)
    }));
    
    res.json(maskedJobs);
  } catch (e) { next(e); }
});

// create job - allow anonymous users (like Trebam.hr)
r.post('/', async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      categoryId,
      subcategoryId,
      projectType,
      customFields,
      budgetMin, 
      budgetMax, 
      city, 
      latitude, 
      longitude, 
      urgency = 'NORMAL', 
      jobSize, 
      deadline, 
      images = [],
      // Anonymous user contact info
      contactEmail,
      contactPhone,
      contactName,
      anonymous = false
    } = req.body;
    
    // If subcategory is provided, use it as the categoryId
    const finalCategoryId = subcategoryId || categoryId;
    
    if (!title || !description || !finalCategoryId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // For anonymous users, require contact info
    let userId = null;
    
    // Check if user is authenticated
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    if (authToken) {
      try {
        const jwt = await import('jsonwebtoken');
        const SECRET = process.env.JWT_SECRET || 'dev-super-secret';
        const decoded = jwt.verify(authToken, SECRET);
        userId = decoded.id;
      } catch (e) {
        // Token invalid or expired, continue as anonymous
      }
    }
    
    // If not authenticated and anonymous, require contact info
    if (!userId && (anonymous || !contactEmail || !contactPhone || !contactName)) {
      return res.status(400).json({ 
        error: 'Missing contact information',
        message: 'Za anonimne korisnike morate unijeti email, telefon i ime'
      });
    }
    
    // Generate linking token for anonymous users
    let linkingToken = null;
    let linkingTokenExpiresAt = null;
    
    if (anonymous && !userId) {
      const crypto = await import('crypto');
      linkingToken = crypto.randomBytes(32).toString('hex');
      linkingTokenExpiresAt = new Date();
      linkingTokenExpiresAt.setDate(linkingTokenExpiresAt.getDate() + 7); // 7 days
    }
    
    const job = await prisma.job.create({
      data: {
        title, 
        description, 
        categoryId: finalCategoryId,
        projectType: projectType || null,
        customFields: customFields || null,
        budgetMin: budgetMin ? parseInt(budgetMin) : null, 
        budgetMax: budgetMax ? parseInt(budgetMax) : null,
        city: city || null, 
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        urgency,
        jobSize,
        deadline: deadline ? new Date(deadline) : null,
        images: Array.isArray(images) ? images : [],
        userId: userId, // Will be null for anonymous users
        linkingToken: linkingToken, // Token for linking job to account after registration
        linkingTokenExpiresAt: linkingTokenExpiresAt, // Token expires in 7 days
        
        // Store contact info in custom fields for anonymous users
        ...(anonymous && {
          customFields: {
            ...(customFields || {}),
            _anonymous: true,
            _contactEmail: contactEmail,
            _contactPhone: contactPhone,
            _contactName: contactName
          }
        })
      }
    });
    
    // If anonymous user, send confirmation email with registration link
    if (anonymous && contactEmail) {
      try {
        await sendAnonymousJobConfirmationEmail(contactEmail, contactName, title, job.id);
        console.log(`[ANONYMOUS_JOB] Confirmation email sent to: ${contactEmail}`);
      } catch (emailError) {
        console.error('[ANONYMOUS_JOB] Failed to send confirmation email:', emailError);
        // Don't fail the job creation if email fails
      }
    }
    
    // Pošalji notifikacije pružateljima u kategoriji
    await notifyNewJob(job, finalCategoryId);
    
    res.status(201).json({
      ...job,
      message: anonymous ? 'Hvala na upitu! Poslali smo Vam e-mail s detaljima.' : 'Posao kreiran uspješno!'
    });
  } catch (e) { next(e); }
});

// accept offer (USER or PROVIDER can accept offers on their jobs)
r.post('/:jobId/accept/:offerId', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const { jobId, offerId } = req.params;
    const job = await prisma.job.findUnique({ 
      where: { id: jobId },
      include: { user: true }
    });
    if (!job || job.userId !== req.user.id) return res.status(404).json({ error: 'Job not found' });
    
    const offer = await prisma.offer.findUnique({ 
      where: { id: offerId },
      include: { user: true }
    });
    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    
    // PREVENT SELF-ASSIGNMENT: Check if job creator and offer provider are same company (by OIB/email)
    const jobUser = await prisma.user.findUnique({
      where: { id: job.userId },
      select: { id: true, taxId: true, email: true }
    });
    
    const offerProvider = await prisma.user.findUnique({
      where: { id: offer.userId },
      select: { id: true, taxId: true, email: true }
    });
    
    if (jobUser && offerProvider) {
      // Same userId - cannot self-assign
      if (jobUser.id === offerProvider.id) {
        return res.status(403).json({ 
          error: 'Ne možete prihvatiti ponudu od samog sebe',
          message: 'Ista tvrtka/obrt ne može sebi dodjeljivati posao.'
        });
      }
      
      // Same taxId - same company cannot assign to itself
      if (jobUser.taxId && offerProvider.taxId && jobUser.taxId === offerProvider.taxId) {
        return res.status(403).json({ 
          error: 'Ne možete prihvatiti ponudu od iste tvrtke',
          message: `Isti OIB (${jobUser.taxId}) ne može sebi dodjeljivati posao.`
        });
      }
      
      // Same email - same user account (even with different role) cannot self-assign
      if (jobUser.email && offerProvider.email && jobUser.email === offerProvider.email) {
        return res.status(403).json({ 
          error: 'Ne možete prihvatiti ponudu od samog sebe',
          message: 'Ista tvrtka/obrt ne može sebi dodjeljivati posao.'
        });
      }
    }
    
    await prisma.offer.update({ where: { id: offerId }, data: { status: 'ACCEPTED' } });
    await prisma.job.update({ where: { id: jobId }, data: { status: 'IN_PROGRESS', acceptedOfferId: offerId } });
    
    // Pošalji notifikaciju pružatelju
    await notifyAcceptedOffer(offer, job);
    
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Mark job as completed
r.patch('/:jobId/complete', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        offers: {
          where: { status: 'ACCEPTED' },
          include: { user: true }
        }
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check authorization: owner or provider who has accepted offer
    const isOwner = job.userId === req.user.id;
    const isProvider = job.offers.length > 0 && job.offers[0].userId === req.user.id;
    
    if (!isOwner && !isProvider) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    if (job.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Job is not in progress' });
    }
    
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { status: 'COMPLETED' }
    });
    
    // Automatski zaključaj sve threadove za ovaj posao
    try {
      const { lockThreadsForCompletedJob } = await import('../services/thread-locking-service.js');
      await lockThreadsForCompletedJob(jobId);
    } catch (lockError) {
      console.error('Error locking threads for completed job:', lockError);
      // Ne bacamo grešku - notifikacija je važnija
    }
    
    // Send notifications
    await notifyJobCompleted(jobId);
    
    res.json({
      success: true,
      job: updatedJob
    });
  } catch (e) { next(e); }
});

// Mark job as cancelled
r.patch('/:jobId/cancel', auth(true, ['USER', 'PROVIDER']), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;
    
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        offers: {
          where: { status: 'ACCEPTED' },
          include: { user: true }
        }
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Only owner can cancel
    if (job.userId !== req.user.id) {
      return res.status(403).json({ error: 'Only job owner can cancel' });
    }
    
    if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot cancel completed or already cancelled job' });
    }
    
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { status: 'CANCELLED' }
    });
    
    // If there was an accepted offer, notify provider
    if (job.offers.length > 0) {
      const provider = job.offers[0].user;
      await prisma.notification.create({
        data: {
          title: 'Posao otkazan',
          message: `Posao "${job.title}" je otkazan${reason ? ': ' + reason : ''}`,
          type: 'JOB_CANCELLED',
          userId: provider.id,
          jobId: job.id
        }
      });
    }
    
    res.json({
      success: true,
      job: updatedJob
    });
  } catch (e) { next(e); }
});

/**
 * GET /api/jobs/:jobId/audit-logs
 * Dohvati audit logove za otkrivanje kontakata za posao
 */
r.get('/:jobId/audit-logs', auth(true), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Verify user has access to this job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        user: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Only job owner or admin can view audit logs
    if (job.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { getJobAuditLogs } = await import('../services/audit-log-service.js');
    const auditLogs = await getJobAuditLogs(jobId, parseInt(limit), parseInt(offset));

    res.json(auditLogs);
  } catch (e) {
    next(e);
  }
});

export default r;