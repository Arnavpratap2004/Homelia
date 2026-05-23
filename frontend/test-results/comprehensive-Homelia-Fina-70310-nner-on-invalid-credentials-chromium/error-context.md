# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: comprehensive.spec.ts >> Homelia Final Comprehensive Suite >> should show error banner on invalid credentials
- Location: tests\e2e\comprehensive.spec.ts:52:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.auth-error')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('.auth-error')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - link "Homelia - Premium Laminates" [ref=e7] [cursor=pointer]:
        - /url: /
        - img "Homelia - Premium Laminates" [ref=e8]
      - navigation [ref=e9]:
        - list [ref=e10]:
          - listitem [ref=e11]:
            - link "Home" [ref=e12] [cursor=pointer]:
              - /url: /
          - listitem [ref=e13]:
            - button "Brands" [ref=e14] [cursor=pointer]:
              - text: Brands
              - img [ref=e15]
          - listitem [ref=e17]:
            - link "Products" [ref=e18] [cursor=pointer]:
              - /url: /catalog
          - listitem [ref=e19]:
            - link "Bulk Orders" [ref=e20] [cursor=pointer]:
              - /url: /bulk-order
          - listitem [ref=e21]:
            - link "Request Quote" [ref=e22] [cursor=pointer]:
              - /url: /request-quote
          - listitem [ref=e23]:
            - link "Contact" [ref=e24] [cursor=pointer]:
              - /url: /contact
      - generic [ref=e25]:
        - button "Search" [ref=e26] [cursor=pointer]:
          - img [ref=e27]
        - button "Wishlist" [ref=e30] [cursor=pointer]:
          - img [ref=e31]
        - link "Cart" [ref=e33] [cursor=pointer]:
          - /url: /cart
          - img [ref=e34]
        - link "Account" [ref=e38] [cursor=pointer]:
          - /url: /login
          - img [ref=e39]
  - main [ref=e42]:
    - generic [ref=e44]:
      - generic [ref=e46]:
        - link "H Homelia" [ref=e47] [cursor=pointer]:
          - /url: /
          - generic [ref=e48]: H
          - generic [ref=e49]: Homelia
        - heading "Welcome to Homelia" [level=1] [ref=e50]
        - paragraph [ref=e51]: Your trusted partner for premium Durian & Rockstar laminates. Access dealer pricing, manage orders, and track invoices.
        - generic [ref=e52]:
          - generic [ref=e53]:
            - generic [ref=e54]: ✓
            - generic [ref=e55]: Exclusive dealer pricing
          - generic [ref=e56]:
            - generic [ref=e57]: ✓
            - generic [ref=e58]: Track orders & invoices
          - generic [ref=e59]:
            - generic [ref=e60]: ✓
            - generic [ref=e61]: Save quotes & favorites
          - generic [ref=e62]:
            - generic [ref=e63]: ✓
            - generic [ref=e64]: Quick re-ordering
      - generic [ref=e66]:
        - generic [ref=e67]:
          - button "Back" [ref=e68] [cursor=pointer]:
            - img [ref=e69]
            - text: Back
          - generic [ref=e71]:
            - img [ref=e72]
            - generic [ref=e75]: B2B Customer Portal
        - generic [ref=e76]:
          - button "Sign In" [active] [ref=e77] [cursor=pointer]
          - button "Create Account" [ref=e78] [cursor=pointer]
        - generic [ref=e79]:
          - generic [ref=e80]:
            - generic [ref=e81]: Email Address
            - generic [ref=e82]:
              - img
              - textbox "your@email.com" [ref=e83]: wrong@homelia.in
          - generic [ref=e84]:
            - generic [ref=e85]: Password
            - generic [ref=e86]:
              - img
              - textbox "Enter password" [ref=e87]: wrongpass
              - button [ref=e88] [cursor=pointer]:
                - img
          - generic [ref=e89]:
            - generic [ref=e90] [cursor=pointer]:
              - checkbox "Remember me" [ref=e91]
              - generic [ref=e92]: Remember me
            - link "Forgot password?" [ref=e93] [cursor=pointer]:
              - /url: "#"
          - button "Sign In" [ref=e94] [cursor=pointer]:
            - text: Sign In
            - img [ref=e95]
  - contentinfo [ref=e97]:
    - generic [ref=e100]:
      - generic [ref=e101]:
        - img [ref=e103]
        - generic [ref=e105]:
          - strong [ref=e106]: Authorized Distributor
          - generic [ref=e107]: Official Durian & Rockstar Partner
      - generic [ref=e108]:
        - img [ref=e110]
        - generic [ref=e115]:
          - strong [ref=e116]: Pan-India Delivery
          - generic [ref=e117]: Fast & Secure Shipping
      - generic [ref=e118]:
        - img [ref=e120]
        - generic [ref=e123]:
          - strong [ref=e124]: Quality Assured
          - generic [ref=e125]: 100% Genuine Products
      - generic [ref=e126]:
        - img [ref=e128]
        - generic [ref=e130]:
          - strong [ref=e131]: Secure Payments
          - generic [ref=e132]: GST Compliant Invoicing
    - generic [ref=e135]:
      - generic [ref=e136]:
        - img "Homelia - Premium Laminates" [ref=e138]
        - paragraph [ref=e139]: Your trusted authorized distributor for Durian and Rockstar laminates. Serving architects, interior designers, contractors, and bulk buyers across India.
        - generic [ref=e140]:
          - link "+91 98352 68202" [ref=e141] [cursor=pointer]:
            - /url: tel:+919835268202
            - img [ref=e142]
            - generic [ref=e144]: +91 98352 68202
          - link "prabhatkumarbxr@gmail.com" [ref=e145] [cursor=pointer]:
            - /url: mailto:prabhatkumarbxr@gmail.com
            - img [ref=e146]
            - generic [ref=e149]: prabhatkumarbxr@gmail.com
          - link "Near RPS More, Patna, Bihar" [ref=e150] [cursor=pointer]:
            - /url: https://maps.google.com/?q=RPS+More+Patna+Bihar
            - img [ref=e151]
            - generic [ref=e154]: Near RPS More, Patna, Bihar
      - generic [ref=e155]:
        - heading "Quick Links" [level=4] [ref=e156]
        - list [ref=e157]:
          - listitem [ref=e158]:
            - link "Home" [ref=e159] [cursor=pointer]:
              - /url: /
          - listitem [ref=e160]:
            - link "All Products" [ref=e161] [cursor=pointer]:
              - /url: /catalog
          - listitem [ref=e162]:
            - link "Durian Laminates" [ref=e163] [cursor=pointer]:
              - /url: /brands/durian
          - listitem [ref=e164]:
            - link "Rockstar Laminates" [ref=e165] [cursor=pointer]:
              - /url: /brands/rockstar
          - listitem [ref=e166]:
            - link "Request Quote" [ref=e167] [cursor=pointer]:
              - /url: /request-quote
          - listitem [ref=e168]:
            - link "Order Samples" [ref=e169] [cursor=pointer]:
              - /url: /sample-order
      - generic [ref=e170]:
        - heading "Categories" [level=4] [ref=e171]
        - list [ref=e172]:
          - listitem [ref=e173]:
            - link "Decorative Laminates" [ref=e174] [cursor=pointer]:
              - /url: /catalog?category=decorative
          - listitem [ref=e175]:
            - link "Compact Laminates" [ref=e176] [cursor=pointer]:
              - /url: /catalog?category=compact
          - listitem [ref=e177]:
            - link "Exterior Laminates" [ref=e178] [cursor=pointer]:
              - /url: /catalog?category=exterior
          - listitem [ref=e179]:
            - link "Fire Retardant" [ref=e180] [cursor=pointer]:
              - /url: /catalog?category=fire-retardant
          - listitem [ref=e181]:
            - link "Anti-Bacterial" [ref=e182] [cursor=pointer]:
              - /url: /catalog?category=anti-bacterial
      - generic [ref=e183]:
        - heading "Support" [level=4] [ref=e184]
        - list [ref=e185]:
          - listitem [ref=e186]:
            - link "Buying Guide" [ref=e187] [cursor=pointer]:
              - /url: /buying-guide
          - listitem [ref=e188]:
            - link "FAQs" [ref=e189] [cursor=pointer]:
              - /url: /faq
          - listitem [ref=e190]:
            - link "Track Order" [ref=e191] [cursor=pointer]:
              - /url: /track-order
          - listitem [ref=e192]:
            - link "Shipping Info" [ref=e193] [cursor=pointer]:
              - /url: /shipping
          - listitem [ref=e194]:
            - link "Returns Policy" [ref=e195] [cursor=pointer]:
              - /url: /returns
          - listitem [ref=e196]:
            - link "Contact Us" [ref=e197] [cursor=pointer]:
              - /url: /contact
      - generic [ref=e198]:
        - heading "Stay Updated" [level=4] [ref=e199]
        - paragraph [ref=e200]: Subscribe for new arrivals, exclusive offers, and design inspiration.
        - generic [ref=e201]:
          - textbox "Enter your email" [ref=e202]
          - button [ref=e203] [cursor=pointer]:
            - img
        - generic [ref=e205]:
          - link "Facebook" [ref=e206] [cursor=pointer]:
            - /url: "#"
            - img [ref=e207]
          - link "Instagram" [ref=e209] [cursor=pointer]:
            - /url: "#"
            - img [ref=e210]
          - link "LinkedIn" [ref=e213] [cursor=pointer]:
            - /url: "#"
            - img [ref=e214]
          - link "YouTube" [ref=e218] [cursor=pointer]:
            - /url: "#"
            - img [ref=e219]
    - generic [ref=e224]:
      - paragraph [ref=e225]: © 2026 Homelia. All rights reserved. Authorized Distributor of Durian & Rockstar Laminates.
      - generic [ref=e226]:
        - link "Privacy Policy" [ref=e227] [cursor=pointer]:
          - /url: /privacy
        - link "Terms of Service" [ref=e228] [cursor=pointer]:
          - /url: /terms
        - link "Sitemap" [ref=e229] [cursor=pointer]:
          - /url: /sitemap
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
> 68  |     await expect(errorBanner).toBeVisible({ timeout: 15000 });
      |                               ^ Error: expect(locator).toBeVisible() failed
  69  |     await expect(errorBanner).toContainText('Invalid email or password');
  70  |   });
  71  | 
  72  |   // 3. CART: REMOVAL & STATE
  73  |   test('should handle item removal and empty state', async ({ page }) => {
  74  |     await page.goto('/');
  75  |     await page.locator('.product-card').first().locator('.quick-add-btn').click();
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