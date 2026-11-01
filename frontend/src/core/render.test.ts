import { ACTION_PRECEDENCE, CASE_CLOSED, REVIEW, TASK_LIST } from "./builtins";
import { initValues } from "./catalog";
import { clean, codeFence, headingName, inlineCode, languageLine, render, SCOPE_TEXT, summarize } from "./render";
import type { ChoiceField, GroupItem, Inputs, Scope } from "./types";
import { NOTHING_TO_GENERATE, RESTRICTED_NEEDS_SOURCES, validateInputs } from "./validate";

const sub = (name: string, text: string): GroupItem => ({ k: name, name, values: { text } });
const block = (name: string, subs: GroupItem[]): GroupItem => ({ k: name, name, values: { subBlocks: subs } });

describe("text handling", () => {
  test("clean normalises line endings and trims blank lines only", () => {
    expect(clean("\r\n  \n  a\r\n b  \n\n")).toBe("  a\n b  ");
  });
  test("heading names collapse whitespace and escape a leading #", () => {
    expect(headingName("  # a \n  b ")).toBe("\\# a b");
  });
  test("inline code fences are longer than any backtick run", () => {
    expect(inlineCode("a.ts")).toBe("`a.ts`");
    expect(inlineCode("a``b")).toBe("```a``b```");
    expect(inlineCode("`x")).toBe("`` `x ``");
  });
  test("code fence is at least 3 and longer than the prompt's runs", () => {
    expect(codeFence("hi\n")).toBe("```markdown\nhi\n```");
    expect(codeFence("````x")).toBe("`````markdown\n````x\n`````");
  });
});

describe("Task list", () => {
  test("renders blocks and sub-blocks, omitting empty ones", () => {
    const inputs: Inputs = {
      blocks: [
        block("Work", [sub("Parser", "Write it.\nCarefully."), sub("Empty", "  ")]),
        block("Testing", [sub("Unit", "Add tests.")]),
        block("Documenting", []),
      ],
    };
    expect(render({ template: TASK_LIST, inputs, mode: null, scope: "open", language: "en" })).toBe(
      `${languageLine("en")}

${TASK_LIST.preamble}

## Work

### Parser
Write it.
Carefully.

## Testing

### Unit
Add tests.

${TASK_LIST.closing}
`,
    );
  });

  test("default values have the three blocks and no sub-blocks", () => {
    const v = initValues(TASK_LIST.fields);
    expect((v.blocks as GroupItem[]).map((b) => b.name)).toEqual(["Work", "Testing", "Documenting"]);
    expect((v.blocks as GroupItem[]).every((b) => (b.values.subBlocks as GroupItem[]).length === 0)).toBe(true);
  });

  test("Generate is blocked until a sub-block has text", () => {
    const errs = validateInputs(TASK_LIST, initValues(TASK_LIST.fields), "open");
    expect(errs.map((e) => e.message)).toEqual([NOTHING_TO_GENERATE]);
    expect(validateInputs(TASK_LIST, { blocks: [block("Work", [sub("", "")])] }, "open")[0].message).toBe(
      NOTHING_TO_GENERATE,
    );
  });

  test("a sub-block with text but no name is an error", () => {
    const errs = validateInputs(TASK_LIST, { blocks: [block("Work", [sub("", "do")])] }, "open");
    expect(errs.map((e) => e.message)).toEqual(["Name this sub-block."]);
  });

  test("required group message names the innermost item", () => {
    const errs = validateInputs(
      { ...TASK_LIST, fields: [...TASK_LIST.fields, { id: "x", label: "X", type: "text", required: false }] },
      { blocks: [], x: "hi" },
      "open",
    );
    expect(errs.map((e) => e.message)).toEqual(["Add text to at least one sub-block."]);
  });
});

