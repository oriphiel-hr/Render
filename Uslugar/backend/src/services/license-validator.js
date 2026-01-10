// License Validator - Automatska provjera valjanosti licenci
import { prisma } from '../lib/prisma.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Provjeri valjanost licence kroz javne registre i API-jeve
 * @param {object} license - ProviderLicense objekt
 * @returns {Promise<{valid: boolean, status: string, message: string, data: object}>}
 */
export async function validateLicense(license) {
  const { licenseType, licenseNumber, issuingAuthority, expiresAt, providerId } = license;
  
  // Prvo provjeri istek
  if (expiresAt && new Date(expiresAt) < new Date()) {
    return {
      valid: false,
      status: 'EXPIRED',
      message: 'Licenca je istekla',
      data: {
        expiryDate: expiresAt,
        daysExpired: Math.floor((new Date() - new Date(expiresAt)) / (1000 * 60 * 60 * 24))
      }
    };
  }
  
  // Provjeri prema issuingAuthority
  const authority = issuingAuthority.toLowerCase();
  const licenseTypeLower = licenseType.toLowerCase();
  
  try {
    // Hrvatska komora inženjera elektrotehnike
    if (authority.includes('elektrotehnik') || authority.includes('hkie')) {
      return await validateHKIELicense(licenseNumber, licenseType);
    }
    
    // Hrvatska komora inženjera građevinarstva
    if (authority.includes('građevinar') || authority.includes('gradevinar') || authority.includes('hkgk')) {
      return await validateHKGKLicense(licenseNumber, licenseType);
    }
    
    // Hrvatska komora arhitekata
    if (authority.includes('arhitekata') || authority.includes('hka')) {
      return await validateHKALicense(licenseNumber, licenseType);
    }
    
    // Hrvatska odvjetnička komora
    if (authority.includes('odvjetnik') || authority.includes('hok')) {
      return await validateHOKLicense(licenseNumber, licenseType);
    }
    
    // Hrvatska komora fizioterapeuta
    if (authority.includes('fizioterapeut') || authority.includes('hkf')) {
      return await validateHKFLicense(licenseNumber, licenseType);
    }
    
    // Ministarstvo mora, prometa i infrastrukture (prijevoz)
    if (authority.includes('promet') || authority.includes('infrastrukture') || authority.includes('prijevoz')) {
      return await validateTransportLicense(licenseNumber, licenseType);
    }
    
    // Hrvatska agencija za nadzor financijskih usluga (osiguranje)
    if (authority.includes('financijskih') || authority.includes('osiguranje') || authority.includes('hanfa')) {
      return await validateHANFALicense(licenseNumber, licenseType);
    }
    
    // Generička provjera (ako ne postoji specifičan provjerač)
    return await validateGenericLicense(licenseNumber, licenseType, issuingAuthority);
    
  } catch (error) {
    console.error(`[License Validator] Error validating license ${licenseNumber}:`, error.message);
    return {
      valid: null, // Unknown - treba ručnu provjeru
      status: 'PENDING_VALIDATION',
      message: 'Provjera valjanosti nije dostupna - potrebna ručna provjera',
      data: {
        error: error.message
      }
    };
  }
}

/**
 * Provjeri HKIET (Elektrotehnička) licencu
 */
async function validateHKIELicense(licenseNumber, licenseType) {
  try {
    // HKIET pretraga: https://www.hkie.hr/registar/
    // TODO: Integrirati pravi API ako postoji
    // Za sada: provjeri format broja (obično ima format)
    
    // Simulacija - provjeri da li broj licence ima valjan format
    const isValidFormat = /^[A-Z]?[0-9]{4,8}$/.test(licenseNumber.trim());
    
    if (!isValidFormat) {
      return {
        valid: false,
        status: 'INVALID_FORMAT',
        message: 'Broj licence nema valjan format za HKIET',
        data: { licenseNumber, expectedFormat: 'Format: X#### ili #####' }
      };
    }
    
    // Mock API call - u produkciji bi trebao biti pravi API
    // const response = await axios.get(`https://api.hkie.hr/registar/${licenseNumber}`);
    
    // Za sada vraćamo PENDING jer ne znamo je li stvarno validna
    return {
      valid: null, // Nije moguće automatski provjeriti bez API-ja
      status: 'PENDING_VALIDATION',
      message: 'HKIET licenca - potrebna ručna provjera (API nije dostupan)',
      data: {
        authority: 'Hrvatska komora inženjera elektrotehnike',
        note: 'Provjera moguća na https://www.hkie.hr/registar/'
      }
    };
  } catch (error) {
    return {
      valid: null,
      status: 'ERROR',
      message: 'Greška pri provjeri HKIET licence',
      data: { error: error.message }
    };
  }
}

