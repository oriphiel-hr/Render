/**
 * USLUGAR EXCLUSIVE - Company Lead Distribution Service
 * 
 * Upravlja internom distribucijom leadova unutar tvrtke
 * Direktor → Tim članovi
 */

import { prisma } from '../lib/prisma.js';

/**
 * Dodaj lead u interni queue tvrtke
 * @param {String} jobId - ID posla
 * @param {String} directorId - ID direktora (ProviderProfile)
 * @returns {Object} - Kreirani CompanyLeadQueue entry
 */
export async function addLeadToCompanyQueue(jobId, directorId) {
  console.log(`📋 Dodajem lead ${jobId} u interni queue tvrtke (direktor: ${directorId})`);

  // Provjeri da li već postoji u queueu
  const existing = await prisma.companyLeadQueue.findUnique({
    where: {
      jobId_directorId: {
        jobId,
        directorId
      }
    }
  });

  if (existing) {
    console.log(`   ⚠️ Lead već postoji u queueu`);
    return existing;
  }

  // Provjeri da li je korisnik stvarno direktor
  const director = await prisma.providerProfile.findUnique({
    where: { id: directorId },
    select: { isDirector: true }
  });

  if (!director || !director.isDirector) {
    throw new Error('Korisnik nije direktor');
  }

  // Dohvati broj leadova u queueu za određivanje pozicije
  const queueCount = await prisma.companyLeadQueue.count({
    where: {
      directorId,
      status: 'PENDING'
    }
  });

  // Kreiraj queue entry
  const queueEntry = await prisma.companyLeadQueue.create({
    data: {
      jobId,
      directorId,
      position: queueCount + 1,
      status: 'PENDING'
    },
    include: {
      job: {
        include: {
          category: true,
          user: {
            select: {
              fullName: true,
              email: true,
              city: true
            }
          }
        }
      }
    }
  });

  console.log(`   ✅ Lead dodan u interni queue (pozicija ${queueEntry.position})`);

  // Pokušaj automatski dodijeliti lead najbolje matchanom tim članu
  try {
    const { assignLeadToBestTeamMember } = await import('./team-category-matching.js');
    const assignedMember = await assignLeadToBestTeamMember(jobId, directorId);
    
    if (assignedMember) {
      console.log(`   ✅ Lead automatski dodijeljen tim članu ${assignedMember.user?.fullName || assignedMember.id}`);
      
      // Ažuriraj queue entry s dodijeljenim tim članom
      const updatedQueue = await prisma.companyLeadQueue.update({
        where: { id: queueEntry.id },
        data: {
          assignedToId: assignedMember.id,
          status: 'ASSIGNED',
          assignmentType: 'AUTO',
          assignedAt: new Date()
        }
      });
      
      return updatedQueue;
    }
  } catch (autoAssignError) {
    console.error(`   ⚠️ Greška pri automatskoj dodjeli leada:`, autoAssignError);
    // Nastavi s PENDING statusom - direktor će ručno dodijeliti
  }

  return queueEntry;
}

/**
 * Ručna dodjela leada tim članu
 * @param {String} queueId - ID CompanyLeadQueue entryja
 * @param {String} teamMemberId - ID tim člana (ProviderProfile)
 * @param {String} directorId - ID direktora (za provjeru ovlasti)
 * @returns {Object} - Ažurirani queue entry
 */
