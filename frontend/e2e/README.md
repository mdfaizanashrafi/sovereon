# E2E Tests with Playwright

This directory contains comprehensive end-to-end tests for the Sovereon application using Playwright.

## Directory Structure

```
e2e/
├── auth/                    # Authentication tests
│   └── login.spec.ts        # Login/logout flows
├── public/                  # Public website tests
│   ├── homepage.spec.ts     # Homepage tests
│   ├── services.spec.ts     # Services page tests
│   └── contact.spec.ts      # Contact form tests
├── admin/                   # Admin dashboard tests
│   ├── dashboard.spec.ts    # Dashboard tests
│   ├── cms.spec.ts          # CMS management tests
│   └── orders.spec.ts       # Order management tests
├── journeys/                # Complete user journey tests
│   ├── customer-journey.spec.ts    # Customer flows
│   └── order-lifecycle.spec.ts     # Order lifecycle flows
├── pages/                   # Page Object Models
│   ├── BasePage.ts          # Base page class
│   ├── HomePage.ts          # Homepage POM
│   ├── LoginPage.ts         # Login page POM
│   ├── AdminDashboardPage.ts # Dashboard POM
│   ├── ServicesPage.ts      # Services page POM
│   ├── ContactPage.ts       # Contact page POM
│   └── index.ts             # Page exports
├── fixtures.ts              # Test fixtures and mock helpers
└── README.md               # This file
```

## Running Tests

```bash
# Run all tests
npm run e2e

# Run tests in headed mode (see browser)
npm run e2e -- --headed

# Run specific test file
npm run e2e -- e2e/auth/login.spec.ts

# Run tests in specific browser
npm run e2e -- --project=chromium

# Run tests with UI mode
npm run e2e:ui

# Run tests in debug mode
npm run e2e:debug

# Run tests with specific grep pattern
npm run e2e -- --grep "login"
```

## Test Coverage

### Authentication Flows
- Valid/invalid login
- Session persistence
- Logout functionality
- Rate limiting

### Public Website
- Homepage sections and navigation
- Services browsing
- Contact form submission
- Mobile responsiveness

### Admin Dashboard
- Dashboard statistics
- Navigation between sections
- CMS management (services, team, testimonials, FAQs)
- Order management

### User Journeys
- Complete customer inquiry flow
- Order lifecycle management
- Multi-touchpoint journeys

## Page Object Model

Tests use the Page Object Model pattern for maintainability:

```typescript
import { HomePage } from './pages/HomePage';

test('homepage loads', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate();
  await homePage.assertAllSectionsVisible();
});
```

## Mocking API Calls

Use the fixtures for consistent API mocking:

```typescript
import { mockServiceCategories } from './fixtures';

test.beforeEach(async ({ page }) => {
  await mockServiceCategories(page, [
    { id: '1', title: 'Software Development', ... }
  ]);
});
```

## Best Practices

1. **Use Page Objects**: Encapsulate selectors and actions in page classes
2. **Mock External APIs**: Use fixtures for consistent test data
3. **Test IDs**: Add `data-testid` attributes for stable selectors
4. **Mobile Testing**: Always test on mobile viewport sizes
5. **Visual Regression**: Screenshots are captured on failure

## Adding New Tests

1. Create test file in appropriate directory
2. Import page objects from `pages/`
3. Use `test.describe` for grouping
4. Follow Arrange-Act-Assert pattern
5. Add to existing or create new page object if needed

## CI/CD Integration

Tests run automatically in CI with:
- Parallel execution disabled for stability
- 2 retries on failure
- Video recording for debugging
- HTML report generation

## Troubleshooting

### Tests failing locally
- Ensure dev server is running: `npm run dev`
- Check `.env` has correct `VITE_API_URL`
- Clear test artifacts: `rm -rf test-results/ playwright-report/`

### Flaky tests
- Add explicit waits: `await expect(locator).toBeVisible()`
- Use `test.slow()` for slower tests
- Increase timeout if needed: `test.setTimeout(60000)`

### Debugging
- Use `--debug` flag for step-through debugging
- Use `--ui` flag for interactive test runner
- Check `test-results/` for screenshots and videos