/**
 * Provjeri HKGK (Građevinska) licencu
 */
async function validateHKGKLicense(licenseNumber, licenseType) {
  try {
    // HKGK registar: https://www.hkgk.hr/
    const isValidFormat = /^[A-Z]?[0-9]{4,8}$/.test(licenseNumber.trim());
    
    if (!isValidFormat) {
      return {
        valid: false,
        status: 'INVALID_FORMAT',
        message: 'Broj licence nema valjan format za HKGK',
        data: { licenseNumber }
      };
    }
    
    return {
      valid: null,
      status: 'PENDING_VALIDATION',
      message: 'HKGK licenca - potrebna ručna provjera (API nije dostupan)',
      data: {
        authority: 'Hrvatska komora inženjera građevinarstva',
        note: 'Provjera moguća na https://www.hkgk.hr/'
      }
    };
  } catch (error) {
    return {
      valid: null,
      status: 'ERROR',
      message: 'Greška pri provjeri HKGK licence',
      data: { error: error.message }
    };
  }
}

/**
 * Provjeri HKA (Arhitektonska) licencu
 */
async function validateHKALicense(licenseNumber, licenseType) {
  try {
    // HKA registar: https://www.hka.hr/
    const isValidFormat = /^[A-Z]?[0-9]{4,8}$/.test(licenseNumber.trim());
    
    return {
      valid: null,
      status: 'PENDING_VALIDATION',
      message: 'HKA licenca - potrebna ručna provjera (API nije dostupan)',
      data: {
        authority: 'Hrvatska komora arhitekata',
        note: 'Provjera moguća na https://www.hka.hr/'
      }
    };
  } catch (error) {
    return {
      valid: null,
      status: 'ERROR',
      message: 'Greška pri provjeri HKA licence',
      data: { error: error.message }
    };
  }
}

/**
 * Provjeri HOK (Odvjetnička) licencu
 */
async function validateHOKLicense(licenseNumber, licenseType) {
  try {
    // HOK registar: https://www.hok.hr/
    // Odvjetničke licence obično imaju specifičan format
    const isValidFormat = /^[A-Z0-9\/-]{5,15}$/.test(licenseNumber.trim());
    
    if (!isValidFormat) {
      return {
        valid: false,
        status: 'INVALID_FORMAT',
        message: 'Broj odvjetničke licence nema valjan format',
        data: { licenseNumber }
      };
    }
    
    return {
      valid: null,
      status: 'PENDING_VALIDATION',
      message: 'HOK licenca - potrebna ručna provjera (API nije dostupan)',
      data: {
        authority: 'Hrvatska odvjetnička komora',
        note: 'Provjera moguća na https://www.hok.hr/'
      }
    };
  } catch (error) {
    return {
      valid: null,
      status: 'ERROR',
      message: 'Greška pri provjeri HOK licence',
      data: { error: error.message }
    };
  }
}

/**
 * Provjeri HKF (Fizioterapeutska) licencu
 */
async function validateHKFLicense(licenseNumber, licenseType) {
  try {
    return {
      valid: null,
      status: 'PENDING_VALIDATION',
      message: 'HKF licenca - potrebna ručna provjera',
      data: {
        authority: 'Hrvatska komora fizioterapeuta'
      }
    };
  } catch (error) {
    return {
      valid: null,
      status: 'ERROR',
      message: 'Greška pri provjeri HKF licence',
      data: { error: error.message }
    };
  }
}

/**
 * Provjeri transportnu licencu (MMPI)
 */
async function validateTransportLicense(licenseNumber, licenseType) {
  try {
    // Ministarstvo mora, prometa i infrastrukture
    // Registar: https://mppi.gov.hr/ (registar autoprijevoznika)
    
    const isValidFormat = /^[A-Z0-9\/-]{6,20}$/.test(licenseNumber.trim());
    
    return {
      valid: null,
      status: 'PENDING_VALIDATION',
      message: 'Transportna licenca - potrebna ručna provjera',
      data: {
        authority: 'Ministarstvo mora, prometa i infrastrukture',
        note: 'Provjera moguća na https://mppi.gov.hr/'
      }
    };
  } catch (error) {
    return {
      valid: null,
      status: 'ERROR',
      message: 'Greška pri provjeri transportne licence',
      data: { error: error.message }
    };
  }
}

/**
 * Provjeri HANFA (Osiguravajuća) licencu
 */
