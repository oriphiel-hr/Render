import { prisma } from '../lib/prisma.js';
import { checkAddonStatus } from './addon-service.js';
import { sendAddonUpsellEmail } from '../lib/email.js';

/**
 * Cron job za provjeru i ažuriranje lifecycle statusa add-on paketa
 * Pokreće se svaki sat
 */
export async function checkAddonLifecycles() {
  console.log('[ADDON-LIFECYCLE] Starting lifecycle check...');

  try {
    // Dohvati sve aktivne add-one
    const activeAddons = await prisma.addonSubscription.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'LOW_BALANCE', 'GRACE_MODE']
        }
      },
      include: {
        usage: true
      }
    });

    let updated = 0;
    let expired = 0;
    let graceStarted = 0;

    for (const addon of activeAddons) {
      try {
        const beforeStatus = addon.status;
        const checked = await checkAddonStatus(addon.id);

        if (checked && checked.status !== beforeStatus) {
          updated++;

          if (checked.status === 'EXPIRED') {
            expired++;
          } else if (checked.status === 'GRACE_MODE') {
            graceStarted++;
          }
        }
      } catch (error) {
        console.error(`[ADDON-LIFECYCLE] Error checking addon ${addon.id}:`, error.message);
      }
    }

    console.log(`[ADDON-LIFECYCLE] Check complete: ${updated} updated, ${expired} expired, ${graceStarted} grace started`);

    return {
      checked: activeAddons.length,
      updated,
      expired,
      graceStarted
    };
  } catch (error) {
    console.error('[ADDON-LIFECYCLE] Error in lifecycle check:', error);
    throw error;
  }
}

/**
 * Provjeri i obnovi add-one s auto-renew
 */
export async function processAutoRenewals() {
  console.log('[ADDON-LIFECYCLE] Processing auto-renewals...');

  try {
    const now = new Date();
    const graceEnd = new Date(now);
    graceEnd.setDate(graceEnd.getDate() - 1); // 1 dan nakon grace perioda

    // Dohvati add-one koji su u grace periodu i imaju auto-renew
    const addonsToRenew = await prisma.addonSubscription.findMany({
      where: {
        status: 'GRACE_MODE',
        autoRenew: true,
        graceUntil: {
          lte: now // Grace period je prošao
        }
      }
    });

    let renewed = 0;
    let failed = 0;

    for (const addon of addonsToRenew) {
      try {
        // Izračunaj novi validUntil (1 mjesec od sada)
        const newValidUntil = new Date(now);
        newValidUntil.setMonth(newValidUntil.getMonth() + 1);

        const renewedAddon = await prisma.addonSubscription.update({
          where: { id: addon.id },
          data: {
            status: 'ACTIVE',
            validFrom: now,
            validUntil: newValidUntil,
            graceUntil: new Date(newValidUntil.getTime() + 7 * 24 * 60 * 60 * 1000) // +7 dana
          }
        });

        // Kreiraj event log
        await prisma.addonEventLog.create({
          data: {
            addonId: addon.id,
            eventType: 'RENEWED',
            oldStatus: 'GRACE_MODE',
            newStatus: 'ACTIVE',
            metadata: {
              autoRenew: true,
              validUntil: newValidUntil.toISOString()
            }
          }
        });

        // Ako je CREDITS add-on, dodaj kredite
        if (addon.type === 'CREDITS' && addon.creditsAmount) {
          const subscription = await prisma.subscription.findUnique({
            where: { userId: addon.userId }
          });

          if (subscription) {
            await prisma.subscription.update({
              where: { userId: addon.userId },
              data: {
                creditsBalance: subscription.creditsBalance + addon.creditsAmount
              }
            });

            await prisma.creditTransaction.create({
              data: {
                userId: addon.userId,
                type: 'PURCHASE',
                amount: addon.creditsAmount,
                balance: subscription.creditsBalance + addon.creditsAmount,
                description: `Auto-renew add-on: ${addon.displayName} - ${addon.creditsAmount} kredita`
              }
            });
          }
        }

        // Kreiraj notifikaciju
        await prisma.notification.create({
          data: {
            userId: addon.userId,
            title: 'Add-on automatski obnovljen',
            message: `Vaš add-on "${addon.displayName}" je automatski obnovljen.`,
            type: 'SYSTEM'
          }
        });

        renewed++;
      } catch (error) {
        console.error(`[ADDON-LIFECYCLE] Error renewing addon ${addon.id}:`, error.message);
        failed++;

        // Ako auto-renew ne uspije, označi kao EXPIRED
        await prisma.addonSubscription.update({
          where: { id: addon.id },
          data: { status: 'EXPIRED' }
        });

        await prisma.notification.create({
          data: {
            userId: addon.userId,
            title: 'Add-on obnova neuspješna',
            message: `Auto-renew za add-on "${addon.displayName}" nije uspio. Molimo obnovite ručno.`,
            type: 'SYSTEM'
          }
        });
      }
    }

    console.log(`[ADDON-LIFECYCLE] Auto-renewal complete: ${renewed} renewed, ${failed} failed`);

    return {
      renewed,
      failed,
      total: addonsToRenew.length
    };
  } catch (error) {
    console.error('[ADDON-LIFECYCLE] Error in auto-renewal:', error);
    throw error;
  }
}

