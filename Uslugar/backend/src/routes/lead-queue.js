/**
 * USLUGAR EXCLUSIVE - Lead Queue API Routes
 * 
 * Endpoints za upravljanje queue sistemom
 */

import express from 'express'
import { PrismaClient } from '@prisma/client'
import { auth } from '../lib/auth.js'
import { 
  findTopProviders, 
  createLeadQueue, 
  offerToNextInQueue,
  respondToLeadOffer 
} from '../lib/leadQueueManager.js'

const router = express.Router()
const prisma = new PrismaClient()

// Helper middleware
const authMiddleware = auth()

/**
 * GET /api/lead-queue/my-offers
 * Dohvaća aktivne ponude za ulogiranog providera
 */
router.get('/my-offers', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    
    const activeOffers = await prisma.leadQueue.findMany({
      where: {
        providerId: userId,
        status: 'OFFERED',
        expiresAt: { gt: new Date() }
      },
      include: {
        job: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                fullName: true,
                city: true,
                clientVerification: true
              }
            }
          }
        }
      },
      orderBy: { offeredAt: 'desc' }
    })
    
    // Dodaj preostalo vrijeme
    const offersWithTimeLeft = activeOffers.map(offer => ({
      ...offer,
      timeLeftHours: Math.max(0, Math.floor((offer.expiresAt - new Date()) / (1000 * 60 * 60))),
      timeLeftMinutes: Math.max(0, Math.floor(((offer.expiresAt - new Date()) % (1000 * 60 * 60)) / (1000 * 60)))
    }))
    
    res.json({
      success: true,
      offers: offersWithTimeLeft
    })
  } catch (error) {
    console.error('Error fetching offers:', error)
    res.status(500).json({
      success: false,
      message: 'Greška pri dohvaćanju ponuda',
      error: error.message
    })
  }
})

/**
 * GET /api/lead-queue/my-queue
 * Dohvaća sve queue stavke za providera (history)
 */
router.get('/my-queue', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { status, limit = 20, offset = 0 } = req.query
    
    const where = {
      providerId: userId
    }
    
    if (status) {
      where.status = status
    }
    
    const queueItems = await prisma.leadQueue.findMany({
      where,
      include: {
        job: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                fullName: true,
                city: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    })
    
    // Za svaki queue item, izračunaj dodatne informacije
    const enhancedQueueItems = await Promise.all(queueItems.map(async (item) => {
      // Pronađi ukupan broj ljudi u redu za ovaj job
      const queueForThisJob = await prisma.leadQueue.findMany({
        where: { jobId: item.jobId },
        orderBy: { position: 'asc' }
      })
      
      // Izračunaj koliko ljudi je ispred
      const peopleAhead = queueForThisJob.filter(q => 
        q.position < item.position && 
        (q.status === 'OFFERED' || q.status === 'WAITING')
      ).length
      
      // Provjeri je li posao već uzet
      const jobTaken = queueForThisJob.some(q => q.status === 'ACCEPTED')
      
      // Izračunaj procijenjeno vrijeme čekanja
      const estimatedWaitHours = peopleAhead * 24
      
      return {
        ...item,
        queueInfo: {
          position: item.position,
          totalInQueue: queueForThisJob.length,
          peopleAhead,
          estimatedWaitHours,
          jobTaken
        }
      }
    }))
    
    const total = await prisma.leadQueue.count({ where })
    
    res.json({
      success: true,
      queueItems: enhancedQueueItems,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Error fetching queue:', error)
    res.status(500).json({
      success: false,
      message: 'Greška pri dohvaćanju queue-a',
      error: error.message
    })
  }
})

/**
 * GET /api/lead-queue/job/:jobId/my-position
 * Provider vidi svoju poziciju u redu za određeni job
 */
router.get('/job/:jobId/my-position', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params
    const userId = req.user.id
    
    // Pronađi providerov queue item za ovaj job
    const myQueueItem = await prisma.leadQueue.findFirst({
      where: {
        jobId,
        providerId: userId
      },
      include: {
        job: {
          include: {
            category: true
          }
        }
      }
    })
    
    if (!myQueueItem) {
      return res.status(404).json({
        success: false,
        message: 'Vi niste u redu za ovaj posao'
      })
    }
    
    // Pronađi sve stavke u redu za ovaj job (za kontekst)
    const allQueueItems = await prisma.leadQueue.findMany({
      where: { jobId },
      include: {
        provider: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: { position: 'asc' }
    })
    
    // Izračunaj koliko ljudi je ispred njega
    const peopleAhead = allQueueItems.filter(item => 
      item.position < myQueueItem.position && 
      (item.status === 'OFFERED' || item.status === 'WAITING')
    ).length
    
    // Provjeri je li posao već rezerviran
    const jobTaken = allQueueItems.some(item => item.status === 'ACCEPTED')
    
    // Izračunaj prosječno vrijeme čekanja (po 24h po osobi)
    const estimatedWaitHours = peopleAhead * 24
    const estimatedWaitText = estimatedWaitHours > 24 
      ? `${Math.floor(estimatedWaitHours / 24)} dana`
      : `${estimatedWaitHours} sati`
    
    res.json({
      success: true,
      myPosition: {
        position: myQueueItem.position,
        totalInQueue: allQueueItems.length,
        status: myQueueItem.status,
        peopleAhead,
        estimatedWaitHours,
        estimatedWaitText,
        jobTaken,
        expiresAt: myQueueItem.expiresAt,
        hasTimeLeft: myQueueItem.expiresAt ? myQueueItem.expiresAt > new Date() : false
      },
      job: {
        id: myQueueItem.job.id,
        title: myQueueItem.job.title,
        category: myQueueItem.job.category.name,
        city: myQueueItem.job.city,
        leadPrice: myQueueItem.job.leadPrice
      },
      queueContext: allQueueItems.map(item => ({
        position: item.position,
        status: item.status,
        providerName: item.providerId === userId ? 'Vi' : item.provider.fullName,
        offeredAt: item.offeredAt,
        expiresAt: item.expiresAt
      }))
    })
  } catch (error) {
    console.error('Error fetching position:', error)
    res.status(500).json({
      success: false,
      message: 'Greška pri dohvaćanju pozicije',
      error: error.message
    })
  }
})

