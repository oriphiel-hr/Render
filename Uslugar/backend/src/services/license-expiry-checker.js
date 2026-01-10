// License Expiry Checker - Check and notify about expiring licenses
import { prisma } from '../lib/prisma.js';
import { notifyClient } from '../lib/notifications.js';

/**
 * Provjeri licence koje istječu i pošalji notifikacije
 * Provjerava licence koje istječu za 30, 14, 7, i 0 dana
 */
export async function checkExpiringLicenses() {
  console.log('📋 Provjeravam licence koje istječu...');
  
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  
  // Dohvati sve licence koje imaju expiresAt i još nisu istekle
  const allLicenses = await prisma.providerLicense.findMany({
    where: {
      expiresAt: {
        not: null,
        gte: now, // Još nije istekla
        lte: in30Days // Istječe unutar 30 dana
      },
      isVerified: true // Samo verificirane licence
    },
    include: {
      provider: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true
            }
          }
        }
      }
    }
  });
  
  let notified30 = 0;
  let notified14 = 0;
  let notified7 = 0;
  let notified1 = 0;
  let expired = 0;
  
  for (const license of allLicenses) {
    if (!license.expiresAt) continue;
    
    const daysUntilExpiry = Math.ceil((license.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const expiryDateStr = license.expiresAt.toLocaleDateString('hr-HR');
    
    // Provjeri je li već poslana notifikacija danas (da izbjegnemo duplikate)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentNotification = await prisma.notification.findFirst({
      where: {
        userId: license.provider.userId,
        type: 'SYSTEM',
        title: {
          contains: license.licenseType
        },
        message: {
          contains: 'istječe'
        },
        createdAt: {
          gte: today
        }
      }
    });
    
    if (recentNotification) {
      continue; // Već je poslana notifikacija danas
    }
    
    // 30 dana prije isteka - rani upozor
    if (daysUntilExpiry === 30 || (daysUntilExpiry <= 30 && daysUntilExpiry > 14)) {
      await notifyLicenseExpiry(license, daysUntilExpiry, expiryDateStr, 'early');
      notified30++;
    }
    // 14 dana prije isteka
    else if (daysUntilExpiry === 14 || (daysUntilExpiry <= 14 && daysUntilExpiry > 7)) {
      await notifyLicenseExpiry(license, daysUntilExpiry, expiryDateStr, 'warning');
      notified14++;
    }
    // 7 dana prije isteka - hitno
    else if (daysUntilExpiry === 7 || (daysUntilExpiry <= 7 && daysUntilExpiry > 1)) {
      await notifyLicenseExpiry(license, daysUntilExpiry, expiryDateStr, 'urgent');
      notified7++;
    }
    // 1 dan prije isteka - vrlo hitno
    else if (daysUntilExpiry === 1 || daysUntilExpiry === 0) {
      await notifyLicenseExpiry(license, daysUntilExpiry, expiryDateStr, 'critical');
      notified1++;
    }
  }
  
  // Provjeri istekle licence (istekle unutar zadnjih 7 dana - još nisu obaviještene)
  const expiredLicenses = await prisma.providerLicense.findMany({
    where: {
      expiresAt: {
        not: null,
        lt: now, // Već je istekla
        gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Unutar zadnjih 7 dana
      },
      isVerified: true
    },
    include: {
      provider: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true
            }
          }
        }
      }
    }
  });
  
  for (const license of expiredLicenses) {
    if (!license.expiresAt) continue;
    
    // Provjeri je li već poslana notifikacija o isteku
    const recentExpiryNotification = await prisma.notification.findFirst({
      where: {
        userId: license.provider.userId,
        type: 'SYSTEM',
        title: {
          contains: 'istekla'
        },
        message: {
          contains: license.licenseType
        },
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Zadnjih 7 dana
        }
      }
    });
    
    if (!recentExpiryNotification) {
      await notifyLicenseExpired(license);
      expired++;
    }
  }
  
  // Obavijesti admine o kritičnim licencama (istječu za 1 dan ili manje)
  const criticalLicenses = allLicenses.filter(l => {
    if (!l.expiresAt) return false;
    const daysLeft = Math.ceil((l.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 1;
  });
  
  if (criticalLicenses.length > 0) {
    await notifyAdminsAboutCriticalLicenses(criticalLicenses);
  }
  
  console.log(`✅ Provjera licenci završena:`);
  console.log(`   - 30 dana: ${notified30} notifikacija`);
  console.log(`   - 14 dana: ${notified14} notifikacija`);
  console.log(`   - 7 dana: ${notified7} notifikacija`);
  console.log(`   - 1 dan: ${notified1} notifikacija`);
  console.log(`   - Istekle: ${expired} notifikacija`);
  console.log(`   - Kritične (za admin): ${criticalLicenses.length}`);
  
  return {
    checked: allLicenses.length,
    notified30,
    notified14,
    notified7,
    notified1,
    expired,
    critical: criticalLicenses.length
  };
}

/**
 * Pošalji notifikaciju provideru o isteku licence
 */
async function notifyLicenseExpiry(license, daysLeft, expiryDate, severity) {
  const user = license.provider.user;
  
  let title = '';
  let message = '';
  let urgency = 'NORMAL';
  
  switch (severity) {
    case 'early':
      title = `⚠️ Licenca istječe za ${daysLeft} dana`;
      message = `Vaša licenca "${license.licenseType}" (broj: ${license.licenseNumber}) istječe ${expiryDate}. Molimo obnovite licencu prije isteka.`;
      urgency = 'LOW';
      break;
    case 'warning':
      title = `⚠️ Licenca istječe za ${daysLeft} dana`;
      message = `Vaša licenca "${license.licenseType}" (broj: ${license.licenseNumber}) istječe ${expiryDate}. Obnovite licencu prije isteka kako biste nastavili koristiti Uslugar.`;
      urgency = 'NORMAL';
      break;
    case 'urgent':
      title = `🔴 Licenca istječe za ${daysLeft} dana!`;
      message = `HITNO: Vaša licenca "${license.licenseType}" (broj: ${license.licenseNumber}) istječe ${expiryDate}. Molimo obnovite licencu odmah!`;
      urgency = 'HIGH';
      break;
    case 'critical':
      title = daysLeft === 0 
        ? `🔴 Licenca istječe DANAŠNJI DAN!`
        : `🔴 Licenca istječe ZA ${daysLeft} DAN!`;
      message = `KRITIČNO: Vaša licenca "${license.licenseType}" (broj: ${license.licenseNumber}) istječe ${expiryDate}. Obnovite licencu odmah ili će biti označena kao nevažeća.`;
      urgency = 'URGENT';
      break;
  }
  
  // Kreiraj in-app notifikaciju
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'SYSTEM',
      title,
      message
    }
  });
  
  // TODO: Pošalji email notifikaciju (ako je potrebno)
  // await sendLicenseExpiryEmail(user.email, license, daysLeft, expiryDate);
  
  console.log(`   📧 Notifikacija poslana: ${user.email} - ${license.licenseType} (${daysLeft} dana)`);
}

