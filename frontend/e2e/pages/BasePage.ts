/**
 * ============================================================================
 * BASE PAGE OBJECT
 * ============================================================================
 * 
 * Abstract base class for all page objects. Provides common functionality
 * like navigation, waiting for elements, and taking screenshots.
 */

import type { Page, Locator, ViewportSize } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  /**
   * Navigate to a specific path
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get current URL
   */
  getUrl(): string {
    return this.page.url();
  }

  // ============================================================================
  // ELEMENT HELPERS
  // ============================================================================

  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click element and wait for navigation
   */
  async clickAndWaitForNavigation(locator: Locator): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation(),
      locator.click(),
    ]);
  }

  // ============================================================================
  // VIEWPORT HELPERS
  // ============================================================================

  /**
   * Set viewport to mobile size
   */
  async setMobileViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Set viewport to tablet size
   */
  async setTabletViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  /**
   * Set viewport to desktop size
   */
  async setDesktopViewport(): Promise<void> {
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  /**
   * Check if viewport is mobile
   */
  async isMobileViewport(): Promise<boolean> {
    const size = this.page.viewportSize();
    return size ? size.width < 768 : false;
  }

  // ============================================================================
  // SCREENSHOT HELPERS
  // ============================================================================

  /**
   * Take a screenshot of the page
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `./test-results/screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Take a screenshot of a specific element
   */
  async takeElementScreenshot(locator: Locator, name: string): Promise<void> {
    await locator.screenshot({ path: `./test-results/screenshots/${name}.png` });
  }

  // ============================================================================
  // SCROLLING
  // ============================================================================

  /**
   * Scroll to element
   */
  async scrollTo(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Scroll to bottom of page
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * Scroll to top of page
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  // ============================================================================
  // FORM HELPERS
  // ============================================================================

  /**
   * Fill form field
   */
  async fillField(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  /**
   * Clear form field
   */
  async clearField(selector: string): Promise<void> {
    await this.page.fill(selector, '');
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  /**
   * Submit form
   */
  async submitForm(formSelector: string = 'form'): Promise<void> {
    await this.page.locator(formSelector).locator('button[type="submit"]').click();
  }

  // ============================================================================
  // ABSTRACT METHODS
  // ============================================================================

  /**
   * Navigate to the page's default URL
   */
  abstract navigate(): Promise<void>;

  /**
   * Wait for page to be ready
   */
  abstract waitForReady(): Promise<void>;

  /**
   * Get page title
   */
  abstract getPageTitle(): Locator;
}
