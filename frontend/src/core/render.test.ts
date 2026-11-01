import { CONVERSATION, RESEARCH, TASK_LIST } from "./builtins";
import { initValues, newDraft } from "./catalog";
import { clean, codeFence, headingName, inlineCode, languageLine, REPLY_MODE_OVERRIDE, render, SCOPE_TEXT, summarize } from "./render";
import type { ChoiceField, GroupItem, Inputs, ReplyMode, Scope } from "./types";
import { NOTHING_TO_GENERATE, RESTRICTED_NEEDS_SOURCES, validateInputs } from "./validate";

const task = (k: string, name: string, details: string, proof = "", dependsOn: string | null = null): GroupItem => ({
  k,
  name,
  values: { details, proof, dependsOn },
});

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
  const render0 = (inputs: Inputs) =>
    render({ template: TASK_LIST, inputs, modes: [], scope: "open", language: "en" });

  test("renders context and numbered tasks, omitting empty ones and unset fields", () => {
    const inputs: Inputs = {
      context: "A parser for the config files.",
      tasks: [
        task("t1", "Parser", "Write it.\nCarefully.", "Tests pass."),
        task("t2", "Empty", "", ""),
        task("t3", "Docs", "Document it.", "", "t1"),
      ],
    };
    expect(render0(inputs)).toBe(
      `${languageLine("en")}

${TASK_LIST.preamble}

## Context
A parser for the config files.

## Task 1: Parser
**Details:**
Write it.
Carefully.
**Proof of Completion:**
Tests pass.

## Task 3: Docs
**Details:**
Document it.
**Depends on:** Task 1: Parser

${TASK_LIST.closing}
`,
    );
  });

  test("a dependency on a later, missing or empty task is not rendered", () => {
    const inputs: Inputs = {
      tasks: [task("t1", "A", "a", "", "t2"), task("t2", "B", "b", "", "gone"), task("t3", "C", "c")],
    };
    expect(render0(inputs)).not.toContain("Depends on");
    const empty: Inputs = { tasks: [task("t1", "A", "", ""), task("t2", "B", "b", "", "t1")] };
    expect(render0(empty)).not.toContain("Depends on");
  });

  test("there are no default tasks", () => {
    expect(initValues(TASK_LIST.fields).tasks).toEqual([]);
  });

  test("Generate is blocked until a task has details", () => {
    const errs = validateInputs(TASK_LIST, initValues(TASK_LIST.fields), "open");
    expect(errs.map((e) => e.message)).toEqual([NOTHING_TO_GENERATE]);
  });

  test("a dependency alone is not content", () => {
    const v: Inputs = { tasks: [task("t1", "A", "a"), task("t2", "", "", "", "t1")] };
    expect(validateInputs(TASK_LIST, v, "open")).toEqual([]);
  });

  test("a task with details but no title is an error", () => {
    const errs = validateInputs(TASK_LIST, { tasks: [task("t1", "", "do")] }, "open");
    expect(errs.map((e) => e.message)).toEqual(["Name this task."]);
  });

  test("details are required once a task has content", () => {
    const errs = validateInputs(TASK_LIST, { tasks: [task("t1", "A", "", "proof")] }, "open");
    expect(errs.map((e) => e.message)).toEqual(["Details is required."]);
  });

  test("required group message names the item", () => {
    const errs = validateInputs(
      { ...TASK_LIST, fields: [...TASK_LIST.fields, { id: "x", label: "X", type: "text", required: false }] },
      { tasks: [], x: "hi" },
      "open",
    );
    expect(errs.map((e) => e.message)).toEqual(["Add text to at least one task."]);
  });
});

