/**
 * ============================================================================
 * GLOBAL TEARDOWN
 * ============================================================================
 * 
 * This file runs once after all test suites complete.
 * Use it to clean up test data, stop services, etc.
 */

import { type FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  // You can perform cleanup tasks here such as:
  // - Deleting test database entries
  // - Stopping mock servers
  // - Cleaning up test files
  // - Generating test reports

  // Example: Clean up test artifacts
  // const fs = require('fs');
  // const path = require('path');
  // 
  // const authDir = path.join(__dirname, '.auth');
  // if (fs.existsSync(authDir)) {
  //   fs.rmSync(authDir, { recursive: true, force: true });
  // }

  console.log('✅ Global teardown complete');
}

export default globalTeardown;
