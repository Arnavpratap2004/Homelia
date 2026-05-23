# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: comprehensive.spec.ts >> Homelia Final Comprehensive Suite >> should handle item removal and empty state
- Location: tests\e2e\comprehensive.spec.ts:73:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.product-card').first().locator('.quick-add-btn')
    - locator resolved to <button title="Quick Add to Cart" class="btn btn-primary btn-sm quick-add-btn">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const MOCK_UUID = '550e8400-e29b-41d4-a716-446655440000';
  4   | const ADMIN_USER = { 
  5   |   id: 'admin-123',
  6   |   email: 'admin@homelia.in', 
  7   |   name: 'Admin User',
  8   |   phone: '9999999999',
  9   |   role: 'ADMIN',
  10  |   isVerified: true,
  11  |   companyName: 'Homelia HQ',
  12  |   gstNumber: null
  13  | };
  14  | 
  15  | test.describe('Homelia Final Comprehensive Suite', () => {
  16  | 
  17  |   test.beforeEach(async ({ context, page }) => {
  18  |     // PRE-INIT: Strict isolation
  19  |     await context.addInitScript(() => {
  20  |       window.localStorage.clear();
  21  |       window.sessionStorage.clear();
  22  |     });
  23  | 
  24  |     // Mock: Featured Products
  25  |     await page.route('**/api/products/featured', async route => {
  26  |       await route.fulfill({
  27  |         status: 200,
  28  |         contentType: 'application/json',
  29  |         body: JSON.stringify({
  30  |           success: true,
  31  |           data: [{ 
  32  |             id: MOCK_UUID, 
  33  |             name: 'Testing Laminate', 
  34  |             sku: 'E2E-101',
  35  |             price: 5000,
  36  |             image: '/mock.png',
  37  |             isFeatured: true 
  38  |           }]
  39  |         }),
  40  |       });
  41  |     });
  42  |   });
  43  | 
  44  |   // 1. PRODUCT DISCOVERY (Baseline)
  45  |   test('should display featured products on homepage', async ({ page }) => {
  46  |     await page.goto('/');
  47  |     await expect(page.locator('.section-header')).toContainText('Featured Collection', { timeout: 15000 });
  48  |     await expect(page.locator('.product-card')).toContainText('Testing Laminate');
  49  |   });
  50  | 
  51  |   // 2. NEGATIVE AUTHENTICATION
  52  |   test('should show error banner on invalid credentials', async ({ page }) => {
  53  |     await page.route('**/api/auth/login', async route => {
  54  |       await route.fulfill({
  55  |         status: 401,
  56  |         contentType: 'application/json',
  57  |         body: JSON.stringify({ success: false, message: 'Invalid email or password' }),
  58  |       });
  59  |     });
  60  | 
  61  |     await page.goto('/login');
  62  |     await page.getByTestId('portal-b2b').click();
  63  |     await page.getByTestId('login-email').fill('wrong@homelia.in');
  64  |     await page.getByTestId('login-password').fill('wrongpass');
  65  |     await page.click('button:has-text("Sign In")');
  66  | 
  67  |     const errorBanner = page.locator('.auth-error');
  68  |     await expect(errorBanner).toBeVisible({ timeout: 15000 });
  69  |     await expect(errorBanner).toContainText('Invalid email or password');
  70  |   });
  71  | 
  72  |   // 3. CART: REMOVAL & STATE
  73  |   test('should handle item removal and empty state', async ({ page }) => {
  74  |     await page.goto('/');
> 75  |     await page.locator('.product-card').first().locator('.quick-add-btn').click();
      |                                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  76  |     
  77  |     await page.goto('/cart');
  78  |     await expect(page.locator('.cart-item')).toBeVisible({ timeout: 15000 });
  79  |     await page.click('.remove-btn');
  80  |     await expect(page.locator('.empty-cart-card')).toBeVisible({ timeout: 15000 });
  81  |   });
  82  | 
  83  |   // 4. MOBILE: FULL JOURNEY (IPHONE 13)
  84  |   test('should complete a full mobile checkout flow', async ({ page }) => {
  85  |     await page.setViewportSize({ width: 390, height: 844 });
  86  |     
  87  |     await page.route('**/api/orders', async route => {
  88  |         await route.fulfill({ 
  89  |           status: 200, 
  90  |           contentType: 'application/json',
  91  |           body: JSON.stringify({ success: true, data: { orderId: 'ORD-MOB-202' } }) 
  92  |         });
  93  |     });
  94  | 
  95  |     await page.goto('/');
  96  |     await expect(page.locator('.navbar-logo, .auth-logo')).toBeVisible({ timeout: 20000 });
  97  |     
  98  |     // Quick Add
  99  |     const card = page.locator('.product-card').first();
  100 |     await card.scrollIntoViewIfNeeded();
  101 |     await card.locator('.quick-add-btn').click();
  102 |     
  103 |     // Cart
  104 |     await page.goto('/cart');
  105 |     await page.click('text=Proceed to Checkout');
  106 | 
  107 |     // Checkout Form
  108 |     await page.locator('input[placeholder*="Arnav Sharma"]').fill('Mobile User');
  109 |     await page.locator('input[placeholder*="91"]').fill('9876543210');
  110 |     await page.locator('input[placeholder*="Street address"]').fill('Mobile Lane 101');
  111 |     await page.locator('div.input-group:has-text("City") input').fill('Mumbai');
  112 |     await page.locator('div.input-group:has-text("Pincode") input').fill('400001');
  113 | 
  114 |     await page.locator('button:has-text("Continue to Details")').click();
  115 |     await page.locator('button:has-text("Continue to Payment")').click();
  116 |     await page.click('.payment-card:has-text("UPI")');
  117 |     await page.click('button.btn-pay');
  118 | 
  119 |     // Success state
  120 |     await expect(page.locator('.success-content')).toBeVisible({ timeout: 25000 });
  121 |   });
  122 | 
  123 | });
  124 | 
```