/**
 * USLUGAR EXCLUSIVE - SLA Reminder Service
 * 
 * Upravlja SLA podsjetnicima za odgovore na poruke i bilježi kršenja koja utječu na reputaciju
 */

import { prisma } from '../lib/prisma.js';

// SLASStatus enum values
const SLASStatus = {
  PENDING: 'PENDING',
  MET: 'MET',
  BREACHED: 'BREACHED'
};

// Default SLA: 4 sata (240 minuta)
const DEFAULT_SLA_MINUTES = 240;

// Podsjetnici se šalju:
// - 1 sat prije isteka SLA-a (50% vremena)
// - 30 minuta prije isteka SLA-a (87.5% vremena)
// - Nakon prekoračenja SLA-a (svakih 2 sata)
const REMINDER_THRESHOLDS = [
  { percentage: 0.5, minutes: 120 },  // 1 sat prije isteka (50% vremena)
  { percentage: 0.875, minutes: 30 }, // 30 minuta prije isteka (87.5% vremena)
  { percentage: 1.0, minutes: 0 }     // Nakon prekoračenja
];

/**
 * Kreiraj SLA tracking za poruku
 * @param {String} messageId - ID poruke
 * @param {String} roomId - ID chat rooma
 * @param {Number} expectedResponseMinutes - Očekivano vrijeme odgovora u minutama (default: 240)
 * @returns {Object} - Kreirani SLA tracking
 */
export async function createSLATracking(messageId, roomId, expectedResponseMinutes = DEFAULT_SLA_MINUTES) {
  try {
    const sla = await prisma.messageSLA.create({
      data: {
        messageId,
        roomId,
        expectedResponseMinutes,
        slaStatus: SLASStatus.PENDING
      }
    });

    console.log(`[SLA] Created tracking for message ${messageId} (SLA: ${expectedResponseMinutes} minutes)`);
    return sla;
  } catch (error) {
    console.error(`[SLA ERROR] Failed to create tracking for message ${messageId}:`, error);
    return null;
  }
}

/**
 * Označi poruku kao odgovorenu i ažuriraj SLA tracking
 * @param {String} messageId - ID poruke koja je odgovorena
 * @param {String} responseMessageId - ID poruke koja je odgovor
 * @returns {Object} - Ažurirani SLA tracking
 */
