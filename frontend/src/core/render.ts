import type {
  ChoiceField,
  Field,
  GroupField,
  GroupItem,
  Inputs,
  ListField,
  ListRow,
  ReplyMode,
  Scope,
  Template,
  Value,
  Wording,
} from "./types";

export const REPLY_MODE_OVERRIDE = "This overrides any conflicting reporting instructions above.";

export const SCOPE_TEXT = {
  restricted: "Use only the listed sources. Treat anything else as off-limits.",
  open: 'Use the listed sources first. You may search elsewhere; label each cited source "listed" or "external."',
  openNone: "No sources are listed. You may search for sources; cite each one you use.",
};

/** LF line endings, leading and trailing blank lines removed, the rest verbatim. */
export function clean(v: string): string {
  const lines = v.replace(/\r\n?/g, "\n").split("\n");
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  return lines.join("\n");
}

export function headingName(name: string): string {
  return name.replace(/\s+/g, " ").trim().replace(/^#/, "\\#");
}

function longestRun(text: string, ch: string): number {
  let max = 0;
  for (const m of text.matchAll(new RegExp(`\\${ch}+`, "g"))) max = Math.max(max, m[0].length);
  return max;
}

export function inlineCode(text: string): string {
  const fence = "`".repeat(longestRun(text, "`") + 1);
  const pad = text.startsWith("`") || text.endsWith("`") ? " " : "";
  return `${fence}${pad}${text}${pad}${fence}`;
}

export function codeFence(text: string): string {
  const fence = "`".repeat(Math.max(3, longestRun(text, "`") + 1));
  return `${fence}markdown\n${text.replace(/\n$/, "")}\n${fence}`;
}

const str = (v: Value | undefined): string => (typeof v === "string" ? v : "");
const rows = (v: Value | undefined): ListRow[] => (Array.isArray(v) ? (v as ListRow[]) : []);
const items = (v: Value | undefined): GroupItem[] => (Array.isArray(v) ? (v as GroupItem[]) : []);

export function choiceLabel(field: ChoiceField, v: Value | undefined): string {
  return field.options.find((o) => o.value === v)?.label ?? "";
}

export function filledRows(v: Value | undefined): ListRow[] {
  return rows(v).filter((r) => r.text.trim() !== "");
}

/** False when the field's showWhen choice does not match: it is then hidden, unvalidated and not rendered. */
export function isShown(field: Field, inputs: Inputs): boolean {
  return !field.showWhen || inputs[field.showWhen.field] === field.showWhen.value;
}

export function isEmpty(field: Field, v: Value | undefined): boolean {
  switch (field.type) {
    case "text":
    case "longtext":
      return str(v).trim() === "";
    case "choice":
      return !field.options.some((o) => o.value === v);
    case "list":
      return filledRows(v).length === 0;
    case "group":
      return !items(v).some((it) => itemHasContent(field, it));
  }
}

export function itemHasContent(group: GroupField, item: GroupItem): boolean {
  return group.children.some((c) => !isEmpty(c, item.values[c.id]));
}

export function resolveWording(w: Wording, template: Template, inputs: Inputs): string {
  let text: string;
  if (typeof w === "string") text = w;
  else {
    const v = inputs[w.by];
    text = (typeof v === "string" && w.variants[v]) || w.fallback;
  }
  const fields = new Map(template.fields.map((f) => [f.id, f]));
  // One pass over the wording: substituted user text is never rescanned.
  return text.replace(/\{\{([a-zA-Z0-9]+)\}\}/g, (_, id: string) => {
    const f = fields.get(id);
    if (!f || !isShown(f, inputs)) return "";
    if (f.type === "choice") return choiceLabel(f, inputs[id]);
    if (f.type === "text" || f.type === "longtext") return clean(str(inputs[id]));
    return "";
  });
}

function listBody(field: ListField, v: Value | undefined): string {
  return filledRows(v)
    .map((r) => {
      const t = clean(r.text).replace(/\n/g, " ");
      const text = field.format === "code" ? inlineCode(t) : t;
      const note = clean(r.note);
      return note ? `- ${text}: ${note}` : `- ${text}`;
    })
    .join("\n");
}

export function scopeInstruction(scope: Scope, count: number): string {
  if (scope === "restricted") return SCOPE_TEXT.restricted;
  return count > 0 ? SCOPE_TEXT.open : SCOPE_TEXT.openNone;
}

/** Value of a non-group field as it appears in the prompt ("" when empty). */
function valueText(field: Exclude<Field, GroupField>, v: Value | undefined): string {
  if (isEmpty(field, v)) return "";
  if (field.type === "choice") return choiceLabel(field, v);
  if (field.type === "list") return listBody(field, v);
  return clean(str(v));
}

function renderItem(group: GroupField, item: GroupItem, level: number): string {
  const head = `${"#".repeat(level)} ${headingName(item.name)}`;
  const plain = group.children.filter((c): c is Exclude<Field, GroupField> => c.type !== "group");
  const nested = group.children.filter((c): c is GroupField => c.type === "group");
  let body: string;
  if (plain.length === 1) body = valueText(plain[0], item.values[plain[0].id]);
  else
    body = plain
      .map((c) => {
        const v = valueText(c, item.values[c.id]);
        if (!v) return "";
        const multi = c.type === "longtext" || c.type === "list";
        return multi ? `**${c.label}:**\n${v}` : `**${c.label}:** ${v}`;
      })
      .filter(Boolean)
      .join("\n");
  const blocks = [body ? `${head}\n${body}` : head];
  for (const g of nested) blocks.push(...renderGroupItems(g, item.values[g.id], level + 1));
  return blocks.join("\n\n");
}

function renderGroupItems(group: GroupField, v: Value | undefined, level: number): string[] {
  return items(v)
    .filter((it) => itemHasContent(group, it))
    .map((it) => renderItem(group, it, level));
}

export interface RenderInput {
  template: Template;
  inputs: Inputs;
  mode: ReplyMode | null;
  scope: Scope;
}

export function renderPreamble(template: Template, inputs: Inputs): string {
  return clean(resolveWording(template.preamble, template, inputs));
}

export function render({ template, inputs, mode, scope }: RenderInput): string {
  const parts: string[] = [renderPreamble(template, inputs)];
  for (const f of template.fields) {
    const v = inputs[f.id];
    if (!isShown(f, inputs)) continue;
    switch (f.type) {
      case "text":
      case "longtext": {
        if (f.output === "none" || isEmpty(f, v)) break;
        const val = clean(str(v));
        const pf = f.prefixFrom && template.fields.find((x) => x.id === f.prefixFrom);
        const prefix = pf && pf.type === "choice" ? choiceLabel(pf, inputs[pf.id]) : "";
        parts.push(`## ${f.label}\n${prefix ? `**${prefix}:** ${val}` : val}`);
        break;
      }
      case "choice": {
        if (f.output === "none" || isEmpty(f, v)) break;
        const opt = f.options.find((o) => o.value === v)!;
        const body = opt.instruction ? clean(resolveWording(opt.instruction, template, inputs)) : opt.label;
        parts.push(`## ${f.label}\n${body}`);
        break;
      }
      case "list": {
        const isScope = template.sourceScope?.field === f.id;
        const count = filledRows(v).length;
        if (count === 0 && !(isScope && scope === "open")) break;
        const lines = [`## ${f.label}`];
        if (isScope) lines.push(scopeInstruction(scope, count));
        if (count) lines.push(listBody(f, v));
        parts.push(lines.join("\n"));
        break;
      }
      case "group":
        parts.push(...renderGroupItems(f, v, 2));
        break;
    }
  }
  parts.push(clean(resolveWording(template.closing, template, inputs)));
  const instruction = clean(mode?.instruction ?? "");
  if (instruction) parts.push(`## Reply mode\n${REPLY_MODE_OVERRIDE}\n\n${instruction}`);
  return `${parts.filter((p) => p !== "").join("\n\n")}\n`;
}

function firstLine(s: string): string {
  return s.split("\n").find((l) => l.trim() !== "")?.trim() ?? "";
}

function firstText(fields: Field[], inputs: Inputs): string {
  for (const f of fields) {
    if ((f.type === "text" || f.type === "longtext") && f.output !== "none" && isShown(f, inputs)) {
      const line = firstLine(str(inputs[f.id]));
      if (line) return line;
    }
  }
  for (const f of fields) {
    if (f.type !== "group") continue;
    for (const it of items(inputs[f.id])) {
      const line = firstText(f.children, it.values);
      if (line) return line;
    }
  }
  return "";
}

export function summarize(template: Template, inputs: Inputs, prompt: string): string {
  let s = firstText(template.fields, inputs);
  if (!s) {
    const pre = renderPreamble(template, inputs);
    s = firstLine(pre && prompt.startsWith(pre) ? prompt.slice(pre.length) : prompt);
  }
  return s.length > 80 ? `${s.slice(0, 79)}…` : s;
}
