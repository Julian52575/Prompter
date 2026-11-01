import AxeBuilder from "@axe-core/playwright";
import { type BrowserContext, expect, type Page, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const FILE = pathToFileURL(`${import.meta.dirname}/../dist/index.html`).href;

/** Opens the app, failing the test on any console error or request other than the file. */
async function open(page: Page, hash = "#/builder") {
  const problems: string[] = [];
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("request", (r) => r.url().split("#")[0] !== FILE && !r.url().startsWith("data:") && !r.url().startsWith("blob:") && problems.push(`request: ${r.url()}`));
  await page.goto(FILE + hash);
  await expect(page.getByRole("heading", { name: "Prompt Builder", level: 1 })).toBeVisible();
  return problems;
}

async function chooseTemplate(page: Page, name: string) {
  await page.getByRole("tablist", { name: "Template" }).getByRole("tab", { name, exact: true }).click();
}

async function fillReview(page: Page) {
  await chooseTemplate(page, "Research");
  await page.getByRole("radio", { name: "Bug Hunt" }).check();
  await page.getByLabel("Goal (required)").fill("Stop the crash.");
  await page.getByLabel("Context").fill("The app crashes on save.");
  await page.getByRole("button", { name: "Add source (path, name or link)" }).click();
  await page.getByLabel("Source (path, name or link) 1", { exact: true }).fill("src/save.ts");
}

const output = (page: Page) => page.getByLabel("Generated prompt");

test("opens from file:// with no errors, no requests and the CSP first in head", async ({ page }) => {
  const problems = await open(page);
  expect(await page.evaluate(() => document.head.firstElementChild?.getAttribute("http-equiv"))).toBe("Content-Security-Policy");
  await expect(page).toHaveTitle("Builder – Prompt Builder");
  await page.getByRole("link", { name: "History" }).click();
  await expect(page).toHaveTitle("History – Prompt Builder");
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page).toHaveTitle("Settings – Prompt Builder");
  expect(problems).toEqual([]);
  expect(readFileSync(new URL(FILE)).length).toBeLessThanOrEqual(256_000);
});

test("task list: add, depend on an earlier task, reorder by keyboard, generate", async ({ page }) => {
  await open(page);
  await page.getByRole("button", { name: "Generate" }).click();
  await expect(page.locator("#error-summary")).toBeFocused();
  await expect(page.locator("#error-summary")).toContainText("Nothing to generate");

  await page.getByLabel("Context").fill("A parser for config files.");
  const tasks = page.locator(".item");
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByLabel("Title")).toBeFocused();
  await page.keyboard.type("Parser");
  await tasks.nth(0).getByLabel("Details (required)").fill("Write the parser.");
  await expect(tasks.nth(0).getByLabel("Depends on")).toHaveCount(1);
  await expect(tasks.nth(0).getByRole("option")).toHaveText(["None"]);

  await page.getByRole("button", { name: "Add task" }).click();
  await page.keyboard.type("Docs");
  await tasks.nth(1).getByLabel("Details (required)").fill("Write the docs.");

  await page.getByRole("button", { name: "Move down: Parser" }).click();
  await expect(page.getByRole("button", { name: "Move down: Parser" })).toBeFocused();
  await expect(page.locator("[aria-live=polite]")).toHaveText("Parser moved to position 2 of 2");
  // Last position: Move down is disabled, so focus moves to Move up.
  await page.getByRole("button", { name: "Move down: Parser" }).press("Enter");
  await expect(page.getByRole("button", { name: "Move up: Parser" })).toBeFocused();

  await tasks.nth(1).getByLabel("Depends on").selectOption({ label: "Task 1: Docs" });

  await page.getByRole("button", { name: "Generate" }).click();
  await expect(output(page)).toBeFocused();
  await expect(output(page)).toHaveValue(
    /## Context\nA parser for config files\.\n\n## Task 1: Docs\n\*\*Details:\*\*\nWrite the docs\.\n\n## Task 2: Parser\n\*\*Details:\*\*\nWrite the parser\.\n\*\*Depends on:\*\* Task 1: Docs\n\nAfter completing/,
  );
  await expect(page.locator("[aria-live=polite]")).toHaveText("Prompt generated");
});

test("research: required fields and Restricted scope block Generate", async ({ page }) => {
  await open(page);
  await chooseTemplate(page, "Research");
  await page.getByLabel("Context").fill("x");
  await page.getByRole("radio", { name: /Restricted/ }).check();
  await page.getByRole("button", { name: "Generate" }).click();
  const summary = page.locator("#error-summary");
  await expect(summary).toBeFocused();
  await expect(summary.getByRole("link")).toHaveText([
    "Choose a deliverable.",
    "Goal is required.",
    "Restricted scope needs at least one source. Add a source or choose Open.",
  ]);
  await summary.getByRole("link", { name: "Goal is required." }).click();
  await expect(page.getByLabel("Goal (required)")).toBeFocused();
  await expect(page.getByLabel("Goal (required)")).toHaveAttribute("aria-invalid", "true");
});

