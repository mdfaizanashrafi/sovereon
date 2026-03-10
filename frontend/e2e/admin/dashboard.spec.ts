/**
 * ============================================================================
 * ADMIN DASHBOARD E2E TESTS
 * ============================================================================
 * 
 * Tests for the admin dashboard including:
 * - Dashboard loading after login
 * - Navigation between sections
 * - Statistics display
 * - Mobile navigation
 */

import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { mockSuccessfulLogin, mockDashboardStats, mockLogout, testData } from '../fixtures';

test.describe('Admin Dashboard', () => {
  let dashboardPage: AdminDashboardPage;

  test.beforeEach(async ({ page }) => {
    // Setup auth mocks
    await mockSuccessfulLogin(page);
    await mockDashboardStats(page);

    // Login first
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(testData.admin.valid.username, testData.admin.valid.password);

    dashboardPage = new AdminDashboardPage(page);
    await dashboardPage.waitForReady();
  });

  test.describe('Dashboard Loading', () => {
    test('should display dashboard after successful login', async () => {
      await dashboardPage.assertOnDashboard();
    });

    test('should display welcome message', async () => {
      await expect(dashboardPage.welcomeMessage).toBeVisible();
    });

    test('should display page title', async () => {
      await expect(dashboardPage.pageTitle).toBeVisible();
      await expect(dashboardPage.pageTitle).toHaveText('Dashboard');
    });
  });

  test.describe('Statistics Cards', () => {
    test('should display all stat cards', async () => {
      await dashboardPage.assertAllStatCardsVisible();
    });

    test('should display team members count', async () => {
      const count = await dashboardPage.getTeamMembersCount();
      expect(typeof count).toBe('number');
    });

    test('should display services count', async () => {
      const count = await dashboardPage.getServicesCount();
      expect(typeof count).toBe('number');
    });

    test('should display testimonials count', async () => {
      const count = await dashboardPage.getTestimonialsCount();
      expect(typeof count).toBe('number');
    });

    test('should display FAQs count', async () => {
      const count = await dashboardPage.getFAQsCount();
      expect(typeof count).toBe('number');
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('should display sidebar with all navigation items', async () => {
      await dashboardPage.assertSidebarNavigationVisible();
    });

    test('should navigate to Team Members section', async () => {
      await dashboardPage.navigateToTeam();
      await expect(dashboardPage.page).toHaveURL(/admin\/team/);
    });

    test('should navigate to Services section', async () => {
      await dashboardPage.navigateToServices();
      await expect(dashboardPage.page).toHaveURL(/admin\/services/);
    });

    test('should navigate to Testimonials section', async () => {
      await dashboardPage.navigateToTestimonials();
      await expect(dashboardPage.page).toHaveURL(/admin\/testimonials/);
    });

    test('should navigate to Case Studies section', async () => {
      await dashboardPage.navigateToCaseStudies();
      await expect(dashboardPage.page).toHaveURL(/admin\/case-studies/);
    });

    test('should navigate to Blog section', async () => {
      await dashboardPage.navigateToBlog();
      await expect(dashboardPage.page).toHaveURL(/admin\/blog/);
    });

    test('should navigate to FAQs section', async () => {
      await dashboardPage.navigateToFAQs();
      await expect(dashboardPage.page).toHaveURL(/admin\/faqs/);
    });

    test('should navigate to Settings section', async () => {
      await dashboardPage.navigateToSettings();
      await expect(dashboardPage.page).toHaveURL(/admin\/settings/);
    });

    test('should highlight active navigation item', async () => {
      await dashboardPage.navigateToServices();
      
      // The services link should have active styling
      const servicesLink = dashboardPage.servicesLink;
      const hasActiveClass = await servicesLink.evaluate((el) => 
        el.classList.contains('bg-primary') || 
        el.getAttribute('data-active') === 'true'
      );
      expect(hasActiveClass).toBe(true);
    });
  });

  test.describe('Quick Actions', () => {
    test('should display Quick Actions card', async () => {
      await expect(dashboardPage.quickActionsCard).toBeVisible();
    });

    test('should display System Status card', async () => {
      await expect(dashboardPage.systemStatusCard).toBeVisible();
    });

    test('should show system status indicators', async () => {
      const systemCard = dashboardPage.systemStatusCard;
      await expect(systemCard.locator('text=CMS Database')).toBeVisible();
      await expect(systemCard.locator('text=Admin Session')).toBeVisible();
      await expect(systemCard.locator('text=API Status')).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should logout and redirect to login page', async () => {
      await mockLogout(dashboardPage.page);
      await dashboardPage.logout();
      await dashboardPage.assertLoggedOut();
    });

    test('should clear admin session on logout', async () => {
      await mockLogout(dashboardPage.page);
      await dashboardPage.logout();

      // Try to access dashboard
      await dashboardPage.page.goto('/admin');
      
      // Should be redirected to login
      await expect(dashboardPage.page).toHaveURL(/admin\/login/);
    });
  });

  test.describe('Back to Website', () => {
    test('should navigate back to public website', async () => {
      await dashboardPage.clickBackToWebsite();
      await expect(dashboardPage.page).toHaveURL('/');
    });
  });

  test.describe('Mobile Navigation', () => {
    test('should display mobile menu button on small screens', async () => {
      await dashboardPage.setMobileViewport();
      await dashboardPage.navigate();
      
      await expect(dashboardPage.mobileMenuButton).toBeVisible();
    });

    test('should open mobile sidebar menu', async () => {
      await dashboardPage.setMobileViewport();
      await dashboardPage.navigate();
      
      await dashboardPage.openMobileMenu();
      // Sheet/Dialog should be visible
      await expect(dashboardPage.page.locator('[role="dialog"], [data-state="open"]')).toBeVisible();
    });

    test('should navigate via mobile menu', async () => {
      await dashboardPage.setMobileViewport();
      await dashboardPage.navigate();
      
      await dashboardPage.openMobileMenu();
      
      // Click a nav item in the mobile menu
      await dashboardPage.page.locator('[role="dialog"] a:has-text("Services")').click();
      
      await expect(dashboardPage.page).toHaveURL(/admin\/services/);
    });
  });

  test.describe('Authentication Protection', () => {
    test('should redirect unauthenticated users to login', async ({ page, browser }) => {
      // Create new context without auth
      const newContext = await browser.newContext();
      const newPage = await newContext.newPage();

      // Try to access dashboard
      await newPage.goto('/admin');

      // Should be redirected to login
      await expect(newPage).toHaveURL(/admin\/login/);

      await newContext.close();
    });
  });
});
