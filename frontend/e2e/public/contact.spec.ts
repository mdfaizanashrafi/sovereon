/**
 * ============================================================================
 * CONTACT PAGE E2E TESTS
 * ============================================================================
 * 
 * Tests for the contact page including:
 * - Form validation
 * - Form submission success
 * - Form submission error handling
 * - Contact information display
 */

import { test, expect } from '@playwright/test';
import { ContactPage } from '../pages/ContactPage';
import { testData, mockContactForm } from '../fixtures';

test.describe('Contact Page', () => {
  let contactPage: ContactPage;

  test.beforeEach(async ({ page }) => {
    contactPage = new ContactPage(page);
    await contactPage.navigate();
    await contactPage.waitForReady();
  });

  test.describe('Page Display', () => {
    test('should load contact page with correct title', async () => {
      const title = await contactPage.page.title();
      expect(title).toContain('Contact');
    });

    test('should display page heading', async () => {
      await expect(contactPage.pageHeading).toBeVisible();
      await expect(contactPage.pageHeading).toContainText("Let's Talk");
    });

    test('should display contact form', async () => {
      await contactPage.assertFormVisible();
    });

    test('should display contact information cards', async () => {
      await contactPage.assertContactInfoVisible();
    });

    test('should display map', async () => {
      const isMapVisible = await contactPage.isMapVisible();
      expect(isMapVisible).toBe(true);
    });
  });

  test.describe('Form Validation', () => {
    test('should require name field', async () => {
      await contactPage.fillEmail(testData.contact.valid.email);
      await contactPage.fillMessage(testData.contact.valid.message);
      await contactPage.submitForm();

      const isValid = await contactPage.isNameValid();
      expect(isValid).toBe(false);
    });

    test('should require email field', async () => {
      await contactPage.fillName(testData.contact.valid.name);
      await contactPage.fillMessage(testData.contact.valid.message);
      await contactPage.submitForm();

      const isValid = await contactPage.isEmailValid();
      expect(isValid).toBe(false);
    });

    test('should require valid email format', async () => {
      await contactPage.fillName(testData.contact.valid.name);
      await contactPage.fillEmail(testData.contact.invalid.email);
      await contactPage.fillMessage(testData.contact.valid.message);
      
      const isValid = await contactPage.isEmailValid();
      expect(isValid).toBe(false);
    });

    test('should require message field', async () => {
      await contactPage.fillName(testData.contact.valid.name);
      await contactPage.fillEmail(testData.contact.valid.email);
      await contactPage.submitForm();

      const isValid = await contactPage.isMessageValid();
      expect(isValid).toBe(false);
    });

    test('should validate all required fields on submit', async () => {
      await contactPage.submitForm();

      const nameValid = await contactPage.isNameValid();
      const emailValid = await contactPage.isEmailValid();
      const messageValid = await contactPage.isMessageValid();

      expect(nameValid).toBe(false);
      expect(emailValid).toBe(false);
      expect(messageValid).toBe(false);
    });
  });

  test.describe('Form Submission - Success', () => {
    test('should submit form with valid data', async ({ page }) => {
      await mockContactForm(page, true);

      await contactPage.fillContactForm(testData.contact.valid);
      await contactPage.submitForm();

      await contactPage.assertFormSubmittedSuccessfully();
    });

    test('should show success message after submission', async ({ page }) => {
      await mockContactForm(page, true);

      await contactPage.fillContactForm(testData.contact.valid);
      await contactPage.submitForm();

      await expect(page.locator('text=Message Sent')).toBeVisible();
    });

    test('should clear form after successful submission', async ({ page }) => {
      await mockContactForm(page, true);

      await contactPage.fillContactForm(testData.contact.valid);
      await contactPage.submitForm();

      // Form should be replaced with success message
      await expect(contactPage.successMessage).toBeVisible();
      await expect(contactPage.contactForm).not.toBeVisible();
    });

    test('should include all optional fields in submission', async ({ page }) => {
      await mockContactForm(page, true);

      await contactPage.fillContactForm({
        ...testData.contact.valid,
        phone: '9876543210',
        company: 'Test Corp',
        service: 'AI Services',
      });
      await contactPage.submitForm();

      await contactPage.assertFormSubmittedSuccessfully();
    });
  });

  test.describe('Form Submission - Error', () => {
    test('should handle server error gracefully', async ({ page }) => {
      await mockContactForm(page, false);

      await contactPage.fillContactForm(testData.contact.valid);
      await contactPage.submitForm();

      // Should show error message
      await expect(page.locator('text=Failed to send')).toBeVisible();
    });

    test('should allow retry after error', async ({ page }) => {
      await mockContactForm(page, false);

      await contactPage.fillContactForm(testData.contact.valid);
      await contactPage.submitForm();

      // Error state
      await expect(page.locator('text=Failed to send')).toBeVisible();

      // Form should still be visible for retry
      await expect(contactPage.contactForm).toBeVisible();
      await expect(contactPage.submitButton).toBeVisible();
    });

    test('should show loading state during submission', async ({ page }) => {
      // Delay the response
      await page.route('**/api/contact', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true }),
        });
      });

      await contactPage.fillContactForm(testData.contact.valid);
      await contactPage.submitForm();

      // Should show loading state
      const isLoading = await contactPage.isLoading();
      expect(isLoading).toBe(true);
    });
  });

  test.describe('Honeypot Field', () => {
    test('should have honeypot field hidden from users', async () => {
      const honeypot = contactPage.honeypotField;
      
      // Honeypot should exist but be hidden
      await expect(honeypot).toHaveCount(1);
      
      // Check if it's visually hidden (via parent or style)
      const isHidden = await honeypot.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const parent = el.parentElement;
        const parentStyle = parent ? window.getComputedStyle(parent) : null;
        return style.display === 'none' || 
               style.visibility === 'hidden' || 
               parentStyle?.display === 'none' ||
               el.getAttribute('tabindex') === '-1';
      });
      
      expect(isHidden).toBe(true);
    });
  });

  test.describe('Contact Information', () => {
    test('should display phone number', async () => {
      const phone = await contactPage.getPhoneNumber();
      expect(phone).toBeTruthy();
    });

    test('should display email address', async () => {
      const email = await contactPage.getEmailAddress();
      expect(email).toBeTruthy();
    });

    test('should display office address', async () => {
      const address = await contactPage.getAddress();
      expect(address).toContain('Bhagalpur');
    });

    test('should have clickable phone link', async () => {
      const phoneLink = contactPage.phoneCard.locator('a[href^="tel:"]');
      await expect(phoneLink).toHaveAttribute('href', /^tel:/);
    });

    test('should have clickable email link', async () => {
      const emailLink = contactPage.emailCard.locator('a[href^="mailto:"]');
      await expect(emailLink).toHaveAttribute('href', /^mailto:/);
    });
  });

  test.describe('Social Links', () => {
    test('should display social media links', async () => {
      const count = await contactPage.getSocialLinkCount();
      expect(count).toBeGreaterThan(0);
    });
  });
});
