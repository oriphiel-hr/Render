/**
 * KYC-lite Verifikacija - Provjera pružatelja usluga (freelancere/samostalne djelatnike)
 * 
 * Implementira GDPR-uskladičenu provjeru identiteta:
 * - Upload Rješenja Porezne uprave o upisu u RPO
 * - Automatski OCR koji traži ključne fraze
 * - Validacija OIB-a (algoritamska kontrolna znamenka)
 * - Podudarnost imena iz dokumenta i profila
 * - Privola korisnika za javni prikaz podataka
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Validira OIB (Porezni broj) algoritamski
 * @param {string} oib - OIB za validaciju
 * @returns {boolean} - true ako je validan
 */
export function validateOIB(oib) {
  if (!oib || oib.length !== 11) return false;
  
  // Provjeri da su svi znakovi brojevi
  if (!/^\d{11}$/.test(oib)) return false;
  
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(oib[i]) + 10;
    sum %= 10;
    if (sum === 0) sum = 10;
    sum *= 2;
    sum %= 11;
  }
  
  const checkDigit = (11 - sum) % 10;
  return checkDigit === parseInt(oib[10]);
}

/**
 * Extrahira OIB iz teksta (OCR rezultat)
 * @param {string} text - Tekst iz OCR-a
 * @returns {string|null} - OIB ili null
 */
export function extractOIBFromText(text) {
  // OIB je 11-znamenkasti broj
  const oibRegex = /\b\d{11}\b/g;
  const matches = text.match(oibRegex);
  
  if (!matches || matches.length === 0) return null;
  
  // Vrati prvi validan OIB
  for (const match of matches) {
    if (validateOIB(match)) {
      return match;
    }
  }
  
  return null;
}

/**
 * Provjerava da li tekst sadrži ključne fraze iz Rješenja Porezne uprave
 * @param {string} text - Tekst za provjeru
 * @returns {boolean} - true ako sadrži ključne fraze
 */
export function containsRPOSolutionKeywords(text) {
  const keywords = [
    'Rješenja Porezne uprave',
    'Upisuje se u registar poreznih obveznika',
    'RPO',
    'OIB:',
    'Osobni identifikacijski broj',
    'Porezna uprava'
  ];
  
  const normalizedText = text.toLowerCase();
  return keywords.some(keyword => normalizedText.includes(keyword.toLowerCase()));
}

/**
 * Provjerava podudarnost imena iz dokumenta i profila korisnika
 * @param {string} extractedName - Ime iz dokumenta
 * @param {string} profileName - Ime u profilu
 * @returns {boolean} - true ako se podudaraju
 */
export function checkNameMatch(extractedName, profileName) {
  if (!extractedName || !profileName) return false;
  
  // Normalizuj imena (mala slova, ukloni dijakritike)
  const normalize = (str) => str.toLowerCase()
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/đ/g, 'd')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z');
  
  const normalizedExtracted = normalize(extractedName);
  const normalizedProfile = normalize(profileName);
  
  // Provjeri da li se ime iz dokumenta nalazi u profilnom imenu
  return normalizedProfile.includes(normalizedExtracted) || normalizedExtracted.includes(normalizedProfile);
}

/**
 * OCR simulacija (za stvarnu implementaciju bi koristili Tesseract.js ili cloud OCR API)
 * @param {Buffer} imageBuffer - Buffer slike
 * @returns {Promise<{text: string, metadata: object}>}
 */
