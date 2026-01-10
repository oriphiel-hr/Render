import { Router } from 'express';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { verifyKYCDocument, validateOIB } from '../lib/kyc-verification.js';
import { uploadDocument } from '../lib/upload.js';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { calculateSimilarity, isSimilarEnough, isValidCompanyName } from '../lib/string-similarity.js';

const r = Router();

/**
 * POST /api/kyc/upload-document
 * Upload Rješenja Porezne uprave za verifikaciju
 * 
 * Body:
 * - document: File (PDF/JPG/PNG)
 * - publicConsent: boolean (Izjava korisnika)
 */
r.post('/upload-document', auth(true), uploadDocument.single('document'), async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Dokument je obavezan',
        message: 'Molimo priložite dokument u PDF, JPG ili PNG formatu' 
      });
    }
    
    const publicConsent = req.body.publicConsent === 'true' || req.body.publicConsent === true;
    
    // Pročitaj fajl
    const filePath = path.join('./uploads', req.file.filename);
    const fileBuffer = await fs.readFile(filePath);
    
    // Kreiraj URL
    const documentUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // Provjeri da je korisnik PROVIDER
    if (user.role !== 'PROVIDER') {
      await fs.unlink(filePath); // Obriši fajl
      return res.status(403).json({ 
        error: 'Samo pružatelji usluga mogu uploadati dokumente za verifikaciju' 
      });
    }
    
    
    // Izvrši verifikaciju
    const verificationResult = await verifyKYCDocument(user, fileBuffer, documentUrl);
    
    if (!verificationResult.success) {
      await fs.unlink(filePath);
      return res.status(400).json({ 
        error: verificationResult.error 
      });
    }
    
    // Ažuriraj publicConsent
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: { kycPublicConsent: publicConsent }
    });
    
    res.json({
      success: true,
      message: 'Dokument je uspješno uploadan i verificiran',
      data: {
        extractedOIB: verificationResult.data.extractedOIB,
        extractedName: verificationResult.data.extractedName,
        nameMatches: verificationResult.data.nameMatches,
        ocrVerified: verificationResult.data.ocrVerified,
        oibValidated: verificationResult.data.oibValidated,
        documentUrl
      }
    });
    
  } catch (err) {
    console.error('[KYC] Upload error:', err);
    next(err);
  }
});

/**
 * GET /api/kyc/status
 * Dohvati KYC status za trenutnog korisnika
 */
r.get('/status', auth(true), async (req, res, next) => {
  try {
    const user = req.user;
    
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: user.id },
      select: {
        kycVerified: true,
        kycDocumentUrl: true,
        kycExtractedOib: true,
        kycExtractedName: true,
        kycDocumentType: true,
        kycPublicConsent: true,
        kycVerificationNotes: true,
        kycVerifiedAt: true,
        kycOcrVerified: true,
        kycOibValidated: true,
        kycObrtnRegChecked: true,
        kycKamaraChecked: true,
        kycViesChecked: true
      }
    });
    
    if (!providerProfile) {
      return res.json({
        kycVerified: false,
        kycDocumentUploaded: false
      });
    }
    
    res.json({
      kycVerified: providerProfile.kycVerified,
      kycDocumentUploaded: !!providerProfile.kycDocumentUrl,
      data: providerProfile
    });
    
  } catch (err) {
    console.error('[KYC] Status error:', err);
    next(err);
  }
});

/**
 * POST /api/kyc/update-consent
 * Ažuriraj izjavu korisnika (publicConsent)
 */
r.post('/update-consent', auth(true), async (req, res, next) => {
  try {
    const user = req.user;
    const { publicConsent } = req.body;
    
    if (typeof publicConsent !== 'boolean') {
      return res.status(400).json({ 
        error: 'publicConsent mora biti boolean' 
      });
    }
    
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: { kycPublicConsent: publicConsent }
    });
    
    res.json({
      success: true,
      message: 'Izjava je uspješno ažurirana',
      publicConsent
    });
    
  } catch (err) {
    console.error('[KYC] Consent update error:', err);
    next(err);
  }
});

/**
 * POST /api/kyc/auto-verify (PUBLIC - može se koristiti prije registracije)
 * Automatska provjera javnih registara
 */
