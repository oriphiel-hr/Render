/**
 * USLUGAR EXCLUSIVE - Lead Queue Manager
 * 
 * Manages the queue system for lead distribution
 * Prevents broadcasting to 6+ providers like Trebam.hr
 */

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Helper funkcija za dodavanje leada u interni queue tvrtke (ako je provider direktor)
async function addToCompanyQueueIfDirector(jobId, providerId) {
  try {
    // Provjeri da li je provider direktor
    const providerProfile = await prisma.providerProfile.findFirst({
      where: {
        userId: providerId,
        isDirector: true
      }
    });

    if (providerProfile) {
      // Dinamički import
      const companyLeadDist = await import('../services/company-lead-distribution.js');
      await companyLeadDist.addLeadToCompanyQueue(jobId, providerProfile.id);
      console.log(`   ✅ Lead automatski dodan u interni queue tvrtke (direktor: ${providerProfile.id})`);
    }
  } catch (e) {
    console.warn('Greška pri dodavanju leada u interni queue:', e.message);
  }
}

/**
 * Pronalazi najbolje matchane providere za posao
 * @param {Object} job - Job objekat
 * @param {Number} limit - Max broj providera (default 5)
 * @returns {Array} - Lista provider profila
 */
export async function findTopProviders(job, limit = 5) {
  console.log(`🔍 Tražim top ${limit} providera za job: ${job.title}`)
  
  // Dohvati kategoriju
  const category = await prisma.category.findUnique({
    where: { id: job.categoryId }
  })
  
  // Get job creator info for self-assignment prevention
  const jobUser = job.userId ? await prisma.user.findUnique({
    where: { id: job.userId },
    select: { id: true, taxId: true, companyName: true, email: true }
  }) : null;
  
  // Pronađi sve providere s tom kategorijom
  let providers = await prisma.providerProfile.findMany({
    where: {
      categories: {
        some: { id: job.categoryId }
      },
      isAvailable: true,
      user: {
        city: job.city // Ista lokacija
      }
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          taxId: true,
          companyName: true,
          city: true
        }
      },
      licenses: {
        where: {
          isVerified: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      }
    }
  })
  
  console.log(`   Pronađeno ${providers.length} potencijalnih providera`)
  
  // PREVENT SELF-ASSIGNMENT: Filter out providers who cannot receive lead from same company
  if (jobUser) {
    const initialCount = providers.length;
    providers = providers.filter(provider => {
      // Same userId - cannot self-assign
      if (provider.userId === jobUser.id) {
        console.log(`   ❌ Izbacujem ${provider.user.fullName} - isti korisnik (userId)`);
        return false;
      }
      
      // Same taxId - same company cannot assign to itself
      if (jobUser.taxId && provider.user.taxId && jobUser.taxId === provider.user.taxId) {
        console.log(`   ❌ Izbacujem ${provider.user.fullName} - isti OIB (${jobUser.taxId})`);
        return false;
      }
      
      // Same email - same user account (even with different role) cannot self-assign
      if (jobUser.email && provider.user.email && jobUser.email === provider.user.email) {
        console.log(`   ❌ Izbacujem ${provider.user.fullName} - isti email (${jobUser.email})`);
        return false;
      }
      
      return true;
    });
    
    if (providers.length < initialCount) {
      console.log(`   🚫 Izbaceno ${initialCount - providers.length} providera zbog sprječavanja samododjeljivanja`);
    }
  }
  
  // Ako kategorija zahtijeva licencu, filtriraj samo one s validnom licencom
  if (category.requiresLicense) {
    providers = providers.filter(p => 
      p.licenses.some(l => 
        l.licenseType === category.licenseType
      )
    )
    console.log(`   Nakon filtriranja po licencama: ${providers.length}`)
  }
  
  // Izračunaj kombinirani match score (tvrtka + tim) za providere s timovima
  const providersWithScores = await Promise.all(providers.map(async (provider) => {
    let combinedMatchScore = 0;
    let hasTeamMatch = false;
    let bestTeamMember = null;

    // Ako je direktor, provjeri match tima i koristi kombinirani score
    if (provider.isDirector && provider.id) {
      try {
        const { calculateCombinedMatchScore } = await import('../services/team-category-matching.js');
        const matchResult = await calculateCombinedMatchScore(job.id, provider.id);
        combinedMatchScore = matchResult.combinedScore;
        hasTeamMatch = matchResult.hasTeamMatch;
        bestTeamMember = matchResult.bestTeamMember;
        // Spremi breakdown za kasnije korištenje (može se proširiti)
        provider._matchBreakdown = matchResult.breakdown;
      } catch (teamError) {
        console.error(`[LEAD-QUEUE] Error calculating team match for provider ${provider.id}:`, teamError);
        // Ako nema tima ili greška, koristi samo company match + reputaciju
        const companyCategoryIds = provider.categories?.map(cat => cat.id) || [];
        const { calculateCategoryMatchScore } = await import('../services/team-category-matching.js');
        const categoryMatch = calculateCategoryMatchScore(job.categoryId, companyCategoryIds);
        
        // Izračunaj reputation score
        const ratingScore = (provider.ratingAvg || 0) / 5.0;
        const responseTimeScore = provider.avgResponseTimeMinutes <= 0 ? 0.5 :
          provider.avgResponseTimeMinutes <= 60 ? 1.0 :
          provider.avgResponseTimeMinutes <= 240 ? 0.5 : 0.1;
        const conversionScore = (provider.conversionRate || 0) / 100;
        const reputationScore = (ratingScore * 0.4) + (responseTimeScore * 0.3) + (conversionScore * 0.3);
        
        // Kombinirani score bez tima (60% kategorije, 40% reputacija)
        combinedMatchScore = (categoryMatch * 0.6) + (reputationScore * 0.4);
      }
    } else {
      // Nije direktor, koristi company match + reputaciju
      const companyCategoryIds = provider.categories?.map(cat => cat.id) || [];
      const { calculateCategoryMatchScore } = await import('../services/team-category-matching.js');
      const categoryMatch = calculateCategoryMatchScore(job.categoryId, companyCategoryIds);
      
      // Izračunaj reputation score
      const ratingScore = (provider.ratingAvg || 0) / 5.0;
      const responseTimeScore = provider.avgResponseTimeMinutes <= 0 ? 0.5 :
        provider.avgResponseTimeMinutes <= 60 ? 1.0 :
        provider.avgResponseTimeMinutes <= 240 ? 0.5 : 0.1;
      const conversionScore = (provider.conversionRate || 0) / 100;
      const reputationScore = (ratingScore * 0.4) + (responseTimeScore * 0.3) + (conversionScore * 0.3);
      
      // Kombinirani score (60% kategorije, 40% reputacija)
      combinedMatchScore = (categoryMatch * 0.6) + (reputationScore * 0.4);
    }

    return {
      ...provider,
      combinedMatchScore,
      hasTeamMatch,
      bestTeamMember
    };
  }));

  // Sortiraj po kombiniranom match score-u i REPUTATION SCORE
  providersWithScores.sort((a, b) => {
    // 1. Prvo po kombiniranom match score-u (50% weight)
    const matchScoreA = a.combinedMatchScore * 0.5;
    const matchScoreB = b.combinedMatchScore * 0.5;
    
    // 2. Reputation Score (50% weight) = kombinacija rating, response time, conversion rate
    // Rating (40% weight)
    const ratingScoreA = a.ratingAvg * 0.4 + (a.ratingCount > 10 ? 0.5 : a.ratingCount / 20) * 0.4;
    const ratingScoreB = b.ratingAvg * 0.4 + (b.ratingCount > 10 ? 0.5 : b.ratingCount / 20) * 0.4;
    
    // Response Time (30% weight) - niže = bolje
    const responseTimeScoreA = a.avgResponseTimeMinutes <= 0 ? 0.5 :
      a.avgResponseTimeMinutes <= 60 ? 1.0 :
      a.avgResponseTimeMinutes <= 240 ? 0.5 : 0.1;
    const responseTimeScoreB = b.avgResponseTimeMinutes <= 0 ? 0.5 :
      b.avgResponseTimeMinutes <= 60 ? 1.0 :
      b.avgResponseTimeMinutes <= 240 ? 0.5 : 0.1;
    
    // Conversion Rate (30% weight)
    const conversionScoreA = a.conversionRate / 100;
    const conversionScoreB = b.conversionRate / 100;
    
    const reputationScoreA = ratingScoreA * 0.4 + responseTimeScoreA * 0.3 + conversionScoreA * 0.3;
    const reputationScoreB = ratingScoreB * 0.4 + responseTimeScoreB * 0.3 + conversionScoreB * 0.3;
    
    // Kombinirani finalni score
    const finalScoreA = matchScoreA + (reputationScoreA * 0.5);
    const finalScoreB = matchScoreB + (reputationScoreB * 0.5);
    
    if (Math.abs(finalScoreB - finalScoreA) > 0.01) {
      return finalScoreB - finalScoreA; // Viši score = bolji
    }
    
    // Fallback: ako su scoreovi gotovo jednaki, koristi rating count
    return b.ratingCount - a.ratingCount;
  });

  // Vrati samo provider objekte (bez dodatnih polja)
  const filteredProviders = providersWithScores.map(({ combinedMatchScore, hasTeamMatch, bestTeamMember, ...provider }) => provider);
  
  const topProviders = filteredProviders.slice(0, limit)
  console.log(`✅ Top ${topProviders.length} providera odabrano`)
  
  return topProviders
}

