/**
 * ============================================================================
 * CONTACT PAGE OBJECT
 * ============================================================================
 * 
 * Page object for the contact page with form handling.
 */

import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ContactPage extends BasePage {
  // ============================================================================
  // SELECTORS
  // ============================================================================

  readonly pageTitle: Locator;
  readonly pageHeading: Locator;
  
  // Contact Info Cards
  readonly phoneCard: Locator;
  readonly emailCard: Locator;
  readonly addressCard: Locator;
  readonly hoursCard: Locator;
  
  // Contact Form
  readonly contactForm: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly companyInput: Locator;
  readonly serviceSelect: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;
  readonly honeypotField: Locator;
  
  // Success/Error States
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;
  
  // Map and Social
  readonly mapContainer: Locator;
  readonly socialLinks: Locator;

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.locator('title');
    this.pageHeading = page.locator('h1');

    // Contact info cards
    this.phoneCard = page.locator('.card, [class*="card"]').filter({ hasText: 'Phone' });
    this.emailCard = page.locator('.card, [class*="card"]').filter({ hasText: 'Email' });
    this.addressCard = page.locator('.card, [class*="card"]').filter({ hasText: 'Address' });
    this.hoursCard = page.locator('.card, [class*="card"]').filter({ hasText: 'Hours' });

    // Form
    this.contactForm = page.locator('form');
    this.nameInput = page.locator('input#name, input[name="name"]');
    this.emailInput = page.locator('input#email, input[name="email"]');
    this.phoneInput = page.locator('input#phone, input[name="phone"]');
    this.companyInput = page.locator('input#company, input[name="company"]');
    this.serviceSelect = page.locator('button[role="combobox"], select[name="service"]');
    this.messageInput = page.locator('textarea#message, textarea[name="message"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.honeypotField = page.locator('input[name="company_website"], input#company_website');

    // Messages
    this.successMessage = page.locator('text=Message Sent, text=Message sent successfully');
    this.errorMessage = page.locator('[role="alert"], .text-red-500, .text-destructive');
    this.loadingSpinner = page.locator('.animate-spin, [data-loading="true"]');

    // Map and social
    this.mapContainer = page.locator('iframe[title*="Map"], iframe[src*="google"]');
    this.socialLinks = page.locator('a[href*="instagram"], a[href*="linkedin"], a[href*="facebook"]');
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  async navigate(): Promise<void> {
    await this.goto('/contact-us');
  }

  async waitForReady(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.contactForm).toBeVisible();
  }

  getPageTitle(): Locator {
    return this.pageHeading;
  }

  // ============================================================================
  // FORM ACTIONS
  // ============================================================================

  async fillName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPhone(phone: string): Promise<void> {
    await this.phoneInput.fill(phone);
  }

  async fillCompany(company: string): Promise<void> {
    await this.companyInput.fill(company);
  }

  async selectService(serviceName: string): Promise<void> {
    // Handle Radix Select component
    await this.serviceSelect.click();
    await this.page.locator(`[role="option"]:has-text("${serviceName}")`).click();
  }

  async fillMessage(message: string): Promise<void> {
    await this.messageInput.fill(message);
  }

  async submitForm(): Promise<void> {
    await this.submitButton.click();
  }

  async fillContactForm(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    service?: string;
    message: string;
  }): Promise<void> {
    await this.fillName(data.name);
    await this.fillEmail(data.email);
    if (data.phone) await this.fillPhone(data.phone);
    if (data.company) await this.fillCompany(data.company);
    if (data.service) await this.selectService(data.service);
    await this.fillMessage(data.message);
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  async isNameValid(): Promise<boolean> {
    const isInvalid = await this.nameInput.evaluate((el: HTMLInputElement) => 
      !el.validity.valid || el.hasAttribute('aria-invalid')
    );
    return !isInvalid;
  }

  async isEmailValid(): Promise<boolean> {
    const isInvalid = await this.emailInput.evaluate((el: HTMLInputElement) => 
      !el.validity.valid || el.hasAttribute('aria-invalid')
    );
    return !isInvalid;
  }

  async isMessageValid(): Promise<boolean> {
    const isInvalid = await this.messageInput.evaluate((el: HTMLTextAreaElement) => 
      !el.validity.valid || el.hasAttribute('aria-invalid')
    );
    return !isInvalid;
  }

  async isSubmitDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  // ============================================================================
  // CONTACT INFO
  // ============================================================================

  async getPhoneNumber(): Promise<string> {
    const link = this.phoneCard.locator('a[href^="tel:"]');
    return await link.textContent() || '';
  }

  async getEmailAddress(): Promise<string> {
    const link = this.emailCard.locator('a[href^="mailto:"]');
    return await link.textContent() || '';
  }

  async getAddress(): Promise<string> {
    return await this.addressCard.locator('p').textContent() || '';
  }

  async clickPhoneLink(): Promise<void> {
    await this.phoneCard.locator('a[href^="tel:"]').click();
  }

  async clickEmailLink(): Promise<void> {
    await this.emailCard.locator('a[href^="mailto:"]').click();
  }

  // ============================================================================
  // SOCIAL & MAP
  // ============================================================================

  async isMapVisible(): Promise<boolean> {
    return await this.mapContainer.isVisible();
  }

  async getSocialLinkCount(): Promise<number> {
    return await this.socialLinks.count();
  }

  async clickSocialLink(platform: 'Instagram' | 'LinkedIn' | 'Facebook'): Promise<void> {
    await this.page.locator(`a:has-text("${platform}")`).click();
  }

  // ============================================================================
  // FORM STATES
  // ============================================================================

  async isSuccessState(): Promise<boolean> {
    return await this.successMessage.isVisible();
  }

  async isErrorState(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async isLoading(): Promise<boolean> {
    const buttonText = await this.submitButton.textContent();
    return buttonText?.includes('Sending') || buttonText?.includes('Loading') || false;
  }

  // ============================================================================
  // ASSERTIONS
  // ============================================================================

  async assertFormVisible(): Promise<void> {
    await expect(this.nameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.messageInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async assertContactInfoVisible(): Promise<void> {
    await expect(this.phoneCard).toBeVisible();
    await expect(this.emailCard).toBeVisible();
    await expect(this.addressCard).toBeVisible();
    await expect(this.hoursCard).toBeVisible();
  }

  async assertFormSubmittedSuccessfully(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  async assertFormSubmissionFailed(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}
