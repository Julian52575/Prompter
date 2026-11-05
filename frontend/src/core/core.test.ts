import { BUILTIN_WRAPPER, RESEARCH, TASK_LIST } from "./builtins";
import { effectiveModes, effectiveTemplates, hasUpdate, matchValues, offeredModes } from "./catalog";
import { checkTemplate, lintTemplateText } from "./lint";
import {
  addHistoryEntry,
  exportData,
  formatSize,
  importData,
  KEYS,
  memoryBackend,
  repo,
  Store,
  STORAGE_VERSION,
  validateExport,
} from "./storage";
import type { HistoryEntry, Template } from "./types";
import { buildLink, LINK_CAP, lintProvider, lintWrapper, wrapPrompt } from "./wrap";

const entry = (id: string, createdAt: number): HistoryEntry => ({
  id,
  createdAt,
  templateId: "review",
  templateName: "Review",
  inputs: {},
  modes: [],
  modeLabel: "",
  scope: "open",
  generated: "x\n",
  prompt: "x\n",
  edited: false,
  summary: id,
});

describe("lint", () => {
  test("built-ins are clean", () => {
    expect(checkTemplate(TASK_LIST, ["conversation"])).toEqual([]);
    expect(checkTemplate(RESEARCH, ["conversation"])).toEqual([]);
  });

  test("syntax errors carry line and column", () => {
    const { issues } = lintTemplateText('{\n  "id": "x",\n  "name" "y"\n}', []);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ level: "error", line: 3, column: 10 });
  });

  test("semantic errors point at the offending value", () => {
    const t = { ...RESEARCH, fields: [...RESEARCH.fields, { id: "Bad", label: "x", type: "text", required: false }] };
    const text = JSON.stringify(t, null, 2);
    const { issues, value } = lintTemplateText(text, ["conversation"]);
    expect(value).toBeUndefined();
    const i = issues.find((x) => x.path.endsWith("/id"))!;
    expect(text.slice(i.offset, i.offset + 5)).toBe('"Bad"');
  });

  test.each<[string, (t: Template) => unknown, string]>([
    ["duplicate id", (t) => ({ ...t, fields: [...t.fields, t.fields[0]] }), "used more than once"],
    ["unknown key", (t) => ({ ...t, extra: 1 }), 'Unknown key "extra"'],
    ["unknown placeholder", (t) => ({ ...t, preamble: "{{nope}}" }), "{{nope}}"],
    ["bad by", (t) => ({ ...t, preamble: { by: "goal", variants: {}, fallback: "" } }), '"by" must name'],
    ["bad variant key", (t) => ({ ...t, closing: { by: "goalType", variants: { zz: "" }, fallback: "" } }), '"zz" is not'],
    ["prefixFrom", (t) => ({ ...t, fields: t.fields.map((f) => (f.id === "goal" ? { ...f, prefixFrom: "situation" } : f)) }), "prefixFrom"],
    ["scope", (t) => ({ ...t, sourceScope: { field: "goal" } }), "sourceScope.field"],
    ["schema", (t) => ({ ...t, schema: 99 }), "supports up to"],
    ["showWhen field", (t) => ({ ...t, fields: t.fields.map((f) => (f.id === "situation" ? { ...f, showWhen: { field: "goal", value: "x" } } : f)) }), "showWhen.field"],
    ["showWhen value", (t) => ({ ...t, fields: t.fields.map((f) => (f.id === "situation" ? { ...f, showWhen: { field: "effort", value: "zz" } } : f)) }), '"zz" is not an option'],
    ["replyModesAfter", (t) => ({ ...t, replyModesAfter: "nope" }), '"replyModesAfter" must name'],
    ["option instruction placeholder", (t) => ({ ...t, fields: t.fields.map((f) => (f.type === "choice" && f.id === "effort" ? { ...f, options: [{ value: "a", label: "A", instruction: "{{nope}}" }] } : f)) }), "{{nope}}"],
  ])("%s is an error", (_, mutate, msg) => {
    const issues = checkTemplate(mutate(RESEARCH), ["conversation"]);
    expect(issues.some((i) => i.level === "error" && i.message.includes(msg))).toBe(true);
  });

  test("groups deeper than two levels are an error", () => {
    const deep = structuredClone(TASK_LIST) as Template;
    (deep.fields[1] as { children: unknown[] }).children[0] = {
      id: "mid",
      label: "M",
      type: "group",
      required: false,
      itemLabel: "M",
      children: [{ id: "deeper", label: "D", type: "group", required: false, itemLabel: "D", children: [] }],
    };
    expect(checkTemplate(deep, []).some((i) => i.message.includes("nested only one level"))).toBe(true);
  });

  test("a missing variant and an unknown mode are warnings", () => {
    const t = { ...RESEARCH, replyModes: ["gone"], closing: { by: "goalType", variants: { bughunt: "x" }, fallback: "f" } };
    const levels = checkTemplate(t, []).map((i) => i.level);
    expect(levels).toContain("warning");
    expect(levels).not.toContain("error");
  });
});

