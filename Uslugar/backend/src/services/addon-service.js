import { prisma } from '../lib/prisma.js';

/**
 * Kreira novi Add-on paket
 * @param {String} userId - ID korisnika (direktora)
 * @param {Object} addonData - Podaci o add-onu
 * @returns {Promise<Object>} - Kreirani add-on
 */
export async function purchaseAddon(userId, addonData) {
  const { type, scope, displayName, categoryId, creditsAmount, price, validUntil, autoRenew } = addonData;

  // Validacija
  if (!type || !scope || !displayName || !price || !validUntil) {
    throw new Error('Missing required fields: type, scope, displayName, price, validUntil');
  }

  if (type === 'CATEGORY' && !categoryId) {
    throw new Error('categoryId is required for CATEGORY add-on');
  }

  if (type === 'CREDITS' && !creditsAmount) {
    throw new Error('creditsAmount is required for CREDITS add-on');
  }

  // Provjeri postoji li već add-on s istim tipom i scope-om
  const existing = await prisma.addonSubscription.findUnique({
    where: {
      userId_type_scope: {
        userId,
        type,
        scope
      }
    }
  });

  if (existing && existing.status !== 'CANCELLED') {
    throw new Error(`Add-on with type ${type} and scope ${scope} already exists`);
  }

  // Izračunaj grace period (7 dana nakon validUntil)
  const graceUntil = new Date(validUntil);
  graceUntil.setDate(graceUntil.getDate() + 7);

  // Kreiraj add-on
  const addon = await prisma.addonSubscription.create({
    data: {
      userId,
      type,
      scope,
      displayName,
      categoryId: type === 'CATEGORY' ? categoryId : null,
      creditsAmount: type === 'CREDITS' ? creditsAmount : null,
      price,
      validUntil: new Date(validUntil),
      graceUntil,
      autoRenew: autoRenew || false,
      status: 'ACTIVE'
    },
    include: {
      category: true,
      usage: true
    }
  });

  // Kreiraj usage zapis
  const initialRemaining = type === 'CREDITS' ? creditsAmount : 0;
  await prisma.addonUsage.create({
    data: {
      addonId: addon.id,
      consumed: 0,
      remaining: initialRemaining,
      percentageUsed: 0.0,
      leadsReceived: 0,
      leadsConverted: 0
    }
  });

  // Kreiraj event log
  await prisma.addonEventLog.create({
    data: {
      addonId: addon.id,
      eventType: 'PURCHASED',
      newStatus: 'ACTIVE',
      metadata: {
        type,
        scope,
        price,
        validUntil: validUntil.toISOString()
      }
    }
  });

  // Ako je CREDITS add-on, dodaj kredite u subscription
  if (type === 'CREDITS') {
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          creditsBalance: subscription.creditsBalance + creditsAmount
        }
      });

      // Kreiraj credit transaction
      await prisma.creditTransaction.create({
        data: {
          userId,
          type: 'PURCHASE',
          amount: creditsAmount,
          balance: subscription.creditsBalance + creditsAmount,
          description: `Add-on paket: ${displayName} - ${creditsAmount} kredita`
        }
      });
    }
  }

  return addon;
}

/**
 * Dohvati sve add-one za korisnika
 * @param {String} userId - ID korisnika
 * @param {Object} filters - Filteri (status, type)
 * @returns {Promise<Array>} - Lista add-ona
 */
export async function getAddons(userId, filters = {}) {
  const where = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  const addons = await prisma.addonSubscription.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      },
      usage: true,
      eventLogs: {
        orderBy: { occurredAt: 'desc' },
        take: 10
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return addons;
}

/**
 * Dohvati jedan add-on
 * @param {String} addonId - ID add-ona
 * @param {String} userId - ID korisnika (za autorizaciju)
 * @returns {Promise<Object>} - Add-on
 */
export async function getAddon(addonId, userId) {
  const addon = await prisma.addonSubscription.findFirst({
    where: {
      id: addonId,
      userId
    },
    include: {
      category: true,
      usage: true,
      eventLogs: {
        orderBy: { occurredAt: 'desc' }
      }
    }
  });

  if (!addon) {
    throw new Error('Add-on not found');
  }

  return addon;
}

