// Auto Verification Service - Automatska verifikacija klijenata
import { prisma } from '../lib/prisma.js';
import { validateOIB, checkObrtniRegistar, checkKomorskiImenik, checkVIES } from '../lib/kyc-verification.js';

/**
 * Automatska verifikacija korisnika na osnovu dostupnih podataka
 * Poziva se kada korisnik unese email, telefon, OIB, ili kada se ažurira profil
 * @param {string} userId - ID korisnika
 * @returns {Promise<{success: boolean, verifications: object, trustScore: number}>}
 */
export async function autoVerifyClient(userId) {
  try {
    console.log(`[Auto Verification] Starting auto-verification for user ${userId}`);
    
    // Dohvati korisnika sa svim podacima
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clientVerification: true
      }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const verificationResults = {
      emailVerified: false,
      phoneVerified: false,
      idVerified: false,
      companyVerified: false,
      autoVerified: [],
      warnings: []
    };
    
    // 1. Email verifikacija (ako je već verificiran u User modelu)
    if (user.isVerified) {
      verificationResults.emailVerified = true;
      verificationResults.autoVerified.push('email');
      console.log(`[Auto Verification] Email auto-verified for user ${userId}`);
    }
    
    // 2. Telefon verifikacija (ako je već verificiran u User modelu)
    if (user.phoneVerified) {
      verificationResults.phoneVerified = true;
      verificationResults.autoVerified.push('phone');
      console.log(`[Auto Verification] Phone auto-verified for user ${userId}`);
    }
    
    // 3. OIB validacija (algoritamska)
    if (user.taxId) {
      const isOIBValid = validateOIB(user.taxId);
      if (isOIBValid) {
        console.log(`[Auto Verification] OIB ${user.taxId} is algorithmically valid`);
        
        // Ako korisnik ima companyName, pokušaj automatsku verifikaciju firme
        if (user.companyName) {
          try {
            const companyCheck = await checkObrtniRegistar(user.taxId, user.companyName);
            if (companyCheck.exists) {
              verificationResults.companyVerified = true;
              verificationResults.autoVerified.push('company');
              console.log(`[Auto Verification] Company verified via Obrtni registar: ${user.companyName}`);
            } else {
              // Pokušaj VIES provjeru
              try {
                const viesCheck = await checkVIES(user.taxId, user.companyName);
                if (viesCheck.exists) {
                  verificationResults.companyVerified = true;
                  verificationResults.autoVerified.push('company');
                  console.log(`[Auto Verification] Company verified via VIES: ${user.companyName}`);
                }
              } catch (e) {
                console.log(`[Auto Verification] VIES check failed: ${e.message}`);
              }
            }
          } catch (error) {
            console.log(`[Auto Verification] Company verification failed: ${error.message}`);
            verificationResults.warnings.push('Company verification unavailable (API not accessible)');
          }
        }
      } else {
        verificationResults.warnings.push('OIB format is invalid');
      }
    }
    
    // 4. Provjeri ID verifikaciju (ako postoji uploadani dokument)
    // Ovo zahtijeva OCR analizu, pa za sada preskačemo automatsku verifikaciju
    
    // Izračunaj trust score na osnovu verifikacija
    let trustScore = 0;
    if (verificationResults.emailVerified) trustScore += 20;
    if (verificationResults.phoneVerified) trustScore += 20;
    if (verificationResults.companyVerified) trustScore += 40;
    if (user.taxId && validateOIB(user.taxId)) trustScore += 20; // OIB validan format
    
    // Ako postoji postojeći ClientVerification, ažuriraj ga
    // Inače kreiraj novi
    const existingVerification = user.clientVerification;
    
    if (existingVerification) {
      // Ažuriraj postojeće verifikacije (samo ako nisu već ručno postavljene)
      const updatedVerification = await prisma.clientVerification.update({
        where: { userId: userId },
        data: {
          emailVerified: existingVerification.emailVerified || verificationResults.emailVerified,
          phoneVerified: existingVerification.phoneVerified || verificationResults.phoneVerified,
          companyVerified: existingVerification.companyVerified || verificationResults.companyVerified,
          trustScore: Math.max(existingVerification.trustScore || 0, trustScore),
          notes: existingVerification.notes 
            ? `${existingVerification.notes}\n[Auto] Auto-verified: ${verificationResults.autoVerified.join(', ') || 'none'} at ${new Date().toISOString()}`
            : `[Auto] Auto-verified: ${verificationResults.autoVerified.join(', ') || 'none'} at ${new Date().toISOString()}`,
          updatedAt: new Date()
        }
      });
      
      return {
        success: true,
        verifications: verificationResults,
        trustScore: updatedVerification.trustScore,
        verification: updatedVerification
      };
    } else {
      // Kreiraj novi verification record
      const newVerification = await prisma.clientVerification.create({
        data: {
          userId: userId,
          emailVerified: verificationResults.emailVerified,
          phoneVerified: verificationResults.phoneVerified,
          companyVerified: verificationResults.companyVerified,
          trustScore: trustScore,
          notes: `[Auto] Auto-verified: ${verificationResults.autoVerified.join(', ') || 'none'} at ${new Date().toISOString()}`,
          verifiedAt: verificationResults.autoVerified.length > 0 ? new Date() : null
        }
      });
      
      return {
        success: true,
        verifications: verificationResults,
        trustScore: newVerification.trustScore,
        verification: newVerification
      };
    }
    
  } catch (error) {
    console.error(`[Auto Verification] Error for user ${userId}:`, error);
    return {
      success: false,
      error: error.message,
      verifications: null,
      trustScore: 0
    };
  }
}