r.post('/auto-verify', async (req, res, next) => {
  try {
    const { taxId, legalStatusId, companyName } = req.body;
    
    if (!taxId || !validateOIB(taxId)) {
      return res.status(400).json({
        verified: false,
        needsDocument: true,
        error: 'OIB nije validan',
        badges: []
      });
    }
    
    // Get legal status
    const legalStatus = await prisma.legalStatus.findUnique({
      where: { id: legalStatusId }
    });
    
    if (!legalStatus) {
      return res.status(400).json({
        verified: false,
        needsDocument: true,
        error: 'Pravni status nije odabran'
      });
    }
    
    // Validate OIB first
    const isOIBValid = validateOIB(taxId);
    if (!isOIBValid) {
      return res.status(400).json({
        verified: false,
        needsDocument: true,
        error: 'OIB nije validan (kontrolna znamenka ne odgovara)',
        badges: [],
        errors: ['OIB kontrolna znamenka nije validna']
      });
    }
    
    // Auto-verify based on legal status
    let results = {
      verified: false,
      needsDocument: true,
      badges: [],
      errors: []
    };
    
    console.log(`[Auto-Verify] Legal status: ${legalStatus.code}`);
    
    switch(legalStatus.code) {
      case 'DOO':
      case 'JDOO':
        // Sudski registar - DEBUGGING MODE
        console.log('[Auto-Verify] 🔍 DEBUGGING: DOO/JDOO API verification');
        
        try {
          const clientId = process.env.SUDREG_CLIENT_ID;
          const clientSecret = process.env.SUDREG_CLIENT_SECRET;
          
          console.log('[Auto-Verify] 📋 Step 1: Checking credentials');
          console.log('[Auto-Verify]   - clientId exists:', !!clientId);
          console.log('[Auto-Verify]   - clientSecret exists:', !!clientSecret);
          console.log('[Auto-Verify]   - clientId value:', clientId?.substring(0, 10) + '...');
          console.log('[Auto-Verify]   - clientSecret value:', clientSecret?.substring(0, 10) + '...');
          
          if (!clientId || !clientSecret) {
            console.log('[Auto-Verify] ❌ Step 1 FAILED: Missing credentials');
            throw new Error('Missing SUDREG credentials');
          }
          
          console.log('[Auto-Verify] ✅ Step 1 SUCCESS: Credentials found');
          console.log('[Auto-Verify] 📞 Step 2: Requesting OAuth token...');
          
          // OAuth request - using correct endpoint
          console.log('[Auto-Verify] Attempting OAuth token request...');
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
              }
            }
          ).catch(err => {
            console.log('[Auto-Verify] ❌ Step 2 FAILED: OAuth request error');
            console.log('[Auto-Verify]   - Status:', err.response?.status);
            console.log('[Auto-Verify]   - StatusText:', err.response?.statusText);
            console.log('[Auto-Verify]   - Data:', JSON.stringify(err.response?.data));
            console.log('[Auto-Verify]   - Message:', err.message);
            throw err;
          });
          
          console.log('[Auto-Verify] Step 2 Response received');
          console.log('[Auto-Verify]   - Status:', tokenResponse?.status);
          console.log('[Auto-Verify]   - Has access_token:', !!tokenResponse?.data?.access_token);
          
          if (!tokenResponse?.data?.access_token) {
            console.log('[Auto-Verify] ❌ Step 2 FAILED: No access token in response');
            throw new Error('No access token received');
          }
          
          const accessToken = tokenResponse.data.access_token;
          console.log('[Auto-Verify] ✅ Step 2 SUCCESS: Token received');
          console.log('[Auto-Verify] 🏢 Step 3: Checking OIB in Sudski registar:', taxId);
          
          // Try API call with retry logic (Sudreg database may be down)
          let sudResponse = null;
          let lastError = null;
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`[Auto-Verify]   Attempt ${attempt}/3...`);
            
            try {
              sudResponse = await axios.get(
                `https://sudreg-data.gov.hr/api/javni/detalji_subjekta`,
                {
                  params: {
                    tip_identifikatora: 'oib',
                    identifikator: taxId
                  },
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                  },
                  timeout: 10000 // 10 second timeout
                }
              );
              
              // Success - break out of retry loop
              console.log(`[Auto-Verify]   ✅ Attempt ${attempt} succeeded!`);
              break;
              
            } catch (err) {
              lastError = err;
              console.log(`[Auto-Verify]   ❌ Attempt ${attempt} failed:`, err.response?.status);
              
              // If 503 (Service Unavailable), retry after delay
              if (err.response?.status === 503 && attempt < 3) {
                console.log('[Auto-Verify]   ⏳ Sudreg database is down, retrying in 2 seconds...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                continue;
              }
              
              // Other errors or max retries reached
              console.log('[Auto-Verify]   Error details:', {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message
              });
              
              // If it's 503 and not last attempt, retry
              if (err.response?.status === 503 && attempt < 3) {
                continue;
              }
              
              // Otherwise break (non-retryable error or max attempts)
              break;
            }
          }
          
          // After retry loop
          if (!sudResponse && lastError) {
            console.log('[Auto-Verify] ❌ All 3 attempts failed');
            console.log('[Auto-Verify] Last error status:', lastError.response?.status);
            console.log('[Auto-Verify] Last error data:', JSON.stringify(lastError.response?.data));
            throw lastError;
          }
          
          console.log('[Auto-Verify] Step 3 Response received');
          console.log('[Auto-Verify]   - Status:', sudResponse?.status);
          console.log('[Auto-Verify]   - Data keys:', Object.keys(sudResponse?.data || {}));
          
          if (sudResponse?.status === 200 && sudResponse.data) {
            const sudData = sudResponse.data;
            const status = sudData.status; // 1 = aktivna, 0 = neaktivna
            console.log('[Auto-Verify]   - SudData keys:', Object.keys(sudData));
            console.log('[Auto-Verify]   - SudData.status:', status);
            console.log('[Auto-Verify]   - SudData.status type:', typeof status);
            
            // status === 1 means company is active
            if (status === 1) {
              console.log('[Auto-Verify] ✅ Step 3 SUCCESS: Company is ACTIVE');
              
              const companyName = sudData.skracena_tvrtka?.ime || sudData.tvrtka?.ime || companyName;
              
              // Building comprehensive badge system
              const badges = [
                { 
                  type: 'BUSINESS', 
                  source: 'SUDSKI_REGISTAR', 
                  verified: true, 
                  companyName: companyName,
                  description: 'Potvrđeno u Sudskom registru - Aktivna firma'
                }
              ];
              
              results = {
                verified: true,
                needsDocument: false,
                badges: badges,
                badgeCount: badges.length,
                errors: []
              };
              
              // Ne spremamo badge u bazu ovdje - bit će spremljen tek nakon registracije
              break;
            } else {
              console.log('[Auto-Verify] ⚠️ Step 3: Company not active, status:', status);
            }
          }
          
          console.log('[Auto-Verify] ⚠️ Step 3: Did not confirm active status');
          
        } catch (apiError) {
          console.log('[Auto-Verify] ❌ CRITICAL ERROR in API verification');
          console.log('[Auto-Verify] Error type:', apiError.name);
          console.log('[Auto-Verify] Error message:', apiError.message);
          console.log('[Auto-Verify] Error stack:', apiError.stack);
        }
        
        // Fallback: require document
        results = {
          verified: false,
          needsDocument: true,
          badges: [],
          errors: ['Za automatsku provjeru unesite službeni izvadak iz Sudskog registra.']
        };
        break;
        
      case 'SOLE_TRADER':
      case 'PAUSAL':
        // Obrtni registar - POKUŠAVAMO provjeru
        console.log('[Auto-Verify] Obrt/Pausalni: Pokušavam provjeriti Obrtni registar...');
        
        // Provjeri da li već postoji verificirani profil u našoj bazi
        const existingOIB = await prisma.user.findFirst({
          where: {
            taxId: taxId,
            role: 'PROVIDER'
          },
          include: {
            providerProfile: true
          }
        });
        
        if (existingOIB && existingOIB.providerProfile?.kycVerified) {
          console.log('[Auto-Verify] OIB već verificiran u našoj bazi');
          
          const badges = [
            { 
              type: 'BUSINESS', 
              source: 'OBRTNI_REGISTAR', 
              verified: true,
              description: 'Potvrđeno u našoj bazi podataka'
            }
          ];
          
          results = {
            verified: true,
            needsDocument: false,
            badges: badges,
            badgeCount: badges.length,
            errors: []
          };
          console.log('[Auto-Verify] ✅ VERIFIED via existing verification');
          break;
        }
        
        // Pokušaj direktnu provjeru na Pretraživač obrta
        let wasWAFBlocked = false; // Flag za praćenje WAF blokade
        try {
          console.log('[Auto-Verify] 📍 Pokušavam scraping sa https://pretrazivac-obrta.gov.hr');
          console.log('[Auto-Verify] 📍 OIB za provjeru:', taxId);
          
          const baseUrl = 'https://pretrazivac-obrta.gov.hr/pretraga';
          
          // KORAK 1: Dobij formu (GET) - VAŽNO: čuvaj cookies za session
          console.log('[Auto-Verify] 🔍 Step 1: Getting form page...');
          let formPage = null;
          let cookies = ''; // Čuvamo cookies za session
          
          // Koristimo axios instance s cookie jar
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
          
          try {
            formPage = await axiosInstance.get(baseUrl);
            // Ekstrahiraj cookies iz response headers
            if (formPage.headers['set-cookie']) {
              cookies = formPage.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
              console.log('[Auto-Verify] ✅ Cookies extracted:', cookies.substring(0, 100) + '...');
            }
          } catch (err) {
            console.log('[Auto-Verify] ❌ Failed to get form page:', err.response?.status);
            if (err.response?.data && typeof err.response.data === 'string') {
              if (err.response.data.includes('URL was rejected') || 
                  err.response.data.includes('support ID')) {
                console.log('[Auto-Verify] 🚫 Pretraživač obrta blokira pristup - WAF/CSP zaštita');
              }
            }
          }
          
          if (!formPage || !formPage.data) {
            console.log('[Auto-Verify] ⚠️ Cannot get form page - skipping scraping');
          } else {
            console.log('[Auto-Verify] ✅ Form page loaded');
            
            // KORAK 2: Kreiraj payload prema stvarnoj strukturi
            console.log('[Auto-Verify] 🔍 Step 2: Building search payload...');
            
            // Prema payload-u koji ste dali
            const formData = new URLSearchParams();
            
            // OIB vlasnika (glavno polje za pretragu)
            formData.append('vlasnikOib', taxId);
            formData.append('_pretraziVlasnikaUPasivi', 'on');
            
            // Status checkboxovi (svi na true)
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
            
            // Ostali parametri (prazni, ali potrebni)
            formData.append('obrtNaziv', '');
            formData.append('obrtMbo', '');
            formData.append('obrtTduId', '');
            formData.append('vlasnikImePrezime', '');
            formData.append('djelatnost2025Id', '');
            formData.append('_pretezitaDjelatnost2025', 'on');
            formData.append('djelatnostId', '');
            formData.append('_pretezitaDjelatnost', 'on');
            
            // Recaptcha token - pokušavamo bez njega prvo, ili mock
            // Ako treba, možemo koristiti proxy servis za reCAPTCHA, ali za sada probajmo bez
            formData.append('recaptchaToken', ''); // Prazan token - možda će proći
            formData.append('action', 'validate_captcha');
            formData.append('trazi', 'Traži');
            
            console.log('[Auto-Verify] 🔍 Payload built with vlasnikOib:', taxId);
            
            // KORAK 3: Pošalji POST zahtjev s OIB parametrom
            console.log('[Auto-Verify] 🔍 Step 3: Submitting search POST...');
            
            try {
              const searchUrl = 'https://pretrazivac-obrta.gov.hr/pretraga';
              
              const searchResponse = await axiosInstance.post(searchUrl, formData.toString(), {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Referer': baseUrl,
                  'Origin': 'https://pretrazivac-obrta.gov.hr',
                  'Cookie': cookies, // Koristi cookies iz GET requesta
                  'Sec-Fetch-Dest': 'document',
                  'Sec-Fetch-Mode': 'navigate',
                  'Sec-Fetch-Site': 'same-origin',
                  'Sec-Fetch-User': '?1',
                  'Upgrade-Insecure-Requests': '1'
                }
              });
              
              console.log('[Auto-Verify] ✅ Search response status:', searchResponse.status);
              console.log('[Auto-Verify] 🔍 Response headers:', Object.keys(searchResponse.headers));
              
              // KORAK 4: Parse rezultate pretrage
              const resultsHTML = searchResponse.data;
              
              // PROVJERI: Da li je ovo F5 Big-IP WAF challenge stranica?
              const isWAFChallenge = resultsHTML.includes('window["bobcmn"]') ||
                                    resultsHTML.includes('window["failureConfig"]') ||
                                    resultsHTML.includes('TSPD_101') ||
                                    resultsHTML.includes('something went wrong') ||
                                    resultsHTML.includes('support id');
              
              console.log('[Auto-Verify] 🔍 Is WAF challenge page:', isWAFChallenge);
              
              if (isWAFChallenge) {
                wasWAFBlocked = true; // Postavi flag
                console.log('[Auto-Verify] 🚫 Server blokira pristup - F5 Big-IP WAF challenge');
                console.log('[Auto-Verify] ⚠️ Scraping nije moguć zbog WAF zaštite');
                // Nastavi na fallback - smart verification
                // Nema break, ide dalje na fallback
              }
              
              const $results = cheerio.load(resultsHTML);
              const resultsText = $results('body').text();
              
              console.log('[Auto-Verify] 🔍 Results page length (text):', resultsText.length);
              console.log('[Auto-Verify] 🔍 Results page length (HTML):', resultsHTML.length);
              
              if (!isWAFChallenge) {
                console.log('[Auto-Verify] 🔍 HTML preview (first 2000 chars):', resultsHTML.substring(0, 2000));
              }
              
              // Traži tablicu s rezultatima
              const resultsTable = $results('table.results, table.pretraga, #rezultati, .rezultati-pretrage').first();
              const tableHTML = resultsTable.html() || '';
              const tableText = resultsTable.text() || '';
              
              console.log('[Auto-Verify] 🔍 Has results table:', resultsTable.length > 0);
              console.log('[Auto-Verify] 🔍 Table HTML length:', tableHTML.length);
              console.log('[Auto-Verify] 🔍 Table text preview:', tableText.substring(0, 500));
              
              // VAŽNO: Provjeri da li OIB postoji u REZULTATIMA pretrage, ne u formi!
              // Problem: hasOIBinHTML provjerava bilo gdje u HTML-u, uključujući i u formi koju smo poslali
              
              // Ako je WAF challenge, preskoči provjeru rezultata
              if (isWAFChallenge) {
                console.log('[Auto-Verify] ⚠️ WAF challenge detected - skipping result check');
                // Nema break - ide dalje na fallback
              } else {
              
              const htmlLower = resultsHTML.toLowerCase();
              
              // Provjeri da li postoji poruka "nema rezultata" (u HTML-u)
              const nemaRezultata = htmlLower.includes('nema rezultata') ||
                                   htmlLower.includes('nema podataka') ||
                                   htmlLower.includes('pretraga nije dala rezultata') ||
                                   htmlLower.includes('nijedan obrt') ||
                                   htmlLower.includes('0 rezultata') ||
                                   htmlLower.includes('rezultata pretrage') ||
                                   htmlLower.includes('pretraga ne sadrži rezultate');
              
              console.log('[Auto-Verify] 🔍 Nema rezultata message:', nemaRezultata);
              
              // Traži OIB u rezultatima (tablice, liste, itd.) - NE u formi
              let hasOIBinResults = false;
              
              // Pokušaj pronaći OIB u tablici rezultata
              if (resultsTable.length > 0 && tableHTML.length > 0) {
                const tableContainsOIB = tableHTML.includes(taxId) || tableText.includes(taxId);
                console.log('[Auto-Verify] 🔍 Table contains OIB:', tableContainsOIB);
                if (tableContainsOIB) {
                  hasOIBinResults = true;
                }
              }
              
              // Ako nema tablice, traži OIB u rezultatima (div-ovi koji nisu forma)
              if (!hasOIBinResults) {
                // Traži div-ove koji nisu dio forme i sadrže OIB
                const resultDivs = $results('div[id*="rezultat"], div[class*="rezultat"], div[id*="result"], div[class*="result"], div[id*="pretraga"]');
                resultDivs.each((i, elem) => {
                  const divHTML = $results(elem).html() || '';
                  if (divHTML.includes(taxId) && divHTML.length > 100) { // Provjeri da nije samo forma
                    hasOIBinResults = true;
                    console.log('[Auto-Verify] 🔍 Found OIB in result div:', i);
                    return false; // break
                  }
                });
              }
              
              // Ako još nismo našli, provjeri da li postoji tekst koji NIJE dio forme i NIJE samo HTML markup
              if (!hasOIBinResults) {
                // Ukloni sve forme i provjeri da li postoji čist tekst koji nije samo HTML
                const $clean = cheerio.load(resultsHTML);
                $clean('form, input, select, button, script, style').remove();
                const cleanText = $clean('body').text().trim();
                
                // Provjeri da li postoji značajan sadržaj (rezultati) i da OIB postoji u tom sadržaju
                const significantContent = cleanText.length > 200; // Mora biti dovoljno teksta (rezultati)
                const oibInCleanText = cleanText.includes(taxId);
                
                hasOIBinResults = significantContent && oibInCleanText;
                
                console.log('[Auto-Verify] 🔍 Clean text length:', cleanText.length);
                console.log('[Auto-Verify] 🔍 Significant content exists:', significantContent);
                console.log('[Auto-Verify] 🔍 OIB in clean text:', oibInCleanText);
                console.log('[Auto-Verify] 🔍 Clean text preview:', cleanText.substring(0, 300));
              }
              
              console.log('[Auto-Verify] 🔍 Has OIB in RESULTS (not form):', hasOIBinResults);
              
                // VAŽNO: OIB treba postojati U REZULTATIMA, i NE smije biti poruka "nema rezultata"
                if (nemaRezultata) {
                  console.log('[Auto-Verify] ⚠️ Obrt NIJE pronađen u registru (nema rezultata poruka)');
                } else if (hasOIBinResults && !nemaRezultata && resultsHTML.length > 5000) {
                  console.log('[Auto-Verify] ✅ Obrt PRONAĐEN (OIB postoji u HTML rezultatima)');
                  console.log('[Auto-Verify] ✅ Obrt PRONAĐEN u rezultatima pretrage! (OIB exists in HTML)');
                  
                  const badges = [
                    { 
                      type: 'BUSINESS', 
                      source: 'OBRTNI_REGISTAR', 
                      verified: true,
                      description: 'Potvrđeno u Obrtnom registru'
                    }
                  ];
                  
                  results = {
                    verified: true,
                    needsDocument: false,
                    badges: badges,
                    badgeCount: badges.length,
                    errors: []
                  };
                  
                  console.log('[Auto-Verify] ✅ Obrt verificiran (Pronađen u rezultatima pretrage)');
                  break;
                } else {
                  console.log('[Auto-Verify] ⚠️ Obrt nije pronađen ili nije aktivan u rezultatima');
                }
              } // end if (!isWAFChallenge)
              
            } catch (searchErr) {
              console.log('[Auto-Verify] ❌ Search POST failed:', searchErr.response?.status);
              console.log('[Auto-Verify] Error:', searchErr.message);
            }
          }
          
          // Ako nije verificiran - zahtijeva dokument
          console.log('[Auto-Verify] ⚠️ Automatska provjera neuspješna - traži se dokument');
          
        } catch (scrapingError) {
          console.log('[Auto-Verify] Scraping error:', scrapingError.message);
          console.log('[Auto-Verify] Error stack:', scrapingError.stack);
        }
        
        // Ako došli ovdje, verificiran
        if (results.verified) {
          break;
        }
        
        // Bez smart fallbacka: uvijek traži dokument ako scraping nije potvrdio
        console.log('[Auto-Verify] Obrt: Traži se dokument iz Obrtnog registra');
        results = {
          verified: false,
          needsDocument: true,
          badges: [],
          errors: [
            'Automatska provjera Obrtnog registra nije dostupna. Molimo uploadajte službeni izvadak iz Obrtnog registra. Možete ga besplatno preuzeti na https://pretrazivac-obrta.gov.hr/pretraga.htm'
          ]
        };
        break;
        
      case 'FREELANCER':
        // Freelancer: odmah traži dokument
        results = {
          verified: false,
          needsDocument: true,
          badges: [],
          errors: ['Freelancer: Potrebno Rješenje Porezne uprave']
        };
        break;
    }
    
    // Ne spremamo badge u bazu ovdje - auto-verify samo vraća rezultate
    // Badge će biti spremljen tek nakon što korisnik klikne "Registriraj se"
    res.json(results);
    
  } catch (err) {
    console.error('[Auto-Verify] Error:', err);
    next(err);
  }
});

