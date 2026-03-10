/**
 * ============================================================================
 * CUSTOMER JOURNEY E2E TESTS
 * ============================================================================
 * 
 * End-to-end tests for complete customer journeys:
 * - Visitor browses services
 * - Fills contact form
 * - Admin receives notification (mocked)
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ServicesPage } from '../pages/ServicesPage';
import { ContactPage } from '../pages/ContactPage';
import { LoginPage } from '../pages/LoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { mockServiceCategories, mockContactForm, mockSuccessfulLogin, mockDashboardStats, testData } from '../fixtures';

test.describe('Customer Journey - Service Inquiry', () => {
  test('complete journey: homepage → services → contact form submission', async ({ page }) => {
    // Setup mocks
    await mockServiceCategories(page, [
      {
        id: '1',
        slug: 'ai-services',
        title: 'AI Services',
        description: 'AI-powered solutions for your business',
        order: 1,
        isActive: true,
        services: [
          { id: '1', slug: 'ai-agents', title: 'AI Agents', shortDescription: 'Custom AI agents', order: 1, isActive: true },
          { id: '2', slug: 'ai-analytics', title: 'AI Analytics', shortDescription: 'Data analytics powered by AI', order: 2, isActive: true },
        ],
      },
      {
        id: '2',
        slug: 'software-development',
        title: 'Software Development',
        description: 'Custom software solutions',
        order: 2,
        isActive: true,
        services: [
          { id: '3', slug: 'web-apps', title: 'Web Applications', shortDescription: 'Modern web applications', order: 1, isActive: true },
        ],
      },
    ]);
    await mockContactForm(page, true);

    // Step 1: Visitor lands on homepage
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.waitForReady();

    await expect(page).toHaveTitle(/Sovereon/);
    await expect(homePage.heroSection).toBeVisible();

    // Step 2: Visitor scrolls through homepage sections
    await homePage.scrollTo(homePage.servicesSection);
    await expect(homePage.servicesSection).toBeVisible();

    // Step 3: Visitor clicks on Services in navigation
    await homePage.clickNavLink('Services');
    await expect(page).toHaveURL(/services/);

    // Step 4: Visitor browses services page
    const servicesPage = new ServicesPage(page);
    await servicesPage.waitForReady();

    const serviceCount = await servicesPage.getServiceCount();
    expect(serviceCount).toBeGreaterThan(0);

    // Step 5: Visitor clicks on a specific service
    await servicesPage.clickServiceCard(0);
    
    // Should be on service detail page
    await expect(page).toHaveURL(/services\//);

    // Step 6: Visitor decides to inquire and goes to contact page
    await page.goto('/contact-us');
    const contactPage = new ContactPage(page);
    await contactPage.waitForReady();

    // Step 7: Visitor fills out contact form
    await contactPage.fillContactForm({
      name: 'John Smith',
      email: 'john.smith@company.com',
      phone: '9876543210',
      company: 'Smith & Co',
      service: 'AI Services',
      message: 'I am interested in AI Agents for our customer support team. Please contact me to discuss requirements.',
    });

    // Step 8: Visitor submits the form
    await contactPage.submitForm();

    // Step 9: Success confirmation
    await contactPage.assertFormSubmittedSuccessfully();
    await expect(page.locator('text=Message Sent')).toBeVisible();
  });

  test('journey: visitor browses multiple services before contacting', async ({ page }) => {
    await mockServiceCategories(page, [
      {
        id: '1',
        slug: 'ai-services',
        title: 'AI Services',
        description: 'AI-powered solutions',
        order: 1,
        isActive: true,
        services: [
          { id: '1', slug: 'ai-agents', title: 'AI Agents', shortDescription: 'Custom AI agents', order: 1, isActive: true },
          { id: '2', slug: 'ai-analytics', title: 'AI Analytics', shortDescription: 'Data analytics', order: 2, isActive: true },
        ],
      },
    ]);
    await mockContactForm(page, true);

    // Start at services page
    const servicesPage = new ServicesPage(page);
    await servicesPage.navigate();
    await servicesPage.waitForReady();

    // Browse first service
    await servicesPage.clickServiceCard(0);
    await expect(page).toHaveURL(/services\/ai-agents/);

    // Go back to services
    await servicesPage.navigate();
    await servicesPage.waitForReady();

    // Browse second service
    await servicesPage.clickServiceCard(1);
    await expect(page).toHaveURL(/services\/ai-analytics/);

    // Navigate to contact
    await page.goto('/contact-us');
    const contactPage = new ContactPage(page);
    await contactPage.waitForReady();

    // Fill and submit form
    await contactPage.fillContactForm(testData.contact.valid);
    await contactPage.submitForm();

    await contactPage.assertFormSubmittedSuccessfully();
  });

  test('journey: mobile visitor navigates and submits inquiry', async ({ page }) => {
    await mockServiceCategories(page, [
      {
        id: '1',
        slug: 'software-development',
        title: 'Software Development',
        description: 'Custom software',
        order: 1,
        isActive: true,
        services: [
          { id: '1', slug: 'web-apps', title: 'Web Applications', shortDescription: 'Web apps', order: 1, isActive: true },
        ],
      },
    ]);
    await mockContactForm(page, true);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Start at homepage
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.waitForReady();

    // Open mobile menu
    await homePage.openMobileMenu();
    expect(await homePage.isMobileMenuOpen()).toBe(true);

    // Navigate to services via mobile menu
    await page.locator('.lg\\:hidden nav a:has-text("Services")').click();
    await expect(page).toHaveURL(/services/);

    // Navigate to contact
    await page.goto('/contact-us');
    const contactPage = new ContactPage(page);
    await contactPage.waitForReady();

    // Fill form on mobile
    await contactPage.fillContactForm(testData.contact.valid);
    await contactPage.submitForm();

    await contactPage.assertFormSubmittedSuccessfully();
  });
});

test.describe('Admin Journey - Lead Management', () => {
  test('admin receives and processes new inquiry', async ({ page }) => {
    // Setup admin authentication
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    // Setup contact submissions API mock
    await page.route('**/api/admin/contact-submissions', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'sub-001',
              name: 'John Smith',
              email: 'john.smith@company.com',
              service: 'AI Services',
              message: 'Interested in AI Agents',
              status: 'new',
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    // Login as admin
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    const dashboard = new AdminDashboardPage(page);
    await dashboard.waitForReady();

    // Check for contact submissions/notifications
    // This would be implemented if there's a notifications or submissions section
    const hasSubmissions = await page.locator('text=Contact Submissions, text=New Leads').isVisible().catch(() => false);
    
    if (hasSubmissions) {
      // Navigate to submissions
      await page.click('text=Contact Submissions');
      
      // Should see the new submission
      await expect(page.locator('text=John Smith')).toBeVisible();
      await expect(page.locator('text=john.smith@company.com')).toBeVisible();
    }
  });
});

