// Lead Quality Scoring - USLUGAR EXCLUSIVE
// Rule-based scoring algoritam za evaluaciju kvalitete leada (0-100)
// Napomena: Ovo je rule-based algoritam, ne pravi AI. Može se nadograditi s pravim AI-om u budućnosti.

/**
 * Izračunaj quality score za lead (0-100)
 */
export function calculateLeadQualityScore(job, client) {
  let score = 50; // Početni score
  
  // 1. Client verification status (max +30)
  if (client.clientVerification) {
    const v = client.clientVerification;
    if (v.phoneVerified) score += 5;
    if (v.emailVerified) score += 5;
    if (v.idVerified) score += 10;
    if (v.companyVerified) score += 10;
    score += Math.floor(v.trustScore / 10); // Trust score 0-100 -> 0-10 points
  }
  
  // 2. Budget defined and reasonable (max +15)
  if (job.budgetMin && job.budgetMax) {
    score += 10; // Ima definiran budget
    if (job.budgetMax >= 500) score += 5; // Veći budget = quality lead
  }
  
  // 3. Description quality (max +10)
  if (job.description) {
    const wordCount = job.description.split(' ').length;
    if (wordCount > 50) score += 5; // Detaljan opis
    if (wordCount > 100) score += 5; // Vrlo detaljan opis
  }
  
  // 4. Images provided (max +10)
  if (job.images && job.images.length > 0) {
    score += 5;
    if (job.images.length >= 3) score += 5; // Više slika = ozbiljan klijent
  }
  
  // 5. Urgency (max +10)
  switch (job.urgency) {
    case 'HIGH':
      score += 5;
      break;
    case 'URGENT':
      score += 10; // Hitni poslovi = brža realizacija
      break;
    case 'LOW':
      score -= 5; // Niska prioriteta = može dugo trajati
      break;
  }
  
  // 6. Deadline defined (max +5)
  if (job.deadline) {
    score += 5;
  }
  
  // 7. City/Location provided (max +5)
  if (job.city || (job.latitude && job.longitude)) {
    score += 5;
  }
  
  // 8. Job size (max +10)
  if (job.jobSize === 'LARGE' || job.jobSize === 'EXTRA_LARGE') {
    score += 10; // Veći posao = veća zarada
  }
  
  // 9. User history (bonus/penalty)
  if (client.createdAt) {
    const accountAge = Date.now() - new Date(client.createdAt).getTime();
    const daysOld = accountAge / (1000 * 60 * 60 * 24);
    
    if (daysOld < 1) {
      score -= 10; // Novi account = potencijalno nepovoljan
    } else if (daysOld > 30) {
      score += 5; // Stariji account = pouzdaniji
    }
  }
  
  // Osiguraj da je score između 0 i 100
  score = Math.max(0, Math.min(100, score));
  
  return Math.round(score);
}

/**
 * Kategoriziraj lead na osnovu score-a
 */
export function getLeadQualityCategory(score) {
  if (score >= 80) return { level: 'EXCELLENT', color: 'green', label: 'Vrhunski lead' };
  if (score >= 60) return { level: 'GOOD', color: 'blue', label: 'Dobar lead' };
  if (score >= 40) return { level: 'AVERAGE', color: 'yellow', label: 'Prosječan lead' };
  return { level: 'LOW', color: 'red', label: 'Slab lead' };
}

/**
 * Preporuka cijene za lead na osnovu kvalitete
 */
export function recommendLeadPrice(qualityScore, basePrice = 10) {
  if (qualityScore >= 80) return basePrice + 10; // 20 kredita
  if (qualityScore >= 60) return basePrice + 5;  // 15 kredita
  if (qualityScore >= 40) return basePrice;      // 10 kredita
  return Math.max(5, basePrice - 5);             // 5 kredita minimum
}

/**
 * Evaluiraj i ažuriraj quality score za job
 */
export async function evaluateAndUpdateJobScore(job, prisma) {
  try {
    // Dohvati client podatke sa verifikacijom
    const client = await prisma.user.findUnique({
      where: { id: job.userId },
      include: { clientVerification: true }
    });
    
    if (!client) {
      console.error('[AI_SCORING] Client not found for job:', job.id);
      return null;
    }
    
    // Izračunaj score
    const qualityScore = calculateLeadQualityScore(job, client);
    const category = getLeadQualityCategory(qualityScore);
    const recommendedPrice = recommendLeadPrice(qualityScore);
    
    // Ažuriraj job sa novim score-om i cijenom
    const updated = await prisma.job.update({
      where: { id: job.id },
      data: {
        qualityScore,
        leadPrice: recommendedPrice
      }
    });
    
    console.log(`[AI_SCORING] Job ${job.id}: Score ${qualityScore}/100 (${category.label}), Price: ${recommendedPrice} kredita`);
    
    return {
      job: updated,
      score: qualityScore,
      category,
      recommendedPrice
    };
    
  } catch (error) {
    console.error('[AI_SCORING] Error evaluating job:', error);
    return null;
  }
}

/**
 * Batch evaluation - evaluiraj sve nove leadove
 */
export async function batchEvaluateNewLeads(prisma) {
  try {
    // Dohvati sve leadove koji nemaju quality score
    const jobs = await prisma.job.findMany({
      where: {
        isExclusive: true,
        qualityScore: { equals: 0 },
        leadStatus: 'AVAILABLE'
      },
      take: 50 // Limit batch size
    });
    
    console.log(`[AI_SCORING] Batch evaluating ${jobs.length} leads...`);
    
    const results = [];
    for (const job of jobs) {
      const result = await evaluateAndUpdateJobScore(job, prisma);
      if (result) results.push(result);
    }
    
    console.log(`[AI_SCORING] Completed ${results.length} evaluations`);
    return results;
    
  } catch (error) {
    console.error('[AI_SCORING] Batch evaluation error:', error);
    return [];
  }
}

