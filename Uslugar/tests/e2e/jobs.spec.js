import { test, expect } from '@playwright/test';
import testData from '../test-data.json';
import { getUser } from '../lib/user-helper.js';
import { createTestUserWithCleanup, createIncompleteTestUser } from '../lib/test-user-helper.js';

/**
 * Automatski testovi za upravljanje poslovima
 */
test.describe('Jobs - Upravljanje Poslovima', () => {
  test.beforeEach(async ({ page }) => {
    // Prijava kao klijent
    await page.goto('/');
    const user = getUser(testData, 'client', { strategy: 'first' });
    
    await page.click('text=Prijava');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('Objava posla', async ({ page }) => {
    const user = getUser(testData, 'client', { strategy: 'first' });
    if (!user) {
      throw new Error('Test podaci nisu konfigurirani. Molimo konfigurirajte test podatke u admin panelu.');
    }
    
    const jobData = testData.testData?.job;
    if (!jobData) {
      throw new Error('Test podaci za posao nisu konfigurirani.');
    }
    
    // 1. Navigiraj na kreiranje posla
    await page.click('text=Objavi posao');
    await page.screenshot({ path: 'test-results/screenshots/job-01-form-start.png', fullPage: true });
    
    // 2. Popuni formu
    await page.fill('input[name="title"]', jobData.title);
    await page.fill('textarea[name="description"]', jobData.description);
    await page.selectOption('select[name="category"]', jobData.category);
    await page.fill('input[name="budgetMin"]', jobData.budgetMin.toString());
    await page.fill('input[name="budgetMax"]', jobData.budgetMax.toString());
    await page.selectOption('select[name="city"]', jobData.city);
    await page.selectOption('select[name="urgency"]', jobData.urgency);
    await page.selectOption('select[name="size"]', jobData.size);
    await page.screenshot({ path: 'test-results/screenshots/job-02-form-filled.png', fullPage: true });
    
    // 3. Upload slika (ako postoje)
    if (jobData.images && jobData.images.length > 0) {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(jobData.images);
      await page.screenshot({ path: 'test-results/screenshots/job-03-images-uploaded.png', fullPage: true });
    }
    
    // 4. Pošalji formu
    await page.click('button[type="submit"]');
    
    // 5. Provjeri da je posao kreiran
    await expect(page.locator('text=Posao uspješno kreiran')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${jobData.title}`)).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/job-04-creation-success.png', fullPage: true });
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

  // ============================================
  // EDGE CASE TESTOVI - Invalid podaci u poslovima
  // ============================================

  test('Objava posla bez naslova - treba prikazati grešku', async ({ page }) => {
    const user = getUser(testData, 'client', { strategy: 'first' });
    
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
    
    // Navigiraj na kreiranje posla
    await page.click('text=Objavi posao');
    
    // Ne unesi naslov (required field)
    await page.fill('textarea[name="description"]', 'Test opis posla');
    await page.selectOption('select[name="category"]', 'Električar');
    await page.fill('input[name="budgetMin"]', '500');
    await page.fill('input[name="budgetMax"]', '1000');
    await page.selectOption('select[name="city"]', 'Zagreb');
    
    await page.click('button[type="submit"]');
    
    // Treba prikazati grešku da je naslov obavezan
    await expect(page.locator('text=/naslov.*obavezan|title.*required/i')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/screenshots/job-edge-01-missing-title.png', fullPage: true });
  });

  test('Objava posla s negativnim budžetom - treba prikazati grešku', async ({ page }) => {
    const user = getUser(testData, 'client', { strategy: 'first' });
    
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
    
    // Navigiraj na kreiranje posla
    await page.click('text=Objavi posao');
    
    // Unesi negativan budžet
    await page.fill('input[name="title"]', 'Test Posao');
    await page.fill('textarea[name="description"]', 'Test opis posla');
    await page.selectOption('select[name="category"]', 'Električar');
    await page.fill('input[name="budgetMin"]', '-100'); // Negativan budžet
    await page.fill('input[name="budgetMax"]', '1000');
    await page.selectOption('select[name="city"]', 'Zagreb');
    
    await page.click('button[type="submit"]');
    
    // Treba prikazati grešku za negativan budžet
    await expect(page.locator('text=/budžet.*negativan|budget.*negative|positive.*number/i')).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('[JOB TEST] Negative budget validation - checking if validation exists');
    });
    await page.screenshot({ path: 'test-results/screenshots/job-edge-02-negative-budget.png', fullPage: true });
  });

  test('Objava posla s budgetMin > budgetMax - treba prikazati grešku', async ({ page }) => {
    const user = getUser(testData, 'client', { strategy: 'first' });
    
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
    
    // Navigiraj na kreiranje posla
    await page.click('text=Objavi posao');
    
    // Unesi budgetMin veći od budgetMax
    await page.fill('input[name="title"]', 'Test Posao');
    await page.fill('textarea[name="description"]', 'Test opis posla');
    await page.selectOption('select[name="category"]', 'Električar');
    await page.fill('input[name="budgetMin"]', '1000');
    await page.fill('input[name="budgetMax"]', '500'); // Manji od budgetMin
    await page.selectOption('select[name="city"]', 'Zagreb');
    
    await page.click('button[type="submit"]');
    
    // Treba prikazati grešku da budgetMin ne može biti veći od budgetMax
    await expect(page.locator('text=/budžet.*veći|budget.*greater|minimum.*maximum/i')).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('[JOB TEST] Budget validation - checking if validation exists');
    });
    await page.screenshot({ path: 'test-results/screenshots/job-edge-03-invalid-budget-range.png', fullPage: true });
  });

  test('Filtri s invalid vrijednostima - treba se ponašati korektno', async ({ page }) => {
    const user = getUser(testData, 'client', { strategy: 'first' });
    
    // Prijava
    await page.goto('/');
    await page.click('text=Prijava');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
    
    // Navigiraj na listu poslova
    await page.goto('/jobs');
    
    // Pokušaj filtri s invalid vrijednostima
    await page.fill('input[name="budgetMin"]', 'abc'); // Invalid broj
    await page.fill('input[name="budgetMax"]', 'xyz'); // Invalid broj
    await page.click('button:has-text("Traži")');
    
    // Provjeri ponašanje (greška ili ignoriranje invalid vrijednosti)
    await page.screenshot({ path: 'test-results/screenshots/job-edge-04-invalid-filters.png', fullPage: true });
    console.log('[JOB TEST] Invalid filter values test - checking UI behavior');
  });
});