/**
 * Kreira queue za job
 * @param {String} jobId - ID posla
 * @param {Array} providers - Lista providera
 * @returns {Array} - Kreirane queue stavke
 */
export async function createLeadQueue(jobId, providers) {
  console.log(`📋 Kreiram queue za job ${jobId}`)
  
  const queueItems = []
  
  for (let i = 0; i < providers.length; i++) {
    const queueItem = await prisma.leadQueue.create({
      data: {
        jobId,
        providerId: providers[i].userId,
        position: i + 1,
        status: i === 0 ? 'OFFERED' : 'WAITING',
        offeredAt: i === 0 ? new Date() : null,
        expiresAt: i === 0 ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null // 24h
      }
    })
    
    queueItems.push(queueItem)
    console.log(`   Pozicija ${i + 1}: ${providers[i].user.fullName} (${providers[i].user.email})`)
  }
  
  // Pošalji notifikaciju prvom provideru
  if (queueItems.length > 0) {
    await sendLeadOfferNotification(queueItems[0])
  }
  
  return queueItems
}

/**
 * Ponudi lead sljedećem provideru u queueu
 * @param {String} jobId - ID posla
 */
export async function offerToNextInQueue(jobId) {
  console.log(`➡️ Tražim sljedećeg providera u queueu za job ${jobId}`)
  
  // Pronađi sljedećeg u queueu koji čeka
  const nextInQueue = await prisma.leadQueue.findFirst({
    where: { 
      jobId,
      status: 'WAITING'
    },
    orderBy: { position: 'asc' }
  })
  
  if (!nextInQueue) {
    console.log('   ⚠️ Nema više providera u queueu')
    
    // Provjeri koliko ih je ukupno odbilo
    const declinedCount = await prisma.leadQueue.count({
      where: {
        jobId,
        status: { in: ['DECLINED', 'EXPIRED'] }
      }
    })
    
    if (declinedCount >= 3) {
      console.log('   🚨 3+ providera odbilo - označavam job kao problematičan')
      await prisma.job.update({
        where: { id: jobId },
        data: { 
          leadStatus: 'EXPIRED',
          qualityScore: 0
        }
      })
      // Obavijesti klijenta
      await notifyClientAboutProblematicJob(jobId)
    }
    
    return null
  }
  
  // Ažuriraj status
  await prisma.leadQueue.update({
    where: { id: nextInQueue.id },
    data: {
      status: 'OFFERED',
      offeredAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    }
  })
  
  console.log(`   ✅ Lead ponuđen provideru na poziciji ${nextInQueue.position}`)
  
  // Pošalji notifikaciju
  await sendLeadOfferNotification(nextInQueue)
  
  return nextInQueue
}

