import { test, expect } from '@playwright/test';
import testData from '../test-data.json';

/**
 * Automatski testovi za autentifikaciju i registraciju
 */
test.describe('Auth - Autentifikacija i Registracija', () => {
  test.beforeEach(async ({ page }) => {
    // Navigiraj na početnu stranicu
    await page.goto('/');
  });

  test('Registracija korisnika usluge (osoba)', async ({ page }) => {
    const user = testData.users.client;
    
    // 1. Navigiraj na registraciju
    await page.click('text=Registracija');
    
    // 2. Unesi podatke
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.fill('input[name="fullName"]', user.fullName);
    await page.fill('input[name="phone"]', user.phone);
    await page.selectOption('select[name="city"]', user.city);
    await page.click('input[value="USER"]'); // Odaberi ulogu korisnika
    
    // 3. Pošalji formu
    await page.click('button[type="submit"]');
    
    // 4. Provjeri uspjeh
    await expect(page.locator('text=Registracija uspješna')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Verifikacijski email poslan')).toBeVisible();
  });

  test('Registracija korisnika usluge (tvrtka/obrt)', async ({ page }) => {
    const user = testData.users.providerCompany;
    
    await page.click('text=Registracija');
    await page.click('input[value="PROVIDER"]');
    
    // Unesi osnovne podatke
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.fill('input[name="fullName"]', user.fullName);
    await page.fill('input[name="phone"]', user.phone);
    await page.selectOption('select[name="city"]', user.city);
    
    // Unesi pravni status i OIB
    await page.selectOption('select[name="legalStatus"]', user.legalStatus);
    await page.fill('input[name="oib"]', user.oib);
    await page.fill('input[name="companyName"]', user.companyName);
    
    await page.click('button[type="submit"]');
    
    // Provjeri validaciju
    await expect(page.locator('text=Registracija uspješna')).toBeVisible({ timeout: 10000 });
  });

  test('Prijava i odjava', async ({ page }) => {
    const user = testData.users.client;
    
    // Prijava
    await page.click('text=Prijava');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    
    // Provjeri da je prijava uspješna
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
    
    // Odjava
    await page.click('button:has-text("Odjava")');
    await expect(page.locator('text=Prijava')).toBeVisible();
  });

  test('Verifikacija emaila', async ({ page, context }) => {
    // Ovo zahtijeva pristup emailu - mock ili test email servis
    const user = testData.users.client;
    
    // Simulacija: klik na link za verifikaciju
    // U stvarnom scenariju, trebalo bi pristupiti emailu i ekstraktirati link
    await page.goto('/verify-email?token=MOCK_VERIFICATION_TOKEN');
    
    // Provjeri uspješnu verifikaciju
    await expect(page.locator('text=Email verificiran')).toBeVisible({ timeout: 10000 });
  });

  test('Zaboravljena lozinka i reset', async ({ page }) => {
    const user = testData.users.client;
    
    // 1. Klikni na "Zaboravljena lozinka"
    await page.click('text=Zaboravljena lozinka');
    
    // 2. Unesi email
    await page.fill('input[name="email"]', user.email);
    await page.click('button[type="submit"]');
    
    // 3. Provjeri da je email poslan
    await expect(page.locator('text=Email za reset lozinke poslan')).toBeVisible({ timeout: 10000 });
    
    // 4. Reset lozinke (zahtijeva pristup emailu)
    // U stvarnom scenariju, trebalo bi pristupiti emailu i ekstraktirati reset token
    await page.goto('/reset-password?token=MOCK_RESET_TOKEN');
    await page.fill('input[name="password"]', 'NewPassword123!');
    await page.fill('input[name="confirmPassword"]', 'NewPassword123!');
    await page.click('button[type="submit"]');
    
    // 5. Provjeri uspjeh
    await expect(page.locator('text=Lozinka uspješno promijenjena')).toBeVisible({ timeout: 10000 });
  });
});

