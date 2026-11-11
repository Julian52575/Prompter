import { readFileSync } from "node:fs";
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
  // Prompts saved without filling the template are marked incomplete, and the checkbox hides the mark.
  await expect(page.locator(".rm-list .rm-incomplete").first()).toBeVisible();
  await page.getByLabel("Show incomplete").uncheck();
  await expect(page.locator(".rm-incomplete")).toHaveCount(0);
  await page.getByLabel("Show incomplete").check();

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
  // Mark as has an Unmark option once a status is set.
  await page.getByRole("button", { name: "Mark as", exact: false }).first().click();
  await page.getByRole("button", { name: "Unmark" }).click();
  await expect(page.locator(".rm-grid .rm-block.rm-cancelled")).toHaveCount(0);

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
  // Zoom in as far as it goes, whatever the default is.
  const zoomIn = page.getByRole("button", { name: "Zoom in" });
  while (await zoomIn.isEnabled()) await zoomIn.click();
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
  // Centre the handle on screen so the drag stays inside the window.
  await handle.evaluate((el) => el.scrollIntoView({ block: "center" }));
  const hb = (await handle.boundingBox())!;
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2 + 80, { steps: 5 });
  expect((await page.locator(".rm-canvas").boundingBox())!.height).toBeGreaterThan(h1 + 40);
  // Scrolling with the wheel during the drag adds the scrolled distance and nothing more (no runaway growth).
  const h2 = (await page.locator(".rm-canvas").boundingBox())!.height;
  await page.mouse.wheel(0, 150);
  await page.waitForTimeout(300);
  const h3 = (await page.locator(".rm-canvas").boundingBox())!.height;
  expect(h3).toBeGreaterThanOrEqual(h2);
  expect(h3).toBeLessThan(h2 + 150 + 60);
  await page.mouse.up();
  for (let i = 0; i < 5; i++) await handle.press("Enter");

  await page.getByRole("button", { name: "Zoom out" }).click();
  const zoomLabel = await page.getByRole("button", { name: "Reset zoom" }).innerText();
  await page.reload();
  await expect(page.getByRole("button", { name: "Reset zoom" })).toHaveText(zoomLabel);
  // The selected prompt comes back after a reload.
  await expect(page.locator("#rm-details")).toBeVisible();

  await page.getByRole("button", { name: "Export Mermaid" }).click();
  const code = await page.getByLabel("Mermaid code").inputValue();
  expect(code).toContain("flowchart TD");
  expect(code).toContain('subgraph t1["Renamed thread"]');
  expect(code).toContain('["First"]');
  expect(code).toContain("p1 --> p2");
  expect(code).toContain("p2 --> p3");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("download a project as a ZIP", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "downloads are checked in Chromium only");
  await page.goto(FILE + "#/builder");
  await page.getByRole("tablist", { name: "Template" }).getByRole("tab", { name: "Research", exact: true }).click();
  await page.getByRole("radio", { name: "Bug & Optimisations Hunt" }).check();
  await page.getByLabel("Goal (required)").fill("Stop the crash.");
  await page.getByLabel("Context").fill("The app crashes on save.");
  await page.getByRole("button", { name: "Add source (path, name or link)" }).click();
  await page.getByLabel("Source (path, name or link) 1", { exact: true }).fill("src/save.ts");
  await saveEmpty(page, "Alpha", "Dolphin");
  await saveEmpty(page, "Beta");

  await page.goto(FILE + "#/roadmap");
  await page.getByRole("button", { name: "Create new empty" }).click();
  await page.getByRole("dialog").getByLabel("Prompt name").fill("Blank");
  await page.getByRole("dialog").getByRole("button", { name: "Create", exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator(".rm-list li", { hasText: "Alpha" }).dragTo(page.locator(".rm-canvas"));
  await page.locator(".rm-list li", { hasText: "Beta" }).dragTo(page.locator(".rm-thread-name"));
  const alpha = page.locator(".rm-grid .rm-block", { hasText: "Alpha" });
  await page.locator(".rm-list li", { hasText: "Blank" }).dragTo(alpha, { targetPosition: { x: 85, y: 17 } });
  await expect(page.locator(".rm-grid .rm-block")).toHaveCount(3);

  // An incomplete prompt in a selected thread blocks the download until its thread is unticked.
  await page.getByRole("button", { name: "Download project" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("alert")).toContainText("Blank");
  // The warning sits above the thread list, where it is seen first.
  const alertY = (await dialog.getByRole("alert").boundingBox())!.y;
  const threadsY = (await dialog.getByText("Threads to include").boundingBox())!.y;
  expect(alertY).toBeLessThan(threadsY);
  await expect(dialog.getByRole("button", { name: "Download", exact: true })).toBeDisabled();
  await dialog.getByLabel(/Thread 1 - 1/).uncheck();
  await expect(dialog.getByRole("button", { name: "Download", exact: true })).toBeEnabled();

  // A branch can only leave its parent thread out once the prompt it starts from is Completed.
  const branch = dialog.getByLabel(/Thread 1 - 1/);
  await dialog.getByLabel(/^Thread 1 \(/).uncheck();
  await expect(branch).toBeDisabled();
  await expect(dialog).toContainText("Mark that prompt Completed");
  await dialog.getByLabel(/^Thread 1 \(/).check();
  await branch.check();
  await dialog.getByLabel(/Thread 1 - 1/).uncheck();

  // A click outside the dialog closes it; a click inside does not.
  await dialog.getByText("Threads to include").click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Download project" }).click();
  await expect(dialog.getByLabel(/Thread 1 - 1/)).not.toBeChecked();

  // The structure preview is folded away until opened, and follows the ticked threads.
  const tree = dialog.locator(".dl-tree");
  await expect(tree.locator("pre")).toBeHidden();
  await tree.locator("summary").click();
  await expect(tree.locator("pre")).toContainText("01-Alpha/");
  await expect(tree.locator("pre")).not.toContainText("Blank");

  // The worktree option needs branches, so it switches that option on and locks it.
  await dialog.getByLabel("Worktree").check();
  await expect(dialog.getByLabel("Multi-branch commit")).toBeChecked();
  await expect(dialog.getByLabel("Multi-branch commit")).toBeDisabled();
  // The shared brief needs sub-agents: locked until that is ticked.
  await expect(dialog.getByLabel("Shared context brief")).toBeDisabled();
  await dialog.getByLabel("Sub-agent delegation").check();
  await dialog.getByLabel("Shared context brief").check();
  await dialog.getByLabel("Re-prompt first").check();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("button", { name: "Download", exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("Prompter-Dolphin.zip");
  const text = readFileSync((await download.path())!).toString("utf8");
  expect(text.startsWith("PK")).toBe(true);
  // Everything sits in a Project-<name> folder, with the helper scripts and their liability notice.
  for (const part of [
    "Project-Dolphin/AGENTS.md",
    "Project-Dolphin/Roadmap.mmd",
    "Project-Dolphin/thread-1/01-Alpha/Prompt.md",
    "Project-Dolphin/thread-1/02-Beta/Prompt.md",
    "Project-Dolphin/scripts/shared/LIABILITY.md",
    "Project-Dolphin/scripts/shared/README.tsv",
    "Project-Dolphin/scripts/shared/completion_to_md.py",
  ])
    expect(text).toContain(part);
  expect(text).toContain("First: settle uncertainties");
  expect(text).toContain("read-only pre-flight");
  expect(text).toContain("## Completion record");
  expect(text).toContain("Run none, and let no sub-agent run any, until I say yes");
  expect(text).toContain("Worktrees: ON");
  expect(text).toContain("Shared context: ON");
  expect(text).toContain("Re-prompt first: ON");
  // The files are worded for the agent that carries the prompt out, not for a reviewer.
  expect(text).toContain("You are the AI agent this prompt is for.");
  expect(text).not.toContain("Do not carry out the task it describes");
  expect(text).not.toContain("Blank");

  // The choices come back when the dialog is opened again, and after a reload.
  for (const reload of [false, true]) {
    if (reload) {
      await page.reload();
    }
    await page.getByRole("button", { name: "Download project" }).click();
    const again = page.getByRole("dialog");
    // Both prompts were sent, so another download is blocked until they are unmarked.
    await expect(again.getByRole("alert")).toContainText("Downloaded");
    await expect(again.getByRole("button", { name: "Download", exact: true })).toBeDisabled();
    await expect(again.getByLabel("Worktree")).toBeChecked();
    await expect(again.getByLabel("Re-prompt first")).toBeChecked();
    await expect(again.getByLabel("Sub-agent delegation")).toBeChecked();
    await expect(again.getByLabel("Shared context brief")).toBeChecked();
    await expect(again.getByLabel(/Thread 1 - 1/)).not.toBeChecked();
    await page.mouse.click(4, 4);
    await expect(again).toBeHidden();
  }
});

test("import a completion report to update prompt statuses", async ({ page }) => {
  await page.goto(FILE + "#/builder");
  await saveEmpty(page, "Alpha", "Dolphin");
  await saveEmpty(page, "Beta");
  await page.goto(FILE + "#/roadmap");

  await page.getByRole("button", { name: "Import completion" }).click();
  const dialog = page.getByRole("dialog");
  const apply = dialog.getByRole("button", { name: "Apply" });
  await expect(apply).toBeDisabled();
  await dialog.getByLabel("Completion report").fill("not json");
  await expect(dialog).toContainText("not valid JSON");
  await expect(apply).toBeDisabled();

  // Prompts are matched by name when the id is not known here.
  const report = {
    format: "prompter-completion",
    version: 1,
    project: "Dolphin",
    threads: [
      {
        name: "Thread 1",
        prompts: [
          { id: "unknown", name: "Alpha", status: "completed", summary: "done" },
          { name: "Beta", status: "cancelled" },
          { name: "Gone", status: "completed" },
        ],
      },
    ],
  };
  await dialog.getByLabel("Completion report").fill("```json\n" + JSON.stringify(report) + "\n```");
  await expect(dialog).toContainText("Alpha: no status → Completed");
  await expect(dialog).toContainText("Beta: no status → Cancelled");
  await expect(dialog).toContainText("Not found in Prompter, ignored: Gone");
  await apply.click();
  await expect(dialog).toBeHidden();
  await expect(page.locator(".rm-list li", { hasText: "Alpha" }).locator(".status")).toHaveText("Completed");
  await expect(page.locator(".rm-list li", { hasText: "Beta" }).locator(".status")).toHaveText("Cancelled");

  // A second import with the same outcomes has nothing left to change.
  await page.getByRole("button", { name: "Import completion" }).click();
  await page.getByRole("dialog").getByLabel("Completion report").fill(JSON.stringify(report));
  await expect(page.getByRole("dialog")).toContainText("Nothing to update");
});
