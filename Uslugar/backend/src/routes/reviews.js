import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { auth } from '../lib/auth.js';
import { autoModerateReview } from '../services/review-moderation-service.js';

const r = Router();

// GET /api/reviews - Lista svih review-a (za admin panel)
r.get('/', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, toUserId, fromUserId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {};
    if (toUserId) where.toUserId = toUserId;
    if (fromUserId) where.fromUserId = fromUserId;
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          job: { select: { id: true, title: true } },
          from: { select: { id: true, fullName: true, email: true } },
          to: { select: { id: true, fullName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.review.count({ where })
    ]);
    
    res.json({ reviews, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) { next(e); }
});

// GET /api/reviews/user/:userId - Review-i za određenog korisnika
// Vraća samo objavljene review-e (osim ako je admin ili vlasnik)
r.get('/user/:userId', auth(false), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, includePending = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Provjeri da li je korisnik admin ili vlasnik review-a
    const isAdmin = req.user?.role === 'ADMIN';
    const isOwner = req.user?.id === userId;
    
    // Ako nije admin ili vlasnik, prikaži samo objavljene i odobrene review-e
    const where = { 
      toUserId: userId,
      ...(includePending === 'true' || isAdmin || isOwner 
        ? {} 
        : { 
            isPublished: true,
            moderationStatus: 'APPROVED' // Samo odobrene review-e
          })
    };
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          job: { select: { id: true, title: true } },
          from: { select: { id: true, fullName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.review.count({ where })
    ]);
    
    res.json({ reviews, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) { next(e); }
});