/**
 * Pošalji notifikaciju o isteklu licenci
 */
async function notifyLicenseExpired(license) {
  const user = license.provider.user;
  const expiryDateStr = license.expiresAt ? license.expiresAt.toLocaleDateString('hr-HR') : 'N/A';
  
  // Kreiraj in-app notifikaciju
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'SYSTEM',
      title: '🔴 Licenca je istekla',
      message: `Vaša licenca "${license.licenseType}" (broj: ${license.licenseNumber}) je istekla ${expiryDateStr}. Molimo uploadajte novu licencu ili obnovite postojeću.`
    }
  });
  
  console.log(`   📧 Notifikacija o isteku: ${user.email} - ${license.licenseType}`);
}

/**
 * Obavijesti admine o kritičnim licencama
 */
async function notifyAdminsAboutCriticalLicenses(criticalLicenses) {
  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN'
    },
    select: {
      id: true,
      email: true,
      fullName: true
    }
  });
  
  if (admins.length === 0) {
    return;
  }
  
  // Grupiraj po provideru
  const licensesByProvider = {};
  for (const license of criticalLicenses) {
    const providerId = license.provider.userId;
    if (!licensesByProvider[providerId]) {
      licensesByProvider[providerId] = {
        provider: license.provider.user,
        licenses: []
      };
    }
    licensesByProvider[providerId].licenses.push(license);
  }
  
  const summary = Object.values(licensesByProvider)
    .map(({ provider, licenses }) => {
      const licenseList = licenses.map(l => 
        `${l.licenseType} (${l.licenseNumber}) - istječe ${l.expiresAt ? l.expiresAt.toLocaleDateString('hr-HR') : 'N/A'}`
      ).join(', ');
      return `${provider.fullName || provider.email}: ${licenseList}`;
    })
    .join('\n');
  
  const message = `Kritične licence koje istječu (≤1 dan):\n\n${summary}\n\nUkupno: ${criticalLicenses.length} licenci`;
  
  // Pošalji notifikaciju svakom adminu
  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'SYSTEM',
        title: `🔴 ${criticalLicenses.length} kritičnih licenci istječe`,
        message
      }
    });
  }
  
  console.log(`   📧 Admin notifikacije poslane za ${criticalLicenses.length} kritičnih licenci`);
}