/**
 * Provider odgovara na ponudu
 * @param {String} queueId - ID queue stavke
 * @param {String} response - 'INTERESTED' | 'NOT_INTERESTED'
 * @param {String} userId - ID providera koji odgovara
 */
export async function respondToLeadOffer(queueId, response, userId) {
  const queueItem = await prisma.leadQueue.findUnique({
    where: { id: queueId },
    include: { job: true }
  })
  
  if (!queueItem) {
    throw new Error('Queue item ne postoji')
  }
  
  if (queueItem.providerId !== userId) {
    throw new Error('Unauthorized - ovo nije vaš lead')
  }
  
  if (queueItem.status !== 'OFFERED') {
    throw new Error('Lead više nije dostupan')
  }
  
  console.log(`💬 Provider ${userId} odgovorio: ${response}`)
  
  if (response === 'INTERESTED') {
    // Provider želi kupiti lead
    const leadPrice = queueItem.job.leadPrice
    
    // Provjeri ima li dovoljno kredita
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })
    
    if (!subscription || subscription.creditsBalance < leadPrice) {
      throw new Error('Nemate dovoljno kredita')
    }
    
    // Počni transakciju
    return await prisma.$transaction(async (tx) => {
      // Oduzmi kredite
      await tx.subscription.update({
        where: { userId },
        data: {
          creditsBalance: { decrement: leadPrice },
          lifetimeCreditsUsed: { increment: leadPrice }
        }
      })
      
      // Kreiraj credit transaction
      await tx.creditTransaction.create({
        data: {
          userId,
          type: 'LEAD_PURCHASE',
          amount: -leadPrice,
          balance: subscription.creditsBalance - leadPrice,
          description: `Kupovina ekskluzivnog leada: ${queueItem.job.title}`,
          relatedJobId: queueItem.jobId
        }
      })
      
      // Kreiraj lead purchase
      const leadPurchase = await tx.leadPurchase.create({
        data: {
          jobId: queueItem.jobId,
          providerId: userId,
          creditsSpent: leadPrice,
          leadPrice: leadPrice,
          status: 'ACTIVE'
        }
      })
      
      // Ažuriraj job
      await tx.job.update({
        where: { id: queueItem.jobId },
        data: {
          leadStatus: 'ASSIGNED',
          assignedProviderId: userId
        }
      })
      
      // Ažuriraj queue status
      await tx.leadQueue.update({
        where: { id: queueId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
          response: 'INTERESTED'
        }
      })
      
      // Poništi sve ostale u queueu
      await tx.leadQueue.updateMany({
        where: {
          jobId: queueItem.jobId,
          id: { not: queueId }
        },
        data: { status: 'SKIPPED' }
      })
      
      console.log(`✅ Lead uspješno kupljen za ${leadPrice} kredita`)
      
      return { leadPurchase, transaction }
    })
    
    // Ako je provider direktor, dodaj lead u interni queue tvrtke (nakon što se transakcija završi)
    try {
      await addToCompanyQueueIfDirector(queueItem.jobId, userId);
    } catch (e) {
      console.warn('Greška pri dodavanju leada u interni queue:', e.message);
    }
    
    // Kreiraj notifikaciju o transakciji nakon što je transakcija commitana
    if (result.transaction) {
      try {
        await prisma.notification.create({
          data: {
            userId,
            type: 'SYSTEM',
            title: 'Kupovina leada',
            message: `Potrošeno ${leadPrice} kredita za kupovinu leada "${queueItem.job.title}". Novo stanje: ${subscription.creditsBalance - leadPrice} kredita.`,
            jobId: queueItem.jobId
          }
        });
      } catch (notifError) {
        console.error('[NOTIFICATION] Error sending transaction notification:', notifError);
      }
    }
    
    return result.leadPurchase
  } else {
    // Provider odbija lead
    await prisma.leadQueue.update({
      where: { id: queueId },
      data: {
        status: 'DECLINED',
        respondedAt: new Date(),
        response: 'NOT_INTERESTED'
      }
    })
    
    console.log(`❌ Provider odbio lead`)
    
    // Ponudi sljedećem u queueu
    await offerToNextInQueue(queueItem.jobId)
  }
}

