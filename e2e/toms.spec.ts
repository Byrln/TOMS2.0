import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

async function expectAccessible(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations, results.violations.map((item) => `${item.id}: ${item.help}`).join("\n")).toEqual([]);
}

test("staff login opens the operational dashboard", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/admin/login");
  await expect(page.getByRole("heading", { name: "Системд нэвтрэх" })).toBeVisible();
  await expectAccessible(page);
  await page.getByRole("link", { name: "Demo admin нээх" }).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:3000\/?(?:\?demo=1)?$/);
  await expect(page.getByRole("heading", { name: "Хяналтын самбар" })).toBeVisible();
  await expect(page.getByText("₮ 1,286,650,000")).toBeVisible();
});

test("staff creates a tour, adds a departure, and publishes it", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/tours");
  await page.getByRole("link", { name: /Шинэ аялал үүсгэх/ }).click();
  await expect(page.getByRole("heading", { name: "Шинэ аялал" })).toBeVisible();
  await page.getByRole("button", { name: "Аялал үүсгэх" }).click();
  await expect(page).toHaveURL(/\/tours\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: "Altai Eagle Journey" })).toBeVisible();

  await page.getByRole("link", { name: "Departure нэмэх" }).click();
  await expect(page.getByRole("heading", { name: "Шинэ хуваарьт гаралт" })).toBeVisible();
  await page.getByRole("button", { name: "Departure нэмэх" }).click();
  await expect(page.getByText("AEJ-2026-10-03")).toBeVisible();

  await page.getByRole("button", { name: "Аялал нийтлэх" }).click();
  await expect(page.getByRole("button", { name: "Нийтлэгдсэн" })).toBeDisabled();
});

test("public discovery completes checkout and traveler claim handoff", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Дэлхийг өөрийнхөөрөө/ })).toBeVisible();
  await expectAccessible(page);

  await page.goto("/tours/seoul-city-experience");
  await expect(page.getByRole("heading", { name: "Сөүл хотын аялал" })).toBeVisible();
  await page.getByRole("link", { name: "Огноо сонгох" }).click();
  await expect(page.getByRole("heading", { name: "Захиалгаа баталгаажуулах" })).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /төлөх/ }).click();
  await expect(page).toHaveURL(/\/booking\/confirmation\/[0-9a-f-]+\?email=/);
  await expect(page.getByRole("heading", { name: "Захиалга амжилттай баталгаажлаа" })).toBeVisible();
  await page.getByRole("link", { name: "Аяллаа claim хийх" }).click();
  await expect(page.getByRole("heading", { name: "Аяллаа claim хийх" })).toBeVisible();
  await expect(page.getByLabel("Баталгаатай имэйл")).toHaveValue("bat@example.com");
  await page.getByRole("link", { name: "Demo traveler portal нээх" }).click();
  await expect(page.getByRole("heading", { name: /Сайн байна уу/ })).toBeVisible();
});

test("staff itinerary update propagates to the authorized trip projection", async ({ page, request }) => {
  const tripsResponse = await request.get("http://127.0.0.1:4000/api/v1/me/trips", { headers: { "x-demo-traveler": "bat@example.com" } });
  const trips = await tripsResponse.json() as { items: Array<{ id: string }> };
  const tripResponse = await request.get(`http://127.0.0.1:4000/api/v1/me/trips/${trips.items[0]?.id}`, { headers: { "x-demo-traveler": "bat@example.com" } });
  const trip = await tripResponse.json() as { id:string; departure:{id:string}; itinerary:Array<{id:string;startsAt:string}> };
  const event = trip.itinerary[0];
  expect(event).toBeDefined();
  const update = await request.patch(`http://127.0.0.1:4000/api/v1/admin/departures/${trip.departure.id}/itinerary/${event?.id}`, {
    headers: { "content-type":"application/json", "x-demo-role":"OWNER" },
    data: { eventId:event?.id, title:"Airport meeting point updated", startsAt:event?.startsAt, location:"Terminal 2, information desk B", details:"Meet 90 minutes before check-in.", visibility:"TRAVELER" }
  });
  expect(update.ok()).toBe(true);
  await page.goto(`/account/trips/${trip.id}?email=bat%40example.com`);
  await expect(page.getByRole("heading", { name: "Airport meeting point updated" })).toBeVisible();
  await expect(page.getByText("Do not expose supplier margin")).toHaveCount(0);
});
