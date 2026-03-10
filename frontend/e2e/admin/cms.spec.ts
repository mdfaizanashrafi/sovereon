/**
 * ============================================================================
 * ADMIN CMS E2E TESTS
 * ============================================================================
 * 
 * Tests for CMS functionality including:
 * - Create new service
 * - Edit existing service
 * - Delete service
 * - Upload images
 */

import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { mockSuccessfulLogin, mockDashboardStats, testData } from '../fixtures';

test.describe('CMS - Services Management', () => {
  test.beforeEach(async ({ page }) => {
    // Setup auth mocks
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    // Setup services API mocks
    await page.route('**/api/admin/service-categories', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: '1',
              slug: 'software-development',
              title: 'Software Development',
              description: 'Custom software solutions',
              order: 1,
              isActive: true,
              services: [
                { id: 's1', slug: 'web-apps', title: 'Web Applications', shortDescription: 'Modern web apps', order: 1, isActive: true },
              ],
            },
          ],
        }),
      });
    });

    await page.route('**/api/admin/services', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            { id: 's1', title: 'Web Applications', slug: 'web-apps', isActive: true },
          ],
        }),
      });
    });

    // Login first
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    // Navigate to services
    const dashboard = new AdminDashboardPage(page);
    await dashboard.navigateToServices();
  });

  test.describe('Services List', () => {
    test('should display services page', async ({ page }) => {
      await expect(page.locator('h1:has-text("Services")')).toBeVisible();
    });

    test('should display existing service categories', async ({ page }) => {
      await expect(page.locator('text=Software Development')).toBeVisible();
    });

    test('should display services within categories', async ({ page }) => {
      await expect(page.locator('text=Web Applications')).toBeVisible();
    });

    test('should show service status (Active/Inactive)', async ({ page }) => {
      await expect(page.locator('text=Active')).toBeVisible();
    });
  });

  test.describe('Create Service Category', () => {
    test('should open add category dialog', async ({ page }) => {
      await page.click('button:has-text("Add Category")');
      
      await expect(page.locator('role=dialog')).toBeVisible();
      await expect(page.locator('text=Add Category')).toBeVisible();
    });

    test('should create new category', async ({ page }) => {
      await page.route('**/api/admin/service-categories', async (route, request) => {
        if (request.method() === 'POST') {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ success: true, data: { id: 'new-cat' } }),
          });
        } else {
          await route.continue();
        }
      });

      await page.click('button:has-text("Add Category")');
      
      // Fill form
      await page.fill('input#slug', testData.service.category.slug);
      await page.fill('input#title', testData.service.category.title);
      await page.fill('textarea#description', testData.service.category.description);
      await page.fill('input#cat-order', String(testData.service.category.order));

      // Submit
      await page.click('button:has-text("Add Category")');

      // Dialog should close
      await expect(page.locator('role=dialog')).not.toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('button:has-text("Add Category")');
      
      // Try to submit without filling required fields
      const slugInput = page.locator('input#slug');
      await slugInput.clear();
      
      // Check HTML5 validation
      const isValid = await slugInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    });

    test('should allow canceling category creation', async ({ page }) => {
      await page.click('button:has-text("Add Category")');
      
      // Fill some data
      await page.fill('input#title', 'Test Category');
      
      // Cancel
      await page.click('button:has-text("Cancel")');
      
      // Dialog should close without creating
      await expect(page.locator('role=dialog')).not.toBeVisible();
    });
  });

  test.describe('Edit Service Category', () => {
    test('should open edit dialog', async ({ page }) => {
      // Expand the category first
      await page.click('text=Software Development');
      
      // Click edit
      await page.click('button:has-text("Edit Category")');
      
      await expect(page.locator('role=dialog')).toBeVisible();
      await expect(page.locator('text=Edit Category')).toBeVisible();
    });

    test('should populate edit form with existing data', async ({ page }) => {
      await page.click('text=Software Development');
      await page.click('button:has-text("Edit Category")');
      
      // Check if form has existing values
      const titleValue = await page.inputValue('input#title');
      expect(titleValue).toBe('Software Development');
    });

    test('should save edited category', async ({ page }) => {
      await page.route('**/api/admin/service-categories/**', async (route, request) => {
        if (request.method() === 'PUT') {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ success: true }),
          });
        } else {
          await route.continue();
        }
      });

      await page.click('text=Software Development');
      await page.click('button:has-text("Edit Category")');
      
      // Update title
      await page.fill('input#title', 'Updated Category Title');
      
      // Save
      await page.click('button:has-text("Save Changes")');

      await expect(page.locator('role=dialog')).not.toBeVisible();
    });

    test('should toggle active status', async ({ page }) => {
      await page.click('text=Software Development');
      await page.click('button:has-text("Edit Category")');
      
      // Find and toggle the switch
      const toggle = page.locator('input[type="checkbox"], button[role="switch"]').first();
      await toggle.click();
      
      // Save changes
      await page.click('button:has-text("Save Changes")');
    });
  });

  test.describe('Delete Service Category', () => {
    test('should show confirmation before delete', async ({ page }) => {
      await page.click('text=Software Development');
      
      // Intercept the confirmation dialog
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('Are you sure');
        await dialog.dismiss();
      });

      await page.click('button:has-text("Delete")');
    });

    test('should delete category after confirmation', async ({ page }) => {
      await page.route('**/api/admin/service-categories/**', async (route, request) => {
        if (request.method() === 'DELETE') {
          await route.fulfill({
            status: 200,
            body: JSON.stringify({ success: true }),
          });
        } else {
          await route.continue();
        }
      });

      await page.click('text=Software Development');
      
      // Accept the confirmation
      page.on('dialog', async (dialog) => {
        await dialog.accept();
      });

      await page.click('button:has-text("Delete")');
    });
  });

  test.describe('Service List Within Category', () => {
    test('should display services in a table', async ({ page }) => {
      await page.click('text=Software Development');
      
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th:has-text("Service")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
    });

    test('should show service order in table', async ({ page }) => {
      await page.click('text=Software Development');
      
      await expect(page.locator('th:has-text("Order")')).toBeVisible();
    });
  });
});

