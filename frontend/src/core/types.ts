export type Wording =
  | string
  | { by: string; variants: Record<string, string>; fallback: string };

export interface BaseField {
  id: string;
  label: string;
  required: boolean;
}

export interface TextField extends BaseField {
  type: "text" | "longtext";
  prefixFrom?: string;
}

export interface ChoiceOption {
  value: string;
  label: string;
}

export interface ChoiceField extends BaseField {
  type: "choice";
  options: ChoiceOption[];
  default?: string;
  output?: "section" | "none";
}

export interface ListField extends BaseField {
  type: "list";
  itemLabel: string;
  noteLabel: string;
  format: "code" | "plain";
}

export interface GroupField extends BaseField {
  type: "group";
  itemLabel: string;
  defaultItems?: string[];
  children: Field[];
}

export type Field = TextField | ChoiceField | ListField | GroupField;
export type FieldType = Field["type"];

export interface BasedOn {
  id: string;
  version: number;
}

export interface Template {
  id: string;
  name: string;
  schema: number;
  version?: number;
  basedOn?: BasedOn;
  fields: Field[];
  preamble: Wording;
  closing: Wording;
  replyModes: "none" | "all" | string[];
  sourceScope: null | { field: string };
}

export interface ListRow {
  k: string;
  text: string;
  note: string;
}

export interface GroupItem {
  k: string;
  name: string;
  values: Inputs;
}

export type Value = string | null | ListRow[] | GroupItem[];
export type Inputs = Record<string, Value>;

export type Scope = "restricted" | "open";
export type OutputType = "bare" | "review";

export interface ReplyMode {
  id: string;
  label: string;
  instruction: string;
  version?: number;
  basedOn?: BasedOn;
}

export interface Wrapper {
  text: string;
  version?: number;
  basedOn?: BasedOn;
}

export interface Provider {
  id: "chatgpt" | "mistral";
  label: string;
  link: string;
  home: string;
  /** Shown in the confirmation dialog: who receives the prompt. */
  company: string;
  host: string;
}

export interface Draft {
  values: Inputs;
  mode: string;
  scope: Scope;
  output: string;
  baseline: string;
  entryId: string | null;
  outputType: OutputType;
  updatedAt: number;
}

export interface HistoryEntry {
  id: string;
  createdAt: number;
  templateId: string;
  templateName: string;
  inputs: Inputs;
  mode: string;
  modeLabel: string;
  scope: Scope;
  generated: string;
  prompt: string;
  edited: boolean;
  summary: string;
}

export type HistoryIndexRow = Pick<
  HistoryEntry,
  "id" | "createdAt" | "templateId" | "templateName" | "summary" | "edited"
>;

export interface Settings {
  theme: "system" | "light" | "dark";
  lastTemplate: string | null;
  dismissed: string[];
  confirmedProviders: string[];
}
