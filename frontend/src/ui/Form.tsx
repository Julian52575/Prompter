import type { ComponentChildren } from "preact";
import { newItem, newRow } from "../core/catalog";
import { isShown, itemHasContent } from "../core/render";
import type { ChoiceField, Field, GroupField, GroupItem, Inputs, ListField, ListRow, TextField, Value } from "../core/types";
import { domId } from "../core/validate";
import { focusLater, focusNow, useApp } from "./context";

export type Errors = Map<string, string>;

interface FormProps {
  fields: Field[];
  values: Inputs;
  onChange(v: Inputs): void;
  errors: Errors;
  /** Path prefix for DOM ids; "" at the top level. */
  path?: string;
  /** Extra controls placed before or after a field, keyed by field id (the reply mode and source scope radios). */
  before?: Record<string, ComponentChildren>;
  after?: Record<string, ComponentChildren>;
}

const pathOf = (prefix: string, id: string) => (prefix ? `${prefix}-${id}` : id);
const errId = (id: string) => `${id}-error`;

function ErrorText({ id, errors }: { id: string; errors: Errors }) {
  const msg = errors.get(id);
  return msg ? (
    <p class="field-error" id={errId(id)}>
      <span aria-hidden="true">✖ </span>
      {msg}
    </p>
  ) : null;
}

const invalid = (id: string, errors: Errors) =>
  errors.has(id) ? { "aria-invalid": true as const, "aria-describedby": errId(id) } : {};

function Req({ on }: { on: boolean }) {
  return on ? <span class="req"> (required)</span> : null;
}

export function Form({ fields, values, onChange, errors, path = "", before, after }: FormProps) {
  const set = (id: string, v: Value) => onChange({ ...values, [id]: v });
  return (
    <>
      {fields.map((f) => (
        <div key={f.id}>
          {before?.[f.id]}
          {isShown(f, values) && (
            <FieldInput field={f} value={values[f.id]} set={(v) => set(f.id, v)} errors={errors} path={pathOf(path, f.id)} />
          )}
          {after?.[f.id]}
        </div>
      ))}
    </>
  );
}

interface FieldProps<F extends Field> {
  field: F;
  value: Value | undefined;
  set(v: Value): void;
  errors: Errors;
  path: string;
  /** Visible label override: a sub-block's name labels its textarea. */
  label?: string;
}

function FieldInput(p: FieldProps<Field>) {
  switch (p.field.type) {
    case "text":
    case "longtext":
      return <TextInput {...(p as FieldProps<TextField>)} />;
    case "choice":
      return <ChoiceInput {...(p as FieldProps<ChoiceField>)} />;
    case "list":
      return <ListInput {...(p as FieldProps<ListField>)} />;
    case "group":
      return <GroupInput {...(p as FieldProps<GroupField>)} />;
  }
}

function TextInput({ field, value, set, errors, path, label }: FieldProps<TextField>) {
  const id = domId.field(path);
  const hintId = field.hint ? `${id}-hint` : undefined;
  const inv = invalid(id, errors);
  const describedBy = [inv["aria-describedby"], hintId].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    value: typeof value === "string" ? value : "",
    onInput: (e: Event) => set((e.currentTarget as HTMLInputElement).value),
    "aria-required": field.required || undefined,
    ...inv,
    "aria-describedby": describedBy,
  };
  return (
    <div class="field">
      <label for={id}>
        {label ?? field.label}
        <Req on={field.required} />
      </label>
      {field.hint && (
        <p class="hint" id={hintId}>
          {field.hint}
        </p>
      )}
      <ErrorText id={id} errors={errors} />
      {field.type === "longtext" ? <textarea rows={4} {...common} /> : <input type="text" {...common} />}
    </div>
  );
}

function ChoiceInput({ field, value, set, errors, path }: FieldProps<ChoiceField>) {
  const id = domId.field(path);
  return (
    <fieldset id={id} {...invalid(id, errors)}>
      <legend>
        {field.label}
        <Req on={field.required} />
      </legend>
      <ErrorText id={id} errors={errors} />
      {field.options.map((o) => (
        <label class="radio" key={o.value}>
          <input type="radio" name={id} value={o.value} checked={value === o.value} onChange={() => set(o.value)} /> {o.label}
        </label>
      ))}
    </fieldset>
  );
}

interface MoveProps {
  index: number;
  count: number;
  name: string;
  baseId: string;
  move(from: number, to: number): void;
}

/** Move up / Move down with the spec's focus rules. */
function MoveButtons({ index, count, name, baseId, move }: MoveProps) {
  const { announce } = useApp();
  const go = (dir: -1 | 1) => {
    const to = index + dir;
    move(index, to);
    announce(`${name} moved to position ${to + 1} of ${count}`);
    const self = dir < 0 ? "up" : "down";
    const other = dir < 0 ? "down" : "up";
    // Ids are keyed by item, so they follow the item to its new position.
    setTimeout(() => focusNow(`${baseId}-${self}`) || focusNow(`${baseId}-${other}`), 0);
  };
  return (
    <>
      <button type="button" id={`${baseId}-up`} disabled={index === 0} aria-label={`Move up: ${name}`} onClick={() => go(-1)}>
        Move up
      </button>
      <button
        type="button"
        id={`${baseId}-down`}
        disabled={index === count - 1}
        aria-label={`Move down: ${name}`}
        onClick={() => go(1)}
      >
        Move down
      </button>
    </>
  );
}

