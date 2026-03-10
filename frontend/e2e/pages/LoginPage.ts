/**
 * ============================================================================
 * LOGIN PAGE OBJECT
 * ============================================================================
 * 
 * Page object for the admin login page.
 * Handles authentication flows and form interactions.
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // ============================================================================
  // SELECTORS
  // ============================================================================

  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly backToWebsiteLink: Locator;
  readonly loadingSpinner: Locator;

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(page: Page) {
    super(page);

    this.loginForm = page.locator('form');
    this.usernameInput = page.locator('input#username, input[name="username"]');
    this.passwordInput = page.locator('input#password, input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorAlert = page.locator('[role="alert"], .alert-destructive');
    this.backToWebsiteLink = page.locator('a[href="/"], a:has-text("Back to Website")');
    this.loadingSpinner = page.locator('.animate-spin, [data-loading="true"]');
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  async navigate(): Promise<void> {
    await this.goto('/admin/login');
  }

  async waitForReady(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  getPageTitle(): Locator {
    return this.page.locator('h1, .card-title:has-text("Admin Login")');
  }

  // ============================================================================
  // FORM ACTIONS
  // ============================================================================

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clearUsername(): Promise<void> {
    await this.usernameInput.clear();
  }

  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.submitForm();
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  async hasError(): Promise<boolean> {
    return await this.errorAlert.isVisible();
  }

  async getErrorMessage(): Promise<string> {
    const error = this.errorAlert.locator('text=*');
    if (await error.count() > 0) {
      return await error.textContent() || '';
    }
    return await this.errorAlert.textContent() || '';
  }

  async hasValidationError(field: 'username' | 'password'): Promise<boolean> {
    const input = field === 'username' ? this.usernameInput : this.passwordInput;
    const isInvalid = await input.evaluate((el: HTMLElement) => 
      el.hasAttribute('aria-invalid') || el.classList.contains('border-red-500')
    );
    return isInvalid;
  }

  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  async isLoading(): Promise<boolean> {
    const buttonText = await this.submitButton.textContent();
    return buttonText?.includes('Signing in') || buttonText?.includes('Loading') || false;
  }

  // ============================================================================
  // NAVIGATION ACTIONS
  // ============================================================================

  async clickBackToWebsite(): Promise<void> {
    await this.backToWebsiteLink.click();
  }

  // ============================================================================
  // ASSERTIONS
  // ============================================================================

  async assertFormElementsVisible(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.backToWebsiteLink).toBeVisible();
  }

  async assertLoginSuccess(): Promise<void> {
    await this.page.waitForURL(/admin\/?$|admin\/dashboard/);
  }

  async assertLoginFailed(): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
  }

  async assertOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/admin\/login/);
  }
}
