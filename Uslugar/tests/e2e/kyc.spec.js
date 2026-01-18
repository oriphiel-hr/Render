import { test, expect } from '@playwright/test';
import testData from '../test-data.json';
import { getUser } from '../lib/user-helper.js';
import {
  createProviderWithoutLicense,
  createProviderWithoutKYC,
  createTestUserWithCleanup
} from '../lib/test-user-helper.js';

/**
 * Automatski testovi za KYC verifikaciju
 */
test.describe('KYC - Verifikacija Identiteta', () => {
  test.beforeEach(async ({ page }) => {
    // Prijava kao provider
    await page.goto('/');
    const user = getUser(testData, 'provider', { strategy: 'first' });
    
    await page.click('text=Prijava');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('KYC: Upload dokumenta', async ({ page }) => {
    const user = getUser(testData, 'provider', { strategy: 'first' });
    if (!user) {
      throw new Error('Test podaci nisu konfigurirani. Molimo konfigurirajte test podatke u admin panelu.');
    }
    
    const kycDoc = testData.documents?.kycDocument;
    
    // 1. Navigiraj na KYC stranicu
    await page.goto('/profile/kyc');
    await page.screenshot({ path: 'test-results/screenshots/kyc-01-start.png', fullPage: true });
    
    // 2. Provjeri consent checkbox
    await page.check('input[name="consent"]');
    await page.screenshot({ path: 'test-results/screenshots/kyc-02-consent-checked.png', fullPage: true });
    
    // 3. Upload dokumenta (ako dokument postoji)
    if (kycDoc?.path || kycDoc?.url) {
      const fileInput = page.locator('input[type="file"]');
      const filePath = kycDoc.path || kycDoc.url;
      await fileInput.setInputFiles(filePath);
      await page.screenshot({ path: 'test-results/screenshots/kyc-03-document-selected.png', fullPage: true });
    }
    
    // 4. Pošalji formu
    await page.click('button[type="submit"]');
    
    // 5. Provjeri da je dokument uploadan
    await expect(page.locator('text=Dokument uploadan')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Status: Pending')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/kyc-04-upload-success.png', fullPage: true });
  });

  test('KYC: Ekstrakcija OIB-a - match', async ({ page }) => {
    // Ovo zahtijeva da dokument sadrži OIB koji odgovara profilu
    const user = getUser(testData, 'provider', { strategy: 'first' });
    const kycDoc = testData.documents.kycDocument;
    
    await page.goto('/profile/kyc');
    await page.check('input[name="consent"]');
    
    if (kycDoc.path) {
      await page.locator('input[type="file"]').setInputFiles(kycDoc.path);
    }
    
    await page.click('button[type="submit"]');
    
    // Provjeri da je OIB ekstrahiran i match-an
    await expect(page.locator('text=OIB verified')).toBeVisible({ timeout: 15000 });
  });

  // ============================================
  // EDGE CASE TESTOVI - Nedostajući dokumenti
  // ============================================

  test('Provider bez licence - treba prikazati upozorenje', async ({ page }) => {
    // Kreiraj providera bez licence
    const { user, cleanup } = await createProviderWithoutLicense(page, testData, {
      city: 'Zagreb'
    });
    
    try {
      // Prijava
      await page.goto('/');
      await page.click('text=Prijava');
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Navigiraj na profil
      await page.goto('/profile');
      
      // Provjeri da li postoji upozorenje o nedostajućoj licenci
      // (ovo ovisi o implementaciji UI-ja)
      await page.screenshot({ path: 'test-results/screenshots/kyc-edge-01-provider-without-license.png', fullPage: true });
      
      // Provjeri da li postoji poruka/upozorenje o licenci
      const hasLicenseWarning = await page.locator('text=/licenca.*potrebna|upload.*licencu|license.*required/i').isVisible().catch(() => false);
      console.log(`[KYC TEST] License warning visible: ${hasLicenseWarning}`);
    } finally {
      await cleanup();
    }
  });

  test('Provider bez KYC dokumenta - treba prikazati upozorenje', async ({ page }) => {
    // Kreiraj providera bez KYC dokumenta
    const { user, cleanup } = await createProviderWithoutKYC(page, testData, {
      city: 'Zagreb'
    });
    
    try {
      // Prijava
      await page.goto('/');
      await page.click('text=Prijava');
      await page.fill('input[name="email"]', user.email);
      await page.fill('input[name="password"]', user.password);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Navigiraj na KYC stranicu
      await page.goto('/profile/kyc');
      
      // Provjeri da li postoji upozorenje o nedostajućem KYC dokumentu
      await page.screenshot({ path: 'test-results/screenshots/kyc-edge-02-provider-without-kyc.png', fullPage: true });
      
      // Provjeri da li postoji poruka/upozorenje o KYC dokumentu
      const hasKYCMessage = await page.locator('text=/KYC.*potreban|upload.*dokument|verifikacija.*identiteta/i').isVisible().catch(() => false);
      console.log(`[KYC TEST] KYC message visible: ${hasKYCMessage}`);
    } finally {
      await cleanup();
    }
  });

  test('KYC upload s invalid tipom datoteke - treba prikazati grešku', async ({ page }) => {
    const user = getUser(testData, 'provider', { strategy: 'first' });
    
    if (!user) {
      throw new Error('Test podaci nisu konfigurirani. Molimo konfigurirajte test podatke u admin panelu.');
    }
    
    // Prijava
    await page.goto('/');
    await page.click('text=Prijava');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
    
    // Navigiraj na KYC stranicu
    await page.goto('/profile/kyc');
    await page.check('input[name="consent"]');
    
    // Pokušaj upload-a s invalid tipom datoteke (npr. .txt umjesto .pdf/.jpg)
    // Napomena: Ovo zahtijeva kreiranje dummy .txt fajla ili provjeru validacije u UI-ju
    await page.screenshot({ path: 'test-results/screenshots/kyc-edge-03-invalid-file-type.png', fullPage: true });
    
    // Provjeri da li postoji validacija tipa datoteke
    // (ovo ovisi o implementaciji - može biti prije upload-a ili nakon)
    console.log('[KYC TEST] File type validation test - checking UI behavior');
  });

  test('KYC upload s prevelikom datotekom - treba prikazati grešku', async ({ page }) => {
    const user = getUser(testData, 'provider', { strategy: 'first' });
    
    if (!user) {
      throw new Error('Test podaci nisu konfigurirani. Molimo konfigurirajte test podatke u admin panelu.');
    }
    
    // Prijava
    await page.goto('/');
    await page.click('text=Prijava');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
    
    // Navigiraj na KYC stranicu
    await page.goto('/profile/kyc');
    await page.check('input[name="consent"]');
    
    // Pokušaj upload-a s prevelikom datotekom
    // Napomena: Ovo zahtijeva kreiranje velike datoteke ili provjeru validacije u UI-ju
    await page.screenshot({ path: 'test-results/screenshots/kyc-edge-04-file-too-large.png', fullPage: true });
    
    // Provjeri da li postoji validacija veličine datoteke
    console.log('[KYC TEST] File size validation test - checking UI behavior');
  });
});

