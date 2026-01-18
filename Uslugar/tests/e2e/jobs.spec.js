import { test, expect } from '@playwright/test';
import testData from '../test-data.json';

/**
 * Automatski testovi za upravljanje poslovima
 */
test.describe('Jobs - Upravljanje Poslovima', () => {
  test.beforeEach(async ({ page }) => {
    // Prijava kao klijent
    await page.goto('/');
    const user = testData.users.client;
    
    await page.click('text=Prijava');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('Objava posla', async ({ page }) => {
    const jobData = testData.testData.job;
    
    // 1. Navigiraj na kreiranje posla
    await page.click('text=Objavi posao');
    
    // 2. Popuni formu
    await page.fill('input[name="title"]', jobData.title);
    await page.fill('textarea[name="description"]', jobData.description);
    await page.selectOption('select[name="category"]', jobData.category);
    await page.fill('input[name="budgetMin"]', jobData.budgetMin.toString());
    await page.fill('input[name="budgetMax"]', jobData.budgetMax.toString());
    await page.selectOption('select[name="city"]', jobData.city);
    await page.selectOption('select[name="urgency"]', jobData.urgency);
    await page.selectOption('select[name="size"]', jobData.size);
    
    // 3. Upload slika (ako postoje)
    if (jobData.images && jobData.images.length > 0) {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(jobData.images);
    }
    
    // 4. Pošalji formu
    await page.click('button[type="submit"]');
    
    // 5. Provjeri da je posao kreiran
    await expect(page.locator('text=Posao uspješno kreiran')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${jobData.title}`)).toBeVisible();
  });

  test('Filtri i pretraga posla', async ({ page }) => {
    // 1. Navigiraj na listu poslova
    await page.goto('/jobs');
    
    // 2. Primijeni filtere
    await page.selectOption('select[name="category"]', 'Električar');
    await page.selectOption('select[name="city"]', 'Zagreb');
    await page.fill('input[name="budgetMin"]', '500');
    await page.fill('input[name="budgetMax"]', '1000');
    await page.click('button:has-text("Traži")');
    
    // 3. Provjeri rezultate
    await expect(page.locator('.job-card')).toHaveCount(0, { timeout: 5000 }); // Može biti 0 ili više
  });

  test('Status posla (OTVOREN, U TIJEKU, ZAVRŠEN, OTKAZAN)', async ({ page }) => {
    // 1. Kreiraj posao (koristi prethodni test)
    // 2. Navigiraj na detalje posla
    await page.goto('/jobs');
    await page.click('.job-card:first-child');
    
    // 3. Promijeni status
    await page.selectOption('select[name="status"]', 'U TIJEKU');
    await page.click('button:has-text("Ažuriraj status")');
    
    // 4. Provjeri da je status ažuriran
    await expect(page.locator('text=U TIJEKU')).toBeVisible({ timeout: 10000 });
  });
});