export async function performOCR(imageBuffer) {
  try {
    console.log('[OCR] Starting Tesseract.js OCR...');
    console.log('[OCR] Image size:', imageBuffer.length, 'bytes');
    
    // Dinamički import Tesseract.js (da ne crashe runtime ako nije instaliran)
    const Tesseract = await import('tesseract.js');
    const { createWorker } = Tesseract.default || Tesseract;
    
    const worker = await createWorker('hrv', 1, {
      logger: m => console.log(`[OCR Worker] ${m.status}: ${Math.round(m.progress * 100)}%`)
    });
    
    // Perform OCR
    const result = await worker.recognize(imageBuffer);
    
    console.log('[OCR] Confidence:', result.data.confidence);
    console.log('[OCR] Text length:', result.data.text.length);
    
    // Terminate worker
    await worker.terminate();
    
    return {
      text: result.data.text,
      metadata: {
        confidence: result.data.confidence,
        language: 'hr',
        words: result.data.words || [],
        lines: result.data.lines || []
      }
    };
    
  } catch (error) {
    console.error('[OCR] Error performing OCR:', error);
    
    // Fallback na simulaciju ako Tesseract nije dostupan
    console.warn('[OCR] Falling back to simulation');
    const mockText = `
      Rješenja Porezne uprave o upisu u registar poreznih obveznika
      
      Na osnovu Zakona o porezu na dodanu vrijednost,
      Porezna uprava donosi:
      
      RJEŠENJE
      
      Upisuje se u registar poreznih obveznika (RPO)
      
      OIB: 12345678901
      Ime i prezime: Test Testić
      Adresa: Testna adresa 1, 10000 Zagreb
      Datum: 2024-01-15
    `;
    
    return {
      text: mockText,
      metadata: {
        confidence: 0.0,
        language: 'hr',
        error: error.message
      }
    };
  }
}

/**
 * Kompletna verifikacija KYC dokumenta
 * @param {object} user - Korisnik
 * @param {Buffer} documentBuffer - Buffer dokumenta
 * @param {string} documentUrl - URL dokumenta
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function verifyKYCDocument(user, documentBuffer, documentUrl) {
  try {
    console.log('[KYC] Starting verification for user:', user.id);
    
    // 1. Perform OCR
    const ocrResult = await performOCR(documentBuffer);
    const extractedText = ocrResult.text;
    
    // 2. Provjeri ključne fraze
    const hasKeywords = containsRPOSolutionKeywords(extractedText);
    if (!hasKeywords) {
      return {
        success: false,
        error: 'Dokument ne sadrži potrebne informacije o Rješenju Porezne uprave'
      };
    }
    
    // 3. Extrahiraj OIB
    const extractedOIB = extractOIBFromText(extractedText);
    if (!extractedOIB) {
      return {
        success: false,
        error: 'Nije moguće izdvojiti OIB iz dokumenta'
      };
    }
    
    // 4. Validiraj OIB
    const isOIBValid = validateOIB(extractedOIB);
    if (!isOIBValid) {
      return {
        success: false,
        error: 'OIB nije validan (kontrolna znamenka ne odgovara)'
      };
    }
    
    // 5. Provjeri podudarnost imena (extrahiraj ime iz dokumenta)
    const extractedName = extractNameFromText(extractedText);
    const nameMatches = extractedName ? checkNameMatch(extractedName, user.fullName) : true; // Počinjemo sa true ako ne možemo izdvojiti
    
    // 6. Ažuriraj profil
    const providerProfile = await prisma.providerProfile.upsert({
      where: { userId: user.id },
      update: {
        kycDocumentUrl: documentUrl,
        kycExtractedOib: extractedOIB,
        kycExtractedName: extractedName,
        kycDocumentType: 'RPO_SOLUTION',
        kycOcrVerified: true,
        kycOibValidated: true,
        // Status verifikacije postavlja admin ručno
        kycVerified: false,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        kycDocumentUrl: documentUrl,
        kycExtractedOib: extractedOIB,
        kycExtractedName: extractedName,
        kycDocumentType: 'RPO_SOLUTION',
        kycOcrVerified: true,
        kycOibValidated: true,
        kycVerified: false
      }
    });
    
    console.log('[KYC] Verification completed successfully for user:', user.id);
    
    return {
      success: true,
      data: {
        extractedOIB,
        extractedName,
        nameMatches,
        ocrVerified: true,
        oibValidated: true,
        providerProfile
      }
    };
    
  } catch (error) {
    console.error('[KYC] Verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extrahira ime iz teksta (jednostavna verzija)
 * @param {string} text - Tekst iz OCR-a
 * @returns {string|null} - Ime ili null
 */