// POST /api/reviews - Kreiranje novog review-a
r.post('/', auth(true), async (req, res, next) => {
  try {
    const { toUserId, rating, comment, jobId } = req.body;
    if (!toUserId || !rating || !jobId) {
      return res.status(400).json({ 
        error: 'Missing required fields: toUserId, rating, jobId' 
      });
    }
    
    // Provjeri da li job postoji i da su useri uključeni u transakciju
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        user: true,
        assignedProvider: true,
        acceptedOffer: true
      }
    });
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Validacija: Provjeri da su korisnici povezani preko job-a
    let isValidReview = false;
    
    if (req.user.role === 'USER') {
      // Korisnik mora biti vlasnik job-a
      if (job.userId === req.user.id && job.assignedProviderId === toUserId) {
        isValidReview = true;
      }
    } else if (req.user.role === 'PROVIDER') {
      // Pružatelj mora biti assignedProvider
      if (job.assignedProviderId === req.user.id && job.userId === toUserId) {
        isValidReview = true;
      }
    }
    
    if (!isValidReview) {
      return res.status(403).json({ 
        error: 'Niste autorizirani da ostavite recenziju za ovog korisnika. Morate biti povezani preko job-a.' 
      });
    }
    
    // Provjeri da li korisnik već ima review za ovaj job
    const existingReview = await prisma.review.findFirst({
      where: { 
        fromUserId: req.user.id, 
        jobId 
      }
    });
    
    if (existingReview) {
      return res.status(400).json({ error: 'Već ste ocijenili ovaj posao' });
    }
    
    // AI automatska moderacija sadržaja
    const moderationResult = await autoModerateReview(comment || '', Number(rating));
    
    // Izračunaj review deadline (7-10 dana od završetka posla ili od trenutka)
    // Ako job ima deadline, koristimo ga; inače koristimo 10 dana od sada
    const reviewDeadlineDays = 10; // 7-10 dana (srednja vrijednost)
    const reviewDeadline = new Date();
    if (job.deadline && new Date(job.deadline) < new Date()) {
      // Ako je posao već završen (deadline prošao), postavi deadline na 10 dana od završetka
      reviewDeadline.setTime(new Date(job.deadline).getTime() + reviewDeadlineDays * 24 * 60 * 60 * 1000);
    } else {
      // Ako posao još nije završen, postavi deadline na 10 dana od sada
      reviewDeadline.setTime(reviewDeadline.getTime() + reviewDeadlineDays * 24 * 60 * 60 * 1000);
    }
    
    // Provjeri da li postoji recipročni review (druga strana)
    const reciprocalReview = await prisma.review.findFirst({
      where: {
        jobId: jobId,
        fromUserId: toUserId, // Druga strana
        toUserId: req.user.id // Trenutni korisnik
      }
    });
    
    // Ako postoji recipročni review i AI je odobrio, objavi oba odmah
    // Ako AI nije odobrio, ne objavljuj dok admin ne odobri
    const shouldPublish = !!reciprocalReview && moderationResult.isApproved;
    const now = new Date();
    
    const review = await prisma.review.create({
      data: { 
        jobId,
        toUserId, 
        rating: Number(rating), 
        comment: comment || '', 
        fromUserId: req.user.id,
        isPublished: shouldPublish,
        publishedAt: shouldPublish ? now : null,
        reviewDeadline: reviewDeadline,
        moderationStatus: moderationResult.moderationStatus, // PENDING, APPROVED, ili REJECTED
        moderationNotes: moderationResult.reason || null // Razlog ako je potrebna moderacija
      },
      include: {
        job: {
          select: { id: true, title: true }
        },
        from: { select: { id: true, fullName: true, email: true } },
        to: { select: { id: true, fullName: true, email: true } }
      }
    });

    // Ako postoji recipročni review i oba su odobrena, objavi oba
    if (reciprocalReview && !reciprocalReview.isPublished && moderationResult.isApproved) {
      // Provjeri da li je recipročni review također odobren
      const reciprocalModerationStatus = reciprocalReview.moderationStatus || 'PENDING';
      if (reciprocalModerationStatus === 'APPROVED') {
        await prisma.review.update({
          where: { id: reciprocalReview.id },
          data: {
            isPublished: true,
            publishedAt: now
          }
        });
      }
    }

    // Update aggregates - samo za objavljene review-e i samo za provider profile
    // Također provjeri da li je review odobren od strane AI-a
    if (shouldPublish && moderationResult.isApproved) {
      const toUser = await prisma.user.findUnique({ where: { id: toUserId } });
      if (toUser?.role === 'PROVIDER') {
        const aggr = await prisma.review.aggregate({
          where: { 
            toUserId,
            isPublished: true, // Samo objavljene review-e
            moderationStatus: 'APPROVED' // Samo odobrene review-e
          },
          _avg: { rating: true },
          _count: { rating: true }
        });
        await prisma.providerProfile.updateMany({
          where: { userId: toUserId },
          data: { ratingAvg: aggr._avg.rating || 0, ratingCount: aggr._count.rating }
        });
      }
    }

    // Ako AI nije odobrio, obavijesti korisnika
    if (!moderationResult.isApproved && moderationResult.needsHumanReview) {
      await prisma.notification.create({
        data: {
          title: 'Recenzija čeka moderaciju',
          message: 'Vaša recenzija je poslana na moderaciju. Objavljena će biti nakon provjere.',
          type: 'REVIEW_PENDING',
          userId: req.user.id
        }
      });
    } else if (!moderationResult.isApproved && !moderationResult.needsHumanReview) {
      await prisma.notification.create({
        data: {
          title: 'Recenzija odbijena',
          message: `Vaša recenzija je automatski odbijena: ${moderationResult.reason || 'Krši pravila platforme'}`,
          type: 'REVIEW_REJECTED',
          userId: req.user.id
        }
      });
    }

    res.status(201).json(review);
  } catch (e) { 
    console.error('[REVIEWS] Error creating review:', e);
    next(e); 
  }
});

