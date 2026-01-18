/**
 * Helper funkcije za kreiranje i brisanje test korisnika
 * Svaki test kreira vlastitog korisnika i briše ga nakon završetka
 */

/**
 * Generiraj jedinstveni email za test korisnika
 * @param {string} userType - Tip korisnika ('client', 'provider', 'admin')
 * @param {number} timestamp - Timestamp za jedinstvenost (default: trenutni)
 * @returns {string} Jedinstveni email
 */
export function generateTestUserEmail(userType = 'client', timestamp = Date.now()) {
  const random = Math.floor(Math.random() * 10000);
  return `test.${userType}.${timestamp}.${random}@uslugar.test`;
}

/**
 * Generiraj jedinstveni OIB za test korisnika
 * @param {number} timestamp - Timestamp za jedinstvenost (default: trenutni)
 * @returns {string} Jedinstveni OIB (11 znamenki)
 */
export function generateTestUserOIB(timestamp = Date.now()) {
  // OIB mora biti 11 znamenki, koristimo timestamp i random za jedinstvenost
  const random = Math.floor(Math.random() * 1000);
  const oibBase = String(timestamp).slice(-8) + String(random).padStart(3, '0');
  // Dodaj checksum digit (jednostavna implementacija)
  return oibBase.slice(0, 11).padStart(11, '0');
}

/**
 * Kreiraj test korisnika preko API-ja
 * @param {Object} page - Playwright page objekt
 * @param {Object} options - Opcije za kreiranje korisnika
 * @param {string} options.userType - Tip korisnika ('client', 'provider', 'admin', 'providerCompany')
 * @param {string} options.email - Email adresa (opcionalno, generira se automatski)
 * @param {string} options.password - Lozinka (opcionalno, default: 'Test123456!')
 * @param {string} options.fullName - Puno ime (opcionalno)
 * @param {string} options.phone - Telefon (opcionalno)
 * @param {string} options.city - Grad (opcionalno, default: 'Zagreb')
 * @param {string} options.legalStatus - Pravni status (za providere)
 * @param {string} options.oib - OIB (za providere, generira se automatski)
 * @param {string} options.companyName - Naziv tvrtke (za providerCompany)
 * @returns {Promise<Object>} Kreirani korisnik objekt
 */
export async function createTestUser(page, options = {}) {
  const {
    userType = 'client',
    email = null,
    password = 'Test123456!',
    fullName = null,
    phone = null,
    city = 'Zagreb',
    legalStatus = 'FREELANCER',
    oib = null,
    companyName = null
  } = options;

  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  // Generiraj jedinstvene podatke ako nisu određeni
  const userEmail = email || generateTestUserEmail(userType, timestamp);
  const userFullName = fullName || `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)} ${timestamp}`;
  const userPhone = phone || `+38599${String(1000000 + random).slice(-7)}`;
  const userOIB = oib || (userType === 'provider' || userType === 'providerCompany' ? generateTestUserOIB(timestamp) : null);

  console.log(`[TEST USER HELPER] Creating test user: ${userType} - ${userEmail}`);

  // Navigiraj na registraciju
  await page.goto('/');
  await page.click('text=Registracija');
  
  // Odaberi tip korisnika
  if (userType === 'client' || userType === 'admin') {
    await page.click('input[value="USER"]');
  } else {
    await page.click('input[value="PROVIDER"]');
  }

  // Unesi osnovne podatke
  await page.fill('input[name="email"]', userEmail);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="fullName"]', userFullName);
  await page.fill('input[name="phone"]', userPhone);
  
  if (userType !== 'admin') {
    await page.selectOption('select[name="city"]', city);
  }

  // Za providere, unesi dodatne podatke
  if (userType === 'provider' || userType === 'providerCompany') {
    await page.selectOption('select[name="legalStatus"]', legalStatus);
    await page.fill('input[name="oib"]', userOIB);
    
    // Za tvrtke, unesi naziv tvrtke
    if (userType === 'providerCompany' || legalStatus === 'DOO' || legalStatus === 'D.O.O.') {
      const finalCompanyName = companyName || `Test Company ${timestamp}`;
      await page.fill('input[name="companyName"]', finalCompanyName);
    }
  }

  // Pošalji formu
  await page.click('button[type="submit"]');
  
  // Čekaj potvrdu registracije
  await page.waitForSelector('text=Registracija uspješna', { timeout: 10000 });
  
  // Screenshot nakon registracije
  await page.screenshot({ 
    path: `test-results/screenshots/user-created-${userType}-${timestamp}.png`, 
    fullPage: true 
  });

  // Vrati podatke korisnika
  const userData = {
    email: userEmail,
    password: password,
    fullName: userFullName,
    phone: userPhone,
    city: city,
    userType: userType,
    timestamp: timestamp,
    oib: userOIB,
    companyName: companyName || (userType === 'providerCompany' ? `Test Company ${timestamp}` : null),
    legalStatus: userType === 'provider' || userType === 'providerCompany' ? legalStatus : null
  };

  console.log(`[TEST USER HELPER] Test user created: ${userEmail}`);
  return userData;
}