export async function markMessageAsResponded(messageId, responseMessageId) {
  try {
    const sla = await prisma.messageSLA.findUnique({
      where: { messageId }
    });

    if (!sla) {
      console.log(`[SLA] No tracking found for message ${messageId}`);
      return null;
    }

    if (sla.respondedAt) {
      // Već je označeno kao odgovoreno
      return sla;
    }

    // Dohvati poruku s informacijama
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { createdAt: true }
    });

    if (!message) {
      console.error(`[SLA] Message ${messageId} not found`);
      return null;
    }

    const now = new Date();
    const responseTimeMinutes = Math.round((now.getTime() - message.createdAt.getTime()) / (1000 * 60));

    const updatedSLA = await prisma.messageSLA.update({
      where: { id: sla.id },
      data: {
        respondedAt: now,
        responseTimeMinutes,
        slaStatus: responseTimeMinutes <= sla.expectedResponseMinutes ? SLASStatus.MET : SLASStatus.BREACHED,
        breachedAt: responseTimeMinutes > sla.expectedResponseMinutes ? now : null,
        updatedAt: now
      }
    });

    // Dohvati ažurirani SLA s porukom
    const finalSLA = await prisma.messageSLA.findUnique({
      where: { id: sla.id },
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        },
        room: {
          include: {
            participants: {
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

    // Ako je SLA prekoračen, ažuriraj reputaciju
    if (finalSLA && finalSLA.slaStatus === SLASStatus.BREACHED) {
      await updateReputationForSLABreach(finalSLA);
    }

    console.log(`[SLA] Message ${messageId} marked as responded (${responseTimeMinutes} minutes, status: ${finalSLA?.slaStatus})`);
    return finalSLA;
  } catch (error) {
    console.error(`[SLA ERROR] Failed to mark message as responded:`, error);
    return null;
  }
}

/**
 * Ažuriraj reputaciju kada se SLA prekorači
 * @param {Object} sla - SLA tracking objekt
 */
async function updateReputationForSLABreach(sla) {
  try {
    // Pronađi sve sudionike rooma osim pošiljatelja poruke
    const room = await prisma.chatRoom.findUnique({
      where: { id: sla.roomId },
      include: {
        participants: {
          where: {
            id: { not: sla.message.senderId }
          },
          include: {
            providerProfile: true
          }
        }
      }
    });

    if (!room || !room.participants.length) {
      return;
    }

    // Ažuriraj reputaciju za sve providere u roomu koji nisu odgovorili
    for (const participant of room.participants) {
      if (participant.role === 'PROVIDER' && participant.providerProfile) {
        // Inkrementiraj broj prekoračenih SLA-ova (može se dodati u ProviderProfile ako je potrebno)
        // Za sada samo logiramo - može se proširiti s dodatnim poljima u ProviderProfile
        console.log(`[SLA] Provider ${participant.id} breached SLA for message ${sla.messageId}`);
      }
    }
  } catch (error) {
    console.error(`[SLA ERROR] Failed to update reputation for SLA breach:`, error);
  }
}

/**
 * Provjeri i pošalji podsjetnike za poruke koje čekaju odgovor
 * @returns {Number} - Broj poslanih podsjetnica
 */
export async function checkAndSendSLAReminders() {
  try {
    const now = new Date();
    const pendingSLAs = await prisma.messageSLA.findMany({
      where: {
        slaStatus: SLASStatus.PENDING,
        respondedAt: null
      },
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true
              }
            }
          }
        },
        room: {
          include: {
            participants: {
              include: {
                providerProfile: true
              }
            },
            job: {
              include: {
                assignedProvider: true
              }
            }
          }
        }
      }
    });

    let remindersSent = 0;

    for (const sla of pendingSLAs) {
      if (!sla.message || !sla.message.createdAt) {
        continue;
      }

      const messageAge = Math.round((now.getTime() - new Date(sla.message.createdAt).getTime()) / (1000 * 60));
      const timeUntilSLA = sla.expectedResponseMinutes - messageAge;
      const percentageElapsed = messageAge / sla.expectedResponseMinutes;

      // Provjeri treba li poslati podsjetnicu
      let shouldSendReminder = false;
      let reminderType = null;

      if (timeUntilSLA <= 0) {
        // SLA je prekoračen - pošalji podsjetnicu svakih 2 sata
        const hoursSinceLastReminder = sla.lastReminderAt
          ? (now.getTime() - sla.lastReminderAt.getTime()) / (1000 * 60 * 60)
          : Infinity;

        if (hoursSinceLastReminder >= 2) {
          shouldSendReminder = true;
          reminderType = 'BREACHED';
        }
      } else if (timeUntilSLA <= 30 && !sla.reminderSentAt) {
        // 30 minuta prije isteka - prva podsjetnica
        shouldSendReminder = true;
        reminderType = 'WARNING_30MIN';
      } else if (timeUntilSLA <= 60 && percentageElapsed >= 0.5 && sla.reminderCount === 0) {
        // 1 sat prije isteka - prva podsjetnica
        shouldSendReminder = true;
        reminderType = 'WARNING_1HOUR';
      }

      if (shouldSendReminder) {
        await sendSLAReminder(sla, reminderType);
        remindersSent++;

        // Ažuriraj SLA tracking
        await prisma.messageSLA.update({
          where: { id: sla.id },
          data: {
            reminderSentAt: now,
            reminderCount: sla.reminderCount + 1,
            lastReminderAt: now,
            slaStatus: timeUntilSLA <= 0 ? SLASStatus.BREACHED : SLASStatus.PENDING
          }
        });
      }
    }

    if (remindersSent > 0) {
      console.log(`[SLA] Sent ${remindersSent} SLA reminders`);
    }

    return remindersSent;
  } catch (error) {
    console.error('[SLA ERROR] Failed to check and send SLA reminders:', error);
    return 0;
  }
}

/**
 * Pošalji SLA podsjetnicu
 * @param {Object} sla - SLA tracking objekt
 * @param {String} reminderType - Tip podsjetnice (WARNING_1HOUR, WARNING_30MIN, BREACHED)
 */
