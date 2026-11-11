import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { pathToFileURL } from "node:url";

const FILE = pathToFileURL(`${import.meta.dirname}/../dist/index.html`).href;

async function saveEmpty(page: Page, name: string, project?: string) {
  await page.getByRole("button", { name: "Save to To-Do Keep" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Prompt name").fill(name);
  if (project) await dialog.getByLabel("Project name").fill(project);
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
}

test("plan prompts on a roadmap and export it", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only in Playwright");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(FILE + "#/builder");
  await saveEmpty(page, "First", "Plan");
  await saveEmpty(page, "Second");
  await page.goto(FILE + "#/roadmap");
  await expect(page.getByRole("list").getByRole("button", { name: "First" })).toBeVisible();

  await expect(page.locator(".rm-list .rm-tpl").first()).toBeVisible();

  const canvas = page.locator(".rm-canvas");
  await page.locator(".rm-list li", { hasText: "First" }).dragTo(canvas);
  await expect(page.locator(".rm-grid .rm-block", { hasText: "First" })).toBeVisible();

  const block = page.locator(".rm-grid .rm-block", { hasText: "First" });
  await page.locator(".rm-list li", { hasText: "Second" }).dragTo(block, { targetPosition: { x: 38, y: 24 } });
  await expect(page.locator(".rm-grid .rm-block")).toHaveCount(2);
  await expect(page.locator(".rm-grid").getByLabel("Thread name")).toHaveValue("Thread 1");
  await page.locator(".rm-grid").getByLabel("Thread name").fill("Goal");

  await page.getByRole("button", { name: "Create new empty" }).click();
  const dlg = page.getByRole("dialog");
  await dlg.getByLabel("Prompt name").fill("Third");
  await dlg.getByLabel("Thread (optional)").selectOption({ label: "Goal" });
  await dlg.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.locator(".rm-grid .rm-block", { hasText: "Third" })).toBeVisible();

  await page.getByRole("button", { name: "Copy: Third" }).click();
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(page.locator("#rm-details").getByText("Copied").first()).toBeVisible();

  // Dropping on the thread-name tab continues the thread right under it.
  await page.getByRole("button", { name: "Create new empty" }).click();
  await page.getByRole("dialog").getByLabel("Prompt name").fill("Under name");
  await page.getByRole("dialog").getByRole("button", { name: "Create", exact: true }).click();
  // Closing the dialog returns focus to the Create button at the foot of the column; scroll back up.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator(".rm-list li", { hasText: "Under name" }).dragTo(page.locator(".rm-thread-name"));
  await expect(page.locator(".rm-grid .rm-block .rm-name").nth(1)).toHaveText("Under name");

  await page.getByRole("button", { name: "Mark as", exact: false }).first().click();
  await page.getByRole("button", { name: "Mark as cancelled" }).click();
  await expect(page.locator(".rm-grid .rm-block.rm-cancelled")).toHaveCount(1);
  await page.getByRole("button", { name: "Copy: Under name" }).click();
  await page.getByRole("button", { name: "Copy Re-Prompt Request" }).click();
  await expect(page.locator(".rm-grid .rm-block.rm-cancelled")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear status" }).click();

  await page.getByRole("button", { name: "Rename: Under name" }).click();
  await page.getByLabel("Prompt name").fill("Renamed");
  await page.keyboard.press("Enter");
  await expect(page.locator(".rm-grid .rm-block .rm-name").nth(1)).toHaveText("Renamed");
  await page.locator("#rm-details").getByLabel("Thread name").fill("Renamed thread");
  await expect(page.locator(".rm-grid").getByLabel("Thread name")).toHaveValue("Renamed thread");

  await expect(page.locator(".rm-grid .rm-tpl").first()).toBeVisible();
  await page.getByLabel("Show templates").uncheck();
  await expect(page.locator(".rm-tpl")).toHaveCount(0);
  await page.getByLabel("Show templates").check();

  // Dragging empty space pans the roadmap.
  await page.getByRole("button", { name: "Zoom in" }).click();
  await page.getByRole("button", { name: "Zoom in" }).click();
  await page.getByRole("button", { name: "Zoom in" }).click();
  await page.getByRole("button", { name: "Zoom in" }).click();
  const canvas2 = page.locator(".rm-canvas");
  const box = (await canvas2.boundingBox())!;
  await canvas2.evaluate((el) => (el.scrollTop = 0));
  // The spare column on the left of the grid is empty space.
  await page.mouse.move(box.x + 60, box.y + box.height - 40);
  await page.mouse.down();
  await page.mouse.move(box.x + 60, box.y + 30, { steps: 5 });
  await page.mouse.up();
  expect(await canvas2.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Reset zoom" }).click();

  // The handle under the roadmap steps through preset heights, and dragging resizes freely.
  const handle = page.getByRole("button", { name: /Roadmap height/ });
  const h0 = (await page.locator(".rm-canvas").boundingBox())!.height;
  await handle.press("Enter");
  const h1 = (await page.locator(".rm-canvas").boundingBox())!.height;
  expect(h1).toBeGreaterThan(h0);
  const hb = (await handle.boundingBox())!;
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2 + 80, { steps: 5 });
  await page.mouse.up();
  expect((await page.locator(".rm-canvas").boundingBox())!.height).toBeGreaterThan(h1 + 40);
  for (let i = 0; i < 5; i++) await handle.press("Enter");

  await page.getByRole("button", { name: "Zoom out" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Reset zoom" })).toHaveText("Zoom 45%");

  await page.getByRole("button", { name: "Export Mermaid" }).click();
  const code = await page.getByLabel("Mermaid code").inputValue();
  expect(code).toContain("flowchart TD");
  expect(code).toContain('subgraph t1["Renamed thread"]');
  expect(code).toContain('["First"]');
  expect(code).toContain("p1 --> p2");
  expect(code).toContain("p2 --> p3");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