describe("wrapper and links", () => {
  test("wrapper lint", () => {
    expect(lintWrapper(BUILTIN_WRAPPER.text)).toEqual([]);
    expect(lintWrapper("no placeholder")).toHaveLength(1);
    expect(lintWrapper("a {{prompt}} b")).toHaveLength(1);
    expect(lintWrapper("{{prompt}}\n{{prompt}}")).toHaveLength(1);
  });

  test("wraps inside a fence longer than any backtick run", () => {
    const out = wrapPrompt("Intro\n\n{{prompt}}", "Use ```js``` here $&\n");
    expect(out).toBe("Intro\n\n````markdown\nUse ```js``` here $&\n````\n");
  });

  test("link building and the length cap", () => {
    const p = { link: "https://x.test/?q={prompt}", home: "https://x.test/" };
    expect(buildLink(p, "a b&")).toEqual({ url: "https://x.test/?q=a%20b%26", kind: "link" });
    expect(buildLink(p, "a".repeat(LINK_CAP))).toEqual({ url: p.home, kind: "long" });
    expect(buildLink(p, "\uD800")).toEqual({ url: p.home, kind: "long" });
    expect(buildLink({ ...p, link: "" }, "a")).toEqual({ url: p.home, kind: "home" });
  });

  test("provider lint", () => {
    expect(lintProvider({ label: "A", link: "", home: "https://a" })).toEqual([]);
    expect(lintProvider({ label: "A", link: "http://a?{prompt}", home: "http://a" })).toEqual(["home", "linkHttps"]);
    expect(lintProvider({ label: "A", link: "https://a?{prompt}{prompt}", home: "https://a" })).toHaveLength(1);
  });
});

describe("layers", () => {
  test("user defaults replace built-ins and report updates", () => {
    const mine = { ...TASK_LIST, name: "Mine", basedOn: { id: "task-list", version: 0 } };
    const list = effectiveTemplates({ "task-list": mine, "c-1": { ...RESEARCH, id: "c-1" } });
    expect(list.map((t) => t.name)).toEqual(["Mine", "Research", "Implement Specification", "Wrap-up", "Research"]);
    expect(hasUpdate(mine, TASK_LIST)).toBe(true);
    expect(hasUpdate({ ...mine, basedOn: { id: "task-list", version: 2 } }, TASK_LIST)).toBe(false);
  });

  test('"all" offers custom modes without editing the template; unknown ids are skipped', () => {
    const modes = effectiveModes({ "m-1": { id: "m-1", label: "Terse", instruction: "Be terse." } });
    expect(offeredModes({ ...RESEARCH, replyModes: "all" }, modes).map((m) => m.id)).toEqual(["conversation", "m-1"]);
    expect(offeredModes({ ...RESEARCH, replyModes: ["gone", "m-1"] }, modes).map((m) => m.id)).toEqual(["m-1"]);
    expect(offeredModes(TASK_LIST, modes)).toEqual([]);
  });

  test("drafts and entries saved with a single mode are read as a list", () => {
    const b = memoryBackend({
      "pb.version": "1",
      "pb.drafts": JSON.stringify({ a: { values: {}, mode: "standard" }, b: { values: {}, mode: "conversation" } }),
      "pb.h.x": JSON.stringify({ ...entry("x", 1), mode: "conversation", modeLabel: "Conversation", modes: undefined }),
    });
    const r = repo(new Store(b));
    expect(r.drafts().a.modes).toEqual([]);
    expect(r.drafts().b.modes).toEqual(["conversation"]);
    expect(r.drafts().b).not.toHaveProperty("mode");
    expect(r.entry("x")?.modes).toEqual(["conversation"]);
  });

  test("an earlier-items choice is only valid inside a group", () => {
    const bad = structuredClone(RESEARCH) as Template;
    (bad.fields[0] as unknown as { from: string }).from = "earlierItems";
    expect(checkTemplate(bad, []).some((i) => i.message.includes("only inside a group"))).toBe(true);
  });

  test("restored inputs are matched by field id", () => {
    const m = matchValues(RESEARCH.fields, { situation: "s", removed: "lost" });
    expect(m.dropped).toBe(true);
    expect(m.values.situation).toBe("s");
    expect(m.values.goalType).toBeNull();
    expect(matchValues(RESEARCH.fields, { situation: "s" }).dropped).toBe(false);
  });
});