/**
 * Obnovi add-on
 * @param {String} addonId - ID add-ona
 * @param {String} userId - ID korisnika
 * @param {Object} renewalData - Podaci o obnovi (validUntil, autoRenew)
 * @returns {Promise<Object>} - Obnovljeni add-on
 */
export async function renewAddon(addonId, userId, renewalData) {
  const { validUntil, autoRenew } = renewalData;

  const addon = await prisma.addonSubscription.findFirst({
    where: {
      id: addonId,
      userId
    }
  });

  if (!addon) {
    throw new Error('Add-on not found');
  }

  if (addon.status === 'CANCELLED') {
    throw new Error('Cannot renew cancelled add-on');
  }

  // Izračunaj grace period
  const graceUntil = new Date(validUntil);
  graceUntil.setDate(graceUntil.getDate() + 7);

  // Obnovi add-on
  const renewed = await prisma.addonSubscription.update({
    where: { id: addonId },
    data: {
      status: 'ACTIVE',
      validFrom: new Date(),
      validUntil: new Date(validUntil),
      graceUntil,
      autoRenew: autoRenew !== undefined ? autoRenew : addon.autoRenew
    },
    include: {
      category: true,
      usage: true
    }
  });

  // Kreiraj event log
  await prisma.addonEventLog.create({
    data: {
      addonId,
      eventType: 'RENEWED',
      oldStatus: addon.status,
      newStatus: 'ACTIVE',
      metadata: {
        validUntil: validUntil.toISOString(),
        autoRenew
      }
    }
  });

  // Ako je CREDITS add-on, dodaj kredite
  if (addon.type === 'CREDITS' && addon.creditsAmount) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          creditsBalance: subscription.creditsBalance + addon.creditsAmount
        }
      });

      await prisma.creditTransaction.create({
        data: {
          userId,
          type: 'PURCHASE',
          amount: addon.creditsAmount,
          balance: subscription.creditsBalance + addon.creditsAmount,
          description: `Obnova add-on paketa: ${addon.displayName} - ${addon.creditsAmount} kredita`
        }
      });
    }
  }

  return renewed;
}

/**
 * Otkaži add-on
 * @param {String} addonId - ID add-ona
 * @param {String} userId - ID korisnika
 * @param {String} reason - Razlog otkazivanja
 * @returns {Promise<Object>} - Otkazani add-on
 */
export async function cancelAddon(addonId, userId, reason) {
  const addon = await prisma.addonSubscription.findFirst({
    where: {
      id: addonId,
      userId
    }
  });

  if (!addon) {
    throw new Error('Add-on not found');
  }

  if (addon.status === 'CANCELLED') {
    throw new Error('Add-on is already cancelled');
  }

  const cancelled = await prisma.addonSubscription.update({
    where: { id: addonId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelledReason: reason
    }
  });

  // Kreiraj event log
  await prisma.addonEventLog.create({
    data: {
      addonId,
      eventType: 'CANCELLED',
      oldStatus: addon.status,
      newStatus: 'CANCELLED',
      metadata: {
        reason
      }
    }
  });

  return cancelled;
}

/**
 * Provjeri i ažuriraj status add-ona (lifecycle management)
 * @param {String} addonId - ID add-ona
 * @returns {Promise<Object>} - Ažurirani add-on
 */
export async function checkAddonStatus(addonId) {
  const addon = await prisma.addonSubscription.findUnique({
    where: { id: addonId },
    include: { usage: true }
  });

  if (!addon || addon.status === 'CANCELLED') {
    return addon;
  }

  const now = new Date();
  let newStatus = addon.status;
  let eventType = null;

  // Provjeri je li istekao (vremenski)
  if (addon.validUntil < now) {
    if (addon.graceUntil && addon.graceUntil >= now) {
      // U grace periodu
      if (addon.status !== 'GRACE_MODE') {
        newStatus = 'GRACE_MODE';
        eventType = 'GRACE_STARTED';
      }
    } else {
      // Potpuno istekao
      if (addon.status !== 'EXPIRED') {
        newStatus = 'EXPIRED';
        eventType = 'EXPIRED';
      }
    }
  }

  // Provjeri potrošnju (za CREDITS add-one)
  if (addon.type === 'CREDITS' && addon.usage) {
    const percentageUsed = addon.usage.percentageUsed;

    if (addon.usage.remaining <= 0 && addon.status !== 'DEPLETED') {
      newStatus = 'DEPLETED';
      eventType = 'DEPLETED';
    } else if (percentageUsed >= 80 && addon.status === 'ACTIVE') {
      newStatus = 'LOW_BALANCE';
      eventType = 'LOW_BALANCE';
    }
  }

  // Ažuriraj status ako se promijenio
  if (newStatus !== addon.status) {
    const updated = await prisma.addonSubscription.update({
      where: { id: addonId },
      data: { status: newStatus },
      include: { usage: true }
    });

    // Kreiraj event log
    if (eventType) {
      await prisma.addonEventLog.create({
        data: {
          addonId,
          eventType,
          oldStatus: addon.status,
          newStatus,
          metadata: {
            validUntil: addon.validUntil.toISOString(),
            graceUntil: addon.graceUntil?.toISOString(),
            percentageUsed: addon.usage?.percentageUsed
          }
        }
      });
    }

    return updated;
  }

  return addon;
}