async function sendSLAReminder(sla, reminderType) {
  try {
    const room = sla.room;
    const message = sla.message;
    const timeUntilSLA = sla.expectedResponseMinutes - Math.round((new Date().getTime() - message.createdAt.getTime()) / (1000 * 60));

    // Pronađi providere u roomu koji trebaju odgovoriti
    const messageSenderId = message.sender?.id || message.senderId;
    const providers = room.participants.filter(p => p.role === 'PROVIDER' && p.id !== messageSenderId);

    if (providers.length === 0) {
      return;
    }

    let title = '';
    let messageText = '';

    if (reminderType === 'WARNING_1HOUR') {
      title = 'SLA Podsjetnik: Odgovorite unutar 1 sata';
      messageText = `Imate poruku koja zahtijeva odgovor unutar ${Math.round(timeUntilSLA)} minuta. Molimo odgovorite na vrijeme kako biste zadržali dobru reputaciju.`;
    } else if (reminderType === 'WARNING_30MIN') {
      title = 'SLA Podsjetnik: Odgovorite unutar 30 minuta';
      messageText = `Imate poruku koja zahtijeva odgovor unutar ${Math.round(timeUntilSLA)} minuta. Molimo odgovorite što prije.`;
    } else if (reminderType === 'BREACHED') {
      title = 'SLA Prekoračen: Odgovorite što prije';
      messageText = `SLA za odgovor na poruku je prekoračen. Molimo odgovorite što prije kako biste zaštitili svoju reputaciju.`;
    }

    // Pošalji notifikacije svim providerima
    for (const provider of providers) {
      await prisma.notification.create({
        data: {
          title,
          message: messageText,
          type: 'SLA_REMINDER',
          userId: provider.id,
          jobId: room.jobId
        }
      });

      // Pošalji push notifikaciju ako je dostupna
      try {
        const { sendPushNotification } = await import('../lib/notifications.js');
        await sendPushNotification(provider.id, {
          title,
          message: messageText,
          type: 'SLA_REMINDER',
          url: room.jobId ? `/jobs/${room.jobId}` : `/chat/${room.id}`
        });
      } catch (pushError) {
        console.error(`[SLA] Failed to send push notification to ${provider.id}:`, pushError);
      }
    }

    console.log(`[SLA] Sent ${reminderType} reminder to ${providers.length} provider(s) for message ${message.id}`);
  } catch (error) {
    console.error('[SLA ERROR] Failed to send SLA reminder:', error);
  }
}

/**
 * Dohvati SLA status za room
 * @param {String} roomId - ID chat rooma
 * @returns {Object} - SLA statistika za room
 */
export async function getSLAStatusForRoom(roomId) {
  try {
    const slaTrackings = await prisma.messageSLA.findMany({
      where: { roomId },
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const total = slaTrackings.length;
    const met = slaTrackings.filter(sla => sla.slaStatus === SLASStatus.MET).length;
    const breached = slaTrackings.filter(sla => sla.slaStatus === SLASStatus.BREACHED).length;
    const pending = slaTrackings.filter(sla => sla.slaStatus === SLASStatus.PENDING).length;

    const avgResponseTime = slaTrackings
      .filter(sla => sla.responseTimeMinutes !== null)
      .reduce((sum, sla) => sum + sla.responseTimeMinutes, 0) / (total - pending) || 0;

    return {
      total,
      met,
      breached,
      pending,
      avgResponseTimeMinutes: Math.round(avgResponseTime),
      complianceRate: total > 0 ? ((met / total) * 100).toFixed(2) : 100,
      trackings: slaTrackings
    };
  } catch (error) {
    console.error(`[SLA ERROR] Failed to get SLA status for room ${roomId}:`, error);
    return null;
  }
}

/**
 * Dohvati SLA status za providera
 * @param {String} providerId - ID providera
 * @returns {Object} - SLA statistika za providera
 */
export async function getSLAStatusForProvider(providerId) {
  try {
    // Pronađi sve roomove gdje je provider sudionik
    const rooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: { id: providerId }
        }
      },
      include: {
        slaTrackings: {
          include: {
            message: {
              include: {
                sender: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Filtriraj samo SLA tracking-e gdje provider nije pošiljatelj poruke
    const relevantSLAs = [];
    for (const room of rooms) {
      for (const sla of room.slaTrackings) {
        const messageSenderId = sla.message?.sender?.id || sla.message?.senderId;
        if (messageSenderId && messageSenderId !== providerId) {
          relevantSLAs.push(sla);
        }
      }
    }

    const total = relevantSLAs.length;
    const met = relevantSLAs.filter(sla => sla.slaStatus === SLASStatus.MET).length;
    const breached = relevantSLAs.filter(sla => sla.slaStatus === SLASStatus.BREACHED).length;
    const pending = relevantSLAs.filter(sla => sla.slaStatus === SLASStatus.PENDING).length;

    const avgResponseTime = relevantSLAs
      .filter(sla => sla.responseTimeMinutes !== null)
      .reduce((sum, sla) => sum + sla.responseTimeMinutes, 0) / (total - pending) || 0;

    return {
      total,
      met,
      breached,
      pending,
      avgResponseTimeMinutes: Math.round(avgResponseTime),
      complianceRate: total > 0 ? ((met / total) * 100).toFixed(2) : 100
    };
  } catch (error) {
    console.error(`[SLA ERROR] Failed to get SLA status for provider ${providerId}:`, error);
    return null;
  }
}

