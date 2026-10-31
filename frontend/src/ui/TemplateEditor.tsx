import { useEffect, useRef, useState } from "preact/hooks";
import { checkTemplate, lintTemplateText } from "../core/lint";
import type { ChoiceField, Field, FieldType, GroupField, ListField, ReplyMode, Template, TextField, Wording } from "../core/types";
import { focusLater, useApp } from "./context";

const TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  longtext: "Long text",
  choice: "Choice",
  list: "List",
  group: "Group",
};

const stringify = (t: Template) => JSON.stringify(t, null, 2);

function allIds(fields: Field[]): string[] {
  return fields.flatMap((f) => [f.id, ...(f.type === "group" ? allIds(f.children) : [])]);
}

function newField(type: FieldType, taken: string[]): Field {
  let n = 1;
  while (taken.includes(`${type}${n}`)) n++;
  const base = { id: `${type}${n}`, label: `${TYPE_LABELS[type]} ${n}`, required: false };
  switch (type) {
    case "text":
    case "longtext":
      return { ...base, type };
    case "choice":
      return { ...base, type, options: [{ value: "a", label: "Option A" }], output: "section" };
    case "list":
      return { ...base, type, itemLabel: "Item", noteLabel: "Note", format: "plain" };
    case "group":
      return { ...base, type, itemLabel: "Item", children: [{ id: `${base.id}Text`, label: "Text", type: "longtext", required: false }] };
  }
}

interface Props {
  initial: Template;
  modes: ReplyMode[];
  title: string;
  onSave(t: Template): void;
  onClose(): void;
}