/**
 * POST /api/kyc/verify-company-name
 * Provjeri i dohvati točan naziv tvrtke iz službenih registara
 * 
 * Body:
 * - taxId: string (OIB)
 * - companyName: string (user-entered name)
 * - legalStatusId: string (optional, helps determine which registry to check)
 */
r.post('/verify-company-name', async (req, res, next) => {
  try {
    const { taxId, companyName, legalStatusId } = req.body;
    
    if (!taxId || !companyName) {
      return res.status(400).json({
        error: 'OIB i naziv tvrtke su obavezni'
      });
    }
    
    // Validiraj OIB
    if (!validateOIB(taxId)) {
      return res.status(400).json({
        error: 'OIB nije valjan'
      });
    }
    
    // Provjeri da li je naziv dovoljno valjan
    if (!isValidCompanyName(companyName)) {
      return res.status(400).json({
        error: 'Naziv tvrtke nije dovoljno točan',
        message: 'Molimo unesite puni naziv tvrtke ili obrta (ne samo "tvrtka", "firma", itd.)'
      });
    }
    
    let officialName = null;
    let source = null;
    let similarity = 0;
    
    // Provjeri Sudski registar (za d.o.o., j.d.o.o., itd.)
    const legalStatus = legalStatusId ? await prisma.legalStatus.findUnique({ 
      where: { id: legalStatusId } 
    }) : null;
    
    const isCompanyType = legalStatus?.code && ['DOO', 'JDOO', 'DNO'].includes(legalStatus.code);
    
    if (isCompanyType || !legalStatusId) {
      // Pokušaj Sudski registar
      try {
        const clientId = process.env.SUDREG_CLIENT_ID;
        const clientSecret = process.env.SUDREG_CLIENT_SECRET;
        
        if (clientId && clientSecret) {
          // Get OAuth token
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
              }
            }
          ).catch(() => null);
          
          if (tokenResponse?.data?.access_token) {
            // Get company data
            const sudResponse = await axios.get(
              'https://sudreg-data.gov.hr/api/javni/detalji_subjekta',
              {
                params: {
                  tip_identifikatora: 'oib',
                  identifikator: taxId
                },
                headers: {
                  'Authorization': `Bearer ${tokenResponse.data.access_token}`
                }
              }
            ).catch(() => null);
            
            if (sudResponse?.status === 200 && sudResponse.data) {
              const sudData = sudResponse.data;
              const status = sudData.status;
              
              if (status === 1) {
                // Company is active
                officialName = sudData.skracena_tvrtka?.ime || sudData.tvrtka?.ime;
                source = 'SUDSKI_REGISTAR';
                
                if (officialName) {
                  similarity = calculateSimilarity(companyName, officialName);
                }
              }
            }
          }
        }
      } catch (sudError) {
        // Continue to try Obrtni registar
      }
    }
    
    // Provjeri Obrtni registar (ako nije pronađeno u Sudskom)
    if (!officialName) {
      try {
        // Scrape Obrtni registar
        const obrtUrl = `https://pretrazivac-obrta.gov.hr/search?query=${encodeURIComponent(taxId)}`;
        const obrtResponse = await axios.get(obrtUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }).catch(() => null);
        
        if (obrtResponse?.status === 200) {
          const $ = cheerio.load(obrtResponse.data);
          
          // Find OIB in results
          const resultsText = $('body').text();
          const hasOIB = resultsText.includes(taxId);
          const noResults = resultsText.includes('Nema rezultata') || resultsText.includes('nema rezultata');
          
          if (hasOIB && !noResults && resultsText.length > 5000) {
            // Try to extract company name from HTML
            // Look for name in table rows or specific divs
            const nameElements = $('td, .result-name, .company-name').filter((i, el) => {
              const text = $(el).text().trim();
              return text.length > 5 && text.length < 200 && !text.includes(taxId);
            });
            
            if (nameElements.length > 0) {
              // Try to find name that doesn't look like address or other data
              for (let i = 0; i < nameElements.length; i++) {
                const candidate = $(nameElements[i]).text().trim();
                const candidateSimilarity = calculateSimilarity(companyName, candidate);
                
                if (candidateSimilarity > similarity && candidateSimilarity >= 0.5) {
                  officialName = candidate;
                  source = 'OBRTNI_REGISTAR';
                  similarity = candidateSimilarity;
                }
              }
            }
          }
        }
      } catch (obrtError) {
        // Continue without official name
      }
    }
    
    // Ako je pronađen službeni naziv i dovoljno je sličan, vrati ga
    if (officialName && isSimilarEnough(companyName, officialName, 0.6)) {
      return res.json({
        success: true,
        officialName,
        source,
        similarity: Math.round(similarity * 100) / 100,
        shouldUpdate: true,
        message: `Pronađen službeni naziv u ${source === 'SUDSKI_REGISTAR' ? 'Sudskom' : 'Obrtnom'} registru`
      });
    }
    
    // Ako je pronađen ali nije dovoljno sličan
    if (officialName && !isSimilarEnough(companyName, officialName, 0.6)) {
      return res.json({
        success: false,
        officialName,
        source,
        similarity: Math.round(similarity * 100) / 100,
        shouldUpdate: false,
        warning: 'Uneseni naziv se značajno razlikuje od službenog naziva u registru. Provjerite točnost.',
        message: `U registru je zaveden naziv: "${officialName}"`
      });
    }
    
    // Ako nije pronađen u registrima, provjeri samo da li je naziv valjan
    return res.json({
      success: true,
      officialName: null,
      source: null,
      similarity: 0,
      shouldUpdate: false,
      message: 'Naziv tvrtke nije provjeren u službenim registrima. Provjerite točnost prije registracije.'
    });
    
  } catch (err) {
    console.error('[KYC] Company name verification error:', err);
    next(err);
  }
});

/**
 * ADMIN ONLY: POST /api/kyc/verify/:userId
 * Ručna verifikacija od strane admina
 */
r.post('/verify/:userId', auth(true), async (req, res, next) => {
  try {
    const adminUser = req.user;
    
    // Provjeri da je admin
    if (adminUser.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: 'Samo admin može verificirati korisnike' 
      });
    }
    
    const { userId } = req.params;
    const { notes } = req.body;
    
    const providerProfile = await prisma.providerProfile.update({
      where: { userId },
      data: {
        kycVerified: true,
        kycVerifiedAt: new Date(),
        kycVerificationNotes: notes || null
      }
    });
    
    res.json({
      success: true,
      message: 'Korisnik je uspješno verificiran',
      data: providerProfile
    });
    
  } catch (err) {
    console.error('[KYC] Admin verification error:', err);
    next(err);
  }
});

/**
 * POST /api/kyc/verify-identity
 * Verify Identity badge - Email/Phone/DNS verification
 * 
 * Body:
 * - type: 'email' | 'phone' | 'dns'
 * - value: string (email/phone/domain)
 */
r.post('/verify-identity', auth(true), async (req, res, next) => {
  try {
    const user = req.user;
    
    // Dozvoljeno za PROVIDER-e i USER-e koji su tvrtke/obrti (imaju ProviderProfile)
    // Za USER-e, provjeravamo da li imaju ProviderProfile (koji se kreira ako imaju legalStatusId)
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: user.id }
    });
    
    if (!providerProfile) {
      // Provjeri da li je USER koji ima legalStatusId (možda treba kreirati profil)
      if (user.role === 'USER') {
        const userWithLegalStatus = await prisma.user.findUnique({
          where: { id: user.id },
          select: { legalStatusId: true }
        });
        
        if (!userWithLegalStatus || !userWithLegalStatus.legalStatusId) {
          return res.status(403).json({ 
            error: 'Nemate pristup',
            message: 'Verifikacija identiteta je dostupna samo za tvrtke/obrte ili pružatelje usluga.'
          });
        }
        
        // Korisnik ima legalStatusId, ali nema ProviderProfile - vrati error koji kaže da treba kreirati profil
        return res.status(404).json({ 
          error: 'Provider profile not found',
          hint: 'Kreirajte ProviderProfile pozivanjem POST /providers/fix-profile'
        });
      }
      
      return res.status(403).json({ 
        error: 'Samo pružatelji usluga ili tvrtke/obrti mogu verificirati identitet',
        hint: user.role === 'USER' ? 'Kreirajte ProviderProfile pozivanjem POST /providers/fix-profile' : ''
      });
    }
    
    const { type, value } = req.body;
    
    if (!type || !value) {
      return res.status(400).json({ 
        error: 'Type i value su obavezni' 
      });
    }
    
    let updateData = {};
    
    switch (type) {
      case 'email':
        // Provjeri da li se domena email adrese podudara s domenom korisnika
        const companyEmailDomain = value.split('@')[1];
        const userEmailDomain = user.email.split('@')[1];
        
        if (companyEmailDomain !== userEmailDomain) {
          return res.status(400).json({ 
            error: 'Email domena se ne podudara s domenom tvrtke',
            message: 'Email adresa mora biti na istoj domeni kao vaš registracijski email.'
          });
        }
        
        // Generiraj verifikacijski token
        const { randomBytes } = await import('crypto');
        const verificationToken = randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 sata
        
        // Spremi email adresu i token u ProviderProfile (ne postavljaj verified još)
        const emailUpdateData = {
          identityEmailAddress: value,
          identityEmailToken: verificationToken,
          identityEmailTokenExpiresAt: tokenExpiresAt,
          identityEmailVerified: false, // Ne postavljaj verified dok se ne klikne link
          identityEmailVerifiedAt: null
        };
        
        // Spremi token u bazu prije slanja emaila
        await prisma.providerProfile.update({
          where: { userId: user.id },
          data: emailUpdateData
        });
        
        // Pošalji verifikacijski email
        try {
          const { sendCompanyEmailVerification } = await import('../lib/email.js');
          const companyName = providerProfile.companyName || user.companyName || null;
          await sendCompanyEmailVerification(value, user.fullName || user.email, verificationToken, companyName);
          console.log(`[KYC] Company email verification sent to: ${value}`);
        } catch (emailError) {
          console.error('[KYC] Error sending company email verification:', emailError);
          // Ne baci grešku - token je spremljen, korisnik može zatražiti ponovno slanje
          return res.status(500).json({
            error: 'Greška pri slanju verifikacijskog emaila',
            message: 'Token je generiran, ali email nije poslan. Pokušajte ponovno zatražiti verifikaciju.',
            tokenSaved: true
          });
        }
        
        // Vrati poruku da je email poslan
        return res.json({
          success: true,
          message: 'Verifikacijski email je poslan na vašu email adresu. Provjerite inbox i kliknite na link za verifikaciju.',
          emailSent: true,
          emailAddress: value
        });
        
      // Ne postavi updateData za email - već smo vratili response
      // break; // Ne treba break jer već return-amo
        
      case 'phone':
        // Provjeri da li je telefon već verificiran preko SMS verifikacije
        const userWithPhone = await prisma.user.findUnique({
          where: { id: user.id },
          select: { phoneVerified: true, phone: true }
        });
        
        if (!userWithPhone?.phoneVerified) {
          return res.status(400).json({ 
            error: 'Telefon mora biti verificiran SMS kodom prije Identity Značke verifikacije. Molimo prvo verificirajte telefon u profilu.' 
          });
        }
        
        // Provjeri da li se broj telefona podudara
        if (userWithPhone.phone && value && userWithPhone.phone !== value) {
          return res.status(400).json({ 
            error: 'Uneseni telefonski broj se ne podudara s verificiranim brojem u profilu.' 
          });
        }
        
        updateData = {
          identityPhoneVerified: true,
          identityPhoneVerifiedAt: new Date()
        };
        break;
        
      case 'dns':
        // Provjeri DNS TXT zapis
        try {
          const dns = await import('dns').then(m => m.promises);
          const domain = value.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
          
          // Provjeri TXT zapise
          const txtRecords = await dns.resolveTxt(domain).catch((err) => {
            console.error('[KYC] DNS resolution error:', err);
            throw new Error(`Neuspješno rješavanje DNS zapisa za domenu ${domain}. Provjerite da li je domena ispravno unesena.`);
          });
          
          // Traži verifikacijski TXT zapis
          // Format: "uslugar-verification=USER_ID" ili samo USER_ID
          const allTxtRecords = txtRecords.flat().join(' ');
          const verificationPattern = new RegExp(`uslugar-verification=(${user.id}|${user.id.substring(0, 8)})`, 'i');
          
          if (!verificationPattern.test(allTxtRecords)) {
            return res.status(400).json({ 
              error: `DNS TXT verifikacijski zapis nije pronađen za domenu ${domain}.`,
              hint: `Dodajte TXT zapis u DNS postavke: uslugar-verification=${user.id.substring(0, 12)}... (ili puni ID: ${user.id})`,
              domain: domain,
              userId: user.id
            });
          }
          
          updateData = {
            identityDnsVerified: true,
            identityDnsVerifiedAt: new Date()
          };
        } catch (dnsError) {
          console.error('[KYC] DNS verification error:', dnsError);
          return res.status(400).json({ 
            error: `Greška pri provjeri DNS zapisa: ${dnsError.message}`,
            hint: 'Provjerite da li je domena ispravno unesena (npr. vasafirma.hr, bez http:// ili www.)'
          });
        }
        break;
        
      default:
        return res.status(400).json({ 
          error: 'Invalid verification type' 
        });
    }
    
    // Ako je email verifikacija, već smo vratili response gore
    if (type === 'email') {
      return; // Već smo vratili response u switch case-u
    }
    
    // Update provider profile
    const updatedProfile = await prisma.providerProfile.update({
      where: { userId: user.id },
      data: updateData
    });
    
    res.json({
      success: true,
      message: 'Identity verificiran',
      data: updatedProfile
    });
    
  } catch (err) {
    console.error('[KYC] Identity verification error:', err);
    next(err);
  }
});

