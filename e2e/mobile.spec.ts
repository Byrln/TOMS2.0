import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  expect(fits).toBe(true);
}

test("storefront discovery fits a phone viewport", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Дэлхийг өөрийнхөөрөө/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Цэс" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.goto("/tours/seoul-city-experience");
  await expect(page.getByRole("heading", { name: "Сөүл хотын аялал" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("staff login and traveler trip remain usable on mobile", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/admin/login");
  await expect(page.getByRole("heading", { name: "Системд нэвтрэх" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.goto("/account/trips/51111111-1111-4111-8111-111111111111?email=bat%40example.com");
  await expect(page.getByRole("heading", { name: "Сөүл хотын аялал" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
