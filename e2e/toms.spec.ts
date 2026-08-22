import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const departureId = "00000003-0000-4000-8000-000000000001";
const bookingId = "00000005-0000-4000-8000-000000000001";
const tourId = "00000002-0000-4000-8000-000000000001";

const storefrontRoutes = {
  home: "/",
  tours: "/tours",
  "tour-detail": "/tours/seoul-city-experience",
  destinations: "/destinations",
  "destination-detail": "/destinations/seoul",
  "departure-detail": `/departures/${departureId}`,
  checkout: `/checkout/${departureId}`,
  promotions: "/promotions",
  about: "/about",
  contact: "/contact",
  login: "/login",
  "traveler-dashboard": "/account",
  "traveler-trips": "/account/trips",
  "traveler-trip-detail": `/account/trips/${bookingId}`,
  "traveler-documents": `/account/trips/${bookingId}/documents`,
  "traveler-payments": `/account/trips/${bookingId}/payments`,
  "traveler-messages": "/account/messages",
  "traveler-profile": "/account/profile",
  confirmation: `/booking/confirmation/${bookingId}`,
} as const;

const adminRoutes = {
  dashboard: "/",
  tours: "/tours",
  "tour-detail": `/tours/${tourId}`,
  "tour-new": "/tours/new",
  departures: "/departures",
  "departure-detail": `/departures/${departureId}`,
  "departure-new": "/departures/new",
  bookings: "/bookings",
  customers: "/customers",
  travelers: "/travelers",
  operations: "/operations",
  manifest: "/manifest",
  documents: "/documents",
  payments: "/payments",
  invoices: "/invoices",
  conversations: "/conversations",
  promotions: "/promotions",
  reports: "/reports",
  cms: "/cms",
  storefront: "/storefront",
  settings: "/settings",
  login: "/admin/login",
  "forgot-password": "/admin/forgot-password",
} as const;

test.beforeEach(async ({ context }) => {
  await context.addCookies([
    { name: "toms-locale", value: "en", url: "http://127.0.0.1:3000" },
    { name: "toms-locale", value: "en", url: "http://127.0.0.1:3001" },
  ]);
});

async function settle(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("body")).not.toContainText(/page could not be loaded|application error|internal server error/i);
}

async function expectAccessible(page: Page, include = "main") {
  const results = await new AxeBuilder({ page })
    .include(include)
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations, results.violations.map((item) => `${item.id}: ${item.help}`).join("\n")).toEqual([]);
}

test("critical discovery, checkout, traveler, and admin flows work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "See the world, your way" })).toBeVisible();
  await expectAccessible(page);

  await page.goto(`/checkout/${departureId}`);
  await page.getByLabel("Payer name").fill("Bat Erdene");
  await page.getByLabel("Email address").fill("bat@example.com");
  await page.getByLabel("Second traveler").fill("Saruul Tumur");
  await page.getByLabel("Date of birth").fill("1992-06-18");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Reserve seats worth/ }).click();
  await expect(page).toHaveURL(/\/booking\/confirmation\/51111111-1111-4111-8111-111111111111/);
  await expect(page.getByRole("heading", { name: /booking is confirmed/i })).toBeVisible();

  await page.goto("/account");
  await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
  await expectAccessible(page);

  await page.goto("http://127.0.0.1:3000/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.locator("svg.recharts-surface")).toHaveCount(2);
  await expectAccessible(page);
});

for (const [name, route] of Object.entries(storefrontRoutes)) {
  test(`desktop visual — storefront ${name}`, async ({ page }) => {
    await page.goto(route);
    await settle(page);
    await expect(page).toHaveScreenshot(`storefront-${name}.png`, { fullPage: true, animations: "disabled", caret: "hide" });
  });
}

for (const [name, route] of Object.entries(adminRoutes)) {
  test(`desktop visual — admin ${name}`, async ({ page }) => {
    await page.goto(`http://127.0.0.1:3000${route}`);
    await settle(page);
    await expect(page).toHaveScreenshot(`admin-${name}.png`, { fullPage: true, animations: "disabled", caret: "hide" });
  });
}