/**
 * Ažuriraj potrošnju add-ona
 * @param {String} addonId - ID add-ona
 * @param {Number} consumed - Potrošeno (kredita ili leadova)
 * @returns {Promise<Object>} - Ažurirani usage
 */
export async function updateAddonUsage(addonId, consumed) {
  const addon = await prisma.addonSubscription.findUnique({
    where: { id: addonId },
    include: { usage: true }
  });

  if (!addon || !addon.usage) {
    throw new Error('Add-on or usage not found');
  }

  const newConsumed = addon.usage.consumed + consumed;
  const newRemaining = addon.type === 'CREDITS' 
    ? (addon.creditsAmount || 0) - newConsumed 
    : addon.usage.remaining;

  const total = addon.type === 'CREDITS' ? (addon.creditsAmount || 0) : 100;
  const percentageUsed = total > 0 ? (newConsumed / total) * 100 : 0;

  const usage = await prisma.addonUsage.update({
    where: { addonId },
    data: {
      consumed: newConsumed,
      remaining: newRemaining,
      percentageUsed,
      lastUpdated: new Date()
    }
  });

  // Provjeri i pošalji notifikacije
  await checkAndSendNotifications(addonId, percentageUsed);

  // Provjeri status
  await checkAddonStatus(addonId);

  return usage;
}

/**
 * Provjeri i pošalji notifikacije za upozorenja (80%, 50%, 20%)
 * @param {String} addonId - ID add-ona
 * @param {Number} percentageUsed - Postotak potrošnje
 */
async function checkAndSendNotifications(addonId, percentageUsed) {
  const addon = await prisma.addonSubscription.findUnique({
    where: { id: addonId },
    include: { usage: true, user: true }
  });

  if (!addon || !addon.usage) {
    return;
  }

  const notifications = [];

  // 80% upozorenje
  if (percentageUsed >= 80 && !addon.usage.notifiedAt80) {
    notifications.push({
      userId: addon.userId,
      title: 'Add-on upozorenje: 80% potrošeno',
      message: `Vaš add-on "${addon.displayName}" je potrošio 80% resursa.`,
      type: 'SYSTEM'
    });

    await prisma.addonUsage.update({
      where: { addonId },
      data: { notifiedAt80: new Date() }
    });
  }

  // 50% upozorenje
  if (percentageUsed >= 50 && !addon.usage.notifiedAt50) {
    notifications.push({
      userId: addon.userId,
      title: 'Add-on upozorenje: 50% potrošeno',
      message: `Vaš add-on "${addon.displayName}" je potrošio 50% resursa.`,
      type: 'SYSTEM'
    });

    await prisma.addonUsage.update({
      where: { addonId },
      data: { notifiedAt50: new Date() }
    });
  }

  // 20% upozorenje
  if (percentageUsed >= 20 && !addon.usage.notifiedAt20) {
    notifications.push({
      userId: addon.userId,
      title: 'Add-on upozorenje: 20% preostalo',
      message: `Vaš add-on "${addon.displayName}" ima samo 20% preostalih resursa. Razmislite o obnovi.`,
      type: 'SYSTEM'
    });

    await prisma.addonUsage.update({
      where: { addonId },
      data: { notifiedAt20: new Date() }
    });
  }

  // Upozorenje o isteku (3 dana prije)
  const daysUntilExpiry = Math.ceil((addon.validUntil - new Date()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 3 && daysUntilExpiry > 0 && !addon.usage.notifiedExpiring) {
    notifications.push({
      userId: addon.userId,
      title: 'Add-on ističe uskoro',
      message: `Vaš add-on "${addon.displayName}" ističe za ${daysUntilExpiry} dana.`,
      type: 'SYSTEM'
    });

    await prisma.addonUsage.update({
      where: { addonId },
      data: { notifiedExpiring: new Date() }
    });
  }

  // Kreiraj notifikacije
  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications
    });
  }
}

