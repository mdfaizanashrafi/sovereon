/**
 * ============================================================================
 * HOMEPAGE PAGE OBJECT
 * ============================================================================
 * 
 * Page object for the home/landing page.
 * Encapsulates selectors and actions for the homepage.
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  // ============================================================================
  // SELECTORS
  // ============================================================================

  readonly heroSection: Locator;
  readonly heroHeading: Locator;
  readonly heroSubheading: Locator;
  readonly ctaPrimaryButton: Locator;
  readonly ctaSecondaryButton: Locator;
  
  readonly servicesSection: Locator;
  readonly servicesHeading: Locator;
  readonly servicesGrid: Locator;
  readonly serviceCards: Locator;
  readonly viewAllServicesButton: Locator;
  
  readonly resultsSection: Locator;
  readonly whyChooseUsSection: Locator;
  readonly reviewsSection: Locator;
  readonly contactSection: Locator;
  
  readonly navbar: Locator;
  readonly logo: Locator;
  readonly navLinks: Locator;
  readonly mobileMenuButton: Locator;
  readonly mobileMenu: Locator;
  
  readonly footer: Locator;
  readonly footerLinks: Locator;
  readonly socialLinks: Locator;

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(page: Page) {
    super(page);

    // Hero Section
    this.heroSection = page.locator('section[aria-label="Hero section"]').first();
    this.heroHeading = this.heroSection.locator('h1');
    this.heroSubheading = this.heroSection.locator('p').first();
    this.ctaPrimaryButton = this.heroSection.locator('a:has-text("Book a Free Strategy Call")');
    this.ctaSecondaryButton = this.heroSection.locator('a:has-text("See Our Results")');

    // Services Section
    this.servicesSection = page.locator('section').filter({ hasText: /Services That.*Move the Needle/ });
    this.servicesHeading = this.servicesSection.locator('h2');
    this.servicesGrid = this.servicesSection.locator('.grid');
    this.serviceCards = this.servicesSection.locator('.ai-card');
    this.viewAllServicesButton = this.servicesSection.locator('a:has-text("View All Services")');

    // Other Sections
    this.resultsSection = page.locator('section').filter({ hasText: 'Results That Speak' });
    this.whyChooseUsSection = page.locator('section').filter({ hasText: 'Why Choose Sovereon' });
    this.reviewsSection = page.locator('section').filter({ hasText: 'Client Reviews' });
    this.contactSection = page.locator('section').filter({ hasText: 'Get in Touch' });

    // Navigation
    this.navbar = page.locator('header');
    this.logo = this.navbar.locator('a[href="/"]').first();
    this.navLinks = this.navbar.locator('nav a');
    this.mobileMenuButton = this.navbar.locator('button').filter({ has: page.locator('[data-lucide="menu"], svg') });
    this.mobileMenu = page.locator('.lg\\:hidden nav');

    // Footer
    this.footer = page.locator('footer');
    this.footerLinks = this.footer.locator('a');
    this.socialLinks = this.footer.locator('a[href*="instagram"], a[href*="linkedin"], a[href*="facebook"]');
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  async navigate(): Promise<void> {
    await this.goto('/');
  }

  async waitForReady(): Promise<void> {
    await this.waitForPageLoad();
    await expect(this.heroSection).toBeVisible();
  }

  getPageTitle(): Locator {
    return this.heroHeading;
  }

  // ============================================================================
  // HERO ACTIONS
  // ============================================================================

  async clickPrimaryCTA(): Promise<void> {
    await this.ctaPrimaryButton.click();
  }

  async clickSecondaryCTA(): Promise<void> {
    await this.ctaSecondaryButton.click();
  }

  async getHeroHeadingText(): Promise<string> {
    return await this.heroHeading.textContent() || '';
  }

  // ============================================================================
  // NAVIGATION ACTIONS
  // ============================================================================

  async clickNavLink(linkText: string): Promise<void> {
    await this.navbar.locator(`nav a:has-text("${linkText}")`).click();
  }

  async clickLogo(): Promise<void> {
    await this.logo.click();
  }

  async openMobileMenu(): Promise<void> {
    if (await this.isMobileViewport()) {
      await this.mobileMenuButton.click();
    }
  }

  async closeMobileMenu(): Promise<void> {
    if (await this.isMobileViewport()) {
      await this.mobileMenuButton.click();
    }
  }

  async isMobileMenuOpen(): Promise<boolean> {
    if (await this.isMobileViewport()) {
      return await this.mobileMenu.isVisible();
    }
    return false;
  }

  // ============================================================================
  // SERVICES ACTIONS
  // ============================================================================

  async clickViewAllServices(): Promise<void> {
    await this.viewAllServicesButton.click();
  }

  async getServiceCardCount(): Promise<number> {
    return await this.serviceCards.count();
  }

  async clickServiceCard(index: number): Promise<void> {
    await this.serviceCards.nth(index).click();
  }

  // ============================================================================
  // FOOTER ACTIONS
  // ============================================================================

  async clickFooterLink(linkText: string): Promise<void> {
    await this.footer.locator(`a:has-text("${linkText}")`).click();
  }

  async clickSocialLink(platform: 'Instagram' | 'LinkedIn' | 'Facebook'): Promise<void> {
    await this.footer.locator(`a:has-text("${platform}")`).click();
  }

  async scrollToFooter(): Promise<void> {
    await this.footer.scrollIntoViewIfNeeded();
  }

  // ============================================================================
  // SECTION VISIBILITY
  // ============================================================================

  async assertAllSectionsVisible(): Promise<void> {
    await expect(this.heroSection).toBeVisible();
    await expect(this.servicesSection).toBeVisible();
    await expect(this.resultsSection).toBeVisible();
    await expect(this.whyChooseUsSection).toBeVisible();
    await expect(this.reviewsSection).toBeVisible();
    await expect(this.contactSection).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  // ============================================================================
  // SEO & META
  // ============================================================================

  async getPageTitleText(): Promise<string> {
    return await this.page.title();
  }

  async hasMetaDescription(): Promise<boolean> {
    const meta = this.page.locator('meta[name="description"]');
    return await meta.count() > 0;
  }
}
