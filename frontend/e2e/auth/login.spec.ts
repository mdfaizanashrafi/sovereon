/**
 * ============================================================================
 * AUTHENTICATION E2E TESTS
 * ============================================================================
 * 
 * Tests for admin login functionality including:
 * - Valid credentials login
 * - Invalid credentials handling
 * - Session persistence
 * - Logout functionality
 * - Rate limiting
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { testData, mockSuccessfulLogin, mockFailedLogin, mockLogout, mockDashboardStats } from '../fixtures';

test.describe('Admin Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.waitForReady();
  });

  test.describe('Form Display', () => {
    test('should display login form with all required fields', async () => {
      await loginPage.assertFormElementsVisible();
    });

    test('should have correct page title', async () => {
      await expect(loginPage.getPageTitle()).toBeVisible();
      await expect(loginPage.page.locator('text=Admin Login')).toBeVisible();
    });

    test('should have link back to website', async () => {
      await loginPage.clickBackToWebsite();
      await expect(loginPage.page).toHaveURL('/');
    });
  });

  test.describe('Valid Login', () => {
    test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
      // Mock successful authentication
      await mockSuccessfulLogin(page);
      await mockDashboardStats(page);

      // Perform login
      await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

      // Assert successful login
      await loginPage.assertLoginSuccess();
      
      // Verify dashboard is loaded
      const dashboard = new AdminDashboardPage(page);
      await dashboard.waitForReady();
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });

    test('should maintain session after page refresh', async ({ page, context }) => {
      // Mock authentication
      await mockSuccessfulLogin(page);
      await mockDashboardStats(page);

      // Login
      await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);
      await loginPage.assertLoginSuccess();

      // Refresh page
      await page.reload();

      // Should still be on dashboard (session persisted)
      const dashboard = new AdminDashboardPage(page);
      await dashboard.waitForReady();
      await expect(page.locator('text=Dashboard')).toBeVisible();
    });
  });

  test.describe('Invalid Login', () => {
    test('should show error with invalid username', async ({ page }) => {
      await mockFailedLogin(page, 401, 'Invalid username or password');

      await loginPage.login(testData.admin.invalid.username, testData.admin.valid.password);

      await loginPage.assertLoginFailed();
      await expect(page.locator('text=Invalid username or password')).toBeVisible();
    });

    test('should show error with invalid password', async ({ page }) => {
      await mockFailedLogin(page, 401, 'Invalid username or password');

      await loginPage.login(testData.admin.valid.username, testData.admin.invalid.password);

      await loginPage.assertLoginFailed();
      await expect(page.locator('text=Invalid username or password')).toBeVisible();
    });

    test('should show error with both invalid credentials', async ({ page }) => {
      await mockFailedLogin(page, 401, 'Invalid username or password');

      await loginPage.login(testData.admin.invalid.username, testData.admin.invalid.password);

      await loginPage.assertLoginFailed();
      await expect(page.locator('text=Invalid username or password')).toBeVisible();
    });

    test('should show rate limiting error after too many attempts', async ({ page }) => {
      await mockFailedLogin(page, 429, 'Too many login attempts. Please try again later.');

      await loginPage.login(testData.admin.valid.username, 'wrongpassword');

      await expect(page.locator('text=Too many login attempts')).toBeVisible();
    });

    test('should clear error when user starts typing', async ({ page }) => {
      await mockFailedLogin(page, 401, 'Invalid username or password');

      // Trigger error
      await loginPage.login('wrong', 'wrong');
      await expect(page.locator('[role="alert"]')).toBeVisible();

      // Clear and type new username
      await loginPage.clearUsername();
      await loginPage.enterUsername('newuser');

      // Error should be hidden
      await expect(page.locator('[role="alert"]')).not.toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should require username field', async () => {
      await loginPage.enterPassword(testData.admin.valid.password);
      await loginPage.submitForm();

      // HTML5 validation should prevent submission
      const username = await loginPage.usernameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(username).toBeTruthy();
    });

    test('should require password field', async () => {
      await loginPage.enterUsername(testData.admin.valid.username);
      await loginPage.submitForm();

      const password = await loginPage.passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(password).toBeTruthy();
    });

    test('should disable submit button while loading', async ({ page }) => {
      await mockSuccessfulLogin(page);

      await loginPage.enterUsername(testData.admin.valid.username);
      await loginPage.enterPassword(testData.admin.valid.password);
      await loginPage.submitForm();

      // Button should show loading state
      await expect(page.locator('button:has-text("Signing in")')).toBeVisible();
    });
  });
});

test.describe('Admin Logout', () => {
  test('should logout and redirect to login page', async ({ page }) => {
    // Setup authenticated state
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);
    await mockLogout(page);

    // Navigate to dashboard (already logged in)
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);
    await loginPage.assertLoginSuccess();

    // Perform logout
    const dashboard = new AdminDashboardPage(page);
    await dashboard.logout();

    // Should be on login page
    await loginPage.assertOnLoginPage();
  });

  test('should clear session on logout', async ({ page, context }) => {
    // Setup authenticated state
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);
    await mockLogout(page);

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);
    await loginPage.assertLoginSuccess();

    // Logout
    const dashboard = new AdminDashboardPage(page);
    await dashboard.logout();

    // Try to access dashboard directly
    await page.goto('/admin');

    // Should be redirected to login
    await loginPage.assertOnLoginPage();
  });
});