// PUT /api/reviews/:id - Ažuriranje review-a
r.put('/:id', auth(true, ['USER']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const review = await prisma.review.findFirst({
      where: { id, fromUserId: req.user.id }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found or access denied' });
    }
    
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating: Number(rating), comment: comment || '' },
      include: {
        from: { select: { id: true, fullName: true, email: true } },
        to: { select: { id: true, fullName: true, email: true } }
      }
    });

    // update aggregates - samo za objavljene i odobrene review-e
    const toUser = await prisma.user.findUnique({ 
      where: { id: review.toUserId },
      select: { role: true }
    });

    if (toUser?.role === 'PROVIDER') {
      const aggr = await prisma.review.aggregate({
        where: { 
          toUserId: review.toUserId,
          isPublished: true, // Samo objavljene review-e
          moderationStatus: 'APPROVED' // Samo odobrene review-e
        },
        _avg: { rating: true },
        _count: { rating: true }
      });
      await prisma.providerProfile.updateMany({
        where: { userId: review.toUserId },
        data: { ratingAvg: aggr._avg.rating || 0, ratingCount: aggr._count.rating }
      });
    }

    res.json(updatedReview);
  } catch (e) { next(e); }
});

// DELETE /api/reviews/:id - Brisanje review-a
r.delete('/:id', auth(true, ['USER', 'ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findFirst({
      where: { 
        id, 
        ...(req.user.role !== 'ADMIN' ? { fromUserId: req.user.id } : {})
      }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found or access denied' });
    }
    
    await prisma.review.delete({ where: { id } });

    // update aggregates - samo za objavljene i odobrene review-e
    const toUser = await prisma.user.findUnique({ 
      where: { id: review.toUserId },
      select: { role: true }
    });

    if (toUser?.role === 'PROVIDER') {
      const aggr = await prisma.review.aggregate({
        where: { 
          toUserId: review.toUserId,
          isPublished: true, // Samo objavljene review-e
          moderationStatus: 'APPROVED' // Samo odobrene review-e
        },
        _avg: { rating: true },
        _count: { rating: true }
      });
      await prisma.providerProfile.updateMany({
        where: { userId: review.toUserId },
        data: { ratingAvg: aggr._avg.rating || 0, ratingCount: aggr._count.rating }
      });
    }

    res.status(204).send();
  } catch (e) { next(e); }
});

// POST /api/reviews/:id/reply - Odgovor na recenziju (1x dozvoljen)
r.post('/:id/reply', auth(true), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;
    
    if (!replyText || replyText.trim().length === 0) {
      return res.status(400).json({ error: 'Odgovor ne može biti prazan' });
    }
    
    // Pronađi review
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            userId: true,
            assignedProviderId: true
          }
        }
      }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Recenzija nije pronađena' });
    }
    
    // Provjeri da li je korisnik autoriziran da odgovori (mora biti toUserId - onaj koji je dobio recenziju)
    if (review.toUserId !== req.user.id) {
      return res.status(403).json({ 
        error: 'Niste autorizirani da odgovorite na ovu recenziju. Samo korisnik koji je dobio recenziju može odgovoriti.' 
      });
    }
    
    // Provjeri da li je već odgovoreno (1x dozvoljen)
    if (review.hasReplied) {
      return res.status(400).json({ 
        error: 'Već ste odgovorili na ovu recenziju. Odgovor je dozvoljen samo jednom.' 
      });
    }
    
    // Provjeri da li je review objavljen (može se odgovoriti samo na objavljene recenzije)
    if (!review.isPublished) {
      return res.status(400).json({ 
        error: 'Ne možete odgovoriti na recenziju koja još nije objavljena.' 
      });
    }
    
    // Ažuriraj review s odgovorom
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        replyText: replyText.trim(),
        repliedAt: new Date(),
        hasReplied: true
      },
      include: {
        job: {
          select: { id: true, title: true }
        },
        from: { select: { id: true, fullName: true, email: true } },
        to: { select: { id: true, fullName: true, email: true } }
      }
    });
    
    res.json(updatedReview);
  } catch (e) {
    console.error('[REVIEWS] Error adding reply to review:', e);
    next(e);
  }
});

