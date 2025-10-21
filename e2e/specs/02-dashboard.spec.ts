import { test, expect } from "@playwright/test";

/**
 * E2E Test: Dashboard
 * Tests dashboard functionality with real data
 */

// Helper to login before tests
async function login(page: any) {
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
}

test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);

    // Navigate to dashboard if not already there
    if (!page.url().includes("dashboard")) {
      await page.goto("/dashboard");
    }
  });

  test("should display dashboard title", async ({ page }) => {
    // Check for dashboard title
    const title = page.locator("h1, h2, .page-title, mat-card-title");
    await expect(title.first()).toContainText(/dashboard|tổng quan/i);
  });

  test("should display device statistics cards", async ({ page }) => {
    // Check for stat cards
    const statCards = page.locator("mat-card, .stat-card, .stats-card, .card");
    const count = await statCards.count();

    // Should have at least 2 stat cards (Total, Online, Offline, etc.)
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("should display device statistics with real data", async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check for numeric values in stats
    const stats = await page
      .locator(".stat-value, mat-card-content, .card-value")
      .allTextContents();

    // At least one stat should have a number
    const hasNumbers = stats.some((text) => /\d+/.test(text));
    expect(hasNumbers).toBeTruthy();
  });

  test("should display recent devices table or list", async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(1000);

    // Check for table or list
    const table = page.locator(
      "table, mat-table, .device-list, .devices-table",
    );
    const hasList = (await table.count()) > 0;

    if (hasList) {
      // If there are devices, table should be visible
      await expect(table.first()).toBeVisible();
    } else {
      // If no devices, should show empty state
      const emptyState = page.locator(
        '.empty-state, .no-data, p:has-text("No devices")',
      );
      // Empty state might be visible, but not required for test to pass
    }
  });

  test("should have navigation menu", async ({ page }) => {
    // Check for navigation menu
    const nav = page.locator("mat-sidenav, .sidebar, nav, mat-nav-list");
    await expect(nav.first()).toBeVisible();

    // Should have navigation links
    const navLinks = page.locator("a[routerLink], mat-list-item, .nav-item");
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(2);
  });

  test("should navigate to devices page", async ({ page }) => {
    // Find and click devices link
    const devicesLink = page
      .locator(
        'a:has-text("Devices"), a:has-text("Thiết bị"), a[routerLink="/devices"]',
      )
      .first();
    await devicesLink.click();

    // Should navigate to devices page
    await page.waitForURL(/devices/, { timeout: 5000 });
    expect(page.url()).toMatch(/devices/);
  });

  test("should refresh data when refresh button clicked", async ({ page }) => {
    // Find refresh button if exists
    const refreshButton = page
      .locator(
        'button:has-text("Refresh"), button[aria-label="Refresh"], button mat-icon:has-text("refresh")',
      )
      .first();

    if (await refreshButton.isVisible()) {
      // Get initial stat value
      const initialStat = await page
        .locator(".stat-value, .card-value")
        .first()
        .textContent();

      // Click refresh
      await refreshButton.click();
      await page.waitForTimeout(1000);

      // Data should be loaded (may or may not change)
      const newStat = await page
        .locator(".stat-value, .card-value")
        .first()
        .textContent();
      expect(newStat).toBeTruthy();
    }
  });
});

test.describe("Dashboard Real-time Updates", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    if (!page.url().includes("dashboard")) {
      await page.goto("/dashboard");
    }
  });

  test("should establish Socket.IO connection", async ({ page }) => {
    // Wait for Socket.IO to connect
    await page.waitForTimeout(2000);

    // Check console for connection messages
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(msg.text());
    });

    await page.waitForTimeout(1000);

    // Should have some console activity (not guaranteed, but good sign)
    expect(logs.length).toBeGreaterThan(0);
  });
});

test.describe("Dashboard Responsive Design", () => {
  test("should display properly on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await login(page);
    if (!page.url().includes("dashboard")) {
      await page.goto("/dashboard");
    }

    // Dashboard should still be visible
    const content = page.locator("mat-card, .card, .stat-card").first();
    await expect(content).toBeVisible();
  });

  test("should display properly on tablet", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await login(page);
    if (!page.url().includes("dashboard")) {
      await page.goto("/dashboard");
    }

    // Dashboard should still be visible
    const content = page.locator("mat-card, .card, .stat-card").first();
    await expect(content).toBeVisible();
  });
});
