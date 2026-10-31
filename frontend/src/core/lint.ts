import { TEMPLATE_SCHEMA } from "./builtins";
import type { Template } from "./types";

export interface Issue {
  level: "error" | "warning";
  message: string;
  /** JSON pointer of the offending value, e.g. /fields/0/id. */
  path: string;
}

export interface LintIssue extends Issue {
  offset: number;
  line: number;
  column: number;
}

export const FIELD_ID = /^[a-z][a-zA-Z0-9]*$/;

// --- a small JSON parser that remembers where every value starts --------

class JsonError extends Error {
  constructor(
    message: string,
    public offset: number,
  ) {
    super(message);
  }
}

export function parseWithPositions(text: string): { value: unknown; pos: Map<string, number> } {
  const pos = new Map<string, number>();
  let i = 0;
  const ws = () => {
    while (i < text.length && " \t\n\r".includes(text[i])) i++;
  };
  const fail = (msg: string): never => {
    throw new JsonError(msg, i);
  };
  const str = (): string => {
    // oxlint-disable-next-line no-control-regex -- JSON forbids raw control characters in strings
    const m = /^"(?:[^"\\\u0000-\u001f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"/.exec(text.slice(i));
    if (!m) fail("Invalid string: check for a missing closing quote or an unescaped character.");
    i += m![0].length;
    return JSON.parse(m![0]) as string;
  };
  const val = (path: string): unknown => {
    ws();
    pos.set(path, i);
    const c = text[i];
    if (c === "{") {
      i++;
      const obj: Record<string, unknown> = {};
      ws();
      if (text[i] === "}") return i++, obj;
      for (;;) {
        ws();
        if (text[i] !== '"') fail("Expected a key in double quotes.");
        const key = str();
        ws();
        if (text[i] !== ":") fail(`Expected ":" after the key "${key}".`);
        i++;
        obj[key] = val(`${path}/${key}`);
        ws();
        if (text[i] === ",") {
          i++;
          continue;
        }
        if (text[i] === "}") return i++, obj;
        fail('Expected "," or "}".');
      }
    }
    if (c === "[") {
      i++;
      const arr: unknown[] = [];
      ws();
      if (text[i] === "]") return i++, arr;
      for (;;) {
        arr.push(val(`${path}/${arr.length}`));
        ws();
        if (text[i] === ",") {
          i++;
          continue;
        }
        if (text[i] === "]") return i++, arr;
        fail('Expected "," or "]".');
      }
    }
    if (c === '"') return str();
    const m = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(text.slice(i));
    if (!m) fail(i >= text.length ? "Unexpected end of the text." : "Unexpected character.");
    i += m![0].length;
    return JSON.parse(m![0]);
  };
  const value = val("");
  ws();
  if (i < text.length) fail("Unexpected text after the end of the JSON.");
  return { value, pos };
}

export function lineCol(text: string, offset: number): { line: number; column: number } {
  const before = text.slice(0, offset).split("\n");
  return { line: before.length, column: before[before.length - 1].length + 1 };
}

// --- template checks -------------------------------------------------------

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === "string";

const FIELD_KEYS: Record<string, string[]> = {
  text: ["prefixFrom"],
  longtext: ["prefixFrom"],
  choice: ["options", "default", "output"],
  list: ["itemLabel", "noteLabel", "format"],
  group: ["itemLabel", "defaultItems", "children"],
};
const TEMPLATE_KEYS = ["id", "name", "schema", "version", "basedOn", "fields", "preamble", "closing", "replyModes", "sourceScope"];
const TEMPLATE_REQUIRED = ["id", "name", "schema", "fields", "preamble", "closing", "replyModes", "sourceScope"];

