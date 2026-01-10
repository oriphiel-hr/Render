// Verification Notifications Service
import { prisma } from '../lib/prisma.js';

/**
 * Obavijesti korisnika o email verifikaciji
 */
export async function notifyEmailVerification(userId, verified = true) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, email: true }
    });
    
    if (!user) return;
    
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'SYSTEM',
        title: verified ? '✅ Email verificiran' : '❌ Email verifikacija neuspješna',
        message: verified 
          ? `Vaš email ${user.email} je uspješno verificiran.`
          : `Verifikacija emaila ${user.email} nije uspjela. Molimo provjerite link ili kontaktirajte podršku.`
      }
    });
    
    console.log(`[Verification Notification] Email verification notification sent to user ${userId}`);
  } catch (error) {
    console.error('[Verification Notification] Error sending email verification notification:', error);
  }
}

/**
 * Obavijesti korisnika o telefon verifikaciji
 */
export async function notifyPhoneVerification(userId, verified = true) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientVerification: true
      },
      select: {
        fullName: true,
        phone: true,
        clientVerification: {
          select: {
            trustScore: true
          }
        }
      }
    });
    
    if (!user) return;
    
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'SYSTEM',
        title: verified ? '✅ Telefon verificiran' : '❌ Telefon verifikacija neuspješna',
        message: verified 
          ? `Vaš telefon ${user.phone || ''} je uspješno verificiran.${user.clientVerification ? ` Vaš trust score: ${user.clientVerification.trustScore}/100.` : ''}`
          : `Verifikacija telefona nije uspjela. Molimo provjerite SMS kod ili pokušajte ponovno.`
      }
    });
    
    console.log(`[Verification Notification] Phone verification notification sent to user ${userId}`);
  } catch (error) {
    console.error('[Verification Notification] Error sending phone verification notification:', error);
  }
}

/**
 * Obavijesti korisnika o ID verifikaciji
 */
export async function notifyIDVerification(userId, verified = true, pending = false, reason = null) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientVerification: true
      },
      select: {
        fullName: true,
        email: true,
        clientVerification: {
          select: {
            trustScore: true,
            idVerified: true
          }
        }
      }
    });
    
    if (!user) return;
    
    let title = '';
    let message = '';
    
    if (pending) {
      title = '⏳ ID verifikacija u tijeku';
      message = 'Vaša osobna iskaznica je uploadana i čeka provjeru. Obavijestit ćemo vas kada bude verificirana.';
    } else if (verified) {
      title = '✅ ID verificiran';
      message = `Vaša osobna iskaznica je uspješno verificirana.${user.clientVerification ? ` Vaš trust score: ${user.clientVerification.trustScore}/100.` : ''}`;
    } else {
      title = '❌ ID verifikacija odbijena';
      message = `Verifikacija vaše osobne iskaznice nije uspjela.${reason ? ` Razlog: ${reason}` : ' Molimo provjerite dokument i pokušajte ponovno.'}`;
    }
    
    await prisma.notification.create({
      data: {
        userId: userId,
        type: verified && !pending ? 'SYSTEM' : 'SYSTEM',
        title: title,
        message: message
      }
    });
    
    console.log(`[Verification Notification] ID verification notification sent to user ${userId} (verified: ${verified}, pending: ${pending})`);
  } catch (error) {
    console.error('[Verification Notification] Error sending ID verification notification:', error);
  }
}

/**
 * Obavijesti korisnika o company verifikaciji
 */
export async function notifyCompanyVerification(userId, verified = true, reason = null) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientVerification: true
      },
      select: {
        fullName: true,
        companyName: true,
        clientVerification: {
          select: {
            trustScore: true
          }
        }
      }
    });
    
    if (!user) return;
    
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'SYSTEM',
        title: verified ? '✅ Firma verificirana' : '❌ Firma verifikacija neuspješna',
        message: verified
          ? `Vaša firma ${user.companyName || ''} je uspješno verificirana.${user.clientVerification ? ` Vaš trust score: ${user.clientVerification.trustScore}/100.` : ''}`
          : `Verifikacija firme ${user.companyName || ''} nije uspjela.${reason ? ` Razlog: ${reason}` : ' Molimo provjerite podatke i pokušajte ponovno.'}`
      }
    });
    
    console.log(`[Verification Notification] Company verification notification sent to user ${userId}`);
  } catch (error) {
    console.error('[Verification Notification] Error sending company verification notification:', error);
  }
}

