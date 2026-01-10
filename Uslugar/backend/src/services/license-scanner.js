// License Document Scanner - OCR and data extraction from license documents
import { performOCR } from '../lib/kyc-verification.js';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

/**
 * Skeniraj i ekstrahiraj podatke iz dokumenta licence
 * @param {Buffer} documentBuffer - Buffer dokumenta (PDF/JPG/PNG)
 * @param {string} fileName - Ime fajla (za format detection)
 * @returns {Promise<{success: boolean, data: object, confidence: number}>}
 */
export async function scanLicenseDocument(documentBuffer, fileName) {
  try {
    console.log('[License Scanner] Starting document scan...');
    console.log('[License Scanner] File type:', path.extname(fileName).toLowerCase());
    
    let imageBuffer = documentBuffer;
    
    // Ako je PDF, konvertiraj u sliku (prvi page)
    if (fileName.toLowerCase().endsWith('.pdf')) {
      try {
        // Za PDF, koristimo sharp ili pdf-poppler (ako je instaliran)
        // Fallback: vraćamo da treba ručna provjera
        console.log('[License Scanner] PDF detected - attempting conversion...');
        // Za sada skip PDF konverziju (može se dodati pdf-poppler ili pdf2pic)
        return {
          success: false,
          data: null,
          confidence: 0,
          message: 'PDF dokumenti zahtijevaju konverziju - molimo uploadajte JPG ili PNG sliku licence',
          requiresManual: true
        };
      } catch (error) {
        console.error('[License Scanner] PDF conversion error:', error);
        return {
          success: false,
          data: null,
          confidence: 0,
          message: 'PDF dokument nije mogao biti obraden - molimo uploadajte JPG ili PNG sliku',
          requiresManual: true
        };
      }
    }
    
    // Ako je JPG/PNG, osiguraj da je u pravom formatu
    if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg')) {
      try {
        // Optimiziraj sliku za OCR (ako je prevelika, smanji)
        const metadata = await sharp(documentBuffer).metadata();
        if (metadata.width > 2000 || metadata.height > 2000) {
          imageBuffer = await sharp(documentBuffer)
            .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toBuffer();
        } else {
          imageBuffer = await sharp(documentBuffer)
            .jpeg({ quality: 90 })
            .toBuffer();
        }
      } catch (error) {
        console.error('[License Scanner] Image optimization error:', error);
        // Nastavi s originalnim buffer-om
      }
    } else if (fileName.toLowerCase().endsWith('.png')) {
      try {
        const metadata = await sharp(documentBuffer).metadata();
        if (metadata.width > 2000 || metadata.height > 2000) {
          imageBuffer = await sharp(documentBuffer)
            .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
            .png({ quality: 90 })
            .toBuffer();
        }
      } catch (error) {
        console.error('[License Scanner] PNG optimization error:', error);
      }
    }
    
    // Izvrši OCR
    const ocrResult = await performOCR(imageBuffer);
    const extractedText = ocrResult.text || '';
    const confidence = ocrResult.metadata?.confidence || 0;
    
    console.log('[License Scanner] OCR completed. Confidence:', confidence);
    console.log('[License Scanner] Extracted text length:', extractedText.length);
    
    if (extractedText.length < 50) {
      return {
        success: false,
        data: null,
        confidence: 0,
        message: 'Nije moguće pročitati dokument - tekst je prekratak. Provjerite kvalitetu slike.',
        requiresManual: true
      };
    }
    
    // Ekstrahiraj podatke iz teksta
    const extractedData = extractLicenseData(extractedText);
    
    return {
      success: true,
      data: extractedData,
      confidence: confidence,
      rawText: extractedText,
      message: 'Dokument je uspješno skeniran'
    };
    
  } catch (error) {
    console.error('[License Scanner] Error:', error);
    return {
      success: false,
      data: null,
      confidence: 0,
      message: `Greška pri skeniranju dokumenta: ${error.message}`,
      requiresManual: true
    };
  }
}

/**
 * Ekstrahiraj podatke licence iz OCR teksta
 * @param {string} text - OCR ekstrahiran tekst
 * @returns {object} Ekstrahiran podaci
 */
