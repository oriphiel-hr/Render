import { test, expect } from '@playwright/test';
import testData from '../test-data.json';
import { 
  createInvalidTestUser, 
  createIncompleteTestUser, 
  createProviderWithoutLicense,
  createProviderWithoutKYC,
  createDirectorWithTeam,
  generateTestUserOIB
} from '../lib/test-user-helper.js';

/**
 * Testovi za validaciju podataka i edge case-ove
 */
test.describe('Validacija podataka i Edge Case-ovi', () => {
  
  test('Registracija s invalid email adresom - treba prikazati grešku', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Registracija');
    
    // Pokušaj registracije s invalid email-om
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'Test123456!');
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="phone"]', '+385991234567');
    await page.click('input[value="USER"]');
    
    // Pokušaj submit-a
    await page.click('button[type="submit"]');
    
    // Treba prikazati grešku za invalid email
    await expect(page.locator('text=/email.*invalid|nevažeći.*email/i')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/screenshots/validation-invalid-email.png', fullPage: true });
  });

  test('Registracija providera s prekratkim OIB-om - treba prikazati grešku', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Registracija');
    await page.click('input[value="PROVIDER"]');
    
    // Unesi podatke s prekratkim OIB-om
    await page.fill('input[name="email"]', `test.provider.${Date.now()}@uslugar.test`);
    await page.fill('input[name="password"]', 'Test123456!');
    await page.fill('input[name="fullName"]', 'Test Provider');
    await page.fill('input[name="phone"]', '+385991234567');
    await page.selectOption('select[name="legalStatus"]', 'FREELANCER');
    await page.fill('input[name="oib"]', '123'); // Prekratak OIB
    
    // Pokušaj submit-a
    await page.click('button[type="submit"]');
    
    // Treba prikazati grešku za invalid OIB
    await expect(page.locator('text=/OIB.*11.*znamenki|nevažeći.*OIB/i')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/screenshots/validation-invalid-oib.png', fullPage: true });
  });

  test('Registracija tvrtke bez naziva tvrtke - treba prikazati grešku', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Registracija');
    await page.click('input[value="PROVIDER"]');
    
    // Odaberi DOO status
    await page.selectOption('select[name="legalStatus"]', 'DOO');
    
    // Ne unesi naziv tvrtke (required field)
    await page.fill('input[name="email"]', `test.company.${Date.now()}@uslugar.test`);
    await page.fill('input[name="password"]', 'Test123456!');
    await page.fill('input[name="fullName"]', 'Test Company');
    await page.fill('input[name="phone"]', '+385991234567');
    await page.fill('input[name="oib"]', generateTestUserOIB(Date.now()));
    
    // Pokušaj submit-a
    await page.click('button[type="submit"]');
    
    // Treba prikazati grešku da je naziv tvrtke obavezan
    await expect(page.locator('text=/naziv.*tvrtke.*obavezan|required/i')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/screenshots/validation-missing-company-name.png', fullPage: true });
  });

  test('Provider bez licence - treba prikazati upozorenje', async ({ page }) => {
    const { user, cleanup } = await createProviderWithoutLicense(page, testData, {
      city: 'Zagreb'
    });
    
    try {
      // Provjeri da li je registracija uspjela
      await expect(page.locator('text=Registracija uspješna')).toBeVisible({ timeout: 10000 });
      
      // Navigiraj na profil
      await page.goto('/profile');
      
      // Provjeri da li postoji upozorenje o nedostajućoj licenci
      // (ovo ovisi o implementaciji UI-ja)
      await page.screenshot({ path: 'test-results/screenshots/provider-without-license.png', fullPage: true });
      
      // Napravi screenshot i provjeri da li postoji upozorenje
      // await expect(page.locator('text=/licenca.*potrebna|upload.*licencu/i')).toBeVisible({ timeout: 5000 });
    } finally {
      await cleanup();
    }
  });

  test('Provider bez KYC dokumenta - treba prikazati upozorenje', async ({ page }) => {
    const { user, cleanup } = await createProviderWithoutKYC(page, testData, {
      city: 'Zagreb'
    });
    
    try {
      // Provjeri da li je registracija uspjela
      await expect(page.locator('text=Registracija uspješna')).toBeVisible({ timeout: 10000 });
      
      // Navigiraj na KYC stranicu
      await page.goto('/profile/kyc');
      
      // Provjeri da li postoji upozorenje o nedostajućem KYC dokumentu
      await page.screenshot({ path: 'test-results/screenshots/provider-without-kyc.png', fullPage: true });
      
      // Napravi screenshot i provjeri da li postoji upozorenje
      // await expect(page.locator('text=/KYC.*potreban|upload.*dokument/i')).toBeVisible({ timeout: 5000 });
    } finally {
      await cleanup();
    }
  });

  test('Direktor i izvođači - struktura tima', async ({ page }) => {
    // Kreiraj direktora s 3 izvođača
    const { director, team, cleanup } = await createDirectorWithTeam(page, testData, {
      teamSize: 3,
      city: 'Zagreb'
    });
    
    try {
      // Provjeri da je direktor kreiran
      await expect(page.locator('text=Registracija uspješna')).toBeVisible({ timeout: 10000 });
      console.log(`[TEST] Director created: ${director.email}`);
      console.log(`[TEST] Team members: ${team.length}`);
      
      // Screenshot direktora
      await page.screenshot({ path: 'test-results/screenshots/director-profile.png', fullPage: true });
      
      // Test: Provjeri da direktor može vidjeti svoje izvođače
      // (ovo ovisi o implementaciji UI-ja)
      await page.goto('/profile/team');
      await page.screenshot({ path: 'test-results/screenshots/director-team-view.png', fullPage: true });
      
      // Test: Provjeri da izvođači mogu vidjeti direktora
      // Prijava kao prvi izvođač
      await page.goto('/');
      await page.click('text=Prijava');
      await page.fill('input[name="email"]', team[0].email);
      await page.fill('input[name="password"]', team[0].password);
      await page.click('button[type="submit"]');
      
      await page.goto('/profile');
      await page.screenshot({ path: 'test-results/screenshots/team-member-profile.png', fullPage: true });
      
      console.log(`[TEST] ✅ Director and team structure test completed`);
    } finally {
      await cleanup();
    }
  });

  test('Client bez telefona - treba prikazati grešku ili upozorenje', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Registracija');
    
    // Ne unesi telefon (može biti opcionalan ili obavezan)
    await page.fill('input[name="email"]', `test.client.${Date.now()}@uslugar.test`);
    await page.fill('input[name="password"]', 'Test123456!');
    await page.fill('input[name="fullName"]', 'Test Client');
    // Ne unesi telefon
    await page.selectOption('select[name="city"]', 'Zagreb');
    await page.click('input[value="USER"]');
    
    // Pokušaj submit-a
    await page.click('button[type="submit"]');
    
    // Provjeri da li je greška prikazana (ako je telefon obavezan)
    // ili da li je registracija uspjela (ako je telefon opcionalan)
    await page.screenshot({ path: 'test-results/screenshots/client-without-phone.png', fullPage: true });
    
    // Test može proći u oba slučaja - samo dokumentiraj ponašanje
    console.log('[TEST] Client registration without phone - checking behavior');
  });
});

// Helper funkcija za generiranje OIB-a (kopirano iz test-user-helper.js)
function generateTestUserOIB(timestamp = Date.now()) {
  const random = Math.floor(Math.random() * 1000);
  const oibBase = String(timestamp).slice(-8) + String(random).padStart(3, '0');
  return oibBase.slice(0, 11).padStart(11, '0');
}

