/**
 * ============================================================================
 * ADMIN DASHBOARD PAGE OBJECT
 * ============================================================================
 * 
 * Page object for the admin dashboard.
 * Handles CMS navigation and dashboard operations.
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminDashboardPage extends BasePage {
  // ============================================================================
  // SELECTORS
  // ============================================================================

  readonly pageTitle: Locator;
  readonly welcomeMessage: Locator;
  
  // Stat Cards
  readonly statCards: Locator;
  readonly teamMembersCard: Locator;
  readonly servicesCard: Locator;
  readonly testimonialsCard: Locator;
  readonly faqsCard: Locator;
  
  // Sidebar Navigation
  readonly sidebar: Locator;
  readonly dashboardLink: Locator;
  readonly teamLink: Locator;
  readonly servicesLink: Locator;
  readonly testimonialsLink: Locator;
  readonly caseStudiesLink: Locator;
  readonly blogLink: Locator;
  readonly faqsLink: Locator;
  readonly settingsLink: Locator;
  readonly logoutButton: Locator;
  readonly backToWebsiteLink: Locator;
  
  // Quick Actions
  readonly quickActionsCard: Locator;
  readonly systemStatusCard: Locator;
  
  // Mobile
  readonly mobileMenuButton: Locator;
  readonly sidebarSheet: Locator;

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(page: Page) {
    super(page);

    // Page content
    this.pageTitle = page.locator('h1:has-text("Dashboard")');
    this.welcomeMessage = page.locator('text=Welcome to the Sovereon CMS');

    // Stat cards
    this.statCards = page.locator('.grid').first().locator('> *');
    this.teamMembersCard = page.locator('.card').filter({ hasText: 'Team Members' });
    this.servicesCard = page.locator('.card').filter({ hasText: 'Services' });
    this.testimonialsCard = page.locator('.card').filter({ hasText: 'Testimonials' });
    this.faqsCard = page.locator('.card').filter({ hasText: 'FAQs' });

    // Sidebar navigation
    this.sidebar = page.locator('aside, [role="navigation"]').first();
    this.dashboardLink = page.locator('a[href="/admin"]').filter({ hasText: 'Dashboard' });
    this.teamLink = page.locator('a[href="/admin/team"]').filter({ hasText: 'Team Members' });
    this.servicesLink = page.locator('a[href="/admin/services"]').filter({ hasText: 'Services' });
    this.testimonialsLink = page.locator('a[href="/admin/testimonials"]').filter({ hasText: 'Testimonials' });
    this.caseStudiesLink = page.locator('a[href="/admin/case-studies"]').filter({ hasText: 'Case Studies' });
    this.blogLink = page.locator('a[href="/admin/blog"]').filter({ hasText: 'Blog Posts' });
    this.faqsLink = page.locator('a[href="/admin/faqs"]').filter({ hasText: 'FAQs' });
    this.settingsLink = page.locator('a[href="/admin/settings"]').filter({ hasText: 'Settings' });
    this.logoutButton = page.locator('button:has-text("Logout")');
    this.backToWebsiteLink = page.locator('a:has-text("Back to Website")');

    // Cards
    this.quickActionsCard = page.locator('.card').filter({ hasText: 'Quick Actions' });
    this.systemStatusCard = page.locator('.card').filter({ hasText: 'System Status' });

    // Mobile
    this.mobileMenuButton = page.locator('button').filter({ has: page.locator('[data-lucide="menu"], svg') }).first();
    this.sidebarSheet = page.locator('[role="dialog"]');
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  async navigate(): Promise<void> {
    await this.goto('/admin');
  }

  async waitForReady(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.statCards.first()).toBeVisible();
  }

  getPageTitle(): Locator {
    return this.pageTitle;
  }

  // ============================================================================
  // SIDEBAR NAVIGATION
  // ============================================================================

  async navigateToDashboard(): Promise<void> {
    await this.dashboardLink.click();
    await this.page.waitForURL(/admin\/?$/);
  }

  async navigateToTeam(): Promise<void> {
    await this.teamLink.click();
    await this.page.waitForURL(/admin\/team/);
  }

  async navigateToServices(): Promise<void> {
    await this.servicesLink.click();
    await this.page.waitForURL(/admin\/services/);
  }

  async navigateToTestimonials(): Promise<void> {
    await this.testimonialsLink.click();
    await this.page.waitForURL(/admin\/testimonials/);
  }

  async navigateToCaseStudies(): Promise<void> {
    await this.caseStudiesLink.click();
    await this.page.waitForURL(/admin\/case-studies/);
  }

  async navigateToBlog(): Promise<void> {
    await this.blogLink.click();
    await this.page.waitForURL(/admin\/blog/);
  }

  async navigateToFAQs(): Promise<void> {
    await this.faqsLink.click();
    await this.page.waitForURL(/admin\/faqs/);
  }

  async navigateToSettings(): Promise<void> {
    await this.settingsLink.click();
    await this.page.waitForURL(/admin\/settings/);
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.page.waitForURL(/admin\/login/);
  }

  async clickBackToWebsite(): Promise<void> {
    await this.backToWebsiteLink.click();
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  async getStatValue(cardName: string): Promise<string> {
    const card = this.page.locator('.card').filter({ hasText: cardName });
    const value = card.locator('.text-2xl, .text-3xl');
    return await value.textContent() || '0';
  }

  async getTeamMembersCount(): Promise<number> {
    const text = await this.getStatValue('Team Members');
    return parseInt(text, 10) || 0;
  }

  async getServicesCount(): Promise<number> {
    const text = await this.getStatValue('Services');
    return parseInt(text, 10) || 0;
  }

  async getTestimonialsCount(): Promise<number> {
    const text = await this.getStatValue('Testimonials');
    return parseInt(text, 10) || 0;
  }

  async getFAQsCount(): Promise<number> {
    const text = await this.getStatValue('FAQs');
    return parseInt(text, 10) || 0;
  }

  // ============================================================================
  // MOBILE NAVIGATION
  // ============================================================================

  async openMobileMenu(): Promise<void> {
    if (await this.isMobileViewport()) {
      await this.mobileMenuButton.click();
    }
  }

  async closeMobileMenu(): Promise<void> {
    if (await this.isMobileViewport()) {
      await this.page.keyboard.press('Escape');
    }
  }

  // ============================================================================
  // ASSERTIONS
  // ============================================================================

  async assertAllStatCardsVisible(): Promise<void> {
    await expect(this.teamMembersCard).toBeVisible();
    await expect(this.servicesCard).toBeVisible();
    await expect(this.testimonialsCard).toBeVisible();
    await expect(this.faqsCard).toBeVisible();
  }

  async assertSidebarNavigationVisible(): Promise<void> {
    await expect(this.dashboardLink).toBeVisible();
    await expect(this.teamLink).toBeVisible();
    await expect(this.servicesLink).toBeVisible();
    await expect(this.testimonialsLink).toBeVisible();
    await expect(this.settingsLink).toBeVisible();
  }

  async assertOnDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/admin\/?$/);
    await expect(this.pageTitle).toBeVisible();
  }

  async assertLoggedOut(): Promise<void> {
    await expect(this.page).toHaveURL(/admin\/login/);
  }
}