/**
 * POST /api/kyc/upload-safety-badge
 * Upload Safety badge - Insurance policy document
 * 
 * Body:
 * - document: File (PDF/JPG/PNG)
 */
r.post('/upload-safety-badge', auth(true), uploadDocument.single('document'), async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!req.file) {
      return res.status(400).json({ 
        error: 'Dokument je obavezan',
        message: 'Molimo priložite policu osiguranja u PDF, JPG ili PNG formatu' 
      });
    }
    
    if (user.role !== 'PROVIDER') {
      await fs.unlink(path.join('./uploads', req.file.filename));
      return res.status(403).json({ 
        error: 'Samo pružatelji usluga mogu uploadati police osiguranja' 
      });
    }
    
    const documentUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    // Get provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: user.id }
    });
    
    if (!providerProfile) {
      return res.status(404).json({ 
        error: 'Provider profile not found' 
      });
    }
    
    // Update provider profile with insurance URL
    const updatedProfile = await prisma.providerProfile.update({
      where: { userId: user.id },
      data: {
        safetyInsuranceUrl: documentUrl,
        safetyInsuranceUploadedAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Polica osiguranja uspješno uploadana',
      data: updatedProfile
    });
    
  } catch (err) {
    console.error('[KYC] Safety badge upload error:', err);
    next(err);
  }
});