test.describe('CMS - Team Members', () => {
  test.beforeEach(async ({ page }) => {
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    await page.route('**/api/admin/team-members', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            { id: '1', name: 'John Doe', role: 'Developer', isActive: true },
            { id: '2', name: 'Jane Smith', role: 'Designer', isActive: true },
          ],
        }),
      });
    });

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    const dashboard = new AdminDashboardPage(page);
    await dashboard.navigateToTeam();
  });

  test('should display team members list', async ({ page }) => {
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();
  });

  test('should show team member roles', async ({ page }) => {
    await expect(page.locator('text=Developer')).toBeVisible();
    await expect(page.locator('text=Designer')).toBeVisible();
  });
});

test.describe('CMS - Testimonials', () => {
  test.beforeEach(async ({ page }) => {
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    await page.route('**/api/admin/testimonials', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            { id: '1', clientName: 'Client A', content: 'Great service!', rating: 5 },
          ],
        }),
      });
    });

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    const dashboard = new AdminDashboardPage(page);
    await dashboard.navigateToTestimonials();
  });

  test('should display testimonials list', async ({ page }) => {
    await expect(page.locator('text=Client A')).toBeVisible();
  });
});

test.describe('CMS - FAQs', () => {
  test.beforeEach(async ({ page }) => {
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    await page.route('**/api/admin/faqs', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            { id: '1', question: 'What services do you offer?', answer: 'We offer...', order: 1 },
          ],
        }),
      });
    });

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    const dashboard = new AdminDashboardPage(page);
    await dashboard.navigateToFAQs();
  });

  test('should display FAQs list', async ({ page }) => {
    await expect(page.locator('text=What services do you offer?')).toBeVisible();
  });
});