describe("storage", () => {
  test("unavailable storage runs in memory with a banner", () => {
    const s = new Store(null);
    expect(s.mode).toBe("memory");
    expect(s.getNotices()[0].code).toBe("unavailable");
    s.setJson(KEYS.settings, { theme: "dark" });
    expect(repo(s).settings().theme).toBe("dark");
  });

  test("a corrupt record is copied before reset", () => {
    const b = memoryBackend({ "pb.version": "1", "pb.drafts": "{oops" });
    const s = new Store(b);
    expect(b.get("pb.drafts")).toBeNull();
    expect(s.corruptCopies()).toEqual([{ key: expect.stringMatching(/^pb\.corrupt\.pb\.drafts\.\d+$/), value: "{oops" }]);
    expect(s.getNotices().some((n) => n.kind === "alert" && n.code === "corruptCopied" && n.record === "pb.drafts")).toBe(true);
  });

  test("a corrupt record with no room is left untouched and kept in memory", () => {
    const init = { "pb.version": "1", "pb.drafts": "{oops" };
    const b = memoryBackend(init, Object.entries(init).reduce((n, [k, v]) => n + k.length + v.length, 0));
    const s = new Store(b);
    s.setJson(KEYS.drafts, {});
    expect(b.get("pb.drafts")).toBe("{oops");
    expect(repo(s).drafts()).toEqual({});
  });

  test("newer data opens read-only", () => {
    const b = memoryBackend({ "pb.version": String(STORAGE_VERSION + 1), "pb.settings": "{}" });
    const s = new Store(b);
    expect(s.mode).toBe("readonly");
    s.setJson(KEYS.settings, { theme: "dark" });
    expect(b.get("pb.settings")).toBe("{}");
  });

  test("a broken history index is repaired on load", () => {
    const b = memoryBackend({
      "pb.version": "1",
      "pb.history": JSON.stringify([{ id: "ghost", createdAt: 3 }]),
      "pb.h.a": JSON.stringify(entry("a", 1)),
      "pb.h.b": JSON.stringify(entry("b", 2)),
    });
    const s = new Store(b);
    expect(repo(s).historyIndex().map((r) => r.id)).toEqual(["b", "a"]);
    expect(JSON.parse(b.get("pb.history")!).map((r: { id: string }) => r.id)).toEqual(["b", "a"]);
  });

  test("full storage keeps the data in memory, alerts, and retries on the next change", () => {
    const b = memoryBackend({}, 200);
    const s = new Store(b);
    expect(s.setJson(KEYS.drafts, { x: "y".repeat(300) })).toBe(false);
    expect(repo(s).drafts()).toEqual({ x: "y".repeat(300) });
    expect(s.getNotices().find((n) => n.id === "full")?.code).toBe("full");
    s.setJson(KEYS.drafts, {});
    expect(s.getNotices().find((n) => n.id === "full")).toBeUndefined();
  });

  test("export then replace-all import restores identical data", () => {
    const a = new Store(memoryBackend());
    a.setJson(KEYS.settings, { theme: "dark", lastTemplate: "review", dismissed: [], confirmedProviders: ["chatgpt"] });
    a.setJson(KEYS.templates, { "c-1": { ...RESEARCH, id: "c-1", version: undefined } });
    addHistoryEntry(a, entry("e1", 5));
    const file = JSON.parse(JSON.stringify(exportData(a)));
    expect(validateExport(file, ["conversation"])).toEqual([]);
    const b = new Store(memoryBackend());
    expect(importData(b, file, "replace")).toBe(true);
    const { exportedAt: _a, ...x } = exportData(a);
    const { exportedAt: _b, ...y } = exportData(b);
    expect(y).toEqual(x);
  });

  test("invalid or newer files are refused", () => {
    expect(validateExport({}, [])).toHaveLength(1);
    expect(validateExport({ app: "prompt-builder", storageVersion: 99 }, [])[0]).toContain("newer");
  });

  test("an import that does not fit changes nothing", () => {
    const backend = memoryBackend({}, 400);
    const s = new Store(backend);
    s.setJson(KEYS.settings, { theme: "dark" });
    const before = backend.keys().map((k) => [k, backend.get(k)]);
    const big = new Store(memoryBackend());
    for (let i = 0; i < 5; i++) addHistoryEntry(big, entry(`e${i}`, i));
    expect(importData(s, exportData(big), "replace")).toBe(false);
    expect(backend.keys().map((k) => [k, backend.get(k)])).toEqual(before);
  });

  test("merge skips existing history ids", () => {
    const s = new Store(memoryBackend());
    addHistoryEntry(s, entry("same", 1));
    const other = new Store(memoryBackend());
    addHistoryEntry(other, { ...entry("same", 1), prompt: "theirs" });
    addHistoryEntry(other, entry("new", 2));
    importData(s, exportData(other), "merge");
    expect(repo(s).historyIndex().map((r) => r.id)).toEqual(["new", "same"]);
    expect(repo(s).entry("same")!.prompt).toBe("x\n");
  });

  test("meter text", () => {
    expect(formatSize(1.2 * 1024 * 1024)).toBe("1.2 MB");
    expect(formatSize(1.2 * 1024 * 1024, "fr")).toBe("1,2 Mo");
  });
});