test("hand edits: confirm before replacing, saved to history, identical regenerate skipped", async ({ page }) => {
  await open(page);
  await fillReview(page);
  await page.getByRole("radio", { name: "Cheap Lookup" }).check();
  await page.getByRole("checkbox", { name: "Conversation" }).check();
  await page.getByRole("button", { name: "Generate" }).click();
  await expect(output(page)).toHaveValue(/## Effort\nDo a quick lookup/);
  await expect(output(page)).toHaveValue(/## Reply mode\nThis overrides/);

  await page.getByRole("button", { name: "Generate" }).click();
  await expect(page.locator("#status")).toHaveText("Prompt generated. Identical to the last history entry, so none was added");

  await output(page).fill("My edited prompt");
  await page.getByRole("button", { name: "Generate" }).click();
  const dialog = page.getByRole("dialog", { name: "Replace your edits?" });
  await expect(dialog.getByRole("button", { name: "Keep editing" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(output(page)).toHaveValue("My edited prompt");
  await expect(page.getByRole("button", { name: "Generate" })).toBeFocused();

  await page.waitForTimeout(700);
  await page.getByRole("link", { name: "History" }).click();
  await expect(page.locator(".history-row")).toHaveCount(1);
  await expect(page.locator(".history-row")).toContainText("Edited");
  await expect(page.locator(".history-row .summary")).toHaveText("Stop the crash.");
});

test("drafts survive a reload; restore brings an entry back", async ({ page }) => {
  await open(page);
  await fillReview(page);
  await page.getByRole("button", { name: "Generate" }).click();
  await page.waitForTimeout(700);
  await page.reload();
  await expect(page.getByRole("tab", { name: "Research", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByLabel("Goal (required)")).toHaveValue("Stop the crash.");

  await page.getByLabel("Goal (required)").fill("Something else");
  await page.getByRole("link", { name: "History" }).click();
  await page.getByRole("button", { name: /^Restore/ }).click();
  await page.getByRole("dialog", { name: "Replace the current draft?" }).getByRole("button", { name: "Replace" }).click();
  await expect(page).toHaveTitle("Builder – Prompt Builder");
  await expect(page.getByLabel("Goal (required)")).toHaveValue("Stop the crash.");
});

test("copy and re-prompt request preview match", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only in Playwright");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page);
  await fillReview(page);
  await page.getByRole("button", { name: "Generate" }).click();
  await output(page).fill("Use ```js``` blocks");
  await page.getByRole("radio", { name: "Re-Prompt Request" }).check();
  await page.locator("summary", { hasText: "Re-Prompt Request preview" }).click();
  const preview = await page.getByLabel("Re-Prompt Request preview").inputValue();
  expect(preview).toContain("````markdown\nUse ```js``` blocks\n````");
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(page.locator("[aria-live=polite]")).toHaveText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(preview);
});

async function interceptPopups(context: BrowserContext) {
  const urls: string[] = [];
  await context.route(/^https:/, (r) => {
    urls.push(r.request().url());
    return r.abort();
  });
  return urls;
}

test("open in ChatGPT asks first, Cancel opens nothing, long prompts fall back", async ({ page, context }) => {
  const urls = await interceptPopups(context);
  await open(page);
  await fillReview(page);
  await page.getByRole("button", { name: "Generate" }).click();
  const btn = page.getByRole("button", { name: "Open in ChatGPT (opens in a new tab)" });

  await btn.click();
  const dialog = page.getByRole("dialog", { name: "Send this prompt to ChatGPT?" });
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await page.waitForTimeout(300);
  expect(urls).toEqual([]);

  await btn.click();
  await dialog.getByLabel("Don't ask again for ChatGPT").check();
  const popup = context.waitForEvent("page");
  await dialog.getByRole("button", { name: "Open ChatGPT" }).click();
  await popup;
  await expect.poll(() => urls.at(-1)).toMatch(/^https:\/\/chatgpt\.com\/\?q=Write%20all%20of%20your%20replies%20to%20me%20in%20English\.%20[^\n]*%0A%0AResearch%20the%20goal/);

  // The popup takes focus in Firefox; input events only reach the page in front.
  await page.bringToFront();
  await output(page).fill("x".repeat(9000));
  await expect(output(page)).toHaveValue(/^x{9000}$/);
  const popup2 = context.waitForEvent("page");
  await page.bringToFront();
  await btn.click();
  await popup2;
  // Firefox may retry the earlier aborted popup, so look for the home URL anywhere.
  await expect.poll(() => urls.includes("https://chatgpt.com/")).toBe(true);
  // The status waits for the clipboard, which a busy browser can delay while the popup has focus.
  await expect(page.locator("#status")).toContainText("too long for a link", { timeout: 15_000 });
});

test("a change in one tab appears in another; a conflicting edit shows the banner", async ({ context }) => {
  const a = await context.newPage();
  const b = await context.newPage();
  await open(a, "#/settings");
  await open(b, "#/settings");
  // Firefox delivers input only to the tab in front.
  await a.bringToFront();
  await a.getByRole("radio", { name: "Dark" }).check();
  await expect(b.getByRole("radio", { name: "Dark" })).toBeChecked();

  await a.getByRole("link", { name: "Builder" }).click();
  await chooseTemplate(a, "Research");
  await a.waitForTimeout(700);
  await b.bringToFront();
  await b.getByRole("link", { name: "Builder" }).click();
  await chooseTemplate(b, "Research");
  await b.getByLabel("Context").fill("mine");
  // a writes while b's autosave is still pending.
  await a.evaluate(() => {
    const drafts = JSON.parse(localStorage.getItem("pb.drafts") ?? "{}");
    drafts.review = { values: { situation: "theirs" }, modes: [], scope: "open", output: "", baseline: "", entryId: null, outputType: "bare", updatedAt: 0 };
    localStorage.setItem("pb.drafts", JSON.stringify(drafts));
  });
  await expect(b.getByText("This data was changed in another tab.")).toBeVisible();
  await b.getByRole("button", { name: "Load theirs" }).click();
  await expect(b.getByLabel("Context")).toHaveValue("theirs");
});

test("export, then import with Replace all into a clean profile", async ({ page, browser }) => {
  await open(page);
  await fillReview(page);
  await page.getByRole("button", { name: "Generate" }).click();
  await page.getByRole("link", { name: "Settings" }).click();
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export all" }).click();
  const file = await dl;
  expect(file.suggestedFilename()).toMatch(/^prompt-builder-export-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await file.path();

  const fresh = await browser.newContext();
  const p2 = await fresh.newPage();
  await open(p2, "#/settings");
  await p2.locator("#import-file").setInputFiles(path);
  await p2.getByRole("dialog", { name: "Import data" }).getByRole("button", { name: "Replace all" }).click();
  await p2.getByRole("dialog", { name: /Replace all current data/ }).getByRole("button", { name: "Replace all" }).click();
  await expect(p2.locator("[aria-live=polite]")).toHaveText("Import complete");
  await p2.getByRole("link", { name: "History" }).click();
  await expect(p2.locator(".history-row")).toHaveCount(1);

  await p2.getByRole("link", { name: "Settings" }).click();
  await p2.locator("#import-file").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from('{"app":"x"}') });
  await expect(p2.getByRole("alert").filter({ hasText: "not imported" })).toBeVisible();
  await fresh.close();
});

test("research: form order, Effort defaults to Case-closed, no reply mode is selected", async ({ page }) => {
  await open(page);
  await chooseTemplate(page, "Research");
  const order = await page.locator("#form-heading ~ div legend, #form-heading ~ div .field > label").allTextContents();
  const idx = (t: string) => order.findIndex((x) => x.startsWith(t));
  expect(idx("Deliverable")).toBeLessThan(idx("Goal"));
  expect(idx("Goal")).toBeLessThan(idx("Context"));
  expect(idx("Context")).toBeLessThan(idx("Source scope"));
  expect(idx("Source scope")).toBeLessThan(idx("Sources"));
  expect(idx("Sources")).toBeLessThan(idx("Effort"));
  expect(idx("Effort")).toBeLessThan(idx("Reply mode"));
  expect(order.some((x) => x.startsWith("Action required") || x.startsWith("Report destination"))).toBe(false);
  await expect(page.getByRole("radio", { name: "Case-closed" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Conversation" })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: "Standard" })).toHaveCount(0);
});

test("clear form resets fields, radios and the prompt after confirming", async ({ page }) => {
  await open(page);
  await fillReview(page);
  await page.getByRole("radio", { name: "Cheap Lookup" }).check();
  await page.getByRole("checkbox", { name: "Conversation" }).check();
  await page.getByRole("button", { name: "Generate" }).click();
  await page.getByRole("button", { name: "Clear form" }).click();
  const dialog = page.getByRole("dialog", { name: "Clear the form?" });
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Goal (required)")).toHaveValue("Stop the crash.");

  await page.getByRole("button", { name: "Clear form" }).click();
  await dialog.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByLabel("Goal (required)")).toHaveValue("");
  await expect(page.getByLabel("Context")).toHaveValue("");
  await expect(page.getByRole("radio", { name: "Bug Hunt" })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: "Case-closed" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Conversation" })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: /^Open/ })).toBeChecked();
  await expect(output(page)).toHaveValue("");
  await expect(page.locator("[aria-live=polite]")).toHaveText("Form cleared");
  await page.getByRole("link", { name: "History" }).click();
  await expect(page.locator(".history-row")).toHaveCount(1);
});

test("template tabs switch with the keyboard", async ({ page }) => {
  await open(page);
  const tabs = page.getByRole("tablist", { name: "Template" });
  await tabs.getByRole("tab", { name: "Task list" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.getByRole("tab", { name: "Research" })).toBeFocused();
  await expect(tabs.getByRole("tab", { name: "Research" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: "Research" })).toBeVisible();
  await expect(page.getByLabel("Goal (required)")).toBeVisible();
  await page.keyboard.press("Home");
  await expect(tabs.getByRole("tab", { name: "Task list" })).toHaveAttribute("aria-selected", "true");

  await page.getByRole("button", { name: "New template" }).click();
  await expect(page).toHaveTitle("Settings – Prompt Builder");
  await expect(page.getByRole("heading", { name: "New template" })).toBeVisible();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("New template");
});

test.describe("language", () => {
  test.use({ locale: "fr-FR" });

  test("a French browser gets the French UI, and the prompt stays English with a French reply line", async ({ page }) => {
    await page.goto(FILE);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page).toHaveTitle("Éditeur – Prompt Builder");
    await page.getByRole("tab", { name: "Recherche" }).click();
    await page.getByRole("radio", { name: "Chasse au bug" }).check();
    await page.getByRole("button", { name: "Générer" }).click();
    await expect(page.locator("#error-summary")).toContainText("Le champ « Objectif » est obligatoire.");
    await page.getByLabel("Objectif (obligatoire)").fill("Arrêter le crash.");
    await page.getByRole("button", { name: "Générer" }).click();
    const prompt = page.getByLabel("Prompt généré");
    await expect(prompt).toHaveValue(/^Write all of your replies to me in French\. [^\n]+\n\nResearch the goal/);
    await expect(prompt).toHaveValue(/## Goal\n\*\*Bug Hunt:\*\* Arrêter le crash\./);
    await expect(prompt).toHaveValue(/## Effort\n/);

    await page.getByRole("link", { name: "Paramètres" }).click();
    await page.getByRole("radio", { name: "English" }).check();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { name: "Settings", level: 2 })).toBeVisible();
    await page.getByRole("radio", { name: /^Browser default \(Français\)/ }).check();
    await expect(page.getByRole("heading", { name: "Paramètres", level: 2 })).toBeVisible();
  });
});

test("JSON view: lint errors are listed and block Apply", async ({ page }) => {
  await open(page, "#/settings");
  await page.getByRole("button", { name: "Edit: Research" }).click();
  await page.getByText("Advanced: JSON view").click();
  const json = page.getByLabel("Template JSON");
  await json.fill('{ "id": "review", "name": }');
  await expect(page.locator("#tpl-json-lint")).toContainText("Line 1, column");
  await expect(page.getByRole("button", { name: "Apply" })).toBeDisabled();
  await page.getByRole("button", { name: "Revert JSON" }).click();
  const text = await json.inputValue();
  await json.fill(text.replace('"name": "Research"', '"name": "My review"'));
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("My review");
  await page.getByRole("button", { name: "Save" }).first().click();
  await page.getByRole("link", { name: "Builder" }).click();
  await expect(page.getByRole("tab")).toHaveText(["Task list", "My review"]);
});

test.describe("accessibility", () => {
  for (const view of ["builder", "history", "settings"])
    test(`axe: ${view}`, async ({ page }) => {
      await open(page, `#/${view}`);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
    });

  test("axe: dark theme and a dialog", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await open(page);
    await fillReview(page);
    await page.getByRole("button", { name: "Generate" }).click();
    await page.getByRole("button", { name: /Open in ChatGPT/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(r.violations.map((v) => v.id)).toEqual([]);
  });

  for (const [theme, label] of [
    ["platformer", "Retro platformer"],
    ["dragon", "Dragon I"],
    ["adventure", "Adventure"],
  ])
    test(`axe: ${label} theme on every view`, async ({ page }) => {
      await open(page, "#/settings");
      await page.getByRole("radio", { name: label, exact: true }).check();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      for (const view of ["builder", "history", "settings"]) {
        await page.getByRole("link", { name: view[0].toUpperCase() + view.slice(1) }).click();
        const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
        expect(r.violations.map((v) => `${view} ${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`)).toEqual([]);
      }
    });

  test("no horizontal scrolling at 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const view of ["builder", "history", "settings"]) {
      await open(page, `#/${view}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    }
  });
});
