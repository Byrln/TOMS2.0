import { expect, test, type Page } from "@playwright/test";

const departureId = "00000003-0000-4000-8000-000000000001";
const bookingId = "00000005-0000-4000-8000-000000000001";

const routes = {
  "storefront-home": "/",
  "storefront-tours": "/tours",
  "storefront-tour-detail": "/tours/seoul-city-experience",
  "storefront-checkout": `/checkout/${departureId}`,
  "traveler-dashboard": "/account",
  "traveler-trip": `/account/trips/${bookingId}`,
  "traveler-documents": `/account/trips/${bookingId}/documents`,
} as const;

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: "toms-locale", value: "en", url: "http://127.0.0.1:3000" },
    { name: "toms-locale", value: "en", url: "http://127.0.0.1:3001" },
  ]);
});

async function expectNoHorizontalOverflow(page: Page) {
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(fits).toBe(true);
}

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await expectNoHorizontalOverflow(page);
  await expect(page.locator("body")).not.toContainText(/page could not be loaded|application error|internal server error/i);
}

test("mobile navigation exposes every primary destination", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  for (const label of ["Tours", "Destinations", "Promotions", "About us", "Contact", "My trips"]) {
    await expect(page.getByRole("dialog").getByText(label, { exact: true })).toBeVisible();
  }
});

for (const [name, route] of Object.entries(routes)) {
  test(`mobile visual — ${name}`, async ({ page }) => {
    await page.goto(route);
    await settle(page);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, animations: "disabled", caret: "hide" });
  });
}

test("mobile visual — admin dashboard", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/");
  await settle(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.locator("svg.recharts-surface")).toHaveCount(2);
  await expect(page).toHaveScreenshot("admin-dashboard.png", { fullPage: true, animations: "disabled", caret: "hide" });
});

test("mobile visual — admin departure detail", async ({ page }) => {
  await page.goto(`http://127.0.0.1:3000/departures/${departureId}`);
  await settle(page);
  await expect(page).toHaveScreenshot("admin-departure-detail.png", { fullPage: true, animations: "disabled", caret: "hide" });
});