/**
 * Obavijesti korisnika o trust score promjeni
 */
export async function notifyTrustScoreChange(userId, oldScore, newScore, reason = null) {
  try {
    // Ne šalji notifikaciju ako je promjena manja od 5 bodova (kako ne bi bilo previše notifikacija)
    if (Math.abs(newScore - oldScore) < 5) {
      return;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true }
    });
    
    if (!user) return;
    
    const scoreDiff = newScore - oldScore;
    const isIncrease = scoreDiff > 0;
    
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'SYSTEM',
        title: isIncrease ? `📈 Trust score povećan (+${scoreDiff})` : `📉 Trust score smanjen (${scoreDiff})`,
        message: `Vaš trust score je ${isIncrease ? 'povećan' : 'smanjen'} sa ${oldScore} na ${newScore} bodova.${reason ? ` ${reason}` : ''}`
      }
    });
    
    console.log(`[Verification Notification] Trust score change notification sent to user ${userId} (${oldScore} -> ${newScore})`);
  } catch (error) {
    console.error('[Verification Notification] Error sending trust score notification:', error);
  }
}

/**
 * Obavijesti korisnika o automatskoj verifikaciji
 */
export async function notifyAutoVerification(userId, verifiedItems = []) {
  try {
    if (verifiedItems.length === 0) return;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientVerification: true
      },
      select: {
        fullName: true,
        clientVerification: {
          select: {
            trustScore: true
          }
        }
      }
    });
    
    if (!user) return;
    
    const itemNames = verifiedItems.map(item => {
      switch(item) {
        case 'email': return 'Email';
        case 'phone': return 'Telefon';
        case 'company': return 'Firma';
        case 'id': return 'Osobna iskaznica';
        default: return item;
      }
    }).join(', ');
    
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'SYSTEM',
        title: '✅ Automatska verifikacija',
        message: `Vaši podaci su automatski verificirani: ${itemNames}.${user.clientVerification ? ` Vaš trust score: ${user.clientVerification.trustScore}/100.` : ''}`
      }
    });
    
    console.log(`[Verification Notification] Auto-verification notification sent to user ${userId} (items: ${verifiedItems.join(', ')})`);
  } catch (error) {
    console.error('[Verification Notification] Error sending auto-verification notification:', error);
  }
}

/**
 * Obavijesti korisnika o ručnoj verifikaciji od strane admina
 */
export async function notifyManualVerification(userId, verifiedType, verified = true, adminNotes = null) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientVerification: true
      },
      select: {
        fullName: true,
        clientVerification: {
          select: {
            trustScore: true
          }
        }
      }
    });
    
    if (!user) return;
    
    const typeNames = {
      'email': 'Email',
      'phone': 'Telefon',
      'id': 'Osobna iskaznica',
      'company': 'Firma'
    };
    
    const typeName = typeNames[verifiedType] || verifiedType;
    
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'SYSTEM',
        title: verified ? `✅ ${typeName} verificiran od strane admina` : `❌ ${typeName} verifikacija odbijena`,
        message: verified
          ? `Admin je verificirao vaš ${typeName.toLowerCase()}.${user.clientVerification ? ` Vaš trust score: ${user.clientVerification.trustScore}/100.` : ''}${adminNotes ? `\n\nAdmin bilješka: ${adminNotes}` : ''}`
          : `Admin je odbio verifikaciju vašeg ${typeName.toLowerCase()}.${adminNotes ? `\n\nRazlog: ${adminNotes}` : ''}`
      }
    });
    
    console.log(`[Verification Notification] Manual verification notification sent to user ${userId} (type: ${verifiedType}, verified: ${verified})`);
  } catch (error) {
    console.error('[Verification Notification] Error sending manual verification notification:', error);
  }
}

