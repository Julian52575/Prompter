import { BUILTIN_MODES, BUILTIN_TEMPLATES, BUILTIN_WRAPPER, STANDARD_MODE } from "./builtins";
import type { Draft, Field, GroupItem, Inputs, ListRow, ReplyMode, Template, Value, Wrapper } from "./types";

export const randomId = (prefix = "") =>
  prefix + Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(36).padStart(2, "0")).join("");

export function omit<T>(rec: Record<string, T>, key: string): Record<string, T> {
  const out = { ...rec };
  delete out[key];
  return out;
}

export const builtinTemplate = (id: string) => BUILTIN_TEMPLATES.find((t) => t.id === id);
export const builtinMode = (id: string) => BUILTIN_MODES.find((m) => m.id === id);

/** Built-ins (or their user defaults) first, then custom templates. */
export function effectiveTemplates(stored: Record<string, Template>): Template[] {
  const builtins = BUILTIN_TEMPLATES.map((b) => stored[b.id] ?? b);
  const custom = Object.values(stored).filter((t) => !builtinTemplate(t.id));
  return [...builtins, ...custom];
}

export function effectiveModes(stored: Record<string, ReplyMode>): ReplyMode[] {
  const builtins = BUILTIN_MODES.map((b) => stored[b.id] ?? b);
  const custom = Object.values(stored).filter((m) => !builtinMode(m.id) && m.id !== STANDARD_MODE.id);
  return [...builtins, ...custom];
}

export function effectiveWrapper(stored: Wrapper | null): Wrapper {
  return stored ?? BUILTIN_WRAPPER;
}

interface Layered {
  id: string;
  basedOn?: { id: string; version: number };
}

/** True when the built-in changed after the user saved their default from it. */
export function hasUpdate(rec: Layered | null | undefined, builtin: { version?: number } | undefined): boolean {
  return !!(rec?.basedOn && builtin?.version !== undefined && builtin.version > rec.basedOn.version);
}

export function offeredModes(t: Template, modes: ReplyMode[]): ReplyMode[] {
  if (t.replyModes === "none") return [];
  if (t.replyModes === "all") return [STANDARD_MODE, ...modes];
  const byId = new Map(modes.map((m) => [m.id, m]));
  const listed = t.replyModes.filter((id) => id !== STANDARD_MODE.id && byId.has(id)).map((id) => byId.get(id)!);
  return [STANDARD_MODE, ...listed];
}

export function templatesListingMode(templates: Template[], modeId: string): Template[] {
  return templates.filter((t) => Array.isArray(t.replyModes) && t.replyModes.includes(modeId));
}

// --- values ---------------------------------------------------------------------

export const newRow = (): ListRow => ({ k: randomId(), text: "", note: "" });
export const newItem = (children: Field[], name = ""): GroupItem => ({
  k: randomId(),
  name,
  values: initValues(children, false),
});

function initValue(f: Field, top: boolean): Value {
  switch (f.type) {
    case "text":
    case "longtext":
      return "";
    case "choice":
      return f.default ?? null;
    case "list":
      return [newRow()];
    case "group":
      return (top ? (f.defaultItems ?? []) : []).map((n) => newItem(f.children, n));
  }
}

export function initValues(fields: Field[], top = true): Inputs {
  return Object.fromEntries(fields.map((f) => [f.id, initValue(f, top || f.type !== "group")]));
}

function fits(f: Field, v: Value | undefined): boolean {
  if (f.type === "text" || f.type === "longtext") return typeof v === "string";
  if (f.type === "choice") return v === null || (typeof v === "string" && f.options.some((o) => o.value === v));
  return Array.isArray(v);
}

/**
 * Matches saved values to the current fields by id. Values for missing fields
 * are dropped, new fields start empty. `dropped` reports whether any content was lost.
 */
export function matchValues(fields: Field[], values: Inputs, top = true): { values: Inputs; dropped: boolean } {
  let dropped = Object.keys(values).some((k) => !fields.some((f) => f.id === k) && hasAny(values[k]));
  const out: Inputs = {};
  for (const f of fields) {
    const v = values[f.id];
    if (v === undefined) out[f.id] = top ? initValue(f, true) : initValue(f, false);
    else if (!fits(f, v)) {
      dropped ||= hasAny(v);
      out[f.id] = initValue(f, false);
    } else if (f.type === "group") {
      out[f.id] = (v as GroupItem[]).map((it) => {
        const m = matchValues(f.children, it.values ?? {}, false);
        dropped ||= m.dropped;
        return { k: it.k ?? randomId(), name: it.name ?? "", values: m.values };
      });
    } else if (f.type === "list") {
      out[f.id] = (v as ListRow[]).map((r) => ({ k: r.k ?? randomId(), text: r.text ?? "", note: r.note ?? "" }));
    } else out[f.id] = v;
  }
  return { values: out, dropped };
}

function hasAny(v: Value | undefined): boolean {
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  return false;
}

export function newDraft(t: Template): Draft {
  return {
    values: initValues(t.fields),
    mode: STANDARD_MODE.id,
    scope: "open",
    output: "",
    baseline: "",
    entryId: null,
    outputType: "bare",
    updatedAt: Date.now(),
  };
}

export function blankTemplate(): Template {
  return {
    id: randomId("c-"),
    name: "New template",
    schema: 1,
    fields: [{ id: "details", label: "Details", type: "longtext", required: false }],
    preamble: "",
    closing: "",
    replyModes: "all",
    sourceScope: null,
  };
}
