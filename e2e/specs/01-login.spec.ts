import { test, expect } from "@playwright/test";

/**
 * E2E Test: Login Flow
 * Tests authentication with real credentials and database
 */

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");
  });

  test("should display login form", async ({ page }) => {
    // Check login form elements
    await expect(page.locator("h1, h2, mat-card-title")).toContainText(
      /login|đăng nhập/i,
    );
    await expect(
      page.locator('input[name="username"], input[formControlName="username"]'),
    ).toBeVisible();
    await expect(
      page.locator('input[name="password"], input[formControlName="password"]'),
    ).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    // Click login without filling fields
    await page.click('button[type="submit"]');

    // Wait for validation messages
    await page.waitForTimeout(500);

    // Check for error messages or disabled state
    const submitButton = page.locator('button[type="submit"]');
    const isDisabled = await submitButton.isDisabled();

    if (!isDisabled) {
      // If not disabled, should show validation errors
      const errorMessages = page.locator(
        ".mat-error, .error-message, mat-error",
      );
      await expect(errorMessages.first()).toBeVisible();
    }
  });

  test("should fail login with invalid credentials", async ({ page }) => {
    // Fill invalid credentials
    await page.fill(
      'input[name="username"], input[formControlName="username"]',
      "wronguser",
    );
    await page.fill(
      'input[name="password"], input[formControlName="password"]',
      "wrongpassword",
    );

    // Click login
    await page.click('button[type="submit"]');

    // Wait for error response
    await page.waitForTimeout(1000);

    // Should show error message
    const errorMessage = page.locator(
      ".error, .mat-error, mat-error, .snack-bar-error",
    );
    await expect(errorMessage.first()).toBeVisible();

    // Should still be on login page
    await expect(page).toHaveURL(/login/);
  });

  test("should successfully login with valid credentials", async ({ page }) => {
    // Fill valid credentials (from seeded admin user)
    await page.fill(
      'input[name="username"], input[formControlName="username"]',
      "admin",
    );
    await page.fill(
      'input[name="password"], input[formControlName="password"]',
      "Admin@123456",
    );

    // Click login
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL(/dashboard|devices/, { timeout: 5000 });

    // Should redirect to dashboard or devices page
    expect(page.url()).toMatch(/dashboard|devices/);

    // Should have authentication token in localStorage
    const token = await page.evaluate(
      () => localStorage.getItem("token") || localStorage.getItem("authToken"),
    );
    expect(token).toBeTruthy();
  });

  test("should redirect to dashboard if already authenticated", async ({
    page,
  }) => {
    // Login first
    await page.fill(
      'input[name="username"], input[formControlName="username"]',
      "admin",
    );
    await page.fill(
      'input[name="password"], input[formControlName="password"]',
      "Admin@123456",
    );
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|devices/, { timeout: 5000 });

    // Try to go back to login page
    await page.goto("/login");

    // Should auto-redirect to dashboard
    await page.waitForURL(/dashboard|devices/, { timeout: 5000 });
    expect(page.url()).toMatch(/dashboard|devices/);
  });
});

test.describe("Logout Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill(
      'input[name="username"], input[formControlName="username"]',
      "admin",
    );
    await page.fill(
      'input[name="password"], input[formControlName="password"]',
      "Admin@123456",
    );
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|devices/, { timeout: 5000 });
  });

  test("should logout successfully", async ({ page }) => {
    // Find and click logout button
    // Try multiple possible selectors
    const logoutButton = page
      .locator(
        'button:has-text("Logout"), button:has-text("Đăng xuất"), button:has-text("Log out"), [aria-label="Logout"]',
      )
      .first();

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try user menu
      const userMenu = page
        .locator(
          'button[aria-label="User menu"], button:has-text("admin"), .user-menu',
        )
        .first();
      await userMenu.click();
      await page.waitForTimeout(500);
      await page
        .locator('button:has-text("Logout"), button:has-text("Đăng xuất")')
        .first()
        .click();
    }

    // Wait for redirect to login
    await page.waitForURL(/login/, { timeout: 5000 });

    // Should be on login page
    expect(page.url()).toMatch(/login/);

    // Token should be removed
    const token = await page.evaluate(
      () => localStorage.getItem("token") || localStorage.getItem("authToken"),
    );
    expect(token).toBeFalsy();
  });
});