export function checkTemplate(t: unknown, knownModes: string[]): Issue[] {
  const out: Issue[] = [];
  const err = (path: string, message: string) => out.push({ level: "error", path, message });
  const warn = (path: string, message: string) => out.push({ level: "warning", path, message });

  if (!isObj(t)) return [{ level: "error", path: "", message: "A template must be a JSON object." }];
  const keys = (o: Obj, path: string, allowed: string[], required: string[]) => {
    for (const k of Object.keys(o)) if (!allowed.includes(k)) err(`${path}/${k}`, `Unknown key "${k}".`);
    for (const k of required) if (!(k in o)) err(path, `Missing key "${k}".`);
  };
  keys(t, "", TEMPLATE_KEYS, TEMPLATE_REQUIRED);
  if ("id" in t && (!isStr(t.id) || !t.id)) err("/id", '"id" must be a non-empty string.');
  if ("name" in t && (!isStr(t.name) || !t.name.trim())) err("/name", '"name" must be a non-empty string.');
  if ("schema" in t) {
    if (!Number.isInteger(t.schema)) err("/schema", '"schema" must be a whole number.');
    else if ((t.schema as number) > TEMPLATE_SCHEMA)
      err("/schema", `This template uses schema ${t.schema}, but this app supports up to ${TEMPLATE_SCHEMA}.`);
  }
  if ("version" in t && !Number.isInteger(t.version)) err("/version", '"version" must be a whole number.');
  if ("basedOn" in t) {
    const b = t.basedOn;
    if (!isObj(b) || !isStr(b.id) || !Number.isInteger(b.version))
      err("/basedOn", '"basedOn" must be { "id": string, "version": number }.');
  }

  // fields
  const top = new Map<string, Obj>();
  const seen = new Set<string>();
  const checkFields = (fields: unknown, path: string, depth: number) => {
    if (!Array.isArray(fields)) return err(path, "Fields must be a list.");
    fields.forEach((f, idx) => {
      const p = `${path}/${idx}`;
      if (!isObj(f)) return err(p, "A field must be an object.");
      const type = f.type;
      if (!isStr(type) || !(type in FIELD_KEYS)) {
        err(`${p}/type`, '"type" must be one of text, longtext, choice, list, group.');
        return;
      }
      const extraRequired: Record<string, string[]> = {
        choice: ["options"],
        list: ["itemLabel", "noteLabel", "format"],
        group: ["itemLabel", "children"],
      };
      keys(f, p, ["id", "label", "type", "required", ...FIELD_KEYS[type]], ["id", "label", "type", "required", ...(extraRequired[type] ?? [])]);
      if (!isStr(f.id) || !FIELD_ID.test(f.id))
        err(`${p}/id`, "A field id must start with a lower-case letter and contain only letters and digits.");
      else if (seen.has(f.id)) err(`${p}/id`, `The field id "${f.id}" is used more than once.`);
      else seen.add(f.id);
      if (depth === 0 && isStr(f.id)) top.set(f.id, f);
      if ("label" in f && (!isStr(f.label) || !f.label.trim())) err(`${p}/label`, '"label" must be a non-empty string.');
      if ("required" in f && typeof f.required !== "boolean") err(`${p}/required`, '"required" must be true or false.');
      if ("prefixFrom" in f && depth > 0) err(`${p}/prefixFrom`, '"prefixFrom" is allowed only on top-level fields.');
      if (type === "choice") {
        const opts = f.options;
        if (!Array.isArray(opts) || opts.length === 0) err(`${p}/options`, "A choice needs at least one option.");
        else {
          const values = new Set<string>();
          opts.forEach((o, oi) => {
            if (!isObj(o) || !isStr(o.value) || !isStr(o.label) || Object.keys(o).some((k) => k !== "value" && k !== "label"))
              err(`${p}/options/${oi}`, 'An option must be { "value": string, "label": string }.');
            else if (!o.value) err(`${p}/options/${oi}/value`, "An option value must not be empty.");
            else if (values.has(o.value)) err(`${p}/options/${oi}/value`, `The option value "${o.value}" is used more than once.`);
            else values.add(o.value);
          });
          if ("default" in f && !(isStr(f.default) && values.has(f.default)))
            err(`${p}/default`, '"default" must be one of the option values.');
        }
        if ("output" in f && f.output !== "section" && f.output !== "none") err(`${p}/output`, '"output" must be "section" or "none".');
      }
      if (type === "list") {
        if ("itemLabel" in f && !isStr(f.itemLabel)) err(`${p}/itemLabel`, '"itemLabel" must be a string.');
        if ("noteLabel" in f && !isStr(f.noteLabel)) err(`${p}/noteLabel`, '"noteLabel" must be a string.');
        if ("format" in f && f.format !== "code" && f.format !== "plain") err(`${p}/format`, '"format" must be "code" or "plain".');
      }
      if (type === "group") {
        if ("itemLabel" in f && !isStr(f.itemLabel)) err(`${p}/itemLabel`, '"itemLabel" must be a string.');
        if ("defaultItems" in f && !(Array.isArray(f.defaultItems) && f.defaultItems.every(isStr)))
          err(`${p}/defaultItems`, '"defaultItems" must be a list of names.');
        if (depth >= 2) err(p, "Groups can be nested only one level deep.");
        else if ("children" in f) checkFields(f.children, `${p}/children`, depth + 1);
      }
    });
  };
  if ("fields" in t) checkFields(t.fields, "/fields", 0);

  const topChoice = (id: unknown) => {
    const f = isStr(id) ? top.get(id) : undefined;
    return f && f.type === "choice" ? f : undefined;
  };
  (Array.isArray(t.fields) ? t.fields : []).forEach((f, idx) => {
    if (isObj(f) && "prefixFrom" in f && !topChoice(f.prefixFrom))
      err(`/fields/${idx}/prefixFrom`, '"prefixFrom" must name a top-level choice field.');
  });

  // wording
  const placeholders = (s: string, path: string) => {
    for (const m of s.matchAll(/\{\{([^}]*)\}\}/g)) {
      const f = top.get(m[1]);
      if (!f || !["text", "longtext", "choice"].includes(f.type as string))
        err(path, `The placeholder {{${m[1]}}} must name a top-level text, long text or choice field.`);
    }
  };
  for (const slot of ["preamble", "closing"] as const) {
    if (!(slot in t)) continue;
    const w = t[slot];
    const p = `/${slot}`;
    if (isStr(w)) {
      placeholders(w, p);
      continue;
    }
    if (!isObj(w)) {
      err(p, `"${slot}" must be text or { "by", "variants", "fallback" }.`);
      continue;
    }
    keys(w, p, ["by", "variants", "fallback"], ["by", "variants", "fallback"]);
    if ("fallback" in w) {
      if (isStr(w.fallback)) placeholders(w.fallback, `${p}/fallback`);
      else err(`${p}/fallback`, '"fallback" must be text.');
    }
    const choice = topChoice(w.by);
    if ("by" in w && !choice) err(`${p}/by`, '"by" must name a top-level choice field.');
    if (!isObj(w.variants)) {
      if ("variants" in w) err(`${p}/variants`, '"variants" must be an object.');
      continue;
    }
    const optValues = choice && Array.isArray(choice.options) ? choice.options.filter(isObj).map((o) => o.value) : [];
    for (const [k, v] of Object.entries(w.variants)) {
      if (!isStr(v)) err(`${p}/variants/${k}`, "A variant must be text.");
      else placeholders(v, `${p}/variants/${k}`);
      if (choice && !optValues.includes(k)) err(`${p}/variants/${k}`, `"${k}" is not an option value of "${w.by}".`);
    }
    for (const v of optValues)
      if (isStr(v) && !(v in w.variants)) warn(`${p}/variants`, `The option "${v}" has no variant; the fallback is used.`);
  }

  if ("replyModes" in t) {
    const r = t.replyModes;
    if (Array.isArray(r)) {
      r.forEach((id, idx) => {
        if (!isStr(id)) err(`/replyModes/${idx}`, "A reply mode id must be text.");
        else if (id !== "standard" && !knownModes.includes(id)) warn(`/replyModes/${idx}`, `No reply mode has the id "${id}"; it is skipped.`);
      });
    } else if (r !== "none" && r !== "all") err("/replyModes", '"replyModes" must be "none", "all" or a list of mode ids.');
  }

  if ("sourceScope" in t && t.sourceScope !== null) {
    const s = t.sourceScope;
    const f = isObj(s) && isStr(s.field) ? top.get(s.field) : undefined;
    if (!isObj(s) || Object.keys(s).some((k) => k !== "field")) err("/sourceScope", '"sourceScope" must be null or { "field": id }.');
    else if (!f || f.type !== "list") err("/sourceScope/field", '"sourceScope.field" must name a top-level list field.');
  }
  return out;
}

export function lintTemplateText(text: string, knownModes: string[]): { issues: LintIssue[]; value?: Template } {
  let parsed: ReturnType<typeof parseWithPositions>;
  try {
    parsed = parseWithPositions(text);
  } catch (e) {
    const offset = e instanceof JsonError ? e.offset : 0;
    return { issues: [{ level: "error", path: "", message: (e as Error).message, offset, ...lineCol(text, offset) }] };
  }
  const issues = checkTemplate(parsed.value, knownModes).map((i) => {
    let p = i.path;
    while (!parsed.pos.has(p) && p) p = p.slice(0, p.lastIndexOf("/"));
    const offset = parsed.pos.get(p) ?? 0;
    return { ...i, offset, ...lineCol(text, offset) };
  });
  return { issues, value: issues.some((i) => i.level === "error") ? undefined : (parsed.value as Template) };
}

export function isValidTemplate(t: unknown, knownModes: string[]): t is Template {
  return !checkTemplate(t, knownModes).some((i) => i.level === "error");
}