/**
 * Dohvati dostupne add-one (cjenik)
 * @returns {Promise<Array>} - Lista dostupnih add-ona
 */
export async function getAvailableAddons() {
  // Ovo bi trebalo biti konfigurirano u bazi ili config file-u
  // Za sada vraćamo hardcoded primjere
  return [
    {
      type: 'REGION',
      name: 'Regija Add-on',
      description: 'Proširi pokrivenost na dodatnu regiju',
      price: 29.99,
      currency: 'EUR',
      duration: 'MONTHLY'
    },
    {
      type: 'CATEGORY',
      name: 'Kategorija Add-on',
      description: 'Proširi pokrivenost na dodatnu kategoriju',
      price: 39.99,
      currency: 'EUR',
      duration: 'MONTHLY'
    },
    {
      type: 'CREDITS',
      name: 'Extra Krediti',
      description: 'Dodatni krediti za leadove',
      price: 0.99,
      currency: 'EUR',
      perCredit: true,
      options: [10, 25, 50, 100]
    }
  ];
}

/**
 * Helper funkcija: Ažuriraj potrošnju add-ona kada se troše krediti
 * Poziva se iz lead-service.js kada se kupi lead
 * @param {String} userId - ID korisnika
 * @param {Number} creditsSpent - Broj potrošenih kredita
 */
export async function trackCreditsConsumption(userId, creditsSpent) {
  try {
    // Pronađi aktivne CREDITS add-one
    const creditsAddons = await prisma.addonSubscription.findMany({
      where: {
        userId,
        type: 'CREDITS',
        status: {
          in: ['ACTIVE', 'LOW_BALANCE']
        }
      },
      include: { usage: true }
    });

    // Ažuriraj potrošnju za svaki aktivni CREDITS add-on
    for (const addon of creditsAddons) {
      if (addon.usage) {
        await updateAddonUsage(addon.id, creditsSpent);
      }
    }
  } catch (error) {
    console.error('[ADDON] Error tracking credits consumption:', error);
    // Ne baci grešku - add-on tracking ne smije blokirati kupovinu leada
  }
}

/**
 * Helper funkcija: Ažuriraj potrošnju add-ona kada se primi lead za regiju/kategoriju
 * Poziva se iz lead-queue ili job creation kada se lead dodijeli provideru
 * @param {String} userId - ID korisnika
 * @param {String} region - Regija leada
 * @param {String} categoryId - ID kategorije leada
 */
export async function trackLeadReceived(userId, region, categoryId) {
  try {
    // Pronađi aktivne REGION add-one za ovu regiju
    if (region) {
      const regionAddons = await prisma.addonSubscription.findMany({
        where: {
          userId,
          type: 'REGION',
          scope: region,
          status: {
            in: ['ACTIVE', 'LOW_BALANCE']
          }
        },
        include: { usage: true }
      });

      for (const addon of regionAddons) {
        if (addon.usage) {
          await prisma.addonUsage.update({
            where: { addonId: addon.id },
            data: {
              leadsReceived: { increment: 1 },
              lastUpdated: new Date()
            }
          });
        }
      }
    }

    // Pronađi aktivne CATEGORY add-one za ovu kategoriju
    if (categoryId) {
      const categoryAddons = await prisma.addonSubscription.findMany({
        where: {
          userId,
          type: 'CATEGORY',
          categoryId,
          status: {
            in: ['ACTIVE', 'LOW_BALANCE']
          }
        },
        include: { usage: true }
      });

      for (const addon of categoryAddons) {
        if (addon.usage) {
          await prisma.addonUsage.update({
            where: { addonId: addon.id },
            data: {
              leadsReceived: { increment: 1 },
              lastUpdated: new Date()
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('[ADDON] Error tracking lead received:', error);
    // Ne baci grešku - add-on tracking ne smije blokirati primanje leada
  }
}


