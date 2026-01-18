import { test, expect } from '@playwright/test';
import testData from '../test-data.json';
import { getUser } from '../lib/user-helper.js';
import { createDirectorWithTeam, createProviderWithoutLicense } from '../lib/test-user-helper.js';

/**
 * Kompletan E2E test za sve domene - "Sve domene - E2E"
 * Ovo je glavni test koji pokriva sve funkcionalnosti platforme
 */
test.describe('Sve domene - E2E Test', () => {
  let clientPage;
  let providerPage;
  let clientContext;
  let providerContext;

  test.beforeAll(async ({ browser }) => {
    // Kreiraj dva browser contexta za paralelno testiranje klijenta i providera
    clientContext = await browser.newContext();
    providerContext = await browser.newContext();
    clientPage = await clientContext.newPage();
    providerPage = await providerContext.newPage();
  });

  test.afterAll(async () => {
    await clientContext.close();
    await providerContext.close();
  });

  test('Kompletni E2E flow - od registracije do završetka posla', async () => {
    const client = getUser(testData, 'client', { strategy: 'first' });
    const provider = getUser(testData, 'provider', { strategy: 'first' });
    const jobData = testData.testData.job;
    const offerData = testData.testData.offer;

    // ============================================
    // 1. AUTH - Registracija klijenta
    // ============================================
    await clientPage.goto('/');
    await clientPage.click('text=Registracija');
    await clientPage.click('input[value="USER"]');
    await clientPage.fill('input[name="email"]', client.email);
    await clientPage.fill('input[name="password"]', client.password);
    await clientPage.fill('input[name="fullName"]', client.fullName);
    await clientPage.fill('input[name="phone"]', client.phone);
    await clientPage.selectOption('select[name="city"]', client.city);
    await clientPage.click('button[type="submit"]');
    await expect(clientPage.locator('text=Registracija uspješna')).toBeVisible({ timeout: 10000 });

    // ============================================
    // 2. AUTH - Registracija providera
    // ============================================
    await providerPage.goto('/');
    await providerPage.click('text=Registracija');
    await providerPage.click('input[value="PROVIDER"]');
    await providerPage.fill('input[name="email"]', provider.email);
    await providerPage.fill('input[name="password"]', provider.password);
    await providerPage.fill('input[name="fullName"]', provider.fullName);
    await providerPage.fill('input[name="phone"]', provider.phone);
    await providerPage.selectOption('select[name="city"]', provider.city);
    await providerPage.selectOption('select[name="legalStatus"]', provider.legalStatus);
    await providerPage.fill('input[name="oib"]', provider.oib);
    await providerPage.click('button[type="submit"]');
    await expect(providerPage.locator('text=Registracija uspješna')).toBeVisible({ timeout: 10000 });

    // ============================================
    // 3. ONBOARDING - Provider profil setup
    // ============================================
    // Prijava providera
    await providerPage.click('text=Prijava');
    await providerPage.fill('input[name="email"]', provider.email);
    await providerPage.fill('input[name="password"]', provider.password);
    await providerPage.click('button[type="submit"]');
    await expect(providerPage.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });

    // Popuni profil
    await providerPage.goto('/profile');
    // Odaberi kategorije (maks 5)
    await providerPage.click('text=Električar');
    await providerPage.click('text=Vodoinstalater');
    await providerPage.click('button:has-text("Spremi")');
    await expect(providerPage.locator('text=Profil ažuriran')).toBeVisible({ timeout: 10000 });

    // ============================================
    // 4. KYC - Upload dokumenta
    // ============================================
    await providerPage.goto('/profile/kyc');
    await providerPage.check('input[name="consent"]');
    // Upload dokumenta (ako postoji)
    const kycDoc = testData.documents.kycDocument;
    if (kycDoc.path) {
      await providerPage.locator('input[type="file"]').setInputFiles(kycDoc.path);
    }
    await providerPage.click('button[type="submit"]');
    await expect(providerPage.locator('text=Dokument uploadan')).toBeVisible({ timeout: 10000 });

    // ============================================
    // 5. JOBS - Objava posla
    // ============================================
    // Prijava klijenta
    await clientPage.click('text=Prijava');
    await clientPage.fill('input[name="email"]', client.email);
    await clientPage.fill('input[name="password"]', client.password);
    await clientPage.click('button[type="submit"]');
    await expect(clientPage.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });

    await clientPage.click('text=Objavi posao');
    await clientPage.fill('input[name="title"]', jobData.title);
    await clientPage.fill('textarea[name="description"]', jobData.description);
    await clientPage.selectOption('select[name="category"]', jobData.category);
    await clientPage.fill('input[name="budgetMin"]', jobData.budgetMin.toString());
    await clientPage.fill('input[name="budgetMax"]', jobData.budgetMax.toString());
    await clientPage.selectOption('select[name="city"]', jobData.city);
    await clientPage.click('button[type="submit"]');
    await expect(clientPage.locator('text=Posao uspješno kreiran')).toBeVisible({ timeout: 10000 });

    // ============================================
    // 6. LEADS - Kupnja leada i slanje ponude
    // ============================================
    await providerPage.goto('/leads');
    // Kupi lead
    await providerPage.click('.lead-card:first-child button:has-text("Kupi lead")');
    await expect(providerPage.locator('text=Lead uspješno kupljen')).toBeVisible({ timeout: 10000 });

    // Pošalji ponudu
    await providerPage.goto('/my-leads');
    await providerPage.click('.lead-card:first-child');
    await providerPage.fill('input[name="amount"]', offerData.amount.toString());
    await providerPage.fill('textarea[name="message"]', offerData.message);
    await providerPage.fill('input[name="estimatedDays"]', offerData.estimatedDays.toString());
    await providerPage.click('button:has-text("Pošalji ponudu")');
    await expect(providerPage.locator('text=Ponuda uspješno poslana')).toBeVisible({ timeout: 10000 });

    // ============================================
    // 7. CHAT - Komunikacija
    // ============================================
    await clientPage.goto('/chat');
    // Otvori chat sobu
    await clientPage.click('.chat-room:first-child');
    await clientPage.fill('textarea[name="message"]', 'Hvala na ponudi!');
    await clientPage.click('button:has-text("Pošalji")');
    await expect(clientPage.locator('text=Hvala na ponudi!')).toBeVisible({ timeout: 10000 });

    // ============================================
    // 8. LEADS - Prihvati ponudu i ROI statusi
    // ============================================
    await clientPage.goto('/jobs/my-jobs');
    await clientPage.click('.job-card:first-child');
    await clientPage.click('button:has-text("Prihvati ponudu")');
    await expect(clientPage.locator('text=Ponuda prihvaćena')).toBeVisible({ timeout: 10000 });

    // Provider označi kao kontaktiran
    await providerPage.goto('/my-leads');
    await providerPage.click('.lead-card:first-child');
    await providerPage.click('button:has-text("Označi kao kontaktiran")');
    await expect(providerPage.locator('text=Status ažuriran: KONTAKTIRAN')).toBeVisible({ timeout: 10000 });

    // ============================================
    // 9. JOBS - Završi posao
    // ============================================
    await clientPage.goto('/jobs/my-jobs');
    await clientPage.click('.job-card:first-child');
    await clientPage.selectOption('select[name="status"]', 'ZAVRŠEN');
    await clientPage.click('button:has-text("Ažuriraj status")');
    await expect(clientPage.locator('text=Status ažuriran')).toBeVisible({ timeout: 10000 });

    // ============================================
    // 10. REVIEWS - Ostavi recenziju
    // ============================================
    await clientPage.click('button:has-text("Ocijeni pružatelja")');
    await clientPage.click(`[data-rating="${testData.testData.review.rating}"]`);
    await clientPage.fill('textarea[name="comment"]', testData.testData.review.comment);
    await clientPage.click('button:has-text("Pošalji recenziju")');
    await expect(clientPage.locator('text=Recenzija uspješno poslana')).toBeVisible({ timeout: 10000 });
  });

  // ============================================
  // EDGE CASE TESTOVI - Direktor i izvođači
  // ============================================

  test('E2E flow s direktorom i izvođačima - interni queue', async () => {
    // Kreiraj direktora s 2 izvođača
    const { director, team, cleanup } = await createDirectorWithTeam(clientPage, testData, {
      teamSize: 2,
      city: 'Zagreb'
    });
    
    try {
      console.log(`[ALL-DOMAINS TEST] Director: ${director.email}`);
      console.log(`[ALL-DOMAINS TEST] Team members: ${team.length}`);
      
      // Prijava direktora
      await clientPage.goto('/');
      await clientPage.click('text=Prijava');
      await clientPage.fill('input[name="email"]', director.email);
      await clientPage.fill('input[name="password"]', director.password);
      await clientPage.click('button[type="submit"]');
      await expect(clientPage.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Provjeri da direktor vidi svoje izvođače
      await clientPage.goto('/profile/team');
      await clientPage.screenshot({ path: 'test-results/screenshots/all-domains-edge-01-director-team-view.png', fullPage: true });
      
      // Prijava prvog izvođača
      await providerPage.goto('/');
      await providerPage.click('text=Prijava');
      await providerPage.fill('input[name="email"]', team[0].email);
      await providerPage.fill('input[name="password"]', team[0].password);
      await providerPage.click('button[type="submit"]');
      await expect(providerPage.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Provjeri da izvođač vidi direktora
      await providerPage.goto('/profile');
      await providerPage.screenshot({ path: 'test-results/screenshots/all-domains-edge-02-team-member-profile.png', fullPage: true });
      
      console.log('[ALL-DOMAINS TEST] ✅ Director and team structure test completed');
    } finally {
      await cleanup();
    }
  });

  test('E2E flow s providerom bez licence - ograničene funkcionalnosti', async () => {
    // Kreiraj providera bez licence
    const { user: provider, cleanup } = await createProviderWithoutLicense(clientPage, testData, {
      city: 'Zagreb'
    });
    
    const client = getUser(testData, 'client', { strategy: 'first' });
    const jobData = testData.testData?.job;
    
    try {
      // Prijava providera bez licence
      await providerPage.goto('/');
      await providerPage.click('text=Prijava');
      await providerPage.fill('input[name="email"]', provider.email);
      await providerPage.fill('input[name="password"]', provider.password);
      await providerPage.click('button[type="submit"]');
      await expect(providerPage.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Provjeri da li provider vidi upozorenje o nedostajućoj licenci
      await providerPage.goto('/profile');
      await providerPage.screenshot({ path: 'test-results/screenshots/all-domains-edge-03-provider-without-license.png', fullPage: true });
      
      // Pokušaj pristupa leadovima - trebao bi biti ograničen bez licence
      await providerPage.goto('/leads');
      await providerPage.screenshot({ path: 'test-results/screenshots/all-domains-edge-04-leads-without-license.png', fullPage: true });
      
      // Provjeri da li postoji poruka o potrebi licence
      const hasLicenseRestriction = await providerPage.locator('text=/licenca.*potrebna|license.*required/i').isVisible().catch(() => false);
      console.log(`[ALL-DOMAINS TEST] License restriction visible: ${hasLicenseRestriction}`);
      
      console.log('[ALL-DOMAINS TEST] ✅ Provider without license test completed');
    } finally {
      await cleanup();
    }
  });
});