async function validateHANFALicense(licenseNumber, licenseType) {
  try {
    // HANFA registar osiguravajućih agenata
    // Registar: https://www.hanfa.hr/
    
    return {
      valid: null,
      status: 'PENDING_VALIDATION',
      message: 'HANFA licenca - potrebna ručna provjera',
      data: {
        authority: 'Hrvatska agencija za nadzor financijskih usluga',
        note: 'Provjera moguća na https://www.hanfa.hr/'
      }
    };
  } catch (error) {
    return {
      valid: null,
      status: 'ERROR',
      message: 'Greška pri provjeri HANFA licence',
      data: { error: error.message }
    };
  }
}

/**
 * Generička provjera licence (fallback)
 */
async function validateGenericLicense(licenseNumber, licenseType, issuingAuthority) {
  try {
    // Provjeri osnovne kriterije
    if (!licenseNumber || licenseNumber.trim().length < 3) {
      return {
        valid: false,
        status: 'INVALID_FORMAT',
        message: 'Broj licence je prekratak ili nevaljan',
        data: { licenseNumber }
      };
    }
    
    // Ako ima expiresAt, provjeri da nije istekla
    // (već provjereno gore, ali ovdje kao double-check)
    
    return {
      valid: null, // Ne znamo je li validna bez specifične provjere
      status: 'PENDING_VALIDATION',
      message: `Licenca "${licenseType}" - potrebna ručna provjera`,
      data: {
        authority: issuingAuthority,
        note: 'Automatska provjera nije dostupna za ovaj tip licence'
      }
    };
  } catch (error) {
    return {
      valid: null,
      status: 'ERROR',
      message: 'Greška pri generičkoj provjeri licence',
      data: { error: error.message }
    };
  }
}

/**
 * Provjeri sve verificirane licence u bazi
 * Poziva se iz cron job-a
 */
export async function validateAllLicenses() {
  console.log('🔍 Provjeravam valjanost svih licenci...');
  
  // Dohvati sve verificirane licence koje imaju expiresAt ili su verificirane
  const licenses = await prisma.providerLicense.findMany({
    where: {
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
  
  let validated = 0;
  let invalid = 0;
  let expired = 0;
  let errors = 0;
  
  for (const license of licenses) {
    try {
      const result = await validateLicense(license);
      
      // Ažuriraj licence status u bazi
      // Napomena: trenutno schema nema polje za validity status,
      // možemo koristiti notes ili dodati novo polje
      await prisma.providerLicense.update({
        where: { id: license.id },
        data: {
          notes: result.message + (license.notes ? ` | ${license.notes}` : ''),
          // Možemo dodati validatedAt polje ako dodamo u schema
          updatedAt: new Date()
        }
      });
      
      // Ako je licenca nevaljana ili istekla, obavijesti providera
      if (result.status === 'EXPIRED' || result.valid === false) {
        await notifyProviderAboutInvalidLicense(license, result);
        
        if (result.status === 'EXPIRED') {
          expired++;
        } else {
          invalid++;
        }
      } else if (result.valid === true) {
        validated++;
      }
      
    } catch (error) {
      console.error(`[License Validator] Error validating license ${license.id}:`, error);
      errors++;
    }
  }
  
  console.log(`✅ Provjera licenci završena:`);
  console.log(`   - Validirano: ${validated}`);
  console.log(`   - Nevaljane: ${invalid}`);
  console.log(`   - Istekle: ${expired}`);
  console.log(`   - Greške: ${errors}`);
  
  return {
    total: licenses.length,
    validated,
    invalid,
    expired,
    errors
  };
}

/**
 * Obavijesti providera o nevaljanoj licenci
 */
async function notifyProviderAboutInvalidLicense(license, validationResult) {
  try {
    const user = license.provider.user;
    const message = `Vaša licenca "${license.licenseType}" (broj: ${license.licenseNumber}) je ${validationResult.status === 'EXPIRED' ? 'istekla' : 'nevaljana'}. ${validationResult.message}. Molimo obnovite licencu ili uploadajte novu.`;
    
    // Provjeri je li već poslana notifikacija danas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const recentNotification = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: 'SYSTEM',
        title: {
          contains: 'licenca'
        },
        message: {
          contains: license.licenseNumber
        },
        createdAt: {
          gte: today
        }
      }
    });
    
    if (!recentNotification) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SYSTEM',
          title: validationResult.status === 'EXPIRED' 
            ? '🔴 Licenca je istekla'
            : '⚠️ Licenca je nevaljana',
          message
        }
      });
      
      console.log(`   📧 Notifikacija poslana: ${user.email} - ${license.licenseType} (${validationResult.status})`);
    }
  } catch (error) {
    console.error('[License Validator] Error notifying provider:', error);
  }
}

