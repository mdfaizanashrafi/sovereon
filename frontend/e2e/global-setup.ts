/**
 * ============================================================================
 * GLOBAL SETUP
 * ============================================================================
 * 
 * This file runs once before all test suites.
 * Use it to set up test data, start services, etc.
 */

import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // You can perform setup tasks here such as:
  // - Creating test database entries
  // - Starting mock servers
  // - Generating test data files
  // - Authenticating and saving storage state

  // Example: Create admin auth state for reuse
  // const { baseURL } = config.projects[0].use;
  // const browser = await chromium.launch();
  // const context = await browser.newContext();
  // const page = await context.newPage();
  // 
  // await page.goto(baseURL + '/admin/login');
  // await page.fill('input[name="username"]', 'admin');
  // await page.fill('input[name="password"]', 'admin123');
  // await page.click('button[type="submit"]');
  // await page.waitForURL(/admin/);
  // 
  // // Save storage state
  // await context.storageState({ path: './e2e/.auth/admin.json' });
  // await browser.close();

  console.log('✅ Global setup complete');
}

export default globalSetup;
