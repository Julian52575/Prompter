import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { expect, type Page, test } from "@playwright/test";

/**
 * Memory budget: no page may use more than 5 MB of JavaScript heap. Heap use is
 * measured after a forced garbage collection, through the Chrome DevTools
 * protocol, so this runs in Chromium only. Results go to the CI job summary.
 */
const BUDGET_MB = 5;
const HISTORY_ENTRIES = 200;
const FILE = pathToFileURL(`${import.meta.dirname}/../dist/index.html`).href;
const MB = 1024 * 1024;

interface Sample {
  page: string;
  heapMb: number;
  nodes: number;
}

test.skip(({ browserName }) => browserName !== "chromium", "heap metrics need the Chrome DevTools protocol");

/** History entries as the app stores them, so the History page renders a realistic list. */
function seedHistory(n: number): Record<string, string> {
  const items: Record<string, string> = { "pb.version": "1" };
  const index = [];
  for (let i = 0; i < n; i++) {
    const prompt = `Write all of your replies to me in English.\n\n## Goal\nEntry ${i}: ${"lorem ipsum ".repeat(40)}\n`;
    const e = {
      id: `seed${i}`,
      createdAt: 1_790_000_000_000 - i * 60_000,
      templateId: "review",
      templateName: "Research",
      inputs: { goal: `Entry ${i}` },
      modes: [],
      modeLabel: "",
      scope: "open",
      generated: prompt,
      prompt,
      edited: i % 3 === 0,
      summary: `Entry ${i}: investigate the failing build`,
    };
    items[`pb.h.${e.id}`] = JSON.stringify(e);
    const { inputs: _i, generated: _g, prompt: _p, modes: _m, modeLabel: _l, scope: _s, ...row } = e;
    index.push(row);
  }
  items["pb.history"] = JSON.stringify(index);
  return items;
}

test("every page stays within the memory budget", async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  const samples: Sample[] = [];
  const measure = async (name: string) => {
    await page.waitForTimeout(300);
    await cdp.send("HeapProfiler.collectGarbage");
    const { metrics } = await cdp.send("Performance.getMetrics");
    const get = (n: string) => metrics.find((m) => m.name === n)?.value ?? 0;
    samples.push({ page: name, heapMb: get("JSHeapUsedSize") / MB, nodes: get("Nodes") });
  };
  // A hash-only goto does not reload; reload so each page starts from stored data.
  const go = async (p: Page, hash: string) => {
    await p.goto(FILE + hash);
    await p.reload();
    await expect(p.getByRole("heading", { name: "Prompt Builder", level: 1 })).toBeVisible();
  };

  await go(page, "#/builder");
  await measure("Builder – Task list");

  await page.getByRole("tab", { name: "Research", exact: true }).click();
  await page.getByRole("radio", { name: "Bug & Optimisations Hunt" }).check();
  await page.getByLabel("Goal (required)").fill("Stop the crash on save.");
  await page.getByLabel("Context").fill("The app crashes when saving a large file.\n".repeat(20));
  await page.getByRole("button", { name: "Generate" }).click();
  await page.getByRole("radio", { name: "Re-Prompt Request" }).check();
  await measure("Builder – Research, generated, re-prompt request");

  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("pb.settings") ?? "{}");
    localStorage.setItem("pb.settings", JSON.stringify({ ...s, theme: "platformer" }));
  });
  await go(page, "#/builder");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "platformer");
  await measure("Builder – Retro platformer theme");

  await page.evaluate((items) => {
    for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v);
  }, seedHistory(HISTORY_ENTRIES));
  await go(page, "#/history");
  // The seeded entries plus the one Generate added above.
  await expect(page.locator(".history-row")).toHaveCount(HISTORY_ENTRIES + 1);
  await measure(`History – ${HISTORY_ENTRIES} entries`);

  await go(page, "#/settings");
  await measure("Settings");

  await page.getByRole("button", { name: "Edit: Research" }).click();
  await page.getByText("Advanced: JSON view").click();
  await measure("Settings – template editor with JSON view");

  report(samples);
  for (const s of samples) expect(s.heapMb, `${s.page} uses ${s.heapMb.toFixed(2)} MB`).toBeLessThanOrEqual(BUDGET_MB);
});

function report(samples: Sample[]): void {
  const f = (n: number) => n.toFixed(2);
  const heaps = samples.map((s) => s.heapMb);
  const max = Math.max(...heaps);
  const mean = heaps.reduce((a, b) => a + b, 0) / heaps.length;
  const worst = samples.find((s) => s.heapMb === max)!;
  const lines = [
    "### Memory budget",
    "",
    `JavaScript heap per page after garbage collection, Chromium. Budget: **${BUDGET_MB} MB** per page.`,
    "",
    "| Page | JS heap (MB) | Share of budget | DOM nodes | Result |",
    "| --- | ---: | ---: | ---: | --- |",
    ...samples.map(
      (s) =>
        `| ${s.page} | ${f(s.heapMb)} | ${Math.round((s.heapMb / BUDGET_MB) * 100)} % | ${s.nodes} | ${s.heapMb <= BUDGET_MB ? "✅ within budget" : "❌ over budget"} |`,
    ),
    "",
    "| Statistic | Value |",
    "| --- | ---: |",
    `| Pages measured | ${samples.length} |`,
    `| Highest | ${f(max)} MB (${worst.page}) |`,
    `| Lowest | ${f(Math.min(...heaps))} MB |`,
    `| Mean | ${f(mean)} MB |`,
    `| Headroom on the highest page | ${f(BUDGET_MB - max)} MB |`,
    "",
  ].join("\n");
  mkdirSync(`${import.meta.dirname}/../test-results`, { recursive: true });
  writeFileSync(`${import.meta.dirname}/../test-results/memory.md`, lines);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines}\n`);
  else console.log(lines);
}
