/**
 * ============================================================================
 * HOMEPAGE E2E TESTS
 * ============================================================================
 * 
 * Tests for the public homepage including:
 * - Page loading and sections
 * - Navigation menu functionality
 * - Hero section CTAs
 * - Mobile responsiveness
 * - SEO elements
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { mockServiceCategories } from '../fixtures';

test.describe('Homepage', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    await mockServiceCategories(page);
    homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.waitForReady();
  });

  test.describe('Page Load', () => {
    test('should load with correct title', async () => {
      const title = await homePage.getPageTitleText();
      expect(title).toContain('Sovereon');
    });

    test('should have meta description', async () => {
      const hasMeta = await homePage.hasMetaDescription();
      expect(hasMeta).toBe(true);
    });

    test('should display all main sections', async () => {
      await homePage.assertAllSectionsVisible();
    });
  });

  test.describe('Hero Section', () => {
    test('should display hero heading with correct text', async () => {
      await expect(homePage.heroHeading).toBeVisible();
      const headingText = await homePage.getHeroHeadingText();
      expect(headingText).toContain('AI Systems');
    });

    test('should display primary CTA button', async () => {
      await expect(homePage.ctaPrimaryButton).toBeVisible();
      await expect(homePage.ctaPrimaryButton).toHaveText(/Book a Free Strategy Call/);
    });

    test('should display secondary CTA button', async () => {
      await expect(homePage.ctaSecondaryButton).toBeVisible();
      await expect(homePage.ctaSecondaryButton).toHaveText(/See Our Results/);
    });

    test('should navigate to contact page on primary CTA click', async () => {
      await homePage.clickPrimaryCTA();
      await expect(homePage.page).toHaveURL(/contact-us/);
    });

    test('should navigate to case studies on secondary CTA click', async () => {
      await homePage.clickSecondaryCTA();
      await expect(homePage.page).toHaveURL(/case-studies/);
    });
  });

  test.describe('Navigation', () => {
    test('should display navigation bar', async () => {
      await expect(homePage.navbar).toBeVisible();
    });

    test('should display logo that links to homepage', async () => {
      await expect(homePage.logo).toBeVisible();
      
      // Navigate away first
      await homePage.goto('/contact-us');
      await homePage.clickLogo();
      await expect(homePage.page).toHaveURL('/');
    });

    test('should have working Services navigation link', async () => {
      await homePage.clickNavLink('Services');
      await expect(homePage.page).toHaveURL(/services/);
    });

    test('should have working Contact Us navigation link', async () => {
      await homePage.clickNavLink('Contact Us');
      await expect(homePage.page).toHaveURL(/contact-us/);
    });

    test('should have working Who We Are navigation link', async () => {
      await homePage.clickNavLink('Who We Are');
      await expect(homePage.page).toHaveURL(/who-we-are/);
    });
  });

  test.describe('Services Section', () => {
    test('should display services section heading', async () => {
      await expect(homePage.servicesHeading).toBeVisible();
    });

    test('should display service cards', async () => {
      const count = await homePage.getServiceCardCount();
      expect(count).toBeGreaterThan(0);
    });

    test('should navigate to services page on view all button click', async () => {
      await homePage.clickViewAllServices();
      await expect(homePage.page).toHaveURL(/services/);
    });
  });

  test.describe('Footer', () => {
    test('should display footer', async () => {
      await homePage.scrollToFooter();
      await expect(homePage.footer).toBeVisible();
    });

    test('should display company information in footer', async () => {
      await homePage.scrollToFooter();
      await expect(homePage.footer.locator('text=Sovereon')).toBeVisible();
    });

    test('should have working footer links', async () => {
      await homePage.scrollToFooter();
      await expect(homePage.footerLinks.first()).toBeVisible();
    });

    test('should display social media links', async () => {
      await homePage.scrollToFooter();
      const count = await homePage.socialLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Mobile Viewport', () => {
    test('should display mobile menu button on small screens', async () => {
      await homePage.setMobileViewport();
      await homePage.navigate();
      await expect(homePage.mobileMenuButton).toBeVisible();
    });

    test('should toggle mobile menu', async () => {
      await homePage.setMobileViewport();
      await homePage.navigate();
      
      await homePage.openMobileMenu();
      const isOpen = await homePage.isMobileMenuOpen();
      expect(isOpen).toBe(true);
    });

    test('should navigate to services via mobile menu', async () => {
      await homePage.setMobileViewport();
      await homePage.navigate();
      
      await homePage.openMobileMenu();
      await homePage.page.locator('.lg\\:hidden nav a:has-text("Services")').click();
      
      await expect(homePage.page).toHaveURL(/services/);
    });
  });
});
