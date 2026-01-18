import { test, expect } from '@playwright/test';
import testData from '../test-data.json';

/**
 * Automatski testovi za KYC verifikaciju
 */
test.describe('KYC - Verifikacija Identiteta', () => {
  test.beforeEach(async ({ page }) => {
    // Prijava kao provider
    await page.goto('/');
    const user = testData.users.provider;
    
    await page.click('text=Prijava');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('KYC: Upload dokumenta', async ({ page }) => {
    if (!testData.users || !testData.users.provider) {
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
    const user = testData.users.provider;
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
});