/**
 * POST /api/lead-queue/:id/respond
 * Provider odgovara na ponuđeni lead
 */
router.post('/:id/respond', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { response } = req.body // 'INTERESTED' | 'NOT_INTERESTED'
    const userId = req.user.id
    
    if (!['INTERESTED', 'NOT_INTERESTED'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Nevažeći odgovor. Dopušteno: INTERESTED, NOT_INTERESTED'
      })
    }
    
    const result = await respondToLeadOffer(id, response, userId)
    
    if (response === 'INTERESTED') {
      res.json({
        success: true,
        message: 'Lead uspješno kupljen!',
        leadPurchase: result
      })
    } else {
      res.json({
        success: true,
        message: 'Odbili ste lead. Ponuđen je sljedećem provideru.'
      })
    }
  } catch (error) {
    console.error('Error responding to lead:', error)
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
})

/**
 * GET /api/lead-queue/job/:jobId
 * Dohvaća queue za određeni job (samo za admina ili klijenta)
 */
router.get('/job/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params
    const userId = req.user.id
    
    // Provjeri da li je korisnik admin ili vlasnik joba
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    })
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job ne postoji'
      })
    }
    
    if (job.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Nemate pristup ovom queue-u'
      })
    }
    
    const queueItems = await prisma.leadQueue.findMany({
      where: { jobId },
      include: {
        job: {
          include: {
            category: true
          }
        }
      },
      orderBy: { position: 'asc' }
    })
    
    // Za klijenta, ne prikazuj imena providera dok nisu kupili lead
    const sanitizedQueue = queueItems.map(item => {
      if (req.user.role !== 'ADMIN' && item.status !== 'ACCEPTED') {
        return {
          ...item,
          providerId: '***hidden***',
          position: item.position,
          status: item.status
        }
      }
      return item
    })
    
    res.json({
      success: true,
      queue: sanitizedQueue
    })
  } catch (error) {
    console.error('Error fetching job queue:', error)
    res.status(500).json({
      success: false,
      message: 'Greška pri dohvaćanju queue-a',
      error: error.message
    })
  }
})

/**
 * POST /api/lead-queue/create-for-job/:jobId
 * Kreira queue za job (automatski se poziva pri kreiranju joba)
 */
router.post('/create-for-job/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params
    const { providerLimit = 5 } = req.body
    
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { category: true }
    })
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job ne postoji'
      })
    }
    
    // Provjeri postoji li već queue
    const existingQueue = await prisma.leadQueue.findFirst({
      where: { jobId }
    })
    
    if (existingQueue) {
      return res.status(400).json({
        success: false,
        message: 'Queue već postoji za ovaj job'
      })
    }
    
    // Pronađi top providere
    const topProviders = await findTopProviders(job, providerLimit)
    
    if (topProviders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nema dostupnih providera za ovu kategoriju u vašoj lokaciji'
      })
    }
    
    // Kreiraj queue
    const queue = await createLeadQueue(jobId, topProviders)
    
    res.json({
      success: true,
      message: `Queue kreiran s ${queue.length} providera`,
      queue
    })
  } catch (error) {
    console.error('Error creating queue:', error)
    res.status(500).json({
      success: false,
      message: 'Greška pri kreiranju queue-a',
      error: error.message
    })
  }
})

/**
 * GET /api/lead-queue/stats
 * Statistika queue-a za providera
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    
    const stats = await prisma.leadQueue.groupBy({
      by: ['status'],
      where: { providerId: userId },
      _count: true
    })
    
    const totalOffers = await prisma.leadQueue.count({
      where: { providerId: userId }
    })
    
    const acceptedLeads = await prisma.leadQueue.count({
      where: { 
        providerId: userId,
        status: 'ACCEPTED'
      }
    })
    
    const declinedLeads = await prisma.leadQueue.count({
      where: { 
        providerId: userId,
        status: 'DECLINED'
      }
    })
    
    const expiredLeads = await prisma.leadQueue.count({
      where: { 
        providerId: userId,
        status: 'EXPIRED'
      }
    })
    
    const acceptanceRate = totalOffers > 0 
      ? ((acceptedLeads / totalOffers) * 100).toFixed(2)
      : 0
    
    const avgPosition = await prisma.leadQueue.aggregate({
      where: { 
        providerId: userId,
        status: 'ACCEPTED'
      },
      _avg: { position: true }
    })
    
    res.json({
      success: true,
      stats: {
        totalOffers,
        acceptedLeads,
        declinedLeads,
        expiredLeads,
        acceptanceRate: parseFloat(acceptanceRate),
        avgQueuePosition: avgPosition._avg.position || 0,
        breakdown: stats
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({
      success: false,
      message: 'Greška pri dohvaćanju statistike',
      error: error.message
    })
  }
})

export default router

