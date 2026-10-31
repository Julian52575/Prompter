import { CASE_CLOSED, REVIEW, TASK_LIST } from "./builtins";
import { initValues } from "./catalog";
import { clean, codeFence, headingName, inlineCode, render, SCOPE_TEXT, summarize } from "./render";
import type { GroupItem, Inputs, Scope } from "./types";
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
    expect(render({ template: TASK_LIST, inputs, mode: null, scope: "open" })).toBe(
      `${TASK_LIST.preamble}

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
  const base = (goalType: string | null, sources: string[]): Inputs => ({
    situation: "The app crashes.",
    files: [
      { k: "1", text: "src/a.ts", note: "entry" },
      { k: "2", text: "b.ts", note: "" },
      { k: "3", text: "", note: "" },
    ],
    goalType,
    goal: "Make it stop.",
    sources: sources.map((s, i) => ({ k: `s${i}`, text: s, note: i === 0 ? "docs" : "" })),
  });

  const goalTypes = ["fix", "prevent", "learn", "answer"] as const;
  const modes = [null, CASE_CLOSED];
  const scopes: [Scope, string[]][] = [
    ["restricted", ["MDN", "RFC 9110"]],
    ["open", ["MDN"]],
    ["open", []],
  ];

  for (const g of goalTypes)
    for (const m of modes)
      for (const [scope, sources] of scopes)
        test(`${g} / ${m?.id ?? "standard"} / ${scope} with ${sources.length} sources`, () => {
          const out = render({ template: REVIEW, inputs: base(g, sources), mode: m, scope });
          expect(out).toMatchSnapshot();
          expect(out.endsWith("\n") && !out.endsWith("\n\n")).toBe(true);
          if (scope === "open") expect(out).toContain("## Sources\n");
          expect(out.includes("## Reply mode")).toBe(m !== null);
        });

  test("full structure for one combination", () => {
    const out = render({ template: REVIEW, inputs: base("fix", ["MDN"]), mode: CASE_CLOSED, scope: "open" });
    const pre = (REVIEW.preamble as { variants: Record<string, string> }).variants.fix;
    const close = (REVIEW.closing as { variants: Record<string, string> }).variants.fix;
    expect(out).toBe(`${pre}

## Goal
**Fix a bug:** Make it stop.

## Situation
The app crashes.

## Files
- \`src/a.ts\`: entry
- \`b.ts\`

## Sources
${SCOPE_TEXT.open}
- MDN: docs

${close}

## Reply mode
This overrides any conflicting reporting instructions above.

${CASE_CLOSED.instruction}
`);
  });

  test("the fallback wording is used with no goal type", () => {
    const out = render({ template: REVIEW, inputs: base(null, []), mode: null, scope: "open" });
    expect(out.startsWith("Review the situation, files, goal, and sources.\n\n")).toBe(true);
    expect(out).toContain("## Goal\nMake it stop.");
  });

  test("goalType and goal are required, and Restricted needs sources", () => {
    const errs = validateInputs(REVIEW, { ...base(null, []), goal: "" }, "restricted");
    expect(errs.map((e) => e.message)).toEqual([
      "Choose a goal type.",
      "Goal is required.",
      RESTRICTED_NEEDS_SOURCES,
    ]);
  });

  test("a note without text is an error", () => {
    const v = base("fix", ["MDN"]);
    (v.files as { text: string; note: string }[])[2].note = "orphan";
    expect(validateInputs(REVIEW, v, "open").map((e) => e.message)).toEqual(["Add a path or remove this row"]);
  });

  test("user text is never scanned for placeholders", () => {
    const t = { ...REVIEW, preamble: "Goal: {{goal}} / {{goalType}}" };
    const out = render({ template: t, inputs: { ...base("fix", []), goal: "{{situation}}" }, mode: null, scope: "open" });
    expect(out.startsWith("Goal: {{situation}} / Fix a bug\n")).toBe(true);
  });
});

describe("summary", () => {
  test("first line of the first text value", () => {
    expect(summarize(REVIEW, { goal: "\n  First line\nsecond", situation: "s" }, "")).toBe("First line");
  });
  test("falls back to group items, then the prompt after the preamble", () => {
    const inputs = { blocks: [block("Work", [sub("A", "x".repeat(100))])] };
    expect(summarize(TASK_LIST, inputs, "")).toBe(`${"x".repeat(79)}…`);
    expect(summarize(TASK_LIST, { blocks: [] }, `${TASK_LIST.preamble}\n\n## Work\n`)).toBe("## Work");
  });
});