/**
 * GET /api/kyc/verify-company-email
 * Verify company email address using token from email link
 * 
 * Query params:
 * - token: string (verification token from email)
 */
r.get('/verify-company-email', async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        error: 'Verifikacijski token je obavezan',
        message: 'Molimo koristite link iz emaila koji ste primili.'
      });
    }
    
    // Pronađi ProviderProfile s ovim tokenom
    const providerProfile = await prisma.providerProfile.findFirst({
      where: {
        identityEmailToken: token,
        identityEmailTokenExpiresAt: {
          gt: new Date() // Token još nije istekao
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });
    
    if (!providerProfile) {
      return res.status(400).json({
        error: 'Nevažeći ili istekao token',
        message: 'Verifikacijski link je nevažeći ili je istekao. Molimo zatražite novi verifikacijski email.'
      });
    }
    
    // Provjeri da li je email adresa još uvijek na istoj domeni
    if (!providerProfile.identityEmailAddress) {
      return res.status(400).json({
        error: 'Email adresa nije pronađena',
        message: 'Email adresa za verifikaciju nije pronađena. Molimo zatražite novu verifikaciju.'
      });
    }
    
    const companyEmailDomain = providerProfile.identityEmailAddress.split('@')[1];
    const userEmailDomain = providerProfile.user.email.split('@')[1];
    
    if (companyEmailDomain !== userEmailDomain) {
      return res.status(400).json({
        error: 'Domena se ne podudara',
        message: 'Email adresa više nije na istoj domeni kao vaš registracijski email. Molimo zatražite novu verifikaciju.'
      });
    }
    
    // Verificiraj email
    const updatedProfile = await prisma.providerProfile.update({
      where: { userId: providerProfile.userId },
      data: {
        identityEmailVerified: true,
        identityEmailVerifiedAt: new Date(),
        identityEmailToken: null, // Obriši token nakon verifikacije
        identityEmailTokenExpiresAt: null
      }
    });
    
    console.log(`[KYC] Company email verified for user ${providerProfile.userId}: ${providerProfile.identityEmailAddress}`);
    
    res.json({
      success: true,
      message: 'Email adresa je uspješno verificirana!',
      data: {
        emailAddress: providerProfile.identityEmailAddress,
        verifiedAt: updatedProfile.identityEmailVerifiedAt
      }
    });
    
  } catch (err) {
    console.error('[KYC] Company email verification error:', err);
    next(err);
  }
});

