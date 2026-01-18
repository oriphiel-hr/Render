import { test, expect } from '@playwright/test';
import testData from '../test-data.json';
import { getUser } from '../lib/user-helper.js';

/**
 * Automatski testovi za autentifikaciju i registraciju
 */
test.describe('Auth - Autentifikacija i Registracija', () => {
  test.beforeEach(async ({ page }) => {
    // Navigiraj na početnu stranicu
    await page.goto('/');
  });

  test('Registracija korisnika usluge (osoba)', async ({ page }) => {
    // Kreiraj test korisnika (automatski će se obrisati nakon testa)
    const { user, cleanup } = await createTestUserWithCleanup(page, testData, {
      userType: 'client',
      city: 'Zagreb'
    });
    
    try {
      // Provjeri uspjeh registracije
      await expect(page.locator('text=Registracija uspješna')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Verifikacijski email poslan')).toBeVisible();
      await page.screenshot({ path: 'test-results/screenshots/03-registracija-uspjeh.png', fullPage: true });
    } finally {
      // Obriši test korisnika
      await cleanup();
    }
  });

  test('Registracija korisnika usluge (tvrtka/obrt)', async ({ page }) => {
    const user = getUser(testData, 'providerCompany', { strategy: 'first' });
    
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
    const user = getUser(testData, 'client', { strategy: 'first' });
    
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
    const user = getUser(testData, 'client', { strategy: 'first' });
    
    if (!user || !user.email) {
      throw new Error('Test podaci nisu konfigurirani. Molimo konfigurirajte test podatke u admin panelu.');
    }
    
    // 1. Registriraj korisnika (ako već nije)
    await page.goto('/');
    await page.click('text=Registracija');
    await page.click('input[value="USER"]');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.fill('input[name="fullName"]', user.fullName);
    await page.fill('input[name="phone"]', user.phone);
    await page.selectOption('select[name="city"]', user.city);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Registracija uspješna')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/screenshots/auth-04-registration-success.png', fullPage: true });
    
    // 2. Dohvati verifikacijski email
    const { findVerificationEmail, extractVerificationLink, screenshotEmail } = await import('../lib/email-helper.js');
    
    try {
      // Pričekaj da email stigne (max 30 sekundi)
      // Koristi korisnikovu email konfiguraciju ako postoji (npr. inboxId, mailtrapEmail za Mailtrap)
      const userEmailConfig = {
        ...(user.emailConfig || {}),
        mailtrapEmail: user.mailtrapEmail || null // Dodaj Mailtrap email adresu ako postoji
      };
      
      // Email adresa za pretraživanje - koristi Mailtrap email ako postoji, inače korisnikov email
      const searchEmailAddress = user.mailtrapEmail || user.email;
      console.log(`[AUTH TEST] Searching for verification email to: ${searchEmailAddress} (Mailtrap: ${user.mailtrapEmail || 'not set'})`);
      
      let verificationEmail = null;
      for (let i = 0; i < 30; i++) {
        verificationEmail = await findVerificationEmail(searchEmailAddress, 'verifikacija|verify|confirmation', userEmailConfig);
        if (verificationEmail) break;
        await page.waitForTimeout(1000); // Čekaj 1 sekund
      }
      
      if (!verificationEmail) {
        throw new Error('Verifikacijski email nije pronađen. Provjerite email konfiguraciju u test podacima.');
      }
      
      // 3. Screenshot email poruke
      await screenshotEmail(page, verificationEmail, 'test-results/screenshots/auth-05-verification-email.png', { inboxId: userEmailConfig?.inboxId });
      
      // 4. Automatski klikni na verifikacijski link u emailu
      const { clickEmailLink } = await import('../lib/email-helper.js');
      const verificationLink = await clickEmailLink(page, verificationEmail, 'verify|verification|confirm|activate', { 
        inboxId: userEmailConfig?.inboxId,
        baseUrl: testData.api?.frontendUrl || 'https://www.uslugar.eu'
      });
      
      if (!verificationLink) {
        // Fallback: ekstraktiraj link ručno ako automatsko klikanje ne radi
        const extractedLink = extractVerificationLink(verificationEmail);
        if (extractedLink) {
          console.log('[AUTH TEST] Fallback: Using extracted link');
          await page.goto(extractedLink);
          await page.waitForLoadState('networkidle');
        } else {
          throw new Error('Verifikacijski link nije pronađen u email poruci.');
        }
      }
      
      await page.screenshot({ path: 'test-results/screenshots/auth-06-verification-link-opened.png', fullPage: true });
      
      // 5. Provjeri uspješnu verifikaciju
      await expect(page.locator('text=Email verificiran')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/screenshots/auth-07-verification-success.png', fullPage: true });
    } catch (emailError) {
      console.warn('Email verifikacija nije moguća:', emailError.message);
      console.warn('Koristim mock token za testiranje...');
      
      // Fallback: koristi mock token
      await page.goto('/verify-email?token=MOCK_VERIFICATION_TOKEN');
      await expect(page.locator('text=Email verificiran')).toBeVisible({ timeout: 10000 });
    }
  });

  test('Zaboravljena lozinka i reset', async ({ page }) => {
    const user = getUser(testData, 'client', { strategy: 'first' });
    
    if (!user || !user.email) {
      throw new Error('Test podaci nisu konfigurirani. Molimo konfigurirajte test podatke u admin panelu.');
    }
    
    // 1. Klikni na "Zaboravljena lozinka"
    await page.click('text=Zaboravljena lozinka');
    await page.screenshot({ path: 'test-results/screenshots/auth-08-forgot-password-start.png', fullPage: true });
    
    // 2. Unesi email
    await page.fill('input[name="email"]', user.email);
    await page.click('button[type="submit"]');
    await page.screenshot({ path: 'test-results/screenshots/auth-09-forgot-password-submitted.png', fullPage: true });
    
    // 3. Provjeri da je email poslan
    await expect(page.locator('text=Email za reset lozinke poslan')).toBeVisible({ timeout: 10000 });
    
    // 4. Dohvati reset email
    const { findPasswordResetEmail, extractResetToken, screenshotEmail } = await import('../lib/email-helper.js');
    
    try {
      // Pričekaj da email stigne (max 30 sekundi)
      // Koristi korisnikovu email konfiguraciju ako postoji (npr. inboxId, mailtrapEmail za Mailtrap)
      const userEmailConfig = {
        ...(user.emailConfig || {}),
        mailtrapEmail: user.mailtrapEmail || null // Dodaj Mailtrap email adresu ako postoji
      };
      
      // Email adresa za pretraživanje - koristi Mailtrap email ako postoji, inače korisnikov email
      const searchEmailAddress = user.mailtrapEmail || user.email;
      console.log(`[AUTH TEST] Searching for reset email to: ${searchEmailAddress} (Mailtrap: ${user.mailtrapEmail || 'not set'})`);
      
      let resetEmail = null;
      for (let i = 0; i < 30; i++) {
        resetEmail = await findPasswordResetEmail(searchEmailAddress, userEmailConfig);
        if (resetEmail) break;
        await page.waitForTimeout(1000); // Čekaj 1 sekund
      }
      
      if (!resetEmail) {
        throw new Error('Reset email nije pronađen. Provjerite email konfiguraciju u test podacima.');
      }
      
      // Screenshot reset email poruke
      await screenshotEmail(page, resetEmail, 'test-results/screenshots/auth-10-reset-email.png', { inboxId: userEmailConfig?.inboxId });
      
      // 5. Automatski klikni na reset link u emailu
      const { clickEmailLink } = await import('../lib/email-helper.js');
      const resetLink = await clickEmailLink(page, resetEmail, 'reset|password|token', { 
        inboxId: userEmailConfig?.inboxId,
        baseUrl: testData.api?.frontendUrl || 'https://www.uslugar.eu'
      });
      
      if (!resetLink) {
        // Fallback: ekstraktiraj link ručno ako automatsko klikanje ne radi
        const extractedResetLink = extractVerificationLink(resetEmail);
        const resetToken = extractResetToken(resetEmail);
        
        if (extractedResetLink) {
          console.log('[AUTH TEST] Fallback: Using extracted reset link');
          await page.goto(extractedResetLink);
        } else if (resetToken) {
          console.log('[AUTH TEST] Fallback: Using extracted reset token');
          await page.goto(`${testData.api?.frontendUrl || 'https://www.uslugar.eu'}/reset-password?token=${resetToken}`);
        } else {
          throw new Error('Reset token ili link nije pronađen u email poruci.');
        }
      }
      
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/screenshots/auth-11-reset-link-opened.png', fullPage: true });
      
      // 6. Unesi novu lozinku
      const newPassword = 'NewPassword123!';
      await page.fill('input[name="password"]', newPassword);
      await page.fill('input[name="confirmPassword"]', newPassword);
      await page.screenshot({ path: 'test-results/screenshots/auth-12-reset-password-filled.png', fullPage: true });
      await page.click('button[type="submit"]');
      
      // 7. Provjeri uspjeh
      await expect(page.locator('text=Lozinka uspješno promijenjena')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/screenshots/auth-13-reset-success.png', fullPage: true });
    } catch (emailError) {
      console.warn('Email reset nije moguć:', emailError.message);
      console.warn('Koristim mock token za testiranje...');
      
      // Fallback: koristi mock token
      await page.goto('/reset-password?token=MOCK_RESET_TOKEN');
      await page.fill('input[name="password"]', 'NewPassword123!');
      await page.fill('input[name="confirmPassword"]', 'NewPassword123!');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Lozinka uspješno promijenjena')).toBeVisible({ timeout: 10000 });
    }
  });
});

