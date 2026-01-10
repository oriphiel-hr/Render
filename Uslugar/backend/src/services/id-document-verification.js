// ID Document Verification Service
import { performOCR } from '../lib/kyc-verification.js';
import { validateOIB, extractOIBFromText, checkNameMatch } from '../lib/kyc-verification.js';
import sharp from 'sharp';

/**
 * Verifikacija osobne iskaznice (front i back)
 * @param {Buffer} frontImageBuffer - Buffer slike prednje strane osobne
 * @param {Buffer} backImageBuffer - Buffer slike stražnje strane osobne (opcionalno)
 * @param {object} user - Korisnik čiji se dokument verificira
 * @returns {Promise<{success: boolean, data: object, confidence: number}>}
 */
export async function verifyIDDocument(frontImageBuffer, backImageBuffer, user) {
  try {
    console.log('[ID Verification] Starting ID document verification...');
    
    let extractedData = {
      oib: null,
      name: null,
      surname: null,
      dateOfBirth: null,
      documentNumber: null,
      expiryDate: null,
      issuingAuthority: null,
      confidence: 0
    };
    
    // Optimiziraj slike za OCR
    let frontOptimized = frontImageBuffer;
    let backOptimized = backImageBuffer;
    
    try {
      const frontMetadata = await sharp(frontImageBuffer).metadata();
      if (frontMetadata.width > 2000 || frontMetadata.height > 2000) {
        frontOptimized = await sharp(frontImageBuffer)
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toBuffer();
      }
      
      if (backImageBuffer) {
        const backMetadata = await sharp(backImageBuffer).metadata();
        if (backMetadata.width > 2000 || backMetadata.height > 2000) {
          backOptimized = await sharp(backImageBuffer)
            .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toBuffer();
        }
      }
    } catch (optimizeError) {
      console.warn('[ID Verification] Image optimization failed, using original:', optimizeError.message);
    }
    
    // OCR na prednjoj strani
    const frontOCR = await performOCR(frontOptimized);
    const frontText = frontOCR.text || '';
    const frontConfidence = frontOCR.metadata?.confidence || 0;
    
    console.log('[ID Verification] Front OCR confidence:', frontConfidence);
    console.log('[ID Verification] Front text length:', frontText.length);
    
    // OCR na stražnjoj strani (ako postoji)
    let backText = '';
    let backConfidence = 0;
    if (backImageBuffer) {
      const backOCR = await performOCR(backOptimized);
      backText = backOCR.text || '';
      backConfidence = backOCR.metadata?.confidence || 0;
      console.log('[ID Verification] Back OCR confidence:', backConfidence);
    }
    
    // Kombiniraj tekst s obje strane
    const combinedText = frontText + ' ' + backText;
    extractedData.confidence = (frontConfidence + (backConfidence || frontConfidence)) / (backImageBuffer ? 2 : 1);
    
    // Ekstrahiraj podatke iz teksta
    extractedData = extractIDData(combinedText, extractedData);
    
    // Validacija
    const validation = validateIDData(extractedData, user);
    
    // Ako je OIB ekstrahiran i validan, i ime se podudara, označi kao verificirano
    const isVerified = validation.isValid && extractedData.oib && extractedData.name;
    
    return {
      success: true,
      verified: isVerified,
      data: extractedData,
      validation,
      confidence: extractedData.confidence
    };
    
  } catch (error) {
    console.error('[ID Verification] Error:', error);
    return {
      success: false,
      verified: false,
      error: error.message,
      confidence: 0
    };
  }
}

/**
 * Ekstrahiraj podatke iz OCR teksta osobne iskaznice
 */