/**
 * Provjeri add-one koji ističu i pošalji upsell ponude
 * Upsell se šalje:
 * - 7 dana prije isteka
 * - 3 dana prije isteka
 * - Na dan isteka (ako nije obnovljen)
 * - 1 dan nakon isteka (ako je u grace periodu)
 */
export async function processAddonUpsells() {
  console.log('[ADDON-UPSELL] Processing upsell offers...');

  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    let upsellsSent = 0;
    let errors = 0;

    // 1. Add-one koji ističu za 7 dana (prvi upsell)
    const addonsExpiringIn7Days = await prisma.addonSubscription.findMany({
      where: {
        status: 'ACTIVE',
        validUntil: {
          gte: new Date(sevenDaysFromNow.getTime() - 24 * 60 * 60 * 1000), // 6-7 dana
          lte: sevenDaysFromNow
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        usage: true
      }
    });

    for (const addon of addonsExpiringIn7Days) {
      try {
        // Provjeri da li je već poslana upsell notifikacija
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: addon.userId,
            title: {
              contains: `Add-on "${addon.displayName}" ističe`
            },
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // U zadnja 24h
            }
          }
        });

        if (!existingNotification) {
          await sendAddonUpsellNotification(addon, 7);
          upsellsSent++;
        }
      } catch (error) {
        console.error(`[ADDON-UPSELL] Error sending 7-day upsell for addon ${addon.id}:`, error.message);
        errors++;
      }
    }

    // 2. Add-one koji ističu za 3 dana (drugi upsell)
    const addonsExpiringIn3Days = await prisma.addonSubscription.findMany({
      where: {
        status: 'ACTIVE',
        validUntil: {
          gte: new Date(threeDaysFromNow.getTime() - 24 * 60 * 60 * 1000), // 2-3 dana
          lte: threeDaysFromNow
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        usage: true
      }
    });

    for (const addon of addonsExpiringIn3Days) {
      try {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: addon.userId,
            title: {
              contains: `Add-on "${addon.displayName}" ističe`
            },
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
            }
          }
        });

        if (!existingNotification) {
          await sendAddonUpsellNotification(addon, 3);
          upsellsSent++;
        }
      } catch (error) {
        console.error(`[ADDON-UPSELL] Error sending 3-day upsell for addon ${addon.id}:`, error.message);
        errors++;
      }
    }

    // 3. Add-one koji su danas istekli (treći upsell)
    const addonsExpiredToday = await prisma.addonSubscription.findMany({
      where: {
        status: {
          in: ['ACTIVE', 'GRACE_MODE']
        },
        validUntil: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // U zadnja 24h
          lte: now
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        usage: true
      }
    });

    for (const addon of addonsExpiredToday) {
      try {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: addon.userId,
            title: {
              contains: `Add-on "${addon.displayName}" je istekao`
            },
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
            }
          }
        });

        if (!existingNotification) {
          await sendAddonUpsellNotification(addon, 0, true);
          upsellsSent++;
        }
      } catch (error) {
        console.error(`[ADDON-UPSELL] Error sending expired upsell for addon ${addon.id}:`, error.message);
        errors++;
      }
    }

    // 4. Add-one u grace periodu (četvrti upsell)
    const addonsInGrace = await prisma.addonSubscription.findMany({
      where: {
        status: 'GRACE_MODE',
        graceUntil: {
          gte: now,
          lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) // Ističe u sljedećih 24h
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        usage: true
      }
    });

    for (const addon of addonsInGrace) {
      try {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: addon.userId,
            title: {
              contains: `Add-on "${addon.displayName}" - posljednja prilika`
            },
            createdAt: {
              gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
            }
          }
        });

        if (!existingNotification) {
          await sendAddonUpsellNotification(addon, 0, false, true);
          upsellsSent++;
        }
      } catch (error) {
        console.error(`[ADDON-UPSELL] Error sending grace period upsell for addon ${addon.id}:`, error.message);
        errors++;
      }
    }

    console.log(`[ADDON-UPSELL] Upsell processing complete: ${upsellsSent} sent, ${errors} errors`);

    return {
      upsellsSent,
      errors,
      total: addonsExpiringIn7Days.length + addonsExpiringIn3Days.length + addonsExpiredToday.length + addonsInGrace.length
    };
  } catch (error) {
    console.error('[ADDON-UPSELL] Error in upsell processing:', error);
    throw error;
  }
}