function moved<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}

function ListInput({ field, value, set, errors, path }: FieldProps<ListField>) {
  const id = domId.field(path);
  const rows = (Array.isArray(value) ? value : []) as ListRow[];
  const addId = `${id}-add`;
  const setRow = (i: number, r: ListRow) => set(rows.map((x, j) => (j === i ? r : x)));
  const remove = (i: number) => {
    const next = rows.filter((_, j) => j !== i);
    set(next);
    const target = next[i] ?? next[i - 1];
    focusLater(target ? domId.row(path, target.k) : addId);
  };
  return (
    <fieldset id={id} class="repeat" {...invalid(id, errors)}>
      <legend>
        {field.label}
        <Req on={field.required} />
      </legend>
      <ErrorText id={id} errors={errors} />
      <ol class="rows">
        {rows.map((r, i) => {
          const rid = domId.row(path, r.k);
          const name = r.text.trim() || `${field.itemLabel} ${i + 1}`;
          return (
            <li key={r.k} class="row">
              <div class="field">
                <label for={rid}>
                  {field.itemLabel} {i + 1}
                </label>
                <ErrorText id={rid} errors={errors} />
                <input type="text" id={rid} value={r.text} onInput={(e) => setRow(i, { ...r, text: e.currentTarget.value })} {...invalid(rid, errors)} />
              </div>
              <div class="field">
                <label for={`${rid}-note`}>
                  {field.noteLabel} {i + 1}
                </label>
                <input type="text" id={`${rid}-note`} value={r.note} onInput={(e) => setRow(i, { ...r, note: e.currentTarget.value })} />
              </div>
              <div class="item-actions">
                <MoveButtons index={i} count={rows.length} name={name} baseId={rid} move={(a, b) => set(moved(rows, a, b))} />
                <button type="button" aria-label={`Remove: ${name}`} onClick={() => remove(i)}>
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        id={addId}
        onClick={() => {
          const r = newRow();
          set([...rows, r]);
          focusLater(domId.row(path, r.k));
        }}
      >
        Add {field.itemLabel.toLowerCase()}
      </button>
    </fieldset>
  );
}

function GroupInput({ field, value, set, errors, path }: FieldProps<GroupField>) {
  const { dialogs } = useApp();
  const id = domId.field(path);
  const items = (Array.isArray(value) ? value : []) as GroupItem[];
  const addId = `${id}-add`;
  const lower = field.itemLabel.toLowerCase();
  const setItem = (i: number, it: GroupItem) => set(items.map((x, j) => (j === i ? it : x)));
  const single = field.children.length === 1 && field.children[0].type !== "group" ? field.children[0] : null;
  const remove = async (i: number) => {
    const it = items[i];
    const name = it.name.trim() || field.itemLabel;
    if (itemHasContent(field, it)) {
      const r = await dialogs.confirm({ title: `Remove ${name} and its contents?`, confirm: "Remove", danger: true });
      if (r.choice !== "confirm") return;
    }
    const next = items.filter((_, j) => j !== i);
    set(next);
    const target = next[i] ?? next[i - 1];
    focusLater(target ? domId.itemName(path, target.k) : addId);
  };
  return (
    <fieldset id={id} class="repeat group" {...invalid(id, errors)}>
      <legend>
        {field.label}
        <Req on={field.required} />
      </legend>
      <ErrorText id={id} errors={errors} />
      <ol class="items">
        {items.map((it, i) => {
          const nid = domId.itemName(path, it.k);
          const name = it.name.trim() || `${field.itemLabel} ${i + 1}`;
          const childPath = (cid: string) => domId.child(path, it.k, cid);
          return (
            <li key={it.k} class="item">
              <div class="field">
                <label for={nid}>
                  {field.itemLabel} {i + 1} name
                </label>
                <ErrorText id={nid} errors={errors} />
                <input
                  type="text"
                  id={nid}
                  value={it.name}
                  onInput={(e) => setItem(i, { ...it, name: e.currentTarget.value.replace(/[\r\n]+/g, " ") })}
                  {...invalid(nid, errors)}
                />
              </div>
              <div class="item-actions">
                <MoveButtons index={i} count={items.length} name={name} baseId={nid} move={(a, b) => set(moved(items, a, b))} />
                <button type="button" aria-label={`Remove: ${name}`} onClick={() => remove(i)}>
                  Remove
                </button>
              </div>
              {single ? (
                <FieldInput
                  field={single}
                  value={it.values[single.id]}
                  set={(v) => setItem(i, { ...it, values: { ...it.values, [single.id]: v } })}
                  errors={errors}
                  path={childPath(single.id)}
                  label={it.name.trim() || `${field.itemLabel} ${i + 1}`}
                />
              ) : (
                field.children.map((c) => (
                  <FieldInput
                    key={c.id}
                    field={c}
                    value={it.values[c.id]}
                    set={(v) => setItem(i, { ...it, values: { ...it.values, [c.id]: v } })}
                    errors={errors}
                    path={childPath(c.id)}
                  />
                ))
              )}
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        id={addId}
        onClick={() => {
          const it = newItem(field.children);
          set([...items, it]);
          focusLater(domId.itemName(path, it.k));
        }}
      >
        Add {lower}
      </button>
    </fieldset>
  );
}
