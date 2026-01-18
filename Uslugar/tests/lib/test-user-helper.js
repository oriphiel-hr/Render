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
 * @param {Object} page - Playwright page objekt
 * @param {Object} testData - test-data.json objekt (za API URL i admin credentials)
 * @param {string} userEmail - Email korisnika koji treba obrisati
 * @returns {Promise<boolean>} True ako je korisnik obrisan, false ako nije
 */
export async function deleteTestUser(page, testData, userEmail) {
  try {
    const apiBaseUrl = testData?.api?.baseUrl || 'https://api.uslugar.eu';
    const adminUser = testData?.users?.admin;
    
    if (!adminUser || !adminUser.email || !adminUser.password) {
      console.warn(`[TEST USER HELPER] Cannot delete user ${userEmail}: Admin credentials not available`);
      return false;
    }

    console.log(`[TEST USER HELPER] Deleting test user: ${userEmail}`);

    // Prijava kao admin preko API-ja
    const loginResponse = await page.request.post(`${apiBaseUrl}/api/auth/login`, {
      data: {
        email: adminUser.email,
        password: adminUser.password
      }
    });

    if (!loginResponse.ok()) {
      console.error(`[TEST USER HELPER] Admin login failed: ${loginResponse.status()}`);
      return false;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    if (!token) {
      console.error(`[TEST USER HELPER] No token received from admin login`);
      return false;
    }

    // Obriši korisnika preko API-ja
    const deleteResponse = await page.request.delete(
      `${apiBaseUrl}/api/testing/test-user/${encodeURIComponent(userEmail)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (deleteResponse.ok()) {
      const deleteData = await deleteResponse.json();
      console.log(`[TEST USER HELPER] Successfully deleted test user: ${userEmail}`, deleteData);
      return true;
    } else {
      const errorData = await deleteResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.warn(`[TEST USER HELPER] Failed to delete user ${userEmail}:`, deleteResponse.status(), errorData);
      return false;
    }
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
    
    // Obriši korisnika preko API-ja
    const deleted = await deleteTestUser(page, testData, userData.email);
    
    if (deleted) {
      console.log(`[TEST USER HELPER] ✅ Test user ${userData.email} successfully deleted`);
    } else {
      console.warn(`[TEST USER HELPER] ⚠️ Failed to delete test user ${userData.email}. Manual cleanup may be required.`);
    }
    
    // Screenshot nakon cleanup-a (ako je potrebno za debug)
    if (testData?.api?.debugScreenshots) {
      await page.screenshot({ 
        path: `test-results/screenshots/user-cleanup-${userData.userType}-${userData.timestamp}.png`, 
        fullPage: true 
      });
    }
  } catch (error) {
    console.error(`[TEST USER HELPER] Error during cleanup:`, error);
    // Ne baci grešku - cleanup ne bi trebao prekinuti test
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

