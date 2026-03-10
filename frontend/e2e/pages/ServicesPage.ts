/**
 * ============================================================================
 * SERVICES PAGE OBJECT
 * ============================================================================
 * 
 * Page object for the public services listing page.
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ServicesPage extends BasePage {
  // ============================================================================
  // SELECTORS
  // ============================================================================

  readonly pageTitle: Locator;
  readonly pageHeading: Locator;
  readonly pageDescription: Locator;
  
  readonly serviceCategories: Locator;
  readonly categorySections: Locator;
  readonly serviceCards: Locator;
  readonly serviceLinks: Locator;
  
  readonly loadingSkeletons: Locator;
  readonly backToTopButton: Locator;

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.locator('title');
    this.pageHeading = page.locator('h1');
    this.pageDescription = page.locator('h1 + p, .text-lg.text-muted-foreground');

    // Services
    this.serviceCategories = page.locator('section[aria-label="Services listing"]');
    this.categorySections = page.locator('section[aria-label="Services listing"] > div > div');
    this.serviceCards = page.locator('.ai-card');
    this.serviceLinks = page.locator('a[href^="/services/"]');

    // Loading
    this.loadingSkeletons = page.locator('.skeleton');
    this.backToTopButton = page.locator('button[aria-label="Scroll to top"], button:has([data-lucide="arrow-up"])');
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  async navigate(): Promise<void> {
    await this.goto('/services');
  }

  async waitForReady(): Promise<void> {
    await this.waitForPageLoad();
    await expect(this.pageHeading).toBeVisible();
  }

  getPageTitle(): Locator {
    return this.pageHeading;
  }

  // ============================================================================
  // SERVICE NAVIGATION
  // ============================================================================

  async getCategoryCount(): Promise<number> {
    return await this.categorySections.count();
  }

  async getServiceCount(): Promise<number> {
    return await this.serviceCards.count();
  }

  async clickServiceCard(index: number): Promise<void> {
    await this.serviceCards.nth(index).click();
  }

  async clickServiceByName(serviceName: string): Promise<void> {
    await this.page.locator(`.ai-card:has-text("${serviceName}")`).click();
  }

  async clickServiceBySlug(slug: string): Promise<void> {
    await this.page.locator(`a[href="/services/${slug}"]`).click();
  }

  async getServiceCardTitle(index: number): Promise<string> {
    const card = this.serviceCards.nth(index);
    const title = card.locator('h3');
    return await title.textContent() || '';
  }

  async getServiceCardDescription(index: number): Promise<string> {
    const card = this.serviceCards.nth(index);
    const desc = card.locator('p');
    return await desc.textContent() || '';
  }

  // ============================================================================
  // CATEGORY NAVIGATION
  // ============================================================================

  async getCategoryTitle(index: number): Promise<string> {
    const category = this.categorySections.nth(index);
    const title = category.locator('h2');
    return await title.textContent() || '';
  }

  async expandCategory(index: number): Promise<void> {
    // Categories are already expanded by default in the public view
    // This is for potential accordion functionality
    const category = this.categorySections.nth(index);
    const trigger = category.locator('button, [role="button"]').first();
    if (await trigger.count() > 0) {
      await trigger.click();
    }
  }

  // ============================================================================
  // LOADING STATES
  // ============================================================================

  async isLoading(): Promise<boolean> {
    return await this.loadingSkeletons.first().isVisible().catch(() => false);
  }

  async waitForServicesLoaded(): Promise<void> {
    await expect(this.loadingSkeletons).toHaveCount(0, { timeout: 10000 });
    await expect(this.serviceCards.first()).toBeVisible();
  }

  // ============================================================================
  // ASSERTIONS
  // ============================================================================

  async assertPageTitleCorrect(): Promise<void> {
    await expect(this.pageHeading).toContainText('Services');
  }

  async assertServicesVisible(): Promise<void> {
    const count = await this.getServiceCount();
    expect(count).toBeGreaterThan(0);
  }

  async assertServiceCardHasLink(index: number): Promise<void> {
    const card = this.serviceCards.nth(index);
    const link = card.locator('a');
    await expect(link).toHaveAttribute('href', /\/services\//);
  }
}