function extractIDData(text, initialData) {
  const data = { ...initialData };
  const textLower = text.toLowerCase();
  const textNormalized = text.replace(/\s+/g, ' ').trim();
  
  // 1. OIB (11 znamenki)
  const oibMatch = extractOIBFromText(text);
  if (oibMatch) {
    data.oib = oibMatch;
  }
  
  // 2. Broj osobne iskaznice (obično format: 9 znamenki ili slova + brojevi)
  const idNumberPatterns = [
    /\b([A-Z]{2}\d{7})\b/, // Format: AB1234567
    /\b(\d{9})\b/, // Format: 123456789
    /(?:br\.|broj|document)\s*(?:no\.?|number)?\s*:?\s*([A-Z0-9]{5,12})/i
  ];
  
  for (const pattern of idNumberPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      data.documentNumber = match[1].trim();
      break;
    }
  }
  
  // 3. Ime i prezime
  // Pattern: "IME: Ivo PREZIME: Horvat" ili "Ivo Horvat" ili "HRVATSKI GRB" + ime
  const namePatterns = [
    /(?:ime|name)\s*:?\s*([A-ZŠĐČĆŽ][a-zšđčćž]+(?:\s+[A-ZŠĐČĆŽ][a-zšđčćž]+)?)/i,
    /(?:prezime|surname)\s*:?\s*([A-ZŠĐČĆŽ][a-zšđčćž]+(?:\s+[A-ZŠĐČĆŽ][a-zšđčćž]+)?)/i,
    /\b([A-ZŠĐČĆŽ][a-zšđčćž]+\s+[A-ZŠĐČĆŽ][a-zšđčćž]+)\b/ // Opći pattern za ime prezime
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const fullName = match[1].trim();
      const nameParts = fullName.split(/\s+/);
      if (nameParts.length >= 2) {
        data.name = nameParts[0];
        data.surname = nameParts.slice(1).join(' ');
      } else {
        data.name = fullName;
      }
      break;
    }
  }
  
  // 4. Datum rođenja (DD.MM.YYYY)
  const dobPatterns = [
    /(?:datum\s+rođenja|date\s+of\s+birth|dob|rođenje)\s*:?\s*(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{4})/i,
    /\b(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{4})\b/g
  ];
  
  for (const pattern of dobPatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]);
      const year = parseInt(match[3]);
      if (year >= 1900 && year <= 2010) { // Razumno očekivane godine rođenja
        try {
          const date = new Date(year, month - 1, day);
          if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
            data.dateOfBirth = date;
            break;
          }
        } catch (e) {}
      }
    }
    if (data.dateOfBirth) break;
  }
  
  // 5. Datum isteka (DD.MMBGGG ili DD.MM.YYYY)
  const expiryPatterns = [
    /(?:istječe|expires?|exp\.?)\s*:?\s*(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{4})/i,
    /(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{4})\s*(?:istječe|expires)/i
  ];
  
  for (const pattern of expiryPatterns) {
    const match = text.match(pattern);
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]);
      const year = parseInt(match[3]);
      if (year >= 2020 && year <= 2100) { // Razumno očekivane godine isteka
        try {
          const date = new Date(year, month - 1, day);
          if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
            data.expiryDate = date;
            break;
          }
        } catch (e) {}
      }
    }
  }
  
  // 6. Izdavatelj (obično "RH" ili "Republika Hrvatska")
  if (textLower.includes('republika hrvatska') || textLower.includes('rh') || textLower.includes('hrvatska')) {
    data.issuingAuthority = 'Republika Hrvatska';
  }
  
  return data;
}

/**
 * Validira ekstrahirane podatke
 */
function validateIDData(extractedData, user) {
  const errors = [];
  const warnings = [];
  
  // Provjeri OIB
  if (extractedData.oib) {
    const isOIBValid = validateOIB(extractedData.oib);
    if (!isOIBValid) {
      errors.push('OIB iz dokumenta nije validan (kontrolna znamenka)');
    } else {
      // Provjeri podudarnost s korisnikovim OIB-om (ako postoji)
      if (user.taxId && extractedData.oib !== user.taxId) {
        warnings.push('OIB iz dokumenta se ne podudara s unesenim OIB-om');
      }
    }
  } else {
    warnings.push('OIB nije pronađen u dokumentu');
  }
  
  // Provjeri ime
  if (extractedData.name) {
    const extractedFullName = `${extractedData.name} ${extractedData.surname || ''}`.trim();
    if (extractedFullName && user.fullName) {
      const nameMatches = checkNameMatch(extractedFullName, user.fullName);
      if (!nameMatches) {
        warnings.push('Ime iz dokumenta se ne podudara potpuno s imenom u profilu');
      }
    }
  } else {
    warnings.push('Ime nije pronađeno u dokumentu');
  }
  
  // Provjeri datum isteka
  if (extractedData.expiryDate) {
    const now = new Date();
    if (extractedData.expiryDate < now) {
      errors.push('Dokument je istekao');
    } else {
      const daysUntilExpiry = Math.floor((extractedData.expiryDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 90) {
        warnings.push(`Dokument istječe za ${daysUntilExpiry} dana`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

