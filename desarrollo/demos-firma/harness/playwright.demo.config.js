import { defineConfig, devices } from '@playwright/test';

/**
 * Config STANDALONE para la demo en video del flujo de consentimientos.
 * No toca la suite E2E existente (testDir propio, sin webServer: los
 * servidores ya estan levantados en 5175 / 8011 / 8026).
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 600000,
  reporter: [['list', { printSteps: true }]],
  outputDir: './.artifacts',
  use: {
    baseURL: process.env.DEMO_BASE_URL || 'http://localhost:5175',
    viewport: { width: 1440, height: 900 },
    navigationTimeout: 120000,
    actionTimeout: 20000,
    // Ritmo humano: sin esto el video es una rafaga de clicks ilegible.
    launchOptions: { slowMo: 150 },
    ...devices['Desktop Chrome'],
  },
  projects: [{ name: 'demo-chromium' }],
});
