/**
 * ============================================================================
 * NAVIGATION E2E TESTS
 * ============================================================================
 */

import { test, expect } from '@playwright/test';

test.describe('Site Navigation', () => {
  test('main navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test all main navigation links
    const links = [
      { text: 'Services', url: '/services' },
      { text: 'About', url: '/about' },
      { text: 'Contact', url: '/contact' },
      { text: 'Blog', url: '/blog' },
    ];
    
    for (const link of links) {
      await page.goto('/');
      await page.click(`text=${link.text}`);
      await expect(page).toHaveURL(link.url);
    }
  });

  test('mobile menu toggles correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Mobile menu button should be visible
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(menuButton).toBeVisible();
    
    // Click to open menu
    await menuButton.click();
    
    // Menu should be visible
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
    
    // Click to close
    await menuButton.click();
    await expect(mobileMenu).not.toBeVisible();
  });

  test('footer links are accessible', async ({ page }) => {
    await page.goto('/');
    
    const footerLinks = ['Privacy Policy', 'Terms of Service', 'Sitemap'];
    
    for (const linkText of footerLinks) {
      const link = page.locator('footer').locator(`text=${linkText}`);
      await expect(link).toBeVisible();
    }
  });

  test('logo links to homepage', async ({ page }) => {
    await page.goto('/contact');
    
    await page.click('[data-testid="logo"]');
    await expect(page).toHaveURL('/');
  });
});
