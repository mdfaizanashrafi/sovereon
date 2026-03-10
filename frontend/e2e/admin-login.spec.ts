/**
 * ============================================================================
 * ADMIN LOGIN E2E TESTS
 * ============================================================================
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login');
  });

  test('displays login form', async ({ page }) => {
    await expect(page.locator('text=Admin Login')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Username is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    // Mock failed login
    await page.route('**/api/admin/login', async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ 
          success: false, 
          error: { message: 'Invalid credentials' } 
        }),
      });
    });

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('redirects to dashboard on successful login', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/admin/login', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          success: true, 
          data: { user: { id: '1', username: 'admin' } } 
        }),
      });
    });

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'correctpassword');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/admin\/dashboard/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('rate limiting shows appropriate message', async ({ page }) => {
    // Mock rate limited response
    await page.route('**/api/admin/login', async (route) => {
      await route.fulfill({
        status: 429,
        body: JSON.stringify({ 
          success: false, 
          error: { message: 'Too many login attempts' } 
        }),
      });
    });

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Too many login attempts')).toBeVisible();
  });
});