/**
 * Pošalji upsell notifikaciju i email
 * @param {Object} addon - Add-on objekt
 * @param {Number} daysLeft - Broj dana do isteka
 * @param {Boolean} isExpired - Da li je već istekao
 * @param {Boolean} isGracePeriod - Da li je u grace periodu
 */
async function sendAddonUpsellNotification(addon, daysLeft, isExpired = false, isGracePeriod = false) {
  const user = addon.user;
  if (!user || !user.email) {
    console.warn(`[ADDON-UPSELL] No email for user ${addon.userId}`);
    return;
  }

  // Kreiraj notifikaciju u aplikaciji
  let title, message;
  const renewalUrl = `${process.env.CLIENT_URL || 'https://uslugar.oriph.io'}#addons/${addon.id}/renew`;
  const upgradeUrl = `${process.env.CLIENT_URL || 'https://uslugar.oriph.io'}#subscription/plans`;

  if (isGracePeriod) {
    title = `Add-on "${addon.displayName}" - posljednja prilika!`;
    message = `Vaš add-on ističe uskoro. Obnovite sada i dobijte 10% popusta!`;
  } else if (isExpired) {
    title = `Add-on "${addon.displayName}" je istekao`;
    message = `Vaš add-on je istekao. Obnovite sada i nastavite koristiti sve funkcionalnosti!`;
  } else if (daysLeft === 7) {
    title = `Add-on "${addon.displayName}" ističe za ${daysLeft} dana`;
    message = `Vaš add-on ističe za ${daysLeft} dana. Obnovite sada i osigurajte kontinuitet!`;
  } else if (daysLeft === 3) {
    title = `Add-on "${addon.displayName}" ističe za ${daysLeft} dana`;
    message = `Vaš add-on ističe za ${daysLeft} dana. Obnovite sada i dobijte 5% popusta!`;
  } else {
    title = `Add-on "${addon.displayName}" ističe uskoro`;
    message = `Vaš add-on ističe uskoro. Obnovite sada!`;
  }

  // Kreiraj in-app notifikaciju
  await prisma.notification.create({
    data: {
      userId: addon.userId,
      title,
      message,
      type: 'SYSTEM',
      actionUrl: renewalUrl
    }
  });

  // Pošalji email
  try {
    await sendAddonUpsellEmail(
      user.email,
      user.fullName || user.email,
      addon,
      daysLeft,
      isExpired,
      isGracePeriod,
      renewalUrl,
      upgradeUrl
    );
    console.log(`[ADDON-UPSELL] Upsell email sent to ${user.email} for addon ${addon.id}`);
  } catch (emailError) {
    console.error(`[ADDON-UPSELL] Error sending email to ${user.email}:`, emailError.message);
    // Ne baci grešku - notifikacija je već kreirana
  }

  // Kreiraj event log
  await prisma.addonEventLog.create({
    data: {
      addonId: addon.id,
      eventType: 'UPSELL_SENT',
      metadata: {
        daysLeft,
        isExpired,
        isGracePeriod,
        sentAt: new Date().toISOString()
      }
    }
  });
}


