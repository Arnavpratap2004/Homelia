import { test, expect } from '@playwright/test';

const MOCK_UUID = '550e8400-e29b-41d4-a716-446655440000';
const ADMIN_USER = { 
  id: 'admin-123',
  email: 'admin@homelia.in', 
  name: 'Admin User',
  phone: '9999999999',
  role: 'ADMIN',
  isVerified: true,
  companyName: 'Homelia HQ',
  gstNumber: null
};

test.describe('Homelia Final Comprehensive Suite', () => {

  test.beforeEach(async ({ context, page }) => {
    // PRE-INIT: Strict isolation
    await context.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    // Mock: Featured Products
    await page.route('**/api/products/featured', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{ 
            id: MOCK_UUID, 
            name: 'Testing Laminate', 
            sku: 'E2E-101',
            price: 5000,
            image: '/mock.png',
            isFeatured: true 
          }]
        }),
      });
    });
  });

  // 1. PRODUCT DISCOVERY (Baseline)
  test('should display featured products on homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.section-header')).toContainText('Featured Collection', { timeout: 15000 });
    await expect(page.locator('.product-card')).toContainText('Testing Laminate');
  });

  // 2. NEGATIVE AUTHENTICATION
  test('should show error banner on invalid credentials', async ({ page }) => {
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Invalid email or password' }),
      });
    });

    await page.goto('/login');
    await page.getByTestId('portal-b2b').click();
    await page.getByTestId('login-email').fill('wrong@homelia.in');
    await page.getByTestId('login-password').fill('wrongpass');
    await page.click('button:has-text("Sign In")');

    const errorBanner = page.locator('.auth-error');
    await expect(errorBanner).toBeVisible({ timeout: 15000 });
    await expect(errorBanner).toContainText('Invalid email or password');
  });

  // 3. CART: REMOVAL & STATE
  test('should handle item removal and empty state', async ({ page }) => {
    await page.goto('/');
    await page.locator('.product-card').first().locator('.quick-add-btn').click();
    
    await page.goto('/cart');
    await expect(page.locator('.cart-item')).toBeVisible({ timeout: 15000 });
    await page.click('.remove-btn');
    await expect(page.locator('.empty-cart-card')).toBeVisible({ timeout: 15000 });
  });

  // 4. MOBILE: FULL JOURNEY (IPHONE 13)
  test('should complete a full mobile checkout flow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.route('**/api/orders', async route => {
        await route.fulfill({ 
          status: 200, 
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { orderId: 'ORD-MOB-202' } }) 
        });
    });

    await page.goto('/');
    await expect(page.locator('.navbar-logo, .auth-logo')).toBeVisible({ timeout: 20000 });
    
    // Quick Add
    const card = page.locator('.product-card').first();
    await card.scrollIntoViewIfNeeded();
    await card.locator('.quick-add-btn').click();
    
    // Cart
    await page.goto('/cart');
    await page.click('text=Proceed to Checkout');

    // Checkout Form
    await page.locator('input[placeholder*="Arnav Sharma"]').fill('Mobile User');
    await page.locator('input[placeholder*="91"]').fill('9876543210');
    await page.locator('input[placeholder*="Street address"]').fill('Mobile Lane 101');
    await page.locator('div.input-group:has-text("City") input').fill('Mumbai');
    await page.locator('div.input-group:has-text("Pincode") input').fill('400001');

    await page.locator('button:has-text("Continue to Details")').click();
    await page.locator('button:has-text("Continue to Payment")').click();
    await page.click('.payment-card:has-text("UPI")');
    await page.click('button.btn-pay');

    // Success state
    await expect(page.locator('.success-content')).toBeVisible({ timeout: 25000 });
  });

});
