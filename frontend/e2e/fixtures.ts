/**
 * ============================================================================
 * TEST FIXTURES
 * ============================================================================
 * 
 * Shared test fixtures for common setup, test data, and helper functions.
 * Provides authenticated admin context and test data management.
 */

import { test as base, expect, type Page, type BrowserContext } from '@playwright/test';

// ============================================================================
// TEST DATA
// ============================================================================

export const testData = {
  admin: {
    valid: {
      username: 'admin',
      password: 'admin123',
    },
    invalid: {
      username: 'wronguser',
      password: 'wrongpassword',
    },
  },
  contact: {
    valid: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      company: 'Test Company',
      service: 'AI Services',
      message: 'This is a test inquiry message for E2E testing.',
    },
    invalid: {
      name: '',
      email: 'invalid-email',
      message: '',
    },
  },
  service: {
    category: {
      slug: 'test-category',
      title: 'Test Service Category',
      description: 'A test category for E2E testing',
      order: 999,
      isActive: true,
    },
    service: {
      slug: 'test-service',
      title: 'Test Service',
      shortDescription: 'A short description for test service',
      fullDescription: 'A full description for test service with more details',
      features: 'Feature 1, Feature 2, Feature 3',
      benefits: 'Benefit 1, Benefit 2, Benefit 3',
      strategy: 'Test strategy for the service',
      order: 1,
      isActive: true,
    },
  },
};

// ============================================================================
// API MOCKING HELPERS
// ============================================================================

export async function mockSuccessfulLogin(page: Page) {
  await page.route('**/api/admin/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { id: '1', username: 'admin' },
      }),
    });
  });

  await page.route('**/api/admin/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: { id: '1', username: 'admin' },
      }),
    });
  });
}

export async function mockFailedLogin(page: Page, status: number = 401, message: string = 'Invalid credentials') {
  await page.route('**/api/admin/auth/login', async (route) => {
    await route.fulfill({
      status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: { message },
      }),
    });
  });
}

export async function mockLogout(page: Page) {
  await page.route('**/api/admin/auth/logout', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: null,
      }),
    });
  });
}

export async function mockContactForm(page: Page, success: boolean = true) {
  await page.route('**/api/contact', async (route) => {
    if (success) {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Message sent successfully',
        }),
      });
    } else {
      await route.fulfill({
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: { message: 'Server error occurred' },
        }),
      });
    }
  });
}

export async function mockServiceCategories(page: Page, categories: any[] = []) {
  await page.route('**/api/public/service-categories', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: categories.length > 0 ? categories : [
          {
            id: '1',
            slug: 'software-development',
            title: 'Software Development',
            description: 'Custom software solutions',
            order: 1,
            isActive: true,
            services: [
              { id: '1', slug: 'web-development', title: 'Web Development', shortDescription: 'Build modern web apps', order: 1, isActive: true },
            ],
          },
        ],
      }),
    });
  });
}

export async function mockDashboardStats(page: Page) {
  await page.route('**/api/admin/team-members', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }],
      }),
    });
  });

  await page.route('**/api/admin/services', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: [{ id: '1', title: 'Service 1' }],
      }),
    });
  });

  await page.route('**/api/admin/testimonials', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: [{ id: '1', clientName: 'Client 1' }],
      }),
    });
  });

  await page.route('**/api/admin/faqs', async (route) => {
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: [{ id: '1', question: 'FAQ 1' }],
      }),
    });
  });
}

// ============================================================================
// EXTENDED TEST FIXTURE
// ============================================================================

interface TestFixtures {
  /** Admin authenticated page context */
  adminPage: Page;
  /** Test data utilities */
  testData: typeof testData;
  /** API mocking utilities */
  mocks: {
    successfulLogin: (page: Page) => Promise<void>;
    failedLogin: (page: Page, status?: number, message?: string) => Promise<void>;
    logout: (page: Page) => Promise<void>;
    contactForm: (page: Page, success?: boolean) => Promise<void>;
    serviceCategories: (page: Page, categories?: any[]) => Promise<void>;
    dashboardStats: (page: Page) => Promise<void>;
  };
}

export const test = base.extend<TestFixtures>({
  // Test data fixture
  testData: async ({}, use) => {
    await use(testData);
  },

  // API mocks fixture
  mocks: async ({}, use) => {
    await use({
      successfulLogin: mockSuccessfulLogin,
      failedLogin: mockFailedLogin,
      logout: mockLogout,
      contactForm: mockContactForm,
      serviceCategories: mockServiceCategories,
      dashboardStats: mockDashboardStats,
    });
  },

  // Admin authenticated page
  adminPage: async ({ browser }, use) => {
    // Create new context and page
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set up auth mocks
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    // Navigate to login and perform login
    await page.goto('/admin/login');
    await page.fill('input[name="username"]', testData.admin.valid.username);
    await page.fill('input[name="password"]', testData.admin.valid.password);
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/admin\/?$/);
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Use the authenticated page
    await use(page);

    // Clean up
    await context.close();
  },
});

export { expect };