/**
 * Cron job - provjerava istekle ponude
 * Pokreće se svaki sat
 */
export async function checkExpiredOffers() {
  console.log('⏰ Provjeravam istekle ponude...')
  
  const expiredOffers = await prisma.leadQueue.findMany({
    where: {
      status: 'OFFERED',
      expiresAt: { lt: new Date() }
    }
  })
  
  console.log(`   Pronađeno ${expiredOffers.length} isteklih ponuda`)
  
  for (const offer of expiredOffers) {
    console.log(`   Istekao offer za job ${offer.jobId}, pozicija ${offer.position}`)
    
    // Označi kao expired
    await prisma.leadQueue.update({
      where: { id: offer.id },
      data: {
        status: 'EXPIRED',
        response: 'NO_RESPONSE'
      }
    })
    
    // Ponudi sljedećem
    await offerToNextInQueue(offer.jobId)
  }
  
  console.log('✅ Provjera isteklih ponuda završena')
}

/**
 * Šalje notifikaciju provideru o ponuđenom leadu
 */
async function sendLeadOfferNotification(queueItem) {
  const job = await prisma.job.findUnique({
    where: { id: queueItem.jobId },
    include: { 
      user: true,
      category: true
    }
  })
  
  const provider = await prisma.user.findUnique({
    where: { id: queueItem.providerId }
  })
  
  // Kreiraj notifikaciju u bazi
  await prisma.notification.create({
    data: {
      userId: provider.id,
      type: 'NEW_JOB',
      title: '🎯 Novi ekskluzivni lead dostupan!',
      message: `${job.category.name}: ${job.title} u ${job.city}. Cijena: ${job.leadPrice} kredita. Imate 24h da odgovorite.`,
      jobId: job.id
    }
  })
  
  // TODO: Pošalji email
  // TODO: Pošalji push notifikaciju
  // TODO: SMS za urgentne poslove
  
  console.log(`📧 Notifikacija poslana provideru ${provider.email}`)
}

/**
 * Obavještava klijenta da je job problematičan
 */
async function notifyClientAboutProblematicJob(jobId) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { 
      user: true,
      category: true
    }
  })
  
  await prisma.notification.create({
    data: {
      userId: job.userId,
      type: 'SYSTEM',
      title: '⚠️ Vaš oglas zahtijeva reviziju',
      message: `Više providera nije zainteresirano za vaš oglas "${job.title}". Možda trebate revidirati opis, cijenu ili lokaciju.`,
      jobId: job.id
    }
  })
  
  console.log(`📧 Klijent ${job.user.email} obaviješten o problematičnom jobu`)
}

