/**
 * USLUGAR EXCLUSIVE - Team Category Matching Service
 * 
 * Uspoređuje kategorije korisnika s vještinama timova kako bi lead preuzeo najrelevantniji specijalist
 */

import { prisma } from '../lib/prisma.js';

/**
 * Izračunaj match score između kategorije posla i kategorija tim člana
 * @param {String} jobCategoryId - ID kategorije posla
 * @param {Array} teamMemberCategories - Lista ID-ova kategorija tim člana
 * @returns {Number} - Match score (0-1, gdje 1 = savršen match)
 */
export function calculateCategoryMatchScore(jobCategoryId, teamMemberCategories) {
  // Ako tim član nema kategorije, score je 0
  if (!teamMemberCategories || teamMemberCategories.length === 0) {
    return 0;
  }

  // Provjeri je li kategorija posla u kategorijama tim člana
  const hasExactMatch = teamMemberCategories.includes(jobCategoryId);
  
  if (hasExactMatch) {
    return 1.0; // Savršen match
  }

  // Može se proširiti s fuzzy matching ili hijerarhijom kategorija
  // Za sada vraćamo 0 ako nema exact match
  return 0;
}

/**
 * Pronađi najbolje matchane tim članove za posao
 * @param {String} jobId - ID posla
 * @param {String} companyId - ID tvrtke (direktorov providerProfile.id)
 * @returns {Array} - Lista tim članova sortiranih po match score-u
 */
export async function findBestTeamMatches(jobId, companyId) {
  try {
    // Dohvati posao s kategorijom
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        category: true
      }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Dohvati sve tim članove tvrtke
    const teamMembers = await prisma.providerProfile.findMany({
      where: {
        companyId,
        isDirector: false, // Samo tim članovi, ne direktor
        isAvailable: true
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            city: true
          }
        }
      }
    });

    if (teamMembers.length === 0) {
      return [];
    }

    // Izračunaj match score za svakog tim člana
    const matches = teamMembers.map(member => {
      const categoryIds = member.categories.map(cat => cat.id);
      const matchScore = calculateCategoryMatchScore(job.categoryId, categoryIds);
      
      return {
        teamMember: member,
        matchScore,
        categoryIds
      };
    });

    // Sortiraj po match score-u (viši = bolji)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Filtriraj samo one s match score > 0
    const validMatches = matches.filter(m => m.matchScore > 0);

    console.log(`[TEAM-MATCH] Found ${validMatches.length} matching team members for job ${jobId} in company ${companyId}`);

    return validMatches;
  } catch (error) {
    console.error('[TEAM-MATCH ERROR] Failed to find team matches:', error);
    return [];
  }
}

/**
 * Dodijeli lead najbolje matchanom tim članu
 * @param {String} jobId - ID posla
 * @param {String} companyId - ID tvrtke
 * @returns {Object|null} - Dodijeljeni tim član ili null
 */