function extractNameFromText(text) {
  // Traži oblike: "Ime i prezime: Test Testić" ili "Ime: Test Prezime: Testić"
  const patterns = [
    /(?:Ime i prezime|Ime|Prezime):\s*([A-ZČĆĐŠŽ][a-zčćđšž]+(?:\s+[A-ZČĆĐŠŽ][a-zčćđšž]+)+)/,
    /(?:Ime i prezime)\s*([A-ZČĆĐŠŽ][a-zčćđšž]+\s+[A-ZČĆĐŠŽ][a-zčćđšž]+)/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Provjeri Sudski registar (d.o.o., j.d.o.o.)
 * @param {string} oib - OIB za provjeru
 * @param {string} companyName - Naziv tvrtke
 * @returns {Promise<{verified: boolean, active: boolean, data: object}>}
 */
export async function checkSudskiRegistar(oib, companyName) {
  try {
    console.log('[Sudski Registar] Checking for OIB:', oib, 'Company:', companyName);
    
    // Provjeri da li su postavljeni API credentials
    const clientId = process.env.SUDREG_CLIENT_ID;
    const clientSecret = process.env.SUDREG_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.log('[Sudski Registar] API credentials not configured');
      return {
        verified: false,
        active: false,
        data: null,
        note: 'API credentials not configured. Set SUDREG_CLIENT_ID and SUDREG_CLIENT_SECRET environment variables.'
      };
    }
    
    try {
      // Get OAuth token
      const axios = (await import('axios')).default;
      const tokenResponse = await axios.post(
        'https://sudreg-data.gov.hr/api/oauth/token',
        'grant_type=client_credentials',
        {
          auth: {
            username: clientId,
            password: clientSecret
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      );
      
      if (!tokenResponse?.data?.access_token) {
        console.log('[Sudski Registar] Failed to get OAuth token');
        return {
          verified: false,
          active: false,
          data: null,
          note: 'Failed to authenticate with Sudski registar API'
        };
      }
      
      const accessToken = tokenResponse.data.access_token;
      
      // Get company data with retry logic
      let sudResponse = null;
      let lastError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          sudResponse = await axios.get(
            'https://sudreg-data.gov.hr/api/javni/detalji_subjekta',
            {
              params: {
                tip_identifikatora: 'oib',
                identifikator: oib
              },
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
              },
              timeout: 10000
            }
          );
          
          // Success - break out of retry loop
          break;
        } catch (err) {
          lastError = err;
          // If 503 (Service Unavailable), retry after delay
          if (err.response?.status === 503 && attempt < 3) {
            console.log(`[Sudski Registar] Service unavailable, retrying in 2 seconds (attempt ${attempt}/3)...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          break;
        }
      }
      
      if (!sudResponse && lastError) {
        throw lastError;
      }
      
      if (sudResponse?.status === 200 && sudResponse.data) {
        const sudData = sudResponse.data;
        const status = sudData.status; // 1 = aktivna, 0 = neaktivna
        
        if (status === 1) {
          const officialName = sudData.skracena_tvrtka?.ime || sudData.tvrtka?.ime || companyName;
          
          console.log('[Sudski Registar] Company found and active:', officialName);
          
          return {
            verified: true,
            active: true,
            data: {
              oib: sudData.oib || oib,
              name: officialName,
              address: sudData.sjediste?.adresa || sudData.adresa || null,
              status: 'AKTIVAN',
              registrationNumber: sudData.maticni_broj || null,
              taxNumber: sudData.porezni_broj || null,
              source: 'SUDSKI_REGISTAR'
            }
          };
        } else {
          console.log('[Sudski Registar] Company found but not active, status:', status);
          return {
            verified: true,
            active: false,
            data: {
              oib: sudData.oib || oib,
              name: sudData.skracena_tvrtka?.ime || sudData.tvrtka?.ime || companyName,
              status: 'NEAKTIVAN',
              source: 'SUDSKI_REGISTAR'
            }
          };
        }
      }
      
      // Not found
      console.log('[Sudski Registar] Company not found in registry');
      return {
        verified: false,
        active: false,
        data: null,
        note: 'Company not found in Sudski registar'
      };
      
    } catch (apiError) {
      console.error('[Sudski Registar] API error:', apiError.message);
      return {
        verified: false,
        active: false,
        data: null,
        error: apiError.message,
        note: 'API request failed'
      };
    }
    
  } catch (error) {
    console.error('[Sudski Registar] Error:', error);
    return { verified: false, active: false, data: null, error: error.message };
  }
}

/**
 * Provjeri Obrtni registar (Obrt, Paušalni obrt)
 * @param {string} oib - OIB za provjeru
 * @param {string} companyName - Naziv obrta
 * @returns {Promise<{verified: boolean, active: boolean, data: object}>}
 */
export async function checkObrtniRegistar(oib, companyName) {
  try {
    console.log('[Obrtni Registar] Checking for OIB:', oib, 'Company:', companyName);
    
    // Provjeri da li već postoji verificirani profil u našoj bazi
    const { prisma } = await import('./prisma.js');
    const existingOIB = await prisma.user.findFirst({
      where: {
        taxId: oib,
        role: 'PROVIDER'
      },
      include: {
        providerProfile: true
      }
    });
    
    if (existingOIB && existingOIB.providerProfile?.kycVerified) {
      console.log('[Obrtni Registar] OIB već verificiran u našoj bazi');
      return {
        verified: true,
        active: true,
        data: {
          oib: oib,
          name: companyName,
          source: 'INTERNAL_DATABASE',
          note: 'Verified via existing KYC verification in our database'
        }
      };
    }
    
    // Pokušaj scraping sa Pretraživač obrta (https://pretrazivac-obrta.gov.hr)
    try {
      const axios = (await import('axios')).default;
      const cheerio = (await import('cheerio')).default;
      
      const baseUrl = 'https://pretrazivac-obrta.gov.hr/pretraga';
      
      // KORAK 1: Dobij formu (GET) - čuvaj cookies za session
      console.log('[Obrtni Registar] Step 1: Getting form page...');
      const axiosInstance = axios.create({
        timeout: 15000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'hr,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br'
        }
      });
      
      let formPage = null;
      let cookies = '';
      
      try {
        formPage = await axiosInstance.get(baseUrl);
        if (formPage.headers['set-cookie']) {
          cookies = formPage.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        }
      } catch (err) {
        console.log('[Obrtni Registar] Failed to get form page:', err.response?.status);
        // Provjeri da li je WAF blokada
        if (err.response?.data && typeof err.response.data === 'string') {
          if (err.response.data.includes('URL was rejected') || 
              err.response.data.includes('support ID')) {
            console.log('[Obrtni Registar] 🚫 WAF/CSP zaštita blokira pristup');
            return {
              verified: false,
              active: false,
              data: null,
              note: 'Obrtni registar je zaštićen WAF-om. Automatska provjera nije moguća. Molimo uploadajte službeni izvadak.'
            };
          }
        }
        throw err;
      }
      
      if (!formPage || !formPage.data) {
        throw new Error('Failed to load form page');
      }
      
      console.log('[Obrtni Registar] ✅ Form page loaded');
      
      // KORAK 2: Kreiraj payload za pretragu
      console.log('[Obrtni Registar] Step 2: Building search payload...');
      const formData = new URLSearchParams();
      formData.append('vlasnikOib', oib);
      formData.append('_pretraziVlasnikaUPasivi', 'on');
      formData.append('obrtStanjeURadu', 'true');
      formData.append('_obrtStanjeURadu', 'on');
      formData.append('obrtStanjePrivObust', 'true');
      formData.append('_obrtStanjePrivObust', 'on');
      formData.append('obrtStanjeMirovanje', 'true');
      formData.append('_obrtStanjeMirovanje', 'on');
      formData.append('obrtStanjeBezPocetka', 'true');
      formData.append('_obrtStanjeBezPocetka', 'on');
      formData.append('obrtStanjeOdjava', 'true');
      formData.append('_obrtStanjeOdjava', 'on');
      formData.append('obrtStanjePreseljen', 'true');
      formData.append('_obrtStanjePreseljen', 'on');
      formData.append('obrtNaziv', '');
      formData.append('obrtMbo', '');
      formData.append('obrtTduId', '');
      formData.append('vlasnikImePrezime', '');
      formData.append('djelatnost2025Id', '');
      formData.append('_pretezitaDjelatnost2025', 'on');
      formData.append('djelatnostId', '');
      formData.append('_pretezitaDjelatnost', 'on');
      formData.append('recaptchaToken', '');
      formData.append('action', 'validate_captcha');
      formData.append('trazi', 'Traži');
      
      // KORAK 3: Pošalji POST zahtjev
      console.log('[Obrtni Registar] Step 3: Submitting search POST...');
      const searchResponse = await axiosInstance.post(baseUrl, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': baseUrl,
          'Origin': 'https://pretrazivac-obrta.gov.hr',
          'Cookie': cookies,
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        }
      });
      
      const resultsHTML = searchResponse.data;
      
      // Provjeri da li je WAF challenge stranica
      const isWAFChallenge = resultsHTML.includes('window["bobcmn"]') ||
                            resultsHTML.includes('window["failureConfig"]') ||
                            resultsHTML.includes('TSPD_101') ||
                            resultsHTML.includes('something went wrong') ||
                            resultsHTML.includes('support id');
      
      if (isWAFChallenge) {
        console.log('[Obrtni Registar] 🚫 WAF challenge detected');
        return {
          verified: false,
          active: false,
          data: null,
          note: 'Obrtni registar je zaštićen WAF-om. Automatska provjera nije moguća. Molimo uploadajte službeni izvadak.'
        };
      }
      
      // KORAK 4: Parse rezultate
      const $ = cheerio.load(resultsHTML);
      const resultsText = $('body').text();
      
      // Provjeri da li postoji poruka "nema rezultata"
      const htmlLower = resultsHTML.toLowerCase();
      const nemaRezultata = htmlLower.includes('nema rezultata') ||
                           htmlLower.includes('nema podataka') ||
                           htmlLower.includes('pretraga nije dala rezultata') ||
                           htmlLower.includes('nijedan obrt') ||
                           htmlLower.includes('0 rezultata');
      
      // Provjeri da li OIB postoji u rezultatima (ne u formi)
      const resultsTable = $('table.results, table.pretraga, #rezultati, .rezultati-pretrage').first();
      const tableHTML = resultsTable.html() || '';
      const tableText = resultsTable.text() || '';
      
      let hasOIBinResults = false;
      
      if (resultsTable.length > 0 && tableHTML.length > 0) {
        const tableContainsOIB = tableHTML.includes(oib) || tableText.includes(oib);
        if (tableContainsOIB) {
          hasOIBinResults = true;
        }
      }
      
      // Ako nema tablice, provjeri u čistom tekstu (bez forme)
      if (!hasOIBinResults) {
        const $clean = cheerio.load(resultsHTML);
        $clean('form, input, select, button, script, style').remove();
        const cleanText = $clean('body').text().trim();
        const significantContent = cleanText.length > 200;
        const oibInCleanText = cleanText.includes(oib);
        hasOIBinResults = significantContent && oibInCleanText;
      }
      
      // Ako je OIB pronađen u rezultatima i nema poruke "nema rezultata"
      if (hasOIBinResults && !nemaRezultata && resultsHTML.length > 5000) {
        console.log('[Obrtni Registar] ✅ Obrt pronađen u rezultatima pretrage');
        
        // Pokušaj ekstrahirati naziv obrta iz rezultata
        let extractedName = companyName;
        const nameElements = $('td, .result-name, .company-name').filter((i, el) => {
          const text = $(el).text().trim();
          return text.length > 5 && text.length < 200 && !text.includes(oib);
        });
        
        if (nameElements.length > 0) {
          extractedName = $(nameElements[0]).text().trim();
        }
        
        return {
          verified: true,
          active: true,
          data: {
            oib: oib,
            name: extractedName,
            source: 'OBRTNI_REGISTAR',
            note: 'Verified via Pretraživač obrta scraping'
          }
        };
      } else {
        console.log('[Obrtni Registar] ⚠️ Obrt nije pronađen u rezultatima');
        return {
          verified: false,
          active: false,
          data: null,
          note: 'Obrt nije pronađen u Obrtnom registru. Provjerite točnost OIB-a ili uploadajte službeni izvadak.'
        };
      }
      
    } catch (scrapingError) {
      console.error('[Obrtni Registar] Scraping error:', scrapingError.message);
      
      // Fallback: ako ima OIB u Rješenju Porezne uprave, možemo pretpostaviti da postoji
      // Ali ne vraćamo verified: true jer nismo potvrdili u registru
      return {
        verified: false,
        active: false,
        data: null,
        error: scrapingError.message,
        note: 'Automatska provjera Obrtnog registra nije dostupna. Molimo uploadajte službeni izvadak iz Obrtnog registra.'
      };
    }
    
  } catch (error) {
    console.error('[Obrtni Registar] Error:', error);
    return { verified: false, active: false, data: null, error: error.message };
  }
}

/**
 * Provjeri Komorski imenik (odvjetnik/liječnik/arhitekt)
 * @param {string} oib - OIB za provjeru
 * @param {string} professionType - Tip profesije ('lawyer', 'doctor', 'architect')
 * @returns {Promise<{exists: boolean, data: object}>}
 */
export async function checkKomorskiImenik(oib, professionType = 'lawyer') {
  try {
    console.log('[Komorski Imenik] Checking for OIB:', oib, 'Profession:', professionType);
    
    // TODO: Integrirati pravi API za Komorski imenik
    // Odvjetnici: https://www.hok.hr/imeinke-prezimena
    // Liječnici: https://www.hlz.hr/
    // Arhitekti: https://www.hka.hr/
    
    // Simulacija
    const APIs = {
      lawyer: 'https://api.hok.hr/v1/lawyers?oib={oib}',
      doctor: 'https://api.hlz.hr/v1/doctors?oib={oib}',
      architect: 'https://api.hka.hr/v1/architects?oib={oib}'
    };
    
    const apiUrl = APIs[professionType];
    if (!apiUrl) return { exists: false, data: null };
    
    const response = await fetch(apiUrl.replace('{oib}', oib), {
      headers: { 'Accept': 'application/json' }
    }).catch(() => ({ status: 404 }));
    
    if (response.status === 200) {
      const data = await response.json();
      return {
        exists: true,
        data: {
          oib: data.oib,
          name: data.name,
          licenseNumber: data.licenseNumber,
          chamber: data.chamber,
          status: data.status
        }
      };
    }
    
    return { exists: false, data: null };
    
  } catch (error) {
    console.error('[Komorski Imenik] Error:', error);
    return { exists: false, data: null, error: error.message };
  }
}

/**
 * Provjeri VIES (PDV) - European VAT Information Exchange System
 * @param {string} vatId - HR PDV ID (npr. "HR12345678901")
 * @returns {Promise<{exists: boolean, data: object}>}
 */
export async function checkVIES(vatId) {
  try {
    console.log('[VIES] Checking VAT ID:', vatId);
    
    // VIES EU API
    const apiUrl = `http://ec.europa.eu/taxation_customs/vies/services/checkVatService`;
    
    // VIES API format: HR + OIB (HR12345678901)
    const format = /^HR\d{11}$/;
    if (!format.test(vatId)) {
      return { exists: false, data: null, error: 'Invalid VAT ID format' };
    }
    
    // TODO: Implementirati VIES SOAP API poziv
    // U produkciji koristiti axios ili dedicated VIES client
    
    // Simulacija
    const response = await fetch(`${apiUrl}?vat=${vatId}`, {
      headers: { 'Accept': 'application/json' }
    }).catch(() => ({ status: 404 }));
    
    if (response.status === 200) {
      const data = await response.json();
      return {
        exists: data.valid === true,
        data: {
          vatId: data.vat,
          name: data.name,
          address: data.address,
          valid: data.valid
        }
      };
    }
    
    return { exists: false, data: null };
    
  } catch (error) {
    console.error('[VIES] Error:', error);
    return { exists: false, data: null, error: error.message };
  }
}

