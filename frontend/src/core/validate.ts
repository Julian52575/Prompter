import { filledRows, isEmpty, isShown, itemHasContent } from "./render";
import type { Field, GroupField, GroupItem, Inputs, ListRow, Scope, Template } from "./types";

export interface InputError {
  /** DOM id of the control the error belongs to. */
  target: string;
  message: string;
}

/** Wording of the input errors; labels come from the (possibly translated) template. */
export interface InputMessages {
  nothing: string;
  restricted: string;
  noteWithoutText: string;
  nameItem(itemLabel: string): string;
  required(label: string): string;
  choose(label: string): string;
  addOne(itemLabel: string): string;
  addText(itemLabel: string): string;
}

export const EN_INPUT_MESSAGES: InputMessages = {
  nothing: "Nothing to generate: fill at least one field",
  restricted: "Restricted scope needs at least one source. Add a source or choose Open.",
  noteWithoutText: "Add a path or remove this row",
  nameItem: (l) => `Name this ${l.toLowerCase()}.`,
  required: (l) => `${l} is required.`,
  choose: (l) => `Choose ${/^[aeiou]/i.test(l) ? "an" : "a"} ${l.toLowerCase()}.`,
  addOne: (l) => `Add at least one ${l.toLowerCase()}.`,
  addText: (l) => `Add text to at least one ${l.toLowerCase()}.`,
};

export const NOTHING_TO_GENERATE = EN_INPUT_MESSAGES.nothing;
export const RESTRICTED_NEEDS_SOURCES = EN_INPUT_MESSAGES.restricted;

/** DOM ids, shared by the form and the error summary. */
export const domId = {
  field: (path: string) => `f-${path}`,
  row: (path: string, k: string) => `f-${path}-${k}`,
  itemName: (path: string, k: string) => `f-${path}-${k}-name`,
  child: (path: string, k: string, childId: string) => `${path}-${k}-${childId}`,
};

/** Item label of the innermost group reached through single-group children. */
function innermostItemLabel(g: GroupField): string {
  let cur = g;
  while (cur.children.length === 1 && cur.children[0].type === "group") cur = cur.children[0];
  return cur.itemLabel;
}

function checkField(f: Field, v: Inputs[string], path: string, out: InputError[], m: InputMessages): void {
  if (f.type === "list") {
    for (const r of (Array.isArray(v) ? v : []) as ListRow[])
      if (r.text.trim() === "" && r.note.trim() !== "")
        out.push({ target: domId.row(path, r.k), message: m.noteWithoutText });
  }
  if (f.type === "group") {
    for (const it of (Array.isArray(v) ? v : []) as GroupItem[]) {
      if (!itemHasContent(f, it)) continue;
      if (it.name.trim() === "")
        out.push({ target: domId.itemName(path, it.k), message: m.nameItem(f.itemLabel) });
      for (const c of f.children) checkField(c, it.values[c.id], domId.child(path, it.k, c.id), out, m);
    }
  }
  if (!f.required || !isEmpty(f, v)) return;
  const target = domId.field(path);
  switch (f.type) {
    case "text":
    case "longtext":
      out.push({ target, message: m.required(f.label) });
      break;
    case "choice":
      out.push({ target, message: m.choose(f.label) });
      break;
    case "list":
      out.push({ target, message: m.addOne(f.itemLabel) });
      break;
    case "group":
      out.push({ target, message: m.addText(innermostItemLabel(f)) });
      break;
  }
}

export function validateInputs(
  template: Template,
  inputs: Inputs,
  scope: Scope,
  m: InputMessages = EN_INPUT_MESSAGES,
): InputError[] {
  const out: InputError[] = [];
  const shown = template.fields.filter((f) => isShown(f, inputs));
  if (shown.every((f) => isEmpty(f, inputs[f.id]))) {
    const first = template.fields[0];
    return [{ target: first ? domId.field(first.id) : "generate", message: m.nothing }];
  }
  for (const f of shown) checkField(f, inputs[f.id], f.id, out, m);
  const sf = template.sourceScope?.field;
  if (sf && scope === "restricted" && filledRows(inputs[sf]).length === 0)
    out.push({ target: domId.field(sf), message: m.restricted });
  return out;
}