describe("Review", () => {
  const base = (goalType: string | null, sources: string[], action: string | null = "update"): Inputs => ({
    goalType,
    goal: "Make it stop.",
    action,
    reportLocation: "Markdown document",
    situation: "The app crashes.",
    sources: [
      ...sources.map((s, i) => ({ k: `s${i}`, text: s, note: i === 0 ? "docs" : "" })),
      { k: "empty", text: "", note: "" },
    ],
  });
  const instruction = (value: string) =>
    (REVIEW.fields.find((f) => f.id === "action") as ChoiceField).options.find((o) => o.value === value)!.instruction!;

  const goalTypes = ["fix", "prevent", "learn", "answer", "spec"] as const;
  const actions = ["context", "report", "update", "chat"] as const;
  const modes = [null, CASE_CLOSED];
  const scopes: [Scope, string[]][] = [
    ["restricted", ["src/a.ts", "RFC 9110"]],
    ["open", ["src/a.ts"]],
    ["open", []],
  ];

  for (const g of goalTypes)
    for (const a of actions)
      for (const m of modes)
        for (const [scope, sources] of scopes)
          test(`${g} / ${a} / ${m?.id ?? "standard"} / ${scope} with ${sources.length} sources`, () => {
            const out = render({ template: REVIEW, inputs: base(g, sources, a), mode: m, scope, language: "en" });
            expect(out).toMatchSnapshot();
            expect(out.endsWith("\n") && !out.endsWith("\n\n")).toBe(true);
            expect(out).toContain(`## Action required\n${ACTION_PRECEDENCE}\n\n`);
            if (scope === "open") expect(out).toContain("## Sources\n");
            expect(out.includes("## Reply mode")).toBe(m !== null);
          });

  test("full structure for one combination", () => {
    const out = render({ template: REVIEW, inputs: base("fix", ["src/a.ts"]), mode: CASE_CLOSED, scope: "open", language: "en" });
    const pre = (REVIEW.preamble as { variants: Record<string, string> }).variants.fix;
    const close = (REVIEW.closing as { variants: Record<string, string> }).variants.fix;
    expect(out).toBe(`${languageLine("en")}

${pre}

## Goal
**Fix a bug:** Make it stop.

## Action required
${instruction("update")}

## Situation
The app crashes.

## Sources
${SCOPE_TEXT.open}
- src/a.ts: docs

${close}

## Reply mode
This overrides any conflicting reporting instructions above.

${CASE_CLOSED.instruction}
`);
  });

  test("Write a report inserts the destination; other actions ignore it", () => {
    const report = render({ template: REVIEW, inputs: { ...base("learn", [], "report"), reportLocation: "GitHub PR comment" }, mode: null, scope: "open", language: "en" });
    expect(report).toContain("then write a report to GitHub PR comment. Do not change code");
    expect(report).not.toContain("## Report destination");
    const update = render({ template: REVIEW, inputs: { ...base("learn", [], "update"), reportLocation: "" }, mode: null, scope: "open", language: "en" });
    expect(update).not.toContain("GitHub");
  });

  test("the report destination is required only while Write a report is chosen", () => {
    expect(validateInputs(REVIEW, { ...base("fix", [], "report"), reportLocation: " " }, "open").map((e) => e.message)).toEqual([
      "Report destination is required.",
    ]);
    expect(validateInputs(REVIEW, { ...base("fix", [], "context"), reportLocation: "" }, "open")).toEqual([]);
  });

  test("the fallback wording is used with no goal type", () => {
    const out = render({ template: REVIEW, inputs: base(null, []), mode: null, scope: "open", language: "en" });
    expect(out.startsWith(`${languageLine("en")}\n\nReview the goal, situation, and sources.\n\n`)).toBe(true);
    expect(out).toContain("## Goal\nMake it stop.");
  });

  test("goalType, goal and action are required, and Restricted needs sources", () => {
    const errs = validateInputs(REVIEW, { ...base(null, [], null), goal: "" }, "restricted");
    expect(errs.map((e) => e.message)).toEqual([
      "Choose a goal type.",
      "Goal is required.",
      "Choose an action required.",
      RESTRICTED_NEEDS_SOURCES,
    ]);
  });

  test("a note without text is an error", () => {
    const v = base("fix", ["src/a.ts"]);
    (v.sources as { text: string; note: string }[])[1].note = "orphan";
    expect(validateInputs(REVIEW, v, "open").map((e) => e.message)).toEqual(["Add a path or remove this row"]);
  });

  test("user text is never scanned for placeholders", () => {
    const t = { ...REVIEW, preamble: "Goal: {{goal}} / {{goalType}}" };
    const out = render({ template: t, inputs: { ...base("fix", []), goal: "{{situation}}" }, mode: null, scope: "open", language: "en" });
    expect(out).toContain("\nGoal: {{situation}} / Fix a bug\n");
  });
});

describe("language", () => {
  test("the prompt stays English and opens with the reply language", () => {
    const inputs = { blocks: [block("Work", [sub("A", "Écrire le parseur.")])] };
    const fr = render({ template: TASK_LIST, inputs, mode: null, scope: "open", language: "fr" });
    expect(fr.startsWith("Write all of your replies to me in French. Keep code, identifiers and file contents in their original language.\n\n")).toBe(true);
    expect(fr).toContain(TASK_LIST.preamble as string);
    expect(fr.replace(languageLine("fr"), languageLine("en"))).toBe(render({ template: TASK_LIST, inputs, mode: null, scope: "open", language: "en" }));
  });
});

describe("summary", () => {
  test("first line of the first text value", () => {
    expect(summarize(REVIEW, { goal: "\n  First line\nsecond", situation: "s" }, "")).toBe("First line");
  });
  test("falls back to group items, then the prompt after the preamble", () => {
    const inputs = { blocks: [block("Work", [sub("A", "x".repeat(100))])] };
    expect(summarize(TASK_LIST, inputs, "")).toBe(`${"x".repeat(79)}…`);
    expect(summarize(TASK_LIST, { blocks: [] }, `${languageLine("fr")}\n\n${TASK_LIST.preamble}\n\n## Work\n`)).toBe("## Work");
  });
});