/**
 * Automatska verifikacija pri registraciji ili ažuriranju profila
 * Poziva se iz webhook-a ili iz route handlera
 * @param {string} userId - ID korisnika
 * @param {object} triggerData - Podaci koji su pokrenuli verifikaciju (npr. { type: 'email', value: '...' })
 */
export async function triggerAutoVerification(userId, triggerData = {}) {
  try {
    const result = await autoVerifyClient(userId);
    
    // Ako je verifikacija uspješna i ima auto-verifikacije, obavijesti korisnika
    if (result.success && result.verifications.autoVerified.length > 0) {
      try {
        const { notifyAutoVerification } = await import('./verification-notifications.js');
        await notifyAutoVerification(userId, result.verifications.autoVerified);
      } catch (notifError) {
        console.error('[Auto Verification] Failed to send notification:', notifError);
        // Ne baci grešku ako notifikacija ne uspije
      }
    }
    
    return result;
  } catch (error) {
    console.error(`[Auto Verification] Trigger failed for user ${userId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch automatska verifikacija za sve korisnike koji imaju podatke ali nisu verificirani
 * Poziva se iz cron job-a ili admin endpointa
 */
export async function batchAutoVerifyClients() {
  console.log('[Auto Verification] Starting batch auto-verification...');
  
  try {
    // Pronađi sve korisnike koji:
    // - Imaju email (isVerified možda nije true)
    // - Imaju telefon (phoneVerified možda nije true)
    // - Imaju OIB (taxId postoji)
    // - Nemaju visoki trust score (< 50)
    const usersToVerify = await prisma.user.findMany({
      where: {
        OR: [
          { isVerified: false, email: { not: null } },
          { phoneVerified: false, phone: { not: null } },
          { taxId: { not: null } }
        ]
      },
      include: {
        clientVerification: true
      },
      take: 100 // Ograniči na 100 korisnika po batch-u
    });
    
    console.log(`[Auto Verification] Found ${usersToVerify.length} users to verify`);
    
    let verified = 0;
    let errors = 0;
    
    for (const user of usersToVerify) {
      try {
        const result = await autoVerifyClient(user.id);
        if (result.success) {
          verified++;
          if (result.verifications.autoVerified.length > 0) {
            console.log(`[Auto Verification] ✓ User ${user.email}: ${result.verifications.autoVerified.join(', ')}`);
          }
        } else {
          errors++;
          console.log(`[Auto Verification] ✗ User ${user.email}: ${result.error}`);
        }
      } catch (error) {
        errors++;
        console.error(`[Auto Verification] Error verifying user ${user.email}:`, error);
      }
    }
    
    console.log(`[Auto Verification] Batch completed: ${verified} verified, ${errors} errors`);
    
    return {
      total: usersToVerify.length,
      verified,
      errors
    };
  } catch (error) {
    console.error('[Auto Verification] Batch verification failed:', error);
    return {
      total: 0,
      verified: 0,
      errors: 1,
      error: error.message
    };
  }
}