// GET /api/reviews/pending - Recenzije koje čekaju moderaciju (admin)
r.get('/pending', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const { getPendingModerationReviews } = await import('../services/review-moderation-service.js');
    const reviews = await getPendingModerationReviews(parseInt(limit), skip);
    
    const total = await prisma.review.count({
      where: { moderationStatus: 'PENDING' }
    });
    
    res.json({
      reviews,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (e) {
    console.error('[REVIEWS] Error fetching pending reviews:', e);
    next(e);
  }
});

// POST /api/reviews/:id/approve - Odobri recenziju (admin)
r.post('/:id/approve', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const { approveReview } = await import('../services/review-moderation-service.js');
    const review = await approveReview(id, req.user.id, notes);
    
    res.json(review);
  } catch (e) {
    console.error('[REVIEWS] Error approving review:', e);
    next(e);
  }
});

// POST /api/reviews/:id/reject - Odbij recenziju (admin)
r.post('/:id/reject', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason, notes } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ error: 'Razlog odbijanja je obavezan' });
    }
    
    const { rejectReview } = await import('../services/review-moderation-service.js');
    const review = await rejectReview(id, req.user.id, rejectionReason, notes);
    
    res.json(review);
  } catch (e) {
    console.error('[REVIEWS] Error rejecting review:', e);
    next(e);
  }
});

// POST /api/reviews/:id/report - Prijava lažne ocjene
r.post('/:id/report', auth(true), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Razlog prijave je obavezan' });
    }
    
    // Pronađi review
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            userId: true,
            assignedProviderId: true
          }
        }
      }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Recenzija nije pronađena' });
    }
    
    // Provjeri da li je korisnik autoriziran da prijavi (mora biti toUserId - onaj koji je dobio recenziju)
    if (review.toUserId !== req.user.id) {
      return res.status(403).json({ 
        error: 'Niste autorizirani da prijavite ovu recenziju. Samo korisnik koji je dobio recenziju može je prijaviti.' 
      });
    }
    
    // Provjeri da li je već prijavljena
    if (review.isReported && review.reportStatus === 'PENDING') {
      return res.status(400).json({ 
        error: 'Ova recenzija je već prijavljena i čeka pregled.' 
      });
    }
    
    // Ažuriraj review s prijavom
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        isReported: true,
        reportedBy: req.user.id,
        reportedAt: new Date(),
        reportReason: reason.trim(),
        reportStatus: 'PENDING'
      },
      include: {
        job: {
          select: { id: true, title: true }
        },
        from: { select: { id: true, fullName: true, email: true } },
        to: { select: { id: true, fullName: true, email: true } }
      }
    });
    
    // Obavijesti admina o novoj prijavi
    try {
      const reporter = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { fullName: true, email: true }
      });
      
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      });
      
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            title: 'Nova prijava lažne ocjene',
            message: `Korisnik ${reporter?.fullName || reporter?.email || 'Nepoznat'} je prijavio recenziju kao lažnu. Razlog: ${reason.trim()}`,
            type: 'REVIEW_REPORTED',
            userId: admin.id
          }
        });
      }
    } catch (notifError) {
      console.error('[REVIEWS] Failed to notify admins:', notifError);
    }
    
    res.json(updatedReview);
  } catch (e) {
    console.error('[REVIEWS] Error reporting review:', e);
    next(e);
  }
});

// GET /api/reviews/reports - Lista prijava lažnih ocjena (admin)
r.get('/reports', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      isReported: true,
      ...(status ? { reportStatus: status } : {})
    };
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          job: {
            select: { id: true, title: true }
          },
          from: { select: { id: true, fullName: true, email: true } },
          to: { select: { id: true, fullName: true, email: true } }
        },
        orderBy: { reportedAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.review.count({ where })
    ]);
    
    // Dohvati podatke o korisniku koji je prijavio (reportedBy)
    const reportsWithReporter = await Promise.all(
      reviews.map(async (review) => {
        if (review.reportedBy) {
          const reporter = await prisma.user.findUnique({
            where: { id: review.reportedBy },
            select: { id: true, fullName: true, email: true }
          });
          return { ...review, reporter };
        }
        return { ...review, reporter: null };
      })
    );
    
    res.json({
      reports: reportsWithReporter,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (e) {
    console.error('[REVIEWS] Error fetching reports:', e);
    next(e);
  }
});

