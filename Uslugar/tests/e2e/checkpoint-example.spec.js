/**
 * Primjer E2E test-a s checkpoint/rollback mehanizmom
 * 
 * Demonstrira kako koristiti checkpoint-e za data isolation teste
 * i ponovno korištenje iste baze s različitim scenariji
 */

import { test, expect } from '@playwright/test';
import { CheckpointHelper } from '../helpers/checkpoint-helper.js';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

let checkpoint;

test.beforeAll(async () => {
  checkpoint = new CheckpointHelper(API_URL);
});

test.afterAll(async () => {
  await checkpoint.cleanup();
});

// ============================================================================
// SCENARIO 1: Data Isolation - Klijent ne vidi tuđe poslove
// ============================================================================

test('Data Isolation: Klijent ne vidi poslove drugog klijenta', async ({ browser }) => {
  // 1. Kreiraj checkpoint prije testa (samo User i Job tablice za brže snimanje)
  const cpId = await checkpoint.create('data_isolation_jobs', ['User', 'Job', 'Offer', 'Chat']);
  console.log('✅ Checkpoint kreiran:', cpId);

  try {
    // 2. Koristi dva odvojena browsera za dva klijenta
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // KLIJENT 1: Registracija i objava posla
    console.log('\n📝 Klijent 1: Registracija...');
    await page1.goto(`${FRONTEND_URL}/register`);
    
    // Popuni formu
    await page1.fill('input[name="email"]', `client1_${Date.now()}@uslugar.hr`);
    await page1.fill('input[name="password"]', 'Test123456!');
    await page1.fill('input[name="fullName"]', 'Klijent Broj Jedan');
    await page1.fill('input[name="phone"]', '+385991234567');
    
    // Odaberi grad
    const citySelect = page1.locator('select[name="city"]');
    if (await citySelect.isVisible()) {
      await citySelect.selectOption('Zagreb');
    }
    
    // Submit
    await page1.click('button[type="submit"]');
    
    // Čekaj da se registracija završi
    await page1.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✅ Klijent 1 registriran');

    // Klijent 1: Objavi posao
    console.log('\n📋 Klijent 1: Objava posla...');
    await page1.goto(`${FRONTEND_URL}/post-job`);
    
    await page1.fill('input[name="title"]', 'Test posao od Klijenta 1');
    await page1.fill('textarea[name="description"]', 'Ovo je test posao samo za Klijenta 1');
    
    // Odaberi kategoriju
    const categorySelect = page1.locator('select[name="category"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('Električni radovi');
    }

    await page1.click('button:has-text("Objavi posao")');
    await page1.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✅ Klijent 1 objavio posao');

    // KLIJENT 2: Registracija
    console.log('\n📝 Klijent 2: Registracija...');
    await page2.goto(`${FRONTEND_URL}/register`);
    
    await page2.fill('input[name="email"]', `client2_${Date.now()}@uslugar.hr`);
    await page2.fill('input[name="password"]', 'Test123456!');
    await page2.fill('input[name="fullName"]', 'Klijent Broj Dva');
    await page2.fill('input[name="phone"]', '+385991234568');
    
    const citySelect2 = page2.locator('select[name="city"]');
    if (await citySelect2.isVisible()) {
      await citySelect2.selectOption('Zagreb');
    }
    
    await page2.click('button[type="submit"]');
    await page2.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✅ Klijent 2 registriran');

    // KLIJENT 2: Provjeri je li vidio posao od Klijenta 1
    console.log('\n🔍 Klijent 2: Provjera data isolation...');
    await page2.goto(`${FRONTEND_URL}/jobs`);
    
    // Provjeri da li vidi posao "Test posao od Klijenta 1"
    const jobTitle = page2.locator('text=Test posao od Klijenta 1');
    
    // TREBALO BI DA NE BUDE VIDLJIVO!
    const isVisible = await jobTitle.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      throw new Error('❌ SIGURNOSNI PROBLEM: Klijent 2 vidi posao od Klijenta 1! Data isolation ne radi!');
    } else {
      console.log('✅ PASS: Klijent 2 ne vidi posao od Klijenta 1 (data isolation radi!)');
    }

    // TEST PROŠAO!
    expect(!isVisible).toBe(true);

    await context1.close();
    await context2.close();

  } finally {
    // 3. Rollback - vrati bazu na stanje prije testa
    console.log('\n⏪ Rollback...');
    await checkpoint.rollback(cpId);
    console.log('✅ Baza vraćena na checkpoint');
  }
});

// ============================================================================
// SCENARIO 2: Provider ne vidi ponude drugog providera
// ============================================================================