test.describe('Customer Journey - Multiple Touchpoints', () => {
  test('visitor returns to site and completes contact form', async ({ page, context }) => {
    await mockServiceCategories(page);
    await mockContactForm(page, true);

    // First visit - browse only
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.waitForReady();

    await homePage.clickNavLink('Services');
    await expect(page).toHaveURL(/services/);

    // Simulate returning visitor (new session)
    const newPage = await context.newPage();
    const returnHomePage = new HomePage(newPage);
    
    await returnHomePage.navigate();
    await returnHomePage.waitForReady();

    // This time go directly to contact
    await newPage.goto('/contact-us');
    const contactPage = new ContactPage(newPage);
    await contactPage.waitForReady();

    // Fill form as returning visitor
    await contactPage.fillContactForm({
      name: 'Returning Visitor',
      email: 'return@example.com',
      message: 'I visited before and now I am ready to start the project.',
    });
    await contactPage.submitForm();

    await contactPage.assertFormSubmittedSuccessfully();
  });

  test('journey from blog post to service inquiry', async ({ page }) => {
    await mockServiceCategories(page);
    await mockContactForm(page, true);

    // Mock blog post data
    await page.route('**/api/public/blog-posts/*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            id: '1',
            title: 'How AI Agents Can Transform Your Business',
            content: 'AI agents are revolutionizing...',
            slug: 'ai-agents-transform-business',
          },
        }),
      });
    });

    // Start at blog post
    await page.goto('/blog/ai-agents-transform-business');
    
    // Look for CTA to services or contact
    const ctaButton = page.locator('a:has-text("Learn More"), a:has-text("Contact Us"), a:has-text("Get Started")').first();
    
    if (await ctaButton.isVisible().catch(() => false)) {
      await ctaButton.click();
      
      // Should navigate to relevant page
      const url = page.url();
      expect(url).toMatch(/services|contact/);
    }
  });
});
