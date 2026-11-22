import { defineConfig, devices } from '@playwright/test';

// Naudojama iš anksto įdiegta Chromium naršyklė (jei nurodyta PW_CHROMIUM).
const executablePath = process.env.PW_CHROMIUM || undefined;

export default defineConfig({
  testDir: 'e2e',
  timeout: 300_000,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: { executablePath },
    trace: 'off',
    actionTimeout: 6000,
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'telefonas', use: { ...devices['Pixel 7'] } },
    { name: 'iphone', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
    { name: 'mazas-telefonas', use: { ...devices['iPhone SE'], browserName: 'chromium' } },
    { name: 'plansete', use: { ...devices['iPad (gen 7)'], browserName: 'chromium' } },
  ],
});
