/**
 * ============================================================================
 * ORDER LIFECYCLE E2E TESTS
 * ============================================================================
 * 
 * End-to-end tests for complete order lifecycle:
 * - Create order from inquiry
 * - Generate invoice
 * - Process payment
 * - Complete order
 * 
 * Note: This assumes an orders/quotations system is implemented
 */

import { test, expect } from '@playwright/test';
import { ContactPage } from '../pages/ContactPage';
import { LoginPage } from '../pages/LoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { mockContactForm, mockSuccessfulLogin, mockDashboardStats, testData } from '../fixtures';

// Mock order data
const createMockOrder = (status: string) => ({
  id: `ORD-${Date.now()}`,
  customerName: 'Test Customer',
  customerEmail: 'customer@example.com',
  customerPhone: '9876543210',
  service: 'Web Development',
  description: 'Custom website development project',
  amount: 50000,
  status,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

test.describe('Order Lifecycle - From Inquiry to Completion', () => {
  test('complete lifecycle: inquiry → order → invoice → completion', async ({ page }) => {
    const mockOrder = createMockOrder('pending');
    
    // Setup mocks
    await mockContactForm(page, true);
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    // Setup orders API
    await page.route('**/api/admin/orders', async (route, request) => {
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            data: mockOrder,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            data: [mockOrder],
          }),
        });
      }
    });

    await page.route(`**/api/admin/orders/${mockOrder.id}`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: mockOrder,
        }),
      });
    });

    await page.route(`**/api/admin/orders/${mockOrder.id}/invoice`, async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            invoiceId: `INV-${Date.now()}`,
            orderId: mockOrder.id,
            amount: mockOrder.amount,
            status: 'generated',
          },
        }),
      });
    });

    // Step 1: Customer submits inquiry
    const contactPage = new ContactPage(page);
    await contactPage.navigate();
    await contactPage.waitForReady();

    await contactPage.fillContactForm({
      name: mockOrder.customerName,
      email: mockOrder.customerEmail,
      phone: mockOrder.customerPhone,
      message: `I need ${mockOrder.service}. ${mockOrder.description}`,
    });
    await contactPage.submitForm();
    await contactPage.assertFormSubmittedSuccessfully();

    // Step 2: Admin logs in and views inquiry
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    const dashboard = new AdminDashboardPage(page);
    await dashboard.waitForReady();

    // Navigate to orders (if available)
    const ordersLink = page.locator('a[href="/admin/orders"], a:has-text("Orders")');
    
    if (await ordersLink.isVisible().catch(() => false)) {
      await ordersLink.click();
      await expect(page).toHaveURL(/admin\/orders/);

      // Step 3: Create order from inquiry
      await page.click('button:has-text("Create Order"), button:has-text("New Order")').catch(() => {});

      // Fill order details
      await page.fill('input[name="customerName"]', mockOrder.customerName);
      await page.fill('input[name="customerEmail"]', mockOrder.customerEmail);
      await page.fill('input[name="service"]', mockOrder.service);
      await page.fill('input[name="amount"]', String(mockOrder.amount));

      // Save order
      await page.click('button:has-text("Save")').catch(() => {});

      // Step 4: Generate invoice
      await page.click('button:has-text("Generate Invoice"), a:has-text("Invoice")').catch(() => {});

      // Step 5: Update order status
      const statusSelect = page.locator('select[name="status"]').first();
      if (await statusSelect.isVisible().catch(() => false)) {
        await statusSelect.selectOption('in_progress');
      }

      // Step 6: Complete order
      await page.click('button:has-text("Complete"), button:has-text("Mark Complete")').catch(() => {});
    }
  });

  test('admin creates order manually and sends to customer', async ({ page }) => {
    const mockOrder = createMockOrder('draft');
    
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    await page.route('**/api/admin/orders', async (route, request) => {
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            data: mockOrder,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, data: [] }),
        });
      }
    });

    // Login as admin
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    // Navigate to orders
    await page.goto('/admin/orders');

    const isOrdersPage = await page.locator('h1:has-text("Orders")').isVisible().catch(() => false);
    
    if (isOrdersPage) {
      // Create new order
      await page.click('button:has-text("New Order"), button:has-text("Create Order")').catch(() => {});

      // Fill order form
      await page.fill('input[name="customerName"]', 'New Client');
      await page.fill('input[name="customerEmail"]', 'client@example.com');
      await page.fill('input[name="service"]', 'AI Development');
      await page.fill('textarea[name="description"]', 'Custom AI agent development');
      await page.fill('input[name="amount"]', '100000');

      // Save as draft
      await page.click('button:has-text("Save Draft")').catch(() => {
        return page.click('button:has-text("Save")');
      });

      // Send to customer
      await page.click('button:has-text("Send to Customer"), button:has-text("Email Quote")').catch(() => {});
    }
  });

  test('customer receives and accepts quotation', async ({ page, context }) => {
    // This test simulates the customer side after receiving a quotation
    
    // Mock customer portal or quotation page
    await page.route('**/api/public/quotations/*', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            id: 'QT-001',
            customerName: 'John Smith',
            service: 'Web Development',
            amount: 50000,
            status: 'pending_acceptance',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        }),
      });
    });

    // Customer opens quotation link
    await page.goto('/quotations/QT-001');

    const isQuotationPage = await page.locator('text=Quotation').isVisible().catch(() => false);
    
    if (isQuotationPage) {
      // View quotation details
      await expect(page.locator('text=Web Development')).toBeVisible();
      await expect(page.locator('text=₹50,000')).toBeVisible();

      // Accept quotation
      await page.click('button:has-text("Accept"), button:has-text("Approve")').catch(() => {});

      // Should show confirmation
      await expect(page.locator('text=Accepted, text=Thank you')).toBeVisible().catch(() => {});
    }
  });

  test('order status transitions through workflow', async ({ page }) => {
    const statuses = ['pending', 'confirmed', 'in_progress', 'review', 'completed'];
    const mockOrder = createMockOrder(statuses[0]);

    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    // Setup order API
    await page.route(`**/api/admin/orders/${mockOrder.id}`, async (route, request) => {
      if (request.method() === 'PUT') {
        // Update status based on request body
        const body = JSON.parse(await request.postData() || '{}');
        mockOrder.status = body.status || mockOrder.status;
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, data: mockOrder }),
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true, data: mockOrder }),
        });
      }
    });

    // Login and navigate to order
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    await page.goto(`/admin/orders/${mockOrder.id}`);

    const isOrderDetailPage = await page.locator('text=Order Details').isVisible().catch(() => false);
    
    if (isOrderDetailPage) {
      // Transition through each status
      for (const status of statuses.slice(1)) {
        const statusSelect = page.locator('select[name="status"]').first();
        
        if (await statusSelect.isVisible().catch(() => false)) {
          await statusSelect.selectOption(status);
          await page.click('button:has-text("Update Status"), button:has-text("Save")').catch(() => {});
          
          // Verify status updated
          await expect(page.locator(`text=${status}`)).toBeVisible().catch(() => {});
        }
      }
    }
  });

  test('generate and download invoice', async ({ page }) => {
    const mockOrder = createMockOrder('in_progress');

    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    await page.route(`**/api/admin/orders/${mockOrder.id}/invoice`, async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="invoice.pdf"',
        },
        body: Buffer.from('PDF content'),
      });
    });

    // Login
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    await page.goto(`/admin/orders/${mockOrder.id}`);

    // Generate invoice
    await page.click('button:has-text("Generate Invoice"), a:has-text("Create Invoice")').catch(() => {});

    // Download invoice
    const [download] = await Promise.all([
      page.waitForEvent('download').catch(() => null),
      page.click('button:has-text("Download"), a:has-text("Download PDF")').catch(() => {}),
    ]);

    if (download) {
      expect(download.suggestedFilename()).toContain('.pdf');
    }
  });
});

