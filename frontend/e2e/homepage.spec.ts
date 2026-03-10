/**
 * ============================================================================
 * HOMEPAGE E2E TESTS
 * ============================================================================
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title and meta', async ({ page }) => {
    await expect(page).toHaveTitle(/Sovereon/);
  });

  test('displays hero section', async ({ page }) => {
    const hero = page.locator('[data-testid="hero-section"]');
    await expect(hero).toBeVisible();
    await expect(hero).toContainText('Digital Growth');
  });

  test('displays services section', async ({ page }) => {
    const services = page.locator('[data-testid="services-section"]');
    await expect(services).toBeVisible();
    await expect(services).toContainText('Services');
  });

  test('navigation links work', async ({ page }) => {
    // Click on Services link
    await page.click('text=Services');
    await expect(page).toHaveURL(/services/);
    
    // Go back
    await page.goto('/');
    
    // Click on Contact link
    await page.click('text=Contact');
    await expect(page).toHaveURL(/contact/);
  });

  test('contact form section is visible', async ({ page }) => {
    const contactForm = page.locator('[data-testid="contact-section"]');
    await expect(contactForm).toBeVisible();
    await expect(contactForm).toContainText('Get in Touch');
  });

  test('footer is displayed', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Sovereon');
  });
});
