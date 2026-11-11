import { describe, expect, it } from "vitest";
import { parseCompletion, planCompletion } from "./completion";
import type { Keep } from "./types";

const report = {
  format: "prompter-completion",
  version: 1,
  project: "Dolphin",
  threads: [
    {
      name: "Core",
      prompts: [
        { id: "a", name: "Cache layer", status: "completed", summary: "done" },
        { id: "zzz", name: "Invalidate", status: "partial" },
        { name: "Benchmark", status: "not-done" },
        { id: "gone", name: "Missing", status: "completed" },
        { id: "bad", name: "Bad status", status: "weird" },
        { status: "completed" },
      ],
    },
  ],
};

const keep = (id: string, name: string, status?: Keep["status"]): Keep => ({
  id,
  name,
  project: "Dolphin",
  savedAt: 0,
  templateId: "t",
  templateName: "T",
  values: {},
  modes: [],
  scope: "open",
  ...(status ? { status } : {}),
});

describe("parseCompletion", () => {
  it("reads bare JSON, a code fence and JSON with prose around it", () => {
    const json = JSON.stringify(report);
    for (const text of [json, "```json\n" + json + "\n```", `Here is the report:\n${json}\nThanks`]) {
      const r = parseCompletion(text);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.report.project).toBe("Dolphin");
        expect(r.report.prompts).toHaveLength(4);
        expect(r.report.skipped).toBe(2);
      }
    }
  });

  it("reports why it cannot read the text", () => {
    expect(parseCompletion("  ")).toEqual({ ok: false, error: "empty" });
    expect(parseCompletion("not json")).toEqual({ ok: false, error: "notJson" });
    expect(parseCompletion('{"format":"other"}')).toEqual({ ok: false, error: "notReport" });
    expect(parseCompletion('{"format":"prompter-completion","version":9,"threads":[]}')).toEqual({
      ok: false,
      error: "newer",
    });
  });
});

describe("planCompletion", () => {
  it("matches by id, falls back to the name, and maps outcomes to statuses", () => {
    const r = parseCompletion(JSON.stringify(report));
    if (!r.ok) throw new Error("parse");
    const keeps = [
      keep("a", "Cache layer", "downloaded"),
      keep("b", "Invalidate", "downloaded"),
      keep("c", "Benchmark", "downloaded"),
    ];
    const plan = planCompletion(r.report, keeps);
    expect(plan.changes).toEqual([
      { id: "a", name: "Cache layer", from: "downloaded", to: "completed" },
      // The id "zzz" matches nothing, so the name is used.
      { id: "b", name: "Invalidate", from: "downloaded", to: "copied" },
      { id: "c", name: "Benchmark", from: "downloaded", to: undefined },
    ]);
    expect(plan.unknown).toEqual(["Missing"]);
  });

  it("counts prompts that already have the reported status", () => {
    const r = parseCompletion(
      JSON.stringify({ ...report, threads: [{ name: "x", prompts: [{ id: "a", status: "completed" }] }] }),
    );
    if (!r.ok) throw new Error("parse");
    const plan = planCompletion(r.report, [keep("a", "Cache layer", "completed")]);
    expect(plan.changes).toEqual([]);
    expect(plan.unchanged).toBe(1);
  });
});