function extractLicenseData(text) {
  const data = {
    licenseType: null,
    licenseNumber: null,
    issuingAuthority: null,
    issuedAt: null,
    expiresAt: null,
    extractedFields: {}
  };
  
  const textLower = text.toLowerCase();
  const textNormalized = text.replace(/\s+/g, ' ').trim();
  
  // Pattern matching za različite tipove licenci
  
  // 1. Broj licence (različiti formati)
  // Format: "Broj:" ili "Broj licence:" ili "Reg. br.:" ili samo brojevi
  const licenseNumberPatterns = [
    /broj\s*(?:licence|dozvole|dozvola|registracije)?\s*:?\s*([A-Z0-9\/\-]{3,20})/i,
    /(?:reg\.?\s*br\.?|registarski\s*broj)\s*:?\s*([A-Z0-9\/\-]{3,20})/i,
    /(?:br\.?\s*|broj)\s*([A-Z]\d{4,10}|\d{5,10}[A-Z]?|\d{4,10})/i,
    /licenca\s*(?:br\.?|broj)?\s*:?\s*([A-Z0-9\/\-]{3,20})/i
  ];
  
  for (const pattern of licenseNumberPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const number = match[1].trim();
      if (number.length >= 3 && number.length <= 20) {
        data.licenseNumber = number;
        data.extractedFields.licenseNumber = number;
        break;
      }
    }
  }
  
  // Ako nije pronađen pattern, pokušaj pronaći samostalni broj
  if (!data.licenseNumber) {
    const standaloneNumber = text.match(/\b([A-Z]\d{4,10}|\d{5,10}[A-Z]?)\b/);
    if (standaloneNumber) {
      data.licenseNumber = standaloneNumber[1];
      data.extractedFields.licenseNumber = standaloneNumber[1];
    }
  }
  
  // 2. Tip licence (ključne riječi)
  const licenseTypes = {
    'elektrotehnička': ['elektrotehni', 'elektro', 'hkie', 'električar'],
    'građevinska': ['građevinska', 'gradevinska', 'hkgk', 'građevinar'],
    'arhitektonska': ['arhitektonska', 'arhitekt', 'hka'],
    'odvjetnička': ['odvjetni', 'odvjetnik', 'hok'],
    'fizioterapeutska': ['fizioterapeut', 'hkf'],
    'prijevoz': ['prijevoz', 'transport', 'mppi', 'autoprijevoz'],
    'osiguranje': ['osiguranje', 'osiguravajuć', 'hanfa'],
    'vodovodna': ['vodovodna', 'vodoinstalater', 'vodoinstalacij']
  };
  
  for (const [type, keywords] of Object.entries(licenseTypes)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword)) {
        data.licenseType = type.charAt(0).toUpperCase() + type.slice(1) + ' licenca';
        data.extractedFields.licenseType = type;
        break;
      }
    }
    if (data.licenseType) break;
  }
  
  // 3. Tijelo koje izdaje (komore i agencije)
  const authorities = {
    'Hrvatska komora inženjera elektrotehnike': ['hkie', 'hrvatska komora inženjera elektrotehnike', 'elektrotehni'],
    'Hrvatska komora inženjera građevinarstva': ['hkgk', 'hrvatska komora inženjera građevinarstva', 'gradevinsk'],
    'Hrvatska komora arhitekata': ['hka', 'hrvatska komora arhitekata'],
    'Hrvatska odvjetnička komora': ['hok', 'hrvatska odvjetnička komora', 'odvjetnička komora'],
    'Hrvatska komora fizioterapeuta': ['hkf', 'hrvatska komora fizioterapeuta'],
    'Ministarstvo mora, prometa i infrastrukture': ['mppi', 'ministarstvo mora', 'ministarstvo prometa', 'prometa i infrastrukture'],
    'Hrvatska agencija za nadzor financijskih usluga': ['hanfa', 'agencija za nadzor financijskih']
  };
  
  for (const [authority, keywords] of Object.entries(authorities)) {
    for (const keyword of keywords) {
      if (textLower.includes(keyword)) {
        data.issuingAuthority = authority;
        data.extractedFields.issuingAuthority = authority;
        break;
      }
    }
    if (data.issuingAuthority) break;
  }
  
  // 4. Datumi (izdavanje i istek)
  // Format datuma: DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  const datePatterns = [
    /\b(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{4})\b/g,
    /\b(\d{4})[.\/\-](\d{1,2})[.\/\-](\d{1,2})\b/g
  ];
  
  const foundDates = [];
  for (const pattern of datePatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      let day, month, year;
      if (match[3] && match[3].length === 4) {
        // DD.MM.YYYY format
        day = parseInt(match[1]);
        month = parseInt(match[2]);
        year = parseInt(match[3]);
      } else {
        // YYYY-MM-DD format
        year = parseInt(match[1]);
        month = parseInt(match[2]);
        day = parseInt(match[3]);
      }
      
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        try {
          const date = new Date(year, month - 1, day);
          if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
            foundDates.push(date);
          }
        } catch (e) {
          // Invalid date
        }
      }
    }
  }
  
  // Sortiraj datume (stariji prvi)
  foundDates.sort((a, b) => a - b);
  
  // Prvi datum = izdavanje, zadnji = istek (ako postoje)
  if (foundDates.length > 0) {
    data.issuedAt = foundDates[0];
    data.extractedFields.issuedAt = foundDates[0].toISOString().split('T')[0];
    
    if (foundDates.length > 1) {
      data.expiresAt = foundDates[foundDates.length - 1];
      data.extractedFields.expiresAt = foundDates[foundDates.length - 1].toISOString().split('T')[0];
    }
  }
  
  // Alternativno: pokušaj pronaći datume kroz ključne riječi
  if (!data.issuedAt || !data.expiresAt) {
    const issuedKeywords = ['izdano', 'izdavanje', 'datum izdavanja', 'dana'];
    const expiryKeywords = ['istječe', 'vrijedi do', 'važi do', 'istek', 'valjan do'];
    
    // Traži datum uz "izdano"
    for (const keyword of issuedKeywords) {
      const index = textLower.indexOf(keyword);
      if (index !== -1) {
        const context = text.substring(Math.max(0, index - 50), Math.min(text.length, index + 100));
        const dateMatch = context.match(/\b(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{4})\b/);
        if (dateMatch) {
          const day = parseInt(dateMatch[1]);
          const month = parseInt(dateMatch[2]);
          const year = parseInt(dateMatch[3]);
          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
            try {
              const date = new Date(year, month - 1, day);
              if (!data.issuedAt) {
                data.issuedAt = date;
                data.extractedFields.issuedAt = date.toISOString().split('T')[0];
              }
            } catch (e) {}
          }
        }
      }
    }
    
    // Traži datum uz "istječe"
    for (const keyword of expiryKeywords) {
      const index = textLower.indexOf(keyword);
      if (index !== -1) {
        const context = text.substring(Math.max(0, index - 50), Math.min(text.length, index + 100));
        const dateMatch = context.match(/\b(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{4})\b/);
        if (dateMatch) {
          const day = parseInt(dateMatch[1]);
          const month = parseInt(dateMatch[2]);
          const year = parseInt(dateMatch[3]);
          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
            try {
              const date = new Date(year, month - 1, day);
              if (!data.expiresAt) {
                data.expiresAt = date;
                data.extractedFields.expiresAt = date.toISOString().split('T')[0];
              }
            } catch (e) {}
          }
        }
      }
    }
  }
  
  // 5. Ime korisnika licence (ako je potrebno)
  const namePatterns = [
    /(?:ime\s+i\s+prezime|ime|prezime|vlasnik)\s*:?\s*([A-ZŠĐČĆŽ][a-zšđčćž]+(?:\s+[A-ZŠĐČĆŽ][a-zšđčćž]+){1,3})/i,
    /^([A-ZŠĐČĆŽ][a-zšđčćž]+(?:\s+[A-ZŠĐČĆŽ][a-zšđčćž]+){1,3})\s*$/m
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      if (name.length > 5 && name.length < 100) {
        data.extractedFields.holderName = name;
        break;
      }
    }
  }
  
  console.log('[License Scanner] Extracted data:', {
    licenseNumber: data.licenseNumber,
    licenseType: data.licenseType,
    issuingAuthority: data.issuingAuthority,
    issuedAt: data.issuedAt?.toISOString().split('T')[0],
    expiresAt: data.expiresAt?.toISOString().split('T')[0]
  });
  
  return data;
}

/**
 * Validiraj ekstrahirane podatke
 */
export function validateExtractedData(extractedData) {
  const errors = [];
  const warnings = [];
  
  if (!extractedData.licenseNumber || extractedData.licenseNumber.length < 3) {
    errors.push('Broj licence nije pronađen ili je nevaljan');
  }
  
  if (!extractedData.licenseType) {
    warnings.push('Tip licence nije automatski prepoznat - molimo odaberite ručno');
  }
  
  if (!extractedData.issuingAuthority) {
    warnings.push('Tijelo koje izdaje licencu nije prepoznato - molimo unesite ručno');
  }
  
  if (!extractedData.issuedAt) {
    warnings.push('Datum izdavanja nije pronađen - molimo unesite ručno');
  }
  
  if (extractedData.expiresAt && extractedData.issuedAt) {
    if (extractedData.expiresAt < extractedData.issuedAt) {
      errors.push('Datum isteka ne može biti prije datuma izdavanja');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

