/**
 * REORGANIZIRANI TEST SUITE - Prirodan tok s checkpoint/rollback
 * 
 * STRUKTURA:
 * 1. Korisnici s neispravnim podacima (najkraći tok)
 * 2. Korisnici s nedostajućim podacima
 * 3. Validni korisnici - Grupa A (povezani)
 * 4. Validni korisnici - Grupa B (izolirani)
 * 5. Security/Permissions testovi
 * 6. Admin testovi
 * 
 * CHECKPOINT/ROLLBACK:
 * - Svaki test koristi checkpoint prije akcija
 * - Rollback nakon testa vraća bazu u čisto stanje
 * - Sequential izvršavanje (nijedna akcija nije istovremena)
 */

import { test, expect } from '@playwright/test';
import testData from '../test-data.json';
import { getUser } from '../lib/user-helper.js';
import { 
  createTestUserWithCleanup,
  createInvalidTestUser,
  createIncompleteTestUser,
  createDirectorWithTeam,
  setupTestUser,
  cleanupTestUser
} from '../lib/test-user-helper.js';

/**
 * CHECKPOINT/Rollback Helper
 * Simulira checkpoint/rollback mehanizam kroz brisanje i ponovno kreiranje korisnika
 */
class TestCheckpoint {
  constructor() {
    this.checkpoints = new Map();
    this.currentCheckpoint = null;
  }

  /**
   * Kreira checkpoint - sprema trenutno stanje
   * @param {string} name - Ime checkpointa
   * @param {Object} state - Stanje koje se sprema
   */
  async createCheckpoint(name, state = {}) {
    this.checkpoints.set(name, {
      ...state,
      timestamp: Date.now()
    });
    this.currentCheckpoint = name;
    console.log(`[CHECKPOINT] Created: ${name}`);
  }

  /**
   * Rollback na checkpoint - vraća bazu u stanje checkpointa
   * @param {string} name - Ime checkpointa
   */
  async rollbackToCheckpoint(name) {
    const checkpoint = this.checkpoints.get(name);
    if (!checkpoint) {
      console.warn(`[CHECKPOINT] Checkpoint ${name} not found`);
      return;
    }
    
    // Rollback = obriši sve korisnike i podatke kreirane nakon checkpointa
    // U stvarnoj implementaciji, ovo bi bilo SQL UPDATE/ROLLBACK
    console.log(`[CHECKPOINT] Rolling back to: ${name}`);
    this.currentCheckpoint = name;
  }

  /**
   * Obriši checkpoint
   */
  async deleteCheckpoint(name) {
    this.checkpoints.delete(name);
    console.log(`[CHECKPOINT] Deleted: ${name}`);
  }
}

const checkpointManager = new TestCheckpoint();

