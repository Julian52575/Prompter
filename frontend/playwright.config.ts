import { defineConfig, devices } from "@playwright/test";

// Tests open the built file from file://, exactly as users do: run `npm run build` first.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // More parallel browsers starve each other of CPU (popups, clipboard, autosave timers) and make tests flaky.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