export async function assignLeadToBestTeamMember(jobId, companyId) {
  try {
    const matches = await findBestTeamMatches(jobId, companyId);

    if (matches.length === 0) {
      console.log(`[TEAM-MATCH] No matching team members found for job ${jobId}, falling back to director ${companyId}`);

      // FALLBACK: dodijeli lead direktoru ako nema tima ili nema matchanih članova
      const existingQueue = await prisma.companyLeadQueue.findFirst({
        where: {
          jobId,
          directorId: companyId
        },
        include: {
          job: true
        }
      });

      const directorProfile = await prisma.providerProfile.findUnique({
        where: { id: companyId },
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

      if (!directorProfile) {
        console.warn(`[TEAM-MATCH] Director profile ${companyId} not found, cannot fallback`);
        return null;
      }

      let queueEntry;

      if (existingQueue) {
        queueEntry = await prisma.companyLeadQueue.update({
          where: { id: existingQueue.id },
          data: {
            assignedToId: companyId,
            status: 'ASSIGNED',
            assignmentType: 'AUTO',
            assignedAt: new Date(),
            notes: existingQueue.notes
              ? `${existingQueue.notes} | Fallback na direktora - nema matchanih tim članova`
              : 'Fallback na direktora - nema matchanih tim članova'
          },
          include: {
            assignedTo: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true
                  }
                }
              }
            }
          }
        });
      } else {
        queueEntry = await prisma.companyLeadQueue.create({
          data: {
            jobId,
            directorId: companyId,
            assignedToId: companyId,
            status: 'ASSIGNED',
            assignmentType: 'AUTO',
            assignedAt: new Date(),
            notes: 'Fallback na direktora - nema matchanih tim članova'
          },
          include: {
            assignedTo: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true
                  }
                }
              }
            },
            job: true
          }
        });
      }

      // Pošalji notifikaciju direktoru
      try {
        await prisma.notification.create({
          data: {
            title: 'Lead dodijeljen vama (fallback)',
            message: `Lead je automatski dodijeljen direktoru jer nema matchanih tim članova za posao: ${queueEntry.job?.title || 'Naziv posla'}`,
            type: 'LEAD_ASSIGNED',
            userId: directorProfile.userId,
            jobId
          }
        });
      } catch (notifError) {
        console.error('[TEAM-MATCH] Failed to send fallback notification to director:', notifError);
      }

      return queueEntry.assignedTo;
    }

    // Uzmi najbolje matchanog tim člana
    const bestMatch = matches[0];
    const teamMemberId = bestMatch.teamMember.id;

    // Provjeri postoji li već CompanyLeadQueue entry
    const existingQueue = await prisma.companyLeadQueue.findFirst({
      where: {
        jobId,
        directorId: companyId
      }
    });

    if (existingQueue) {
      // Ažuriraj postojeći entry
      const queueEntry = await prisma.companyLeadQueue.update({
        where: { id: existingQueue.id },
        data: {
          assignedToId: teamMemberId,
          status: 'ASSIGNED',
          assignmentType: 'AUTO',
          assignedAt: new Date()
        },
        include: {
          assignedTo: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true
                }
              }
            }
          }
        }
      });

      console.log(`[TEAM-MATCH] Lead assigned to team member ${teamMemberId} with match score ${bestMatch.matchScore}`);
      return queueEntry.assignedTo;
    }

    // Kreiraj novi CompanyLeadQueue entry
    const queueEntry = await prisma.companyLeadQueue.create({
      data: {
        jobId,
        directorId: companyId,
        assignedToId: teamMemberId,
        status: 'ASSIGNED',
        assignmentType: 'AUTO',
        assignedAt: new Date()
      },
      include: {
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`[TEAM-MATCH] Lead assigned to team member ${teamMemberId} with match score ${bestMatch.matchScore}`);

    // Pošalji notifikaciju tim članu
    try {
      await prisma.notification.create({
        data: {
          title: 'Novi lead dodijeljen',
          message: `Direktor vam je dodijelio novi lead: ${job.title || 'Naziv posla'}`,
          type: 'TEAM_LEAD_ASSIGNED',
          userId: bestMatch.teamMember.userId,
          jobId
        }
      });
    } catch (notifError) {
      console.error('[TEAM-MATCH] Failed to send notification:', notifError);
    }

    return queueEntry.assignedTo;
  } catch (error) {
    console.error('[TEAM-MATCH ERROR] Failed to assign lead to team member:', error);
    return null;
  }
}

/**
 * Izračunaj Company Reputation Score (reputacija, odziv, compliance)
 * @param {Object} companyProfile - ProviderProfile tvrtke
 * @returns {Number} - Reputation score (0-1)
 */
function calculateCompanyReputationScore(companyProfile) {
  // Rating (40% weight)
  const ratingScore = (companyProfile.ratingAvg || 0) / 5.0; // Normalizacija 0-5 -> 0-1
  const ratingCountBonus = companyProfile.ratingCount > 10 ? 0.1 : companyProfile.ratingCount / 100;
  const ratingComponent = (ratingScore * 0.4) + (ratingCountBonus * 0.4);
  
  // Response Time (30% weight) - niže = bolje
  const responseTimeScore = companyProfile.avgResponseTimeMinutes <= 0 ? 0.5 : // Nema podataka
    companyProfile.avgResponseTimeMinutes <= 60 ? 1.0 :
    companyProfile.avgResponseTimeMinutes <= 240 ? 0.5 : 0.1;
  const responseTimeComponent = responseTimeScore * 0.3;
  
  // Conversion Rate (30% weight)
  const conversionScore = (companyProfile.conversionRate || 0) / 100; // 0-100 -> 0-1
  const conversionComponent = conversionScore * 0.3;
  
  // Kombinirani reputation score
  const reputationScore = ratingComponent + responseTimeComponent + conversionComponent;
  
  return Math.min(1.0, Math.max(0.0, reputationScore));
}

/**
 * Izračunaj Context Score (hitnost, paket, povijest)
 * @param {Object} job - Job objekat
 * @param {Object} companyProfile - ProviderProfile tvrtke
 * @returns {Number} - Context score (0-1)
 */