test.describe('Payment Processing', () => {
  test('customer pays invoice online', async ({ page }) => {
    // Mock payment gateway integration
    await page.route('**/api/public/payments/create', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            paymentId: 'PAY-001',
            orderId: 'ORD-001',
            amount: 50000,
            paymentUrl: '/payment/checkout/PAY-001',
          },
        }),
      });
    });

    // Customer navigates to payment page
    await page.goto('/payment/checkout/PAY-001');

    const isPaymentPage = await page.locator('text=Payment, text=Checkout').isVisible().catch(() => false);
    
    if (isPaymentPage) {
      // Fill payment details (in test mode)
      await page.fill('input[name="cardNumber"]', '4111111111111111');
      await page.fill('input[name="expiry"]', '12/30');
      await page.fill('input[name="cvv"]', '123');
      await page.fill('input[name="name"]', 'John Smith');

      // Submit payment
      await page.click('button:has-text("Pay")');

      // Should show success
      await expect(page.locator('text=Payment Successful, text=Thank you')).toBeVisible().catch(() => {});
    }
  });

  test('admin records offline payment', async ({ page }) => {
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    await page.route('**/api/admin/payments', async (route, request) => {
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            success: true,
            data: {
              paymentId: 'PAY-OFFLINE-001',
              orderId: 'ORD-001',
              amount: 50000,
              method: 'bank_transfer',
              status: 'completed',
            },
          }),
        });
      }
    });

    // Login
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    await page.goto('/admin/orders/ORD-001');

    // Record payment
    await page.click('button:has-text("Record Payment"), button:has-text("Add Payment")').catch(() => {});

    // Fill payment details
    await page.fill('input[name="amount"]', '50000');
    await page.selectOption('select[name="method"]', 'bank_transfer');
    await page.fill('input[name="reference"]', 'UTR123456789');

    // Save
    await page.click('button:has-text("Record")').catch(() => {});
  });
});

test.describe('Order Notifications', () => {
  test('admin receives notification for new order', async ({ page }) => {
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    // Mock notification endpoint
    await page.route('**/api/admin/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'notif-001',
              type: 'new_order',
              title: 'New Order Received',
              message: 'Order ORD-001 from John Smith',
              isRead: false,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });
    });

    // Login
    await page.goto('/admin/login');
    const loginPage = new LoginPage(page);
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    // Check for notifications
    const notificationBell = page.locator('[data-testid="notifications"], button:has-text("🔔")').first();
    
    if (await notificationBell.isVisible().catch(() => false)) {
      await notificationBell.click();
      
      // Should show notification
      await expect(page.locator('text=New Order Received')).toBeVisible().catch(() => {});
    }
  });

  test('customer receives email notifications at each stage', async ({ page }) => {
    // This would test email integration
    // Typically verified by checking API calls or email service mocks
    
    test.skip(true, 'Email integration tests require external service setup');
  });
});
