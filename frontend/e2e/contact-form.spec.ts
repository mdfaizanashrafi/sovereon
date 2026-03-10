/**
 * ============================================================================
 * CONTACT FORM E2E TESTS
 * ============================================================================
 */

import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('displays contact form', async ({ page }) => {
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Check form fields exist
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('validates required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('validates email format', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('submits form successfully', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, message: 'Message sent' }),
      });
    });

    // Fill form
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Message sent successfully')).toBeVisible();
  });

  test('handles form submission error', async ({ page }) => {
    // Mock the API error response
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: { message: 'Server error' } }),
      });
    });

    // Fill form
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill('textarea[name="message"]', 'This is a test message');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Failed to send message')).toBeVisible();
  });
});