// POST /api/reviews/:id/report/resolve - Rješavanje prijave (admin)
r.post('/:id/report/resolve', auth(true, ['ADMIN']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // action: 'dismiss' ili 'accept'
    
    if (!action || !['dismiss', 'accept'].includes(action)) {
      return res.status(400).json({ error: 'Action mora biti "dismiss" ili "accept"' });
    }
    
    // Pronađi review
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        from: { select: { id: true, fullName: true, email: true } },
        to: { select: { id: true, fullName: true, email: true } }
      }
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Recenzija nije pronađena' });
    }
    
    if (!review.isReported) {
      return res.status(400).json({ error: 'Ova recenzija nije prijavljena' });
    }
    
    const reportStatus = action === 'accept' ? 'ACCEPTED' : 'DISMISSED';
    
    // Ako je prihvaćeno (recenzija je lažna), odbij recenziju
    if (action === 'accept') {
      await prisma.review.update({
        where: { id },
        data: {
          reportStatus: 'ACCEPTED',
          reportReviewedBy: req.user.id,
          reportReviewedAt: new Date(),
          reportReviewNotes: notes || 'Prijava prihvaćena - recenzija je lažna',
          moderationStatus: 'REJECTED',
          moderationReviewedBy: req.user.id,
          moderationReviewedAt: new Date(),
          moderationRejectionReason: 'Prijava lažne ocjene prihvaćena',
          isPublished: false // Skrij recenziju
        }
      });
      
      // Obavijesti korisnika koji je dao recenziju
      try {
        await prisma.notification.create({
          data: {
            title: 'Vaša recenzija je odbijena',
            message: 'Vaša recenzija je prijavljena i potvrđena kao lažna. Recenzija je uklonjena.',
            type: 'REVIEW_REJECTED',
            userId: review.fromUserId
          }
        });
      } catch (notifError) {
        console.error('[REVIEWS] Failed to notify user:', notifError);
      }
      
      // Ažuriraj aggregate (ukloni odbijenu recenziju iz kalkulacije)
      const toUser = await prisma.user.findUnique({
        where: { id: review.toUserId },
        select: { role: true }
      });
      
      if (toUser?.role === 'PROVIDER') {
        const aggr = await prisma.review.aggregate({
          where: {
            toUserId: review.toUserId,
            isPublished: true,
            moderationStatus: 'APPROVED'
          },
          _avg: { rating: true },
          _count: { rating: true }
        });
        
        await prisma.providerProfile.updateMany({
          where: { userId: review.toUserId },
          data: {
            ratingAvg: aggr._avg.rating || 0,
            ratingCount: aggr._count.rating
          }
        });
      }
    } else {
      // Odbij prijavu (recenzija nije lažna)
      await prisma.review.update({
        where: { id },
        data: {
          reportStatus: 'DISMISSED',
          reportReviewedBy: req.user.id,
          reportReviewedAt: new Date(),
          reportReviewNotes: notes || 'Prijava odbijena - recenzija nije lažna'
        }
      });
      
      // Obavijesti korisnika koji je prijavio
      try {
        await prisma.notification.create({
          data: {
            title: 'Prijava odbijena',
            message: 'Vaša prijava lažne ocjene je pregledana i odbijena. Recenzija ostaje objavljena.',
            type: 'REVIEW_REPORT_DISMISSED',
            userId: review.reportedBy
          }
        });
      } catch (notifError) {
        console.error('[REVIEWS] Failed to notify user:', notifError);
      }
    }
    
    const updatedReview = await prisma.review.findUnique({
      where: { id },
      include: {
        job: {
          select: { id: true, title: true }
        },
        from: { select: { id: true, fullName: true, email: true } },
        to: { select: { id: true, fullName: true, email: true } }
      }
    });
    
    res.json(updatedReview);
  } catch (e) {
    console.error('[REVIEWS] Error resolving report:', e);
    next(e);
  }
});

export default r;