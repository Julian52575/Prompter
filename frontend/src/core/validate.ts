import { filledRows, isEmpty, isShown, itemHasContent } from "./render";
import type { Field, GroupField, GroupItem, Inputs, ListRow, Scope, Template } from "./types";

export interface InputError {
  /** DOM id of the control the error belongs to. */
  target: string;
  message: string;
}

export const NOTHING_TO_GENERATE = "Nothing to generate: fill at least one field";
export const RESTRICTED_NEEDS_SOURCES = "Restricted scope needs at least one source. Add a source or choose Open.";

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
  return cur.itemLabel.toLowerCase();
}

function checkField(f: Field, v: Inputs[string], path: string, out: InputError[]): void {
  if (f.type === "list") {
    for (const r of (Array.isArray(v) ? v : []) as ListRow[])
      if (r.text.trim() === "" && r.note.trim() !== "")
        out.push({ target: domId.row(path, r.k), message: "Add a path or remove this row" });
  }
  if (f.type === "group") {
    for (const it of (Array.isArray(v) ? v : []) as GroupItem[]) {
      if (!itemHasContent(f, it)) continue;
      if (it.name.trim() === "")
        out.push({ target: domId.itemName(path, it.k), message: `Name this ${f.itemLabel.toLowerCase()}.` });
      for (const c of f.children) checkField(c, it.values[c.id], domId.child(path, it.k, c.id), out);
    }
  }
  if (!f.required || !isEmpty(f, v)) return;
  const target = domId.field(path);
  switch (f.type) {
    case "text":
    case "longtext":
      out.push({ target, message: `${f.label} is required.` });
      break;
    case "choice":
      out.push({ target, message: `Choose ${/^[aeiou]/i.test(f.label) ? "an" : "a"} ${f.label.toLowerCase()}.` });
      break;
    case "list":
      out.push({ target, message: `Add at least one ${f.itemLabel.toLowerCase()}.` });
      break;
    case "group":
      out.push({ target, message: `Add text to at least one ${innermostItemLabel(f)}.` });
      break;
  }
}

export function validateInputs(template: Template, inputs: Inputs, scope: Scope): InputError[] {
  const out: InputError[] = [];
  const shown = template.fields.filter((f) => isShown(f, inputs));
  if (shown.every((f) => isEmpty(f, inputs[f.id]))) {
    const first = template.fields[0];
    return [{ target: first ? domId.field(first.id) : "generate", message: NOTHING_TO_GENERATE }];
  }
  for (const f of shown) checkField(f, inputs[f.id], f.id, out);
  const sf = template.sourceScope?.field;
  if (sf && scope === "restricted" && filledRows(inputs[sf]).length === 0)
    out.push({ target: domId.field(sf), message: RESTRICTED_NEEDS_SOURCES });
  return out;
}