export async function assignLeadToTeamMember(queueId, teamMemberId, directorId) {
  console.log(`👤 Ručna dodjela leada ${queueId} tim članu ${teamMemberId}`);

  // Provjeri da li je korisnik direktor
  const director = await prisma.providerProfile.findUnique({
    where: { id: directorId },
    select: { isDirector: true }
  });

  if (!director || !director.isDirector) {
    throw new Error('Samo direktor može dodijeliti lead');
  }

  // Provjeri da li tim član pripada direktoru
  const teamMember = await prisma.providerProfile.findUnique({
    where: { id: teamMemberId },
    select: { companyId: true }
  });

  if (!teamMember || teamMember.companyId !== directorId) {
    throw new Error('Tim član ne pripada ovoj tvrtki');
  }

  // Provjeri da li queue entry postoji i pripada direktoru
  const queueEntry = await prisma.companyLeadQueue.findUnique({
    where: { id: queueId },
    include: {
      job: true
    }
  });

  if (!queueEntry) {
    throw new Error('Queue entry ne postoji');
  }

  if (queueEntry.directorId !== directorId) {
    throw new Error('Nemate pristup ovom leadu');
  }

  if (queueEntry.status !== 'PENDING') {
    throw new Error('Lead je već dodijeljen');
  }

  // Dodijeli lead
  const updated = await prisma.companyLeadQueue.update({
    where: { id: queueId },
    data: {
      assignedToId: teamMemberId,
      status: 'ASSIGNED',
      assignmentType: 'MANUAL',
      assignedAt: new Date()
    },
    include: {
      assignedTo: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      },
      job: {
        include: {
          category: true,
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });

  // Pošalji notifikaciju tim članu
  await prisma.notification.create({
    data: {
      userId: teamMember.userId,
      title: 'Novi lead dodijeljen',
      message: `Direktor vam je dodijelio novi lead: ${queueEntry.job.title}`,
      type: 'LEAD_ASSIGNED',
      link: `/my-leads`
    }
  });

  console.log(`   ✅ Lead dodijeljen tim članu ${teamMember.user.fullName}`);

  return updated;
}

/**
 * Automatska dodjela leada najboljem tim članu
 * @param {String} queueId - ID CompanyLeadQueue entryja
 * @param {String} directorId - ID direktora (za provjeru ovlasti)
 * @returns {Object} - Ažurirani queue entry
 */
export async function autoAssignLead(queueId, directorId) {
  console.log(`🤖 Automatska dodjela leada ${queueId}`);

  // Provjeri da li je korisnik direktor
  const director = await prisma.providerProfile.findUnique({
    where: { id: directorId },
    include: {
      teamMembers: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          },
          categories: true
        }
      }
    }
  });

  if (!director || !director.isDirector) {
    throw new Error('Samo direktor može koristiti auto-assign');
  }

  // Dohvati queue entry i job
  const queueEntry = await prisma.companyLeadQueue.findUnique({
    where: { id: queueId },
    include: {
      job: {
        include: {
          category: true
        }
      }
    }
  });

  if (!queueEntry) {
    throw new Error('Queue entry ne postoji');
  }

  if (queueEntry.directorId !== directorId) {
    throw new Error('Nemate pristup ovom leadu');
  }

  if (queueEntry.status !== 'PENDING') {
    throw new Error('Lead je već dodijeljen');
  }

  // Koristi team-category-matching service za pronalaženje najboljeg matcha
  const { findBestTeamMatches } = await import('./team-category-matching.js');
  const matches = await findBestTeamMatches(queueEntry.jobId, directorId);

  if (matches.length === 0) {
    // FALLBACK: nema matchanih tim članova → dodijeli lead direktoru
    console.log(`   ⚠️ Nema matchanih tim članova za lead ${queueId}, fallback na direktora ${directorId}`);

    const updated = await prisma.companyLeadQueue.update({
      where: { id: queueId },
      data: {
        assignedToId: directorId,
        status: 'ASSIGNED',
        assignmentType: 'AUTO',
        assignedAt: new Date(),
        notes: queueEntry.notes
          ? `${queueEntry.notes} | Fallback na direktora - nema matchanih tim članova`
          : 'Fallback na direktora - nema matchanih tim članova'
      },
      include: {
        assignedTo: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        },
        job: {
          include: {
            category: true,
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Pošalji notifikaciju direktoru
    await prisma.notification.create({
      data: {
        userId: director.userId,
        title: 'Lead dodijeljen vama (fallback)',
        message: `Lead je automatski dodijeljen direktoru jer nema matchanih tim članova za posao: ${updated.job.title}`,
        type: 'LEAD_ASSIGNED',
        link: `/my-leads`,
        jobId: updated.jobId
      }
    });

    console.log(`   ✅ Lead automatski dodijeljen direktoru (fallback)`);

    return updated;
  }

  // Uzmi najbolje matchanog tim člana
  const bestMatch = matches[0];
  const bestTeamMember = bestMatch.teamMember;

  // Dodijeli lead najbolje matchanom tim članu
  const updated = await prisma.companyLeadQueue.update({
    where: { id: queueId },
    data: {
      assignedToId: bestTeamMember.id,
      status: 'ASSIGNED',
      assignmentType: 'AUTO',
      assignedAt: new Date()
    },
    include: {
      assignedTo: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      },
      job: {
        include: {
          category: true,
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      }
    }
  });

  // Pošalji notifikaciju tim članu
  await prisma.notification.create({
    data: {
      userId: bestTeamMember.userId,
      title: 'Novi lead automatski dodijeljen',
      message: `Sustav vam je automatski dodijelio novi lead: ${queueEntry.job.title} (match score: ${bestMatch.matchScore.toFixed(2)})`,
      type: 'LEAD_ASSIGNED',
      link: `/my-leads`,
      jobId: queueEntry.jobId
    }
  });

  console.log(`   ✅ Lead automatski dodijeljen tim članu ${bestTeamMember.user.fullName} (match score: ${bestMatch.matchScore})`);

  return updated;
}

/**
 * Pronađi najboljeg tim člana za lead
 * @param {Array} teamMembers - Lista tim članova
 * @param {Object} job - Job objekat
 * @returns {Object|null} - Najbolji tim član ili null
 */
function findBestTeamMemberForLead(teamMembers, job) {
  // Filtriraj samo dostupne tim članove
  const availableMembers = teamMembers.filter(m => m.isAvailable);

  if (availableMembers.length === 0) {
    return null;
  }

  // Filtriraj po kategoriji
  const matchingMembers = availableMembers.filter(member =>
    member.categories.some(cat => cat.id === job.categoryId)
  );

  if (matchingMembers.length === 0) {
    // Ako nema matchanih po kategoriji, vrati bilo kojeg dostupnog
    return availableMembers[0];
  }

  // Sortiraj po reputaciji (rating, response time, conversion rate)
  matchingMembers.sort((a, b) => {
    const scoreA = calculateMemberScore(a);
    const scoreB = calculateMemberScore(b);
    return scoreB - scoreA;
  });

  return matchingMembers[0];
}

/**
 * Izračunaj score tim člana
 * @param {Object} member - ProviderProfile tim člana
 * @returns {Number} - Score (0-100)
 */
function calculateMemberScore(member) {
  // Rating (40%)
  const ratingScore = (member.ratingAvg || 0) * 0.4;

  // Response time (30%) - niže = bolje
  const responseTimeScore = member.avgResponseTimeMinutes <= 0 ? 0.5 :
    member.avgResponseTimeMinutes <= 60 ? 1.0 :
    member.avgResponseTimeMinutes <= 240 ? 0.5 : 0.1;
  const responseScore = responseTimeScore * 0.3;

  // Conversion rate (30%)
  const conversionScore = (member.conversionRate || 0) / 100 * 0.3;

  return (ratingScore + responseScore + conversionScore) * 100;
}

/**
 * Dohvati sve leadove u internom queueu tvrtke
 * @param {String} directorId - ID direktora
 * @returns {Array} - Lista leadova u queueu
 */
export async function getCompanyLeadQueue(directorId) {
  const queue = await prisma.companyLeadQueue.findMany({
    where: {
      directorId
    },
    include: {
      job: {
        include: {
          category: true,
          user: {
            select: {
              fullName: true,
              email: true,
              city: true
            }
          }
        }
      },
      assignedTo: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      }
    },
    orderBy: [
      { status: 'asc' }, // PENDING prvo
      { position: 'asc' }
    ]
  });

  return queue;
}

/**
 * Odbij lead (direktor odbija lead)
 * @param {String} queueId - ID CompanyLeadQueue entryja
 * @param {String} directorId - ID direktora
 * @param {String} reason - Razlog odbijanja
 * @returns {Object} - Ažurirani queue entry
 */
export async function declineCompanyLead(queueId, directorId, reason) {
  const queueEntry = await prisma.companyLeadQueue.findUnique({
    where: { id: queueId }
  });

  if (!queueEntry || queueEntry.directorId !== directorId) {
    throw new Error('Nemate pristup ovom leadu');
  }

  const updated = await prisma.companyLeadQueue.update({
    where: { id: queueId },
    data: {
      status: 'DECLINED',
      notes: reason
    }
  });

  return updated;
}