function calculateContextScore(job, companyProfile) {
  let contextScore = 0.5; // Bazni score
  
  // Urgency (30% weight)
  switch (job.urgency) {
    case 'URGENT':
      contextScore += 0.3; // Hitni poslovi = veći prioritet
      break;
    case 'HIGH':
      contextScore += 0.15;
      break;
    case 'LOW':
      contextScore -= 0.1; // Niska prioriteta = niži score
      break;
  }
  
  // Package tier (30% weight) - Premium partneri dobivaju bonus
  // Može se proširiti s provjerom subscription paketa
  // Za sada koristimo featured status kao indikator
  if (companyProfile.isFeatured) {
    contextScore += 0.2; // Featured = premium tier
  }
  
  // History (40% weight) - povijest uspješnih poslova s ovim klijentom
  // Može se proširiti s provjerom prethodnih poslova
  // Za sada koristimo rating count kao indikator iskustva
  if (companyProfile.ratingCount > 50) {
    contextScore += 0.2; // Iskusan provider
  } else if (companyProfile.ratingCount > 20) {
    contextScore += 0.1;
  }
  
  return Math.min(1.0, Math.max(0.0, contextScore));
}

/**
 * Kombinirani match score (tvrtka + tim + reputacija + context)
 * @param {String} jobId - ID posla
 * @param {String} companyProviderId - ID provider profila tvrtke (direktor)
 * @returns {Object} - { companyMatchScore, teamMatchScore, companyReputationScore, contextScore, bestTeamMember, combinedScore, breakdown }
 */
export async function calculateCombinedMatchScore(jobId, companyProviderId) {
  try {
    // Dohvati posao
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        category: true
      }
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Dohvati provider profil tvrtke (direktor) s reputacijskim podacima
    const companyProfile = await prisma.providerProfile.findUnique({
      where: { id: companyProviderId },
      include: {
        categories: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!companyProfile) {
      throw new Error('Company profile not found');
    }

    // 1. Company Category Match Score (30% weight)
    const companyCategoryIds = companyProfile.categories.map(cat => cat.id);
    const companyMatchScore = calculateCategoryMatchScore(job.categoryId, companyCategoryIds);

    // 2. Team Match Score (20% weight)
    const teamMatches = await findBestTeamMatches(jobId, companyProviderId);
    const bestTeamMember = teamMatches.length > 0 ? teamMatches[0] : null;
    const teamMatchScore = bestTeamMember ? bestTeamMember.matchScore : 0;

    // 3. Company Reputation Score (30% weight)
    const companyReputationScore = calculateCompanyReputationScore(companyProfile);

    // 4. Context Score (20% weight)
    const contextScore = calculateContextScore(job, companyProfile);

    // Kombinirani finalni score
    const combinedScore = (
      companyMatchScore * 0.3 +      // Kategorije tvrtke
      teamMatchScore * 0.2 +          // Kategorije tima
      companyReputationScore * 0.3 + // Reputacija tvrtke
      contextScore * 0.2              // Context (hitnost, paket, povijest)
    );

    // Breakdown za transparentnost
    const breakdown = {
      companyCategoryMatch: {
        score: companyMatchScore,
        weight: 0.3,
        contribution: companyMatchScore * 0.3,
        description: 'Poklapanje kategorija tvrtke s kategorijom posla'
      },
      teamCategoryMatch: {
        score: teamMatchScore,
        weight: 0.2,
        contribution: teamMatchScore * 0.2,
        description: 'Poklapanje kategorija najboljeg tim člana s kategorijom posla',
        bestTeamMember: bestTeamMember ? {
          id: bestTeamMember.teamMember.id,
          name: bestTeamMember.teamMember.user?.fullName || 'N/A'
        } : null
      },
      companyReputation: {
        score: companyReputationScore,
        weight: 0.3,
        contribution: companyReputationScore * 0.3,
        description: 'Reputacija tvrtke (rating, response time, conversion rate)',
        details: {
          rating: companyProfile.ratingAvg || 0,
          ratingCount: companyProfile.ratingCount || 0,
          responseTimeMinutes: companyProfile.avgResponseTimeMinutes || 0,
          conversionRate: companyProfile.conversionRate || 0
        }
      },
      context: {
        score: contextScore,
        weight: 0.2,
        contribution: contextScore * 0.2,
        description: 'Context faktori (hitnost, paket, povijest)',
        details: {
          urgency: job.urgency || 'NORMAL',
          isFeatured: companyProfile.isFeatured || false,
          ratingCount: companyProfile.ratingCount || 0
        }
      }
    };

    return {
      companyMatchScore,
      teamMatchScore,
      companyReputationScore,
      contextScore,
      bestTeamMember: bestTeamMember ? bestTeamMember.teamMember : null,
      combinedScore,
      hasTeamMatch: teamMatches.length > 0,
      breakdown
    };
  } catch (error) {
    console.error('[TEAM-MATCH ERROR] Failed to calculate combined match score:', error);
    return {
      companyMatchScore: 0,
      teamMatchScore: 0,
      companyReputationScore: 0,
      contextScore: 0,
      bestTeamMember: null,
      combinedScore: 0,
      hasTeamMatch: false,
      breakdown: null
    };
  }
}