describe("Research", () => {
  const base = (goalType: string | null, sources: string[], effort: string | null = "case-closed"): Inputs => ({
    goalType,
    goal: "Make it stop.",
    situation: "The app crashes.",
    sources: [
      ...sources.map((s, i) => ({ k: `s${i}`, text: s, note: i === 0 ? "docs" : "" })),
      { k: "empty", text: "", note: "" },
    ],
    effort,
  });
  const effortInstruction = (value: string) =>
    (RESEARCH.fields.find((f) => f.id === "effort") as ChoiceField).options.find((o) => o.value === value)!.instruction!;

  const deliverables = ["bughunt", "teacher", "answer", "spec"] as const;
  const efforts = ["case-closed", "cheap-lookup"] as const;
  const modeSets: [string, ReplyMode[]][] = [
    ["no mode", []],
    ["conversation", [CONVERSATION]],
  ];
  const scopes: [Scope, string[]][] = [
    ["restricted", ["src/a.ts", "RFC 9110"]],
    ["open", ["src/a.ts"]],
    ["open", []],
  ];

  for (const g of deliverables)
    for (const e of efforts)
      for (const [label, modes] of modeSets)
        for (const [scope, sources] of scopes)
          test(`${g} / ${e} / ${label} / ${scope} with ${sources.length} sources`, () => {
            const out = render({ template: RESEARCH, inputs: base(g, sources, e), modes, scope, language: "en" });
            expect(out).toMatchSnapshot();
            expect(out.endsWith("\n") && !out.endsWith("\n\n")).toBe(true);
            expect(out).toContain(`## Effort\n${effortInstruction(e)}`);
            if (scope === "open") expect(out).toContain("## Sources\n");
            expect(out.includes("## Reply mode")).toBe(modes.length > 0);
          });

  test("full structure for one combination", () => {
    const out = render({
      template: RESEARCH,
      inputs: base("bughunt", ["src/a.ts"], "cheap-lookup"),
      modes: [CONVERSATION],
      scope: "open",
      language: "en",
    });
    const pre = (RESEARCH.preamble as { variants: Record<string, string> }).variants.bughunt;
    const close = (RESEARCH.closing as { variants: Record<string, string> }).variants.bughunt;
    expect(out).toBe(`${languageLine("en")}

${pre}

## Goal
**Bug Hunt:** Make it stop.

## Context
The app crashes.

## Sources
${SCOPE_TEXT.open}
- src/a.ts: docs

## Effort
${effortInstruction("cheap-lookup")}

${close}

## Reply mode
${REPLY_MODE_OVERRIDE}

${CONVERSATION.instruction}
`);
  });

  test("several reply modes are all rendered under one heading", () => {
    const extra: ReplyMode = { id: "m-1", label: "Terse", instruction: "Be terse." };
    const out = render({ template: RESEARCH, inputs: base("answer", []), modes: [CONVERSATION, extra], scope: "open", language: "en" });
    expect(out.match(/## Reply mode/g)).toHaveLength(1);
    expect(out).toContain(`${CONVERSATION.instruction}\n\nBe terse.\n`);
  });

  test("the fallback wording is used with no deliverable", () => {
    const out = render({ template: RESEARCH, inputs: base(null, []), modes: [], scope: "open", language: "en" });
    expect(out.startsWith(`${languageLine("en")}\n\nResearch the goal, context, and sources.\n\n`)).toBe(true);
    expect(out).toContain("## Goal\nMake it stop.");
  });

  test("deliverable, goal and effort are required, and Restricted needs sources", () => {
    const errs = validateInputs(RESEARCH, { ...base(null, [], null), goal: "" }, "restricted");
    expect(errs.map((e) => e.message)).toEqual([
      "Choose a deliverable.",
      "Goal is required.",
      "Choose an effort.",
      RESTRICTED_NEEDS_SOURCES,
    ]);
  });

  test("Effort defaults to Case-closed and no reply mode is selected", () => {
    expect(initValues(RESEARCH.fields).effort).toBe("case-closed");
    expect(initValues(RESEARCH.fields).sources).toEqual([]);
    expect(newDraft(RESEARCH).modes).toEqual([]);
  });

  test("conversation wording is neutral and covers the lesson case", () => {
    expect(CONVERSATION.instruction).not.toMatch(/\b(he|his|him|she|her)\b/i);
    expect(CONVERSATION.instruction).toContain("lesson");
  });

  test("a note without text is an error", () => {
    const v = base("bughunt", ["src/a.ts"]);
    (v.sources as { text: string; note: string }[])[1].note = "orphan";
    expect(validateInputs(RESEARCH, v, "open").map((e) => e.message)).toEqual(["Add a path or remove this row"]);
  });

  test("user text is never scanned for placeholders", () => {
    const t = { ...RESEARCH, preamble: "Goal: {{goal}} / {{goalType}}" };
    const out = render({ template: t, inputs: { ...base("bughunt", []), goal: "{{situation}}" }, modes: [], scope: "open", language: "en" });
    expect(out).toContain("\nGoal: {{situation}} / Bug Hunt\n");
  });
});

describe("language", () => {
  test("the prompt stays English and opens with the reply language", () => {
    const inputs = { tasks: [task("t1", "A", "Écrire le parseur.")] };
    const fr = render({ template: TASK_LIST, inputs, modes: [], scope: "open", language: "fr" });
    expect(fr.startsWith("Write all of your replies to me in French. Keep code, identifiers and file contents in their original language.\n\n")).toBe(true);
    expect(fr).toContain(TASK_LIST.preamble as string);
    expect(fr.replace(languageLine("fr"), languageLine("en"))).toBe(render({ template: TASK_LIST, inputs, modes: [], scope: "open", language: "en" }));
  });
});

describe("summary", () => {
  test("first line of the first text value", () => {
    expect(summarize(RESEARCH, { goal: "\n  First line\nsecond", situation: "s" }, "")).toBe("First line");
  });
  test("falls back to group items, then the prompt after the preamble", () => {
    const inputs = { tasks: [task("t1", "A", "x".repeat(100))] };
    expect(summarize(TASK_LIST, inputs, "")).toBe(`${"x".repeat(79)}…`);
    expect(summarize(TASK_LIST, { tasks: [] }, `${languageLine("fr")}\n\n${TASK_LIST.preamble}\n\n## Task 1: A\n`)).toBe("## Task 1: A");
  });
});