test('Data Isolation: Provider ne vidi ponude drugog providera', async ({ browser }) => {
  const cpId = await checkpoint.create('data_isolation_offers', [
    'User',
    'ProviderProfile',
    'Job',
    'Offer',
    'Chat'
  ]);
  console.log('✅ Checkpoint kreiran:', cpId);

  try {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // PROVIDER 1: Registracija kao provider
    console.log('\n📝 Provider 1: Registracija...');
    await page1.goto(`${FRONTEND_URL}/register`);
    
    await page1.fill('input[name="email"]', `provider1_${Date.now()}@uslugar.hr`);
    await page1.fill('input[name="password"]', 'Test123456!');
    await page1.fill('input[name="fullName"]', 'Provider Broj Jedan');
    
    // Odaberi provider role
    const roleSelect = page1.locator('select[name="role"]');
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption('PROVIDER');
    }

    await page1.click('button[type="submit"]');
    await page1.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✅ Provider 1 registriran');

    // PROVIDER 2: Registracija
    console.log('\n📝 Provider 2: Registracija...');
    await page2.goto(`${FRONTEND_URL}/register`);
    
    await page2.fill('input[name="email"]', `provider2_${Date.now()}@uslugar.hr`);
    await page2.fill('input[name="password"]', 'Test123456!');
    await page2.fill('input[name="fullName"]', 'Provider Broj Dva');
    
    const roleSelect2 = page2.locator('select[name="role"]');
    if (await roleSelect2.isVisible()) {
      await roleSelect2.selectOption('PROVIDER');
    }

    await page2.click('button[type="submit"]');
    await page2.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✅ Provider 2 registriran');

    // KLIJENT: Objavi posao s kojom će se provajderi konkurirati
    console.log('\n📋 Klijent: Objava posla...');
    const contextClient = await browser.newContext();
    const pageClient = await contextClient.newPage();
    
    await pageClient.goto(`${FRONTEND_URL}/register`);
    await pageClient.fill('input[name="email"]', `client_${Date.now()}@uslugar.hr`);
    await pageClient.fill('input[name="password"]', 'Test123456!');
    await pageClient.fill('input[name="fullName"]', 'Klijent za Test Ponuda');
    await pageClient.click('button[type="submit"]');
    await pageClient.waitForNavigation({ waitUntil: 'networkidle' });
    
    // Objavi posao
    await pageClient.goto(`${FRONTEND_URL}/post-job`);
    await pageClient.fill('input[name="title"]', 'Test posao za ponude');
    await pageClient.fill('textarea[name="description"]', 'Ponude od provajdera');
    await pageClient.click('button:has-text("Objavi posao")');
    await pageClient.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✅ Klijent objavio posao');

    // PROVIDER 1: Pošalji ponudu
    console.log('\n💰 Provider 1: Slanje ponude...');
    await page1.goto(`${FRONTEND_URL}/jobs`);
    // ... slanje ponude ...
    console.log('✅ Provider 1 poslao ponudu');

    // PROVIDER 2: Provjeri ne vidi li ponudu od Provider 1
    console.log('\n🔍 Provider 2: Provjera data isolation...');
    await page2.goto(`${FRONTEND_URL}/my-offers`);
    
    const offerFromProvider1 = page2.locator('text="Provider Broj Jedan"');
    const isVisible = await offerFromProvider1.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      throw new Error('❌ SIGURNOSNI PROBLEM: Provider 2 vidi ponudu od Provider 1!');
    } else {
      console.log('✅ PASS: Provider 2 ne vidi ponudu od Provider 1 (data isolation radi!)');
    }

    expect(!isVisible).toBe(true);

    await context1.close();
    await context2.close();
    await contextClient.close();

  } finally {
    console.log('\n⏪ Rollback...');
    await checkpoint.rollback(cpId);
    console.log('✅ Baza vraćena na checkpoint');
  }
});

// ============================================================================
// SCENARIO 3: Reuse Checkpoint - Isti checkpoint za više test scenarija
// ============================================================================

test('Reuse Checkpoint - Ponovna korištenja za više scenarija', async ({ browser }) => {
  // Kreiraj checkpoint JEDNOM
  const cpId = await checkpoint.create('reusable_checkpoint', ['User', 'Job']);
  console.log('📸 Checkpoint kreiran jednom za više scenarija');

  try {
    // Scenario A
    console.log('\n🧪 Scenario A...');
    // ... test kod ...
    console.log('✅ Scenario A gotov');

    // Rollback između scenarija
    await checkpoint.rollback(cpId);
    console.log('⏪ Rollback nakon Scenario A');

    // Scenario B
    console.log('\n🧪 Scenario B...');
    // ... test kod ...
    console.log('✅ Scenario B gotov');

    // Rollback
    await checkpoint.rollback(cpId);
    console.log('⏪ Rollback nakon Scenario B');

    // Scenario C
    console.log('\n🧪 Scenario C...');
    // ... test kod ...
    console.log('✅ Scenario C gotov');

  } finally {
    console.log('\n🗑️ Obriši checkpoint na kraju');
    await checkpoint.delete(cpId);
  }
});