export function TemplateEditor({ initial, modes, title, onSave, onClose }: Props) {
  const { dialogs, setLeaveGuard, registerDirty } = useApp();
  const [tpl, setTplState] = useState(initial);
  const [json, setJson] = useState(() => stringify(initial));
  const [saved, setSaved] = useState(initial);
  const jsonRef = useRef<HTMLTextAreaElement>(null);
  const modeIds = modes.map((m) => m.id);
  const jsonLint = lintTemplateText(json, modeIds);
  const jsonDirty = json !== stringify(tpl);
  const dirty = jsonDirty || stringify(tpl) !== stringify(saved);
  const issues = checkTemplate(tpl, modeIds);
  const errors = issues.filter((i) => i.level === "error");
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const confirmLeave = async () => {
    if (!dirtyRef.current) return true;
    const r = await dialogs.confirm({ title: "Discard unsaved changes?", cancel: "Keep editing", confirm: "Discard", danger: true });
    return r.choice === "confirm";
  };
  useEffect(() => {
    setLeaveGuard(confirmLeave);
    const un = registerDirty({ key: "pb.templates", isDirty: () => dirtyRef.current, reload: onClose });
    return () => {
      setLeaveGuard(null);
      un();
    };
  }, []);

  const setTpl = (t: Template) => {
    setTplState(t);
    setJson(stringify(t));
  };
  const setFields = (fields: Field[]) => setTpl({ ...tpl, fields });
  const top = tpl.fields;
  const choices = top.filter((f): f is ChoiceField => f.type === "choice");
  const lists = top.filter((f): f is ListField => f.type === "list");

  const apply = () => {
    if (!jsonLint.value) return;
    setTplState({ ...jsonLint.value, id: initial.id });
    setJson(stringify({ ...jsonLint.value, id: initial.id }));
  };

  const goTo = (offset: number) => {
    const el = jsonRef.current!;
    el.focus();
    el.setSelectionRange(offset, offset);
  };

  return (
    <section class="editor" aria-labelledby="tpl-editor-title">
      <h3 id="tpl-editor-title">{title}</h3>
      <div class="field">
        <label for="tpl-name">Name</label>
        <input id="tpl-name" type="text" value={tpl.name} onInput={(e) => setTpl({ ...tpl, name: e.currentTarget.value })} />
      </div>
      <WordingEditor label="Preamble" id="tpl-preamble" value={tpl.preamble} choices={choices} onChange={(preamble) => setTpl({ ...tpl, preamble })} />

      <fieldset>
        <legend>Fields</legend>
        <FieldsEditor fields={tpl.fields} onChange={setFields} depth={0} path="fe" taken={allIds(tpl.fields)} choices={choices} />
      </fieldset>

      <WordingEditor label="Closing" id="tpl-closing" value={tpl.closing} choices={choices} onChange={(closing) => setTpl({ ...tpl, closing })} />

      <fieldset>
        <legend>Reply modes offered</legend>
        {(["none", "all", "list"] as const).map((k) => (
          <label class="radio" key={k}>
            <input
              type="radio"
              name="tpl-modes"
              checked={k === "list" ? Array.isArray(tpl.replyModes) : tpl.replyModes === k}
              onChange={() => setTpl({ ...tpl, replyModes: k === "list" ? [] : k })}
            />{" "}
            {k === "none" ? "None" : k === "all" ? "All (Standard plus every mode, including new ones)" : "Standard plus selected modes"}
          </label>
        ))}
        {Array.isArray(tpl.replyModes) && (
          <fieldset>
            <legend>Selected modes</legend>
            {modes.map((m) => (
              <label class="check" key={m.id}>
                <input
                  type="checkbox"
                  checked={(tpl.replyModes as string[]).includes(m.id)}
                  onChange={(e) => {
                    const list = (tpl.replyModes as string[]).filter((x) => x !== m.id);
                    setTpl({ ...tpl, replyModes: e.currentTarget.checked ? [...list, m.id] : list });
                  }}
                />{" "}
                {m.label}
              </label>
            ))}
          </fieldset>
        )}
      </fieldset>

      <div class="field">
        <label for="tpl-scope">Source scope</label>
        <select
          id="tpl-scope"
          value={tpl.sourceScope?.field ?? ""}
          onChange={(e) => setTpl({ ...tpl, sourceScope: e.currentTarget.value ? { field: e.currentTarget.value } : null })}
        >
          <option value="">Off</option>
          {lists.map((f) => (
            <option key={f.id} value={f.id}>
              Attach to {f.label}
            </option>
          ))}
        </select>
      </div>

      {issues.length > 0 && (
        <div role="alert" class="lint">
          <p>{errors.length ? "Fix these before saving:" : "Warnings:"}</p>
          <ul>
            {issues.map((i, n) => (
              <li key={n}>
                <strong>{i.level === "error" ? "Error" : "Warning"}:</strong> {i.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <details>
        <summary>Advanced: JSON view</summary>
        <div class="field">
          <label for="tpl-json">Template JSON</label>
          <textarea
            id="tpl-json"
            ref={jsonRef}
            class="output"
            rows={20}
            spellcheck={false}
            value={json}
            onInput={(e) => setJson(e.currentTarget.value)}
            aria-describedby="tpl-json-lint"
          />
        </div>
        <div id="tpl-json-lint" role="alert">
          {jsonLint.issues.length > 0 && (
            <ul class="lint">
              {jsonLint.issues.map((i, n) => (
                <li key={n}>
                  <a
                    href="#tpl-json"
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(i.offset);
                    }}
                  >
                    Line {i.line}, column {i.column}
                  </a>{" "}
                  — {i.level === "error" ? "Error" : "Warning"}: {i.message}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div class="actions">
          <button type="button" onClick={apply} disabled={!jsonLint.value || !jsonDirty}>
            Apply
          </button>
          <button type="button" onClick={() => setJson(stringify(tpl))} disabled={!jsonDirty}>
            Revert JSON
          </button>
        </div>
      </details>

      <div class="actions">
        <button
          type="button"
          class="primary"
          disabled={errors.length > 0 || jsonDirty}
          onClick={() => {
            onSave(tpl);
            setSaved(tpl);
          }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={async () => {
            if (await confirmLeave()) onClose();
          }}
        >
          Close
        </button>
      </div>
      {jsonDirty && <p class="hint">Apply or revert the JSON edits before saving.</p>}
    </section>
  );
}

function WordingEditor({
  label,
  id,
  value,
  choices,
  onChange,
}: {
  label: string;
  id: string;
  value: Wording;
  choices: ChoiceField[];
  onChange(w: Wording): void;
}) {
  const plain = typeof value === "string";
  const by = plain ? null : choices.find((c) => c.id === value.by);
  return (
    <fieldset>
      <legend>{label}</legend>
      <label class="radio">
        <input type="radio" name={`${id}-kind`} checked={plain} onChange={() => onChange(plain ? value : value.fallback)} /> Plain text
      </label>
      <label class="radio">
        <input
          type="radio"
          name={`${id}-kind`}
          checked={!plain}
          disabled={choices.length === 0}
          onChange={() => onChange({ by: choices[0].id, variants: {}, fallback: plain ? value : "" })}
        />{" "}
        Varies by a choice field{choices.length === 0 && " (add a choice field first)"}
      </label>
      {plain ? (
        <div class="field">
          <label for={id}>{label} text</label>
          <textarea id={id} rows={3} value={value} onInput={(e) => onChange(e.currentTarget.value)} />
        </div>
      ) : (
        <>
          <div class="field">
            <label for={`${id}-by`}>Choice field</label>
            <select id={`${id}-by`} value={value.by} onChange={(e) => onChange({ ...value, by: e.currentTarget.value, variants: {} })}>
              {choices.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          {by?.options.map((o) => (
            <div class="field" key={o.value}>
              <label for={`${id}-v-${o.value}`}>{o.label}</label>
              <textarea
                id={`${id}-v-${o.value}`}
                rows={2}
                value={value.variants[o.value] ?? ""}
                onInput={(e) => {
                  const variants = { ...value.variants };
                  if (e.currentTarget.value) variants[o.value] = e.currentTarget.value;
                  else delete variants[o.value];
                  onChange({ ...value, variants });
                }}
              />
            </div>
          ))}
          <div class="field">
            <label for={`${id}-fallback`}>Fallback (no choice, or no variant)</label>
            <textarea id={`${id}-fallback`} rows={2} value={value.fallback} onInput={(e) => onChange({ ...value, fallback: e.currentTarget.value })} />
          </div>
        </>
      )}
      <p class="hint">Placeholders such as {"{{fieldId}}"} insert a top-level text or choice field.</p>
    </fieldset>
  );
}

interface FieldsProps {
  fields: Field[];
  onChange(f: Field[]): void;
  depth: number;
  path: string;
  taken: string[];
  choices: ChoiceField[];
}

function FieldsEditor({ fields, onChange, depth, path, taken, choices }: FieldsProps) {
  const { dialogs, announce } = useApp();
  const [addType, setAddType] = useState<FieldType>("text");
  const types = (Object.keys(TYPE_LABELS) as FieldType[]).filter((t) => t !== "group" || depth < 2);
  const move = (i: number, to: number) => {
    const next = fields.slice();
    const [f] = next.splice(i, 1);
    next.splice(to, 0, f);
    onChange(next);
    announce(`${f.label} moved to position ${to + 1} of ${fields.length}`);
    const self = to < i ? "up" : "down";
    const other = to < i ? "down" : "up";
    focusLater(`${path}-${f.id}-${self}`, `${path}-${f.id}-${other}`);
  };
  return (
    <>
      <ol class="items">
        {fields.map((f, i) => (
          <li key={i} class="item">
            <FieldEditor
              field={f}
              onChange={(nf) => onChange(fields.map((x, j) => (j === i ? nf : x)))}
              depth={depth}
              path={`${path}-${i}`}
              taken={taken}
              choices={choices}
            />
            <div class="item-actions">
              <button type="button" id={`${path}-${f.id}-up`} disabled={i === 0} aria-label={`Move up: ${f.label}`} onClick={() => move(i, i - 1)}>
                Move up
              </button>
              <button
                type="button"
                id={`${path}-${f.id}-down`}
                disabled={i === fields.length - 1}
                aria-label={`Move down: ${f.label}`}
                onClick={() => move(i, i + 1)}
              >
                Move down
              </button>
              <button
                type="button"
                aria-label={`Remove field: ${f.label}`}
                onClick={async () => {
                  const r = await dialogs.confirm({ title: `Remove the field ${f.label}?`, confirm: "Remove", danger: true });
                  if (r.choice !== "confirm") return;
                  onChange(fields.filter((_, j) => j !== i));
                  focusLater(`${path}-add`);
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>
      <div class="inline-actions">
        <label for={`${path}-type`}>New field type</label>
        <select id={`${path}-type`} value={addType} onChange={(e) => setAddType(e.currentTarget.value as FieldType)}>
          {types.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <button
          type="button"
          id={`${path}-add`}
          onClick={() => {
            onChange([...fields, newField(addType, taken)]);
            focusLater(`${path}-${fields.length}-label`);
          }}
        >
          Add field
        </button>
      </div>
    </>
  );
}

interface FieldProps extends Omit<FieldsProps, "fields" | "onChange"> {
  field: Field;
  onChange(f: Field): void;
}

function FieldEditor({ field: f, onChange, depth, path, taken, choices }: FieldProps) {
  const set = (p: Partial<Field>) => onChange({ ...f, ...p } as Field);
  return (
    <fieldset>
      <legend>
        {TYPE_LABELS[f.type]} field: {f.label}
      </legend>
      <div class="grid2">
        <div class="field">
          <label for={`${path}-label`}>Label</label>
          <input id={`${path}-label`} type="text" value={f.label} onInput={(e) => set({ label: e.currentTarget.value })} />
        </div>
        <div class="field">
          <label for={`${path}-id`}>Id (letters and digits, starting lower-case)</label>
          <input id={`${path}-id`} type="text" value={f.id} onInput={(e) => set({ id: e.currentTarget.value })} />
        </div>
      </div>
      <label class="check">
        <input type="checkbox" checked={f.required} onChange={(e) => set({ required: e.currentTarget.checked })} /> Required
      </label>
      {(f.type === "text" || f.type === "longtext") && depth === 0 && (
        <div class="field">
          <label for={`${path}-prefix`}>Prefix from choice</label>
          <select
            id={`${path}-prefix`}
            value={(f as TextField).prefixFrom ?? ""}
            onChange={(e) => {
              const { prefixFrom: _, ...rest } = f as TextField;
              onChange(e.currentTarget.value ? { ...rest, prefixFrom: e.currentTarget.value } : rest);
            }}
          >
            <option value="">None</option>
            {choices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {f.type === "choice" && <ChoiceOptions f={f} onChange={onChange} path={path} />}
      {f.type === "list" && (
        <div class="grid2">
          <div class="field">
            <label for={`${path}-item`}>Row label</label>
            <input id={`${path}-item`} type="text" value={f.itemLabel} onInput={(e) => set({ itemLabel: e.currentTarget.value })} />
          </div>
          <div class="field">
            <label for={`${path}-note`}>Note label</label>
            <input id={`${path}-note`} type="text" value={f.noteLabel} onInput={(e) => set({ noteLabel: e.currentTarget.value })} />
          </div>
          <fieldset>
            <legend>Row format</legend>
            {(["plain", "code"] as const).map((v) => (
              <label class="radio" key={v}>
                <input type="radio" name={`${path}-format`} checked={f.format === v} onChange={() => set({ format: v })} />{" "}
                {v === "code" ? "Code (paths)" : "Plain"}
              </label>
            ))}
          </fieldset>
        </div>
      )}
      {f.type === "group" && (
        <>
          <div class="field">
            <label for={`${path}-item`}>Item label</label>
            <input id={`${path}-item`} type="text" value={f.itemLabel} onInput={(e) => set({ itemLabel: e.currentTarget.value })} />
          </div>
          {depth === 0 && (
            <div class="field">
              <label for={`${path}-defaults`}>Default items (one name per line)</label>
              <textarea
                id={`${path}-defaults`}
                rows={3}
                value={(f.defaultItems ?? []).join("\n")}
                onInput={(e) => {
                  const names = e.currentTarget.value.split("\n");
                  const { defaultItems: _, ...rest } = f as GroupField;
                  onChange(names.some((n) => n.trim()) ? { ...rest, defaultItems: names } : rest);
                }}
              />
            </div>
          )}
          <fieldset>
            <legend>Child fields of {f.label}</legend>
            <FieldsEditor
              fields={f.children}
              onChange={(children) => set({ children })}
              depth={depth + 1}
              path={`${path}-c`}
              taken={taken}
              choices={choices}
            />
          </fieldset>
        </>
      )}
    </fieldset>
  );
}

function ChoiceOptions({ f, onChange, path }: { f: ChoiceField; onChange(f: Field): void; path: string }) {
  const setOpt = (i: number, p: Partial<{ value: string; label: string }>) =>
    onChange({ ...f, options: f.options.map((o, j) => (j === i ? { ...o, ...p } : o)) });
  return (
    <>
      <fieldset>
        <legend>Options</legend>
        <ol class="rows">
          {f.options.map((o, i) => (
            <li key={i} class="row">
              <div class="field">
                <label for={`${path}-o${i}-label`}>Option {i + 1} label</label>
                <input id={`${path}-o${i}-label`} type="text" value={o.label} onInput={(e) => setOpt(i, { label: e.currentTarget.value })} />
              </div>
              <div class="field">
                <label for={`${path}-o${i}-value`}>Option {i + 1} value</label>
                <input id={`${path}-o${i}-value`} type="text" value={o.value} onInput={(e) => setOpt(i, { value: e.currentTarget.value })} />
              </div>
              <div class="item-actions">
                <button
                  type="button"
                  aria-label={`Remove option: ${o.label}`}
                  disabled={f.options.length === 1}
                  onClick={() => {
                    onChange({ ...f, options: f.options.filter((_, j) => j !== i) });
                    focusLater(`${path}-addopt`);
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          id={`${path}-addopt`}
          onClick={() => {
            onChange({ ...f, options: [...f.options, { value: `option${f.options.length + 1}`, label: `Option ${f.options.length + 1}` }] });
            focusLater(`${path}-o${f.options.length}-label`);
          }}
        >
          Add option
        </button>
      </fieldset>
      <div class="grid2">
        <div class="field">
          <label for={`${path}-default`}>Default option</label>
          <select
            id={`${path}-default`}
            value={f.default ?? ""}
            onChange={(e) => {
              const { default: _, ...rest } = f;
              onChange(e.currentTarget.value ? { ...rest, default: e.currentTarget.value } : rest);
            }}
          >
            <option value="">None</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend>In the prompt</legend>
          {(["section", "none"] as const).map((v) => (
            <label class="radio" key={v}>
              <input type="radio" name={`${path}-output`} checked={(f.output ?? "section") === v} onChange={() => onChange({ ...f, output: v })} />{" "}
              {v === "section" ? "Own section" : "Not shown (feeds wording and prefixes only)"}
            </label>
          ))}
        </fieldset>
      </div>
    </>
  );
}