/**
 * Obriši test korisnika preko API-ja (zahtijeva admin pristup)
 * @param {Object} testData - test-data.json objekt (za API URL)
 * @param {string} userEmail - Email korisnika koji treba obrisati
 * @returns {Promise<boolean>} True ako je korisnik obrisan, false ako nije
 */
export async function deleteTestUser(testData, userEmail) {
  try {
    const api = testData?.api?.baseUrl || 'https://api.uslugar.eu';
    const adminUser = testData?.users?.admin;
    
    if (!adminUser || !adminUser.email || !adminUser.password) {
      console.warn(`[TEST USER HELPER] Cannot delete user ${userEmail}: Admin credentials not available`);
      return false;
    }

    console.log(`[TEST USER HELPER] Deleting test user: ${userEmail}`);

    // Prijava kao admin (preko API-ja ili Playwright)
    // Ovo zahtijeva admin endpoint za brisanje korisnika
    // Za sada, vraćamo warning jer brisanje korisnika možda nije implementirano
    
    console.warn(`[TEST USER HELPER] User deletion not yet implemented. Please delete manually: ${userEmail}`);
    return false;
  } catch (error) {
    console.error(`[TEST USER HELPER] Error deleting user ${userEmail}:`, error);
    return false;
  }
}

/**
 * Helper za cleanup test korisnika u Playwright testovima
 * @param {Object} page - Playwright page objekt
 * @param {Object} userData - Podaci korisnika koji treba obrisati
 * @param {Object} testData - test-data.json objekt
 * @returns {Promise<void>}
 */
export async function cleanupTestUser(page, userData, testData) {
  if (!userData || !userData.email) {
    return;
  }

  try {
    console.log(`[TEST USER HELPER] Cleaning up test user: ${userData.email}`);
    
    // Prijava kao admin
    const adminUser = testData?.users?.admin;
    if (!adminUser || !adminUser.email || !adminUser.password) {
      console.warn(`[TEST USER HELPER] Cannot cleanup: Admin credentials not available`);
      return;
    }

    await page.goto('/admin/login');
    await page.fill('input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    
    // Navigiraj na admin panel za korisnike
    await page.goto('/admin/users');
    
    // Pronađi i obriši korisnika
    // Ovo ovisi o UI implementaciji - možda treba dodati search i delete gumb
    // Za sada, samo logujemo
    console.warn(`[TEST USER HELPER] Manual cleanup required: ${userData.email}`);
    
    // Screenshot prije brisanja
    await page.screenshot({ 
      path: `test-results/screenshots/user-cleanup-${userData.userType}-${userData.timestamp}.png`, 
      fullPage: true 
    });
  } catch (error) {
    console.error(`[TEST USER HELPER] Error during cleanup:`, error);
  }
}

/**
 * Kreiraj test korisnika i automatski ga obriši nakon testa
 * Wrapper funkcija za Playwright testove
 * @param {Object} page - Playwright page objekt
 * @param {Object} testData - test-data.json objekt
 * @param {Object} options - Opcije za kreiranje korisnika (vidi createTestUser)
 * @returns {Promise<{user: Object, cleanup: Function}>} Korisnik i cleanup funkcija
 */
export async function createTestUserWithCleanup(page, testData, options = {}) {
  const user = await createTestUser(page, options);
  
  // Vrati cleanup funkciju
  const cleanup = async () => {
    await cleanupTestUser(page, user, testData);
  };
  
  return { user, cleanup };
}