/**
 * POST /api/kyc/resend-company-email-verification
 * Resend company email verification email
 * 
 * Body: (optional - koristi se email iz ProviderProfile ako nije specificiran)
 * - email: string (optional)
 */
r.post('/resend-company-email-verification', auth(true), async (req, res, next) => {
  try {
    const user = req.user;
    const { email } = req.body;
    
    // Dohvati ProviderProfile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: user.id }
    });
    
    if (!providerProfile) {
      return res.status(404).json({
        error: 'Provider profile not found',
        message: 'Nemate provider profil. Ova funkcionalnost je dostupna samo za pružatelje usluga.'
      });
    }
    
    // Koristi email iz body-a ili iz ProviderProfile
    const emailToVerify = email || providerProfile.identityEmailAddress;
    
    if (!emailToVerify) {
      return res.status(400).json({
        error: 'Email adresa nije specificirana',
        message: 'Molimo unesite email adresu za verifikaciju ili prvo zatražite verifikaciju preko /api/kyc/verify-identity endpointa.'
      });
    }
    
    // Provjeri da li se domena podudara
    const companyEmailDomain = emailToVerify.split('@')[1];
    const userEmailDomain = user.email.split('@')[1];
    
    if (companyEmailDomain !== userEmailDomain) {
      return res.status(400).json({
        error: 'Email domena se ne podudara s domenom tvrtke',
        message: 'Email adresa mora biti na istoj domeni kao vaš registracijski email.'
      });
    }
    
    // Provjeri da li je već verificiran
    if (providerProfile.identityEmailVerified && providerProfile.identityEmailAddress === emailToVerify) {
      return res.json({
        success: true,
        message: 'Email adresa je već verificirana.',
        alreadyVerified: true
      });
    }
    
    // Generiraj novi verifikacijski token
    const { randomBytes } = await import('crypto');
    const verificationToken = randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 sata
    
    // Ažuriraj ProviderProfile s novim tokenom
    await prisma.providerProfile.update({
      where: { userId: user.id },
      data: {
        identityEmailAddress: emailToVerify,
        identityEmailToken: verificationToken,
        identityEmailTokenExpiresAt: tokenExpiresAt,
        identityEmailVerified: false, // Reset verified status ako se mijenja email
        identityEmailVerifiedAt: null
      }
    });
    
    // Pošalji verifikacijski email
    try {
      const { sendCompanyEmailVerification } = await import('../lib/email.js');
      const companyName = providerProfile.companyName || user.companyName || null;
      await sendCompanyEmailVerification(emailToVerify, user.fullName || user.email, verificationToken, companyName);
      console.log(`[KYC] Company email verification resent to: ${emailToVerify}`);
    } catch (emailError) {
      console.error('[KYC] Error resending company email verification:', emailError);
      return res.status(500).json({
        error: 'Greška pri slanju verifikacijskog emaila',
        message: 'Token je generiran, ali email nije poslan. Pokušajte ponovno.'
      });
    }
    
    res.json({
      success: true,
      message: 'Verifikacijski email je ponovno poslan na vašu email adresu.',
      emailSent: true,
      emailAddress: emailToVerify
    });
    
  } catch (err) {
    console.error('[KYC] Resend company email verification error:', err);
    next(err);
  }
});

export default r;

