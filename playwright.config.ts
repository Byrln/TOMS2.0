import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    { name: "chromium", testMatch: "toms.spec.ts", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", testMatch: "mobile.spec.ts", use: { ...devices["Pixel 7"] } }
  ],
  webServer: [
    { command: "pnpm --filter @toms/api dev", url: "http://127.0.0.1:4000/health", reuseExistingServer: true, timeout: 120_000 },
    { command: "pnpm --filter @toms/admin dev", url: "http://127.0.0.1:3000/admin/login", reuseExistingServer: true, timeout: 120_000 },
    { command: "pnpm --filter @toms/storefront dev", url: "http://127.0.0.1:3001", reuseExistingServer: true, timeout: 120_000 }
  ]
});
