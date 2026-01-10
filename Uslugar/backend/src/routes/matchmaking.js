/**
 * USLUGAR EXCLUSIVE - Matchmaking API Routes
 * 
 * API endpointovi za matchmaking i kombinirani match score
 */

import express from 'express';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

const r = express.Router();

/**
 * GET /api/matchmaking/jobs/:jobId/combined-score/:providerId
 * Dohvati kombinirani match score za providera i posao
 */
r.get('/jobs/:jobId/combined-score/:providerId', auth(true), async (req, res, next) => {
  try {
    const { jobId, providerId } = req.params;

    // Provjeri pristup - samo admin ili provider vidi svoj score
    if (req.user.role !== 'ADMIN' && req.user.id !== providerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Dohvati provider profil
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!providerProfile) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Izračunaj kombinirani match score
    const { calculateCombinedMatchScore } = await import('../services/team-category-matching.js');
    const matchResult = await calculateCombinedMatchScore(jobId, providerId);

    res.json({
      success: true,
      jobId,
      providerId,
      providerName: providerProfile.user.fullName,
      ...matchResult
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/matchmaking/jobs/:jobId/combined-scores
 * Dohvati kombinirane match score-ove za sve providere (samo admin)
 */
r.get('/jobs/:jobId/combined-scores', auth(true), async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can view all combined scores' });
    }

    const { jobId } = req.params;

    // Dohvati posao
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        category: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Dohvati sve providere s tom kategorijom
    const providers = await prisma.providerProfile.findMany({
      where: {
        categories: {
          some: { id: job.categoryId }
        },
        isAvailable: true
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        categories: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 50 // Limit za performanse
    });

    // Izračunaj kombinirani score za svakog providera
    const { calculateCombinedMatchScore } = await import('../services/team-category-matching.js');
    const scores = await Promise.all(
      providers.map(async (provider) => {
        try {
          const matchResult = await calculateCombinedMatchScore(jobId, provider.id);
          return {
            providerId: provider.id,
            providerName: provider.user.fullName,
            ...matchResult
          };
        } catch (error) {
          console.error(`Error calculating score for provider ${provider.id}:`, error);
          return {
            providerId: provider.id,
            providerName: provider.user.fullName,
            combinedScore: 0,
            error: 'Failed to calculate score'
          };
        }
      })
    );

    // Sortiraj po combined score-u
    scores.sort((a, b) => b.combinedScore - a.combinedScore);

    res.json({
      success: true,
      jobId,
      jobTitle: job.title,
      scores
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/matchmaking/jobs/:jobId/recalculate-score/:providerId
 * Ručna recalculacija kombiniranog match score-a (samo admin)
 */
r.post('/jobs/:jobId/recalculate-score/:providerId', auth(true), async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can recalculate scores' });
    }

    const { jobId, providerId } = req.params;

    // Provjeri postojanje
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    const provider = await prisma.providerProfile.findUnique({ where: { id: providerId } });

    if (!job || !provider) {
      return res.status(404).json({ error: 'Job or provider not found' });
    }

    // Izračunaj kombinirani match score
    const { calculateCombinedMatchScore } = await import('../services/team-category-matching.js');
    const matchResult = await calculateCombinedMatchScore(jobId, providerId);

    res.json({
      success: true,
      message: 'Score recalculated',
      ...matchResult
    });
  } catch (e) {
    next(e);
  }
});

export default r;

