import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright konfiguracija za automatske E2E testove
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Maksimalno vrijeme za jedan test */
  timeout: 60 * 1000,
  expect: {
    /* Maksimalno vrijeme za assertion */
    timeout: 5000
  },
  /* Paralelno izvršavanje testova */
  fullyParallel: true,
  /* Fail build na CI ako neki test padne */
  forbidOnly: !!process.env.CI,
  /* Retry failed tests */
  retries: process.env.CI ? 2 : 0,
  /* Broj worker procesa */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter konfiguracija */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  /* Shared settings za sve projekte */
  use: {
    /* Base URL za testove */
    baseURL: process.env.FRONTEND_URL || 'https://www.uslugar.eu',
    /* Screenshot nakon svakog testa (ne samo na failure) */
    screenshot: 'on',
    /* Video snimanje */
    video: 'retain-on-failure',
    /* Trace za debugging */
    trace: 'on-first-retry',
    /* Action timeout */
    actionTimeout: 10000,
    /* Navigation timeout */
    navigationTimeout: 30000,
  },

  /* Konfiguracija projekata za različite browsere */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Web server konfiguracija (ako treba pokrenuti lokalni server) */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: !process.env.CI,
  // },
});