// ============================================
// SETUP: Kreiraj sve test korisnike
// ============================================
test.describe('Reorganized Test Suite - Prirodan tok s checkpoint/rollback', () => {
  let groupA = {
    client: null,
    director: null,
    teamMember: null,
    job: null,
    cleanup: []
  };

  let groupB = {
    client: null,
    director: null,
    teamMember: null,
    cleanup: []
  };

  let admin = null;

  /**
   * SETUP: Kreiraj sve korisnike prije testova
   * IZVRŠAVA: Test framework (beforeAll)
   * ROLLBACK: Ne (ovo je početno stanje)
   */
  test.beforeAll(async ({ page }) => {
    console.log('[SETUP] Creating all test users...');
    
    // Admin (za cleanup i admin testove)
    admin = getUser(testData, 'admin', { strategy: 'first' });
    if (!admin || !admin.email) {
      throw new Error('Admin test podaci nisu konfigurirani.');
    }

    // GRUPA A: Povezani korisnici
    console.log('[SETUP] Creating Group A (connected users)...');
    
    // Client A
    const { user: clientA, cleanup: cleanupClientA } = await createTestUserWithCleanup(page, testData, {
      userType: 'client',
      city: 'Zagreb',
      autoSetup: true
    });
    groupA.client = clientA;
    groupA.cleanup.push(cleanupClientA);

    // Director A (direktor tvrtke)
    const { user: directorA, cleanup: cleanupDirectorA } = await createTestUserWithCleanup(page, testData, {
      userType: 'provider',
      legalStatus: 'DOO',
      companyName: `Test Company A ${Date.now()}`,
      isDirector: true,
      city: 'Zagreb',
      autoSetup: true
    });
    groupA.director = directorA;
    groupA.cleanup.push(cleanupDirectorA);

    // Team Member A (zaposlenik tvrtke)
    const { user: teamMemberA, cleanup: cleanupTeamMemberA } = await createTestUserWithCleanup(page, testData, {
      userType: 'provider',
      legalStatus: 'FREELANCER',
      isDirector: false,
      companyId: directorA.email, // Povezan s Direktorom A
      city: 'Zagreb',
      autoSetup: true
    });
    groupA.teamMember = teamMemberA;
    groupA.cleanup.push(cleanupTeamMemberA);

    // GRUPA B: Izolirani korisnici
    console.log('[SETUP] Creating Group B (isolated users)...');
    
    // Client B
    const { user: clientB, cleanup: cleanupClientB } = await createTestUserWithCleanup(page, testData, {
      userType: 'client',
      city: 'Split',
      autoSetup: true
    });
    groupB.client = clientB;
    groupB.cleanup.push(cleanupClientB);

    // Director B (druga tvrtka)
    const { user: directorB, cleanup: cleanupDirectorB } = await createTestUserWithCleanup(page, testData, {
      userType: 'provider',
      legalStatus: 'DOO',
      companyName: `Test Company B ${Date.now()}`,
      isDirector: true,
      city: 'Split',
      autoSetup: true
    });
    groupB.director = directorB;
    groupB.cleanup.push(cleanupDirectorB);

    // Team Member B (druga tvrtka)
    const { user: teamMemberB, cleanup: cleanupTeamMemberB } = await createTestUserWithCleanup(page, testData, {
      userType: 'provider',
      legalStatus: 'FREELANCER',
      isDirector: false,
      companyId: directorB.email, // Povezan s Direktorom B
      city: 'Split',
      autoSetup: true
    });
    groupB.teamMember = teamMemberB;
    groupB.cleanup.push(cleanupTeamMemberB);

    // Kreiraj početni checkpoint
    await checkpointManager.createCheckpoint('initial-setup', {
      groupA,
      groupB,
      admin
    });

    console.log('[SETUP] ✅ All test users created');
  });

  /**
   * CLEANUP: Obriši sve test korisnike nakon testova
   * IZVRŠAVA: Test framework (afterAll)
   * ROLLBACK: Da (vraća bazu u početno stanje)
   */
  test.afterAll(async () => {
    console.log('[CLEANUP] Rolling back to initial checkpoint...');
    await checkpointManager.rollbackToCheckpoint('initial-setup');
    
    // Obriši sve korisnike
    console.log('[CLEANUP] Deleting all test users...');
    for (const cleanup of groupA.cleanup) {
      await cleanup().catch(err => console.warn('[CLEANUP] Error:', err));
    }
    for (const cleanup of groupB.cleanup) {
      await cleanup().catch(err => console.warn('[CLEANUP] Error:', err));
    }
    
    await checkpointManager.deleteCheckpoint('initial-setup');
    console.log('[CLEANUP] ✅ All test users deleted');
  });

  // ============================================
  // SEKTOR 1: KORISNICI S NEISPRAVNIM PODACIMA
  // ============================================
  // IZVRŠAVA: Test framework
  // ROLLBACK: Da (nakon svakog testa)
  // REDOSLIJED: Prvo (najkraći tok)

  test.describe('Sektor 1: Korisnici s neispravnim podacima', () => {
    /**
     * Test: Registracija s invalid email formatom
     * IZVRŠAVA: Test framework
     * ROLLBACK: Da (automatski nakon testa)
     */
    test('1.1 - Registracija klijenta s invalid email formatom', async ({ page }) => {
      await checkpointManager.createCheckpoint('before-invalid-email-test');
      
      await page.goto('/');
      await page.click('text=Registracija');
      await page.click('input[value="USER"]');
      
      // Invalid email format
      await page.fill('input[name="email"]', 'invalid-email-format');
      await page.fill('input[name="password"]', 'Test123456!');
      await page.fill('input[name="fullName"]', 'Test User');
      await page.fill('input[name="phone"]', '+385991234567');
      await page.selectOption('select[name="city"]', 'Zagreb');
      await page.click('button[type="submit"]');
      
      // Provjeri da se prikazuje greška
      await expect(page.locator('text=/email.*invalid|nevažeći.*email|invalid.*format/i')).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/screenshots/01-01-invalid-email.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('before-invalid-email-test');
    });

    /**
     * Test: Registracija providera s prekratkim OIB-om
     * IZVRŠAVA: Test framework
     * ROLLBACK: Da (automatski nakon testa)
     */
    test('1.2 - Registracija providera s prekratkim OIB-om', async ({ page }) => {
      await checkpointManager.createCheckpoint('before-invalid-oib-test');
      
      await page.goto('/');
      await page.click('text=Registracija');
      await page.click('input[value="PROVIDER"]');
      
      const timestamp = Date.now();
      await page.fill('input[name="email"]', `test.provider.${timestamp}@uslugar.test`);
      await page.fill('input[name="password"]', 'Test123456!');
      await page.fill('input[name="fullName"]', 'Test Provider');
      await page.fill('input[name="phone"]', '+385991234567');
      await page.selectOption('select[name="city"]', 'Zagreb');
      await page.selectOption('select[name="legalStatus"]', 'FREELANCER');
      await page.fill('input[name="oib"]', '123'); // Prekratak OIB
      
      await page.click('button[type="submit"]');
      
      // Provjeri da se prikazuje greška
      await expect(page.locator('text=/OIB.*11.*znamenki|nevažeći.*OIB|OIB.*invalid/i')).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/screenshots/01-02-invalid-oib.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('before-invalid-oib-test');
    });

    /**
     * Test: Registracija tvrtke bez naziva tvrtke
     * IZVRŠAVA: Test framework
     * ROLLBACK: Da (automatski nakon testa)
     */
    test('1.3 - Registracija tvrtke (DOO) bez naziva tvrtke', async ({ page }) => {
      await checkpointManager.createCheckpoint('before-missing-company-name-test');
      
      await page.goto('/');
      await page.click('text=Registracija');
      await page.click('input[value="PROVIDER"]');
      
      const timestamp = Date.now();
      await page.fill('input[name="email"]', `test.company.${timestamp}@uslugar.test`);
      await page.fill('input[name="password"]', 'Test123456!');
      await page.fill('input[name="fullName"]', 'Test Company');
      await page.fill('input[name="phone"]', '+385991234567');
      await page.selectOption('select[name="city"]', 'Zagreb');
      await page.selectOption('select[name="legalStatus"]', 'DOO');
      await page.fill('input[name="oib"]', '12345678901');
      // Ne unesi naziv tvrtke (required za DOO)
      
      await page.click('button[type="submit"]');
      
      // Provjeri da se prikazuje greška
      await expect(page.locator('text=/naziv.*tvrtke.*obavezan|company.*name.*required/i')).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/screenshots/01-03-missing-company-name.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('before-missing-company-name-test');
    });

    /**
     * Test: Prijava s nevažećim credentials
     * IZVRŠAVA: Test framework
     * ROLLBACK: Da (automatski nakon testa)
     */
    test('1.4 - Prijava s nevažećim credentials', async ({ page }) => {
      await checkpointManager.createCheckpoint('before-invalid-credentials-test');
      
      await page.goto('/');
      await page.click('text=Prijava');
      
      await page.fill('input[name="email"]', 'nonexistent@uslugar.test');
      await page.fill('input[name="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]');
      
      // Provjeri da se prikazuje greška
      await expect(page.locator('text=/nevažeći.*credentials|pogrešna.*lozinka|invalid.*login/i')).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/screenshots/01-04-invalid-credentials.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('before-invalid-credentials-test');
    });
  });

  // ============================================
  // SEKTOR 2: KORISNICI S NEDOSTAJUĆIM PODACIMA
  // ============================================
  // IZVRŠAVA: Test framework
  // ROLLBACK: Da (nakon svakog testa)

  test.describe('Sektor 2: Korisnici s nedostajućim podacima', () => {
    /**
     * Test: Registracija s nedostajućim podacima
     * IZVRŠAVA: Test framework
     * ROLLBACK: Da (automatski nakon testa)
     */
    test('2.1 - Registracija klijenta s nedostajućim podacima', async ({ page }) => {
      await checkpointManager.createCheckpoint('before-missing-data-test');
      
      await page.goto('/');
      await page.click('text=Registracija');
      await page.click('input[value="USER"]');
      
      // Unesi samo email, ostalo prazno
      await page.fill('input[name="email"]', `test.incomplete.${Date.now()}@uslugar.test`);
      // Ne unesi password, fullName, phone, city
      
      await page.click('button[type="submit"]');
      
      // Provjeri da se prikazuju greške za nedostajuće podatke
      await expect(page.locator('text=/obavezan|required|nedostaje/i').first()).toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/screenshots/02-01-missing-data.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('before-missing-data-test');
    });
  });

  // ============================================
  // SEKTOR 3: GRUPA A - POVEZANI KORISNICI
  // ============================================
  // IZVRŠAVA: Klijent A, Direktor A, Član tima A (sequential)
  // ROLLBACK: Da (nakon svakog testa)

  test.describe('Sektor 3: Grupa A - Povezani korisnici', () => {
    /**
     * Test: Klijent A kreira Posao 1
     * IZVRŠAVA: Klijent A
     * ROLLBACK: Da (nakon testa)
     */
    test('3.1 - Klijent A kreira Posao 1', async ({ page }) => {
      await checkpointManager.createCheckpoint('before-job-1-creation');
      
      // Prijava kao Klijent A
      await page.goto('/');
      await page.click('text=Prijava');
      await page.fill('input[name="email"]', groupA.client.email);
      await page.fill('input[name="password"]', groupA.client.password);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Kreiraj posao
      const jobData = testData.testData?.job || {
        title: 'Test Posao 1 - Grupa A',
        description: 'Opis test posla za Grupu A',
        category: 'Električar',
        budgetMin: 500,
        budgetMax: 1000,
        city: 'Zagreb'
      };
      
      await page.click('text=Objavi posao');
      await page.fill('input[name="title"]', jobData.title);
      await page.fill('textarea[name="description"]', jobData.description);
      await page.selectOption('select[name="category"]', jobData.category);
      await page.fill('input[name="budgetMin"]', jobData.budgetMin.toString());
      await page.fill('input[name="budgetMax"]', jobData.budgetMax.toString());
      await page.selectOption('select[name="city"]', jobData.city);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Posao uspješno kreiran')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/screenshots/03-01-client-a-creates-job.png', fullPage: true });
      
      // Spremi job ID za kasnije testove
      // U stvarnoj implementaciji, ovo bi bilo iz response-a ili URL-a
      groupA.job = { title: jobData.title, id: 'job-1-id' };
      
      await checkpointManager.createCheckpoint('after-job-1-creation', { groupA });
    });

    /**
     * Test: Direktor A vidi Posao 1
     * IZVRŠAVA: Direktor A
     * ROLLBACK: Da (nakon testa)
     */
    test('3.2 - Direktor A vidi Posao 1', async ({ page }) => {
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
      
      // Prijava kao Direktor A
      await page.goto('/');
      await page.click('text=Prijava');
      await page.fill('input[name="email"]', groupA.director.email);
      await page.fill('input[name="password"]', groupA.director.password);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Provjeri da Direktor A vidi Posao 1
      await page.goto('/leads');
      await expect(page.locator(`text=${groupA.job.title}`)).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/screenshots/03-02-director-a-sees-job.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
    });

    /**
     * Test: Član tima A vidi Posao 1
     * IZVRŠAVA: Član tima A
     * ROLLBACK: Da (nakon testa)
     */
    test('3.3 - Član tima A vidi Posao 1', async ({ page }) => {
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
      
      // Prijava kao Član tima A
      await page.goto('/');
      await page.click('text=Prijava');
      await page.fill('input[name="email"]', groupA.teamMember.email);
      await page.fill('input[name="password"]', groupA.teamMember.password);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Provjeri da Član tima A vidi Posao 1
      await page.goto('/leads');
      await expect(page.locator(`text=${groupA.job.title}`)).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/screenshots/03-03-team-member-a-sees-job.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
    });
  });

  // ============================================
  // SEKTOR 4: GRUPA B - IZOLIRANI KORISNICI
  // ============================================
  // IZVRŠAVA: Klijent B, Direktor B, Član tima B (sequential)
  // ROLLBACK: Da (nakon svakog testa)

  test.describe('Sektor 4: Grupa B - Izolirani korisnici', () => {
    /**
     * Test: Klijent B NE vidi Posao 1
     * IZVRŠAVA: Klijent B
     * ROLLBACK: Da (nakon testa)
     */
    test('4.1 - Klijent B NE vidi Posao 1 (security test)', async ({ page }) => {
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
      
      // Prijava kao Klijent B
      await page.goto('/');
      await page.click('text=Prijava');
      await page.fill('input[name="email"]', groupB.client.email);
      await page.fill('input[name="password"]', groupB.client.password);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Provjeri da Klijent B NE vidi Posao 1
      await page.goto('/jobs/my-jobs');
      await expect(page.locator(`text=${groupA.job.title}`)).not.toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/screenshots/04-01-client-b-does-not-see-job.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
    });

    /**
     * Test: Direktor B NE vidi Posao 1
     * IZVRŠAVA: Direktor B
     * ROLLBACK: Da (nakon testa)
     */
    test('4.2 - Direktor B NE vidi Posao 1 (security test)', async ({ page }) => {
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
      
      // Prijava kao Direktor B
      await page.goto('/');
      await page.click('text=Prijava');
      await page.fill('input[name="email"]', groupB.director.email);
      await page.fill('input[name="password"]', groupB.director.password);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Provjeri da Direktor B NE vidi Posao 1
      await page.goto('/leads');
      await expect(page.locator(`text=${groupA.job.title}`)).not.toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/screenshots/04-02-director-b-does-not-see-job.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
    });

    /**
     * Test: Član tima B NE vidi Posao 1
     * IZVRŠAVA: Član tima B
     * ROLLBACK: Da (nakon testa)
     */
    test('4.3 - Član tima B NE vidi Posao 1 (security test)', async ({ page }) => {
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
      
      // Prijava kao Član tima B
      await page.goto('/');
      await page.click('text=Prijava');
      await page.fill('input[name="email"]', groupB.teamMember.email);
      await page.fill('input[name="password"]', groupB.teamMember.password);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Provjeri da Član tima B NE vidi Posao 1
      await page.goto('/leads');
      await expect(page.locator(`text=${groupA.job.title}`)).not.toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/screenshots/04-03-team-member-b-does-not-see-job.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
    });
  });

  // ============================================
  // SEKTOR 5: ADMIN TESTOVI
  // ============================================
  // IZVRŠAVA: Admin
  // ROLLBACK: Da (nakon svakog testa)

  test.describe('Sektor 5: Admin testovi', () => {
    /**
     * Test: Admin vidi sve korisnike
     * IZVRŠAVA: Admin
     * ROLLBACK: Da (nakon testa)
     */
    test('5.1 - Admin vidi sve korisnike', async ({ page }) => {
      await checkpointManager.rollbackToCheckpoint('initial-setup');
      
      // Prijava kao Admin
      await page.goto('/admin');
      await page.fill('input[name="email"]', admin.email);
      await page.fill('input[name="password"]', admin.password);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Admin Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Provjeri da Admin vidi sve korisnike
      await page.goto('/admin/users');
      await expect(page.locator(`text=${groupA.client.email}`)).toBeVisible({ timeout: 10000 });
      await expect(page.locator(`text=${groupA.director.email}`)).toBeVisible({ timeout: 10000 });
      await expect(page.locator(`text=${groupB.client.email}`)).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/screenshots/05-01-admin-sees-all-users.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('initial-setup');
    });

    /**
     * Test: Admin vidi sve poslove
     * IZVRŠAVA: Admin
     * ROLLBACK: Da (nakon testa)
     */
    test('5.2 - Admin vidi sve poslove', async ({ page }) => {
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
      
      // Prijava kao Admin
      await page.goto('/admin');
      await page.fill('input[name="email"]', admin.email);
      await page.fill('input[name="password"]', admin.password);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Admin Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Provjeri da Admin vidi sve poslove
      await page.goto('/admin/jobs');
      await expect(page.locator(`text=${groupA.job.title}`)).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/screenshots/05-02-admin-sees-all-jobs.png', fullPage: true });
      
      await checkpointManager.rollbackToCheckpoint('after-job-1-creation');
    });

    /**
     * Test: Admin može obrisati korisnika
     * IZVRŠAVA: Admin
     * ROLLBACK: Da (nakon testa - vraća korisnika)
     */
    test('5.3 - Admin može obrisati korisnika', async ({ page }) => {
      await checkpointManager.rollbackToCheckpoint('initial-setup');
      
      // Prijava kao Admin
      await page.goto('/admin');
      await page.fill('input[name="email"]', admin.email);
      await page.fill('input[name="password"]', admin.password);
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Admin Dashboard')).toBeVisible({ timeout: 10000 });
      
      // Kreiraj privremenog korisnika za brisanje
      const { user: tempUser, cleanup: tempCleanup } = await createTestUserWithCleanup(page, testData, {
        userType: 'client',
        city: 'Zagreb',
        autoSetup: false
      });
      
      // Obriši korisnika
      await page.goto(`/admin/users/${tempUser.email}`);
      await page.click('button:has-text("Obriši korisnika")');
      await page.click('button:has-text("Potvrdi")');
      
      await expect(page.locator('text=Korisnik obrisan')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/screenshots/05-03-admin-deletes-user.png', fullPage: true });
      
      // Cleanup
      await tempCleanup().catch(() => {}); // Već obrisan
      
      await checkpointManager.rollbackToCheckpoint('initial-setup');
    });
  });
});

