import { useEffect, useRef, useState } from "preact/hooks";
import { BUILTIN_PROVIDERS, BUILTIN_WRAPPER, STANDARD_MODE } from "../core/builtins";
import {
  blankTemplate,
  builtinMode,
  builtinTemplate,
  effectiveModes,
  effectiveTemplates,
  hasUpdate,
  omit,
  randomId,
  templatesListingMode,
} from "../core/catalog";
import {
  type ExportFile,
  exportData,
  exportFileName,
  importConflicts,
  importData,
  KEYS,
  MSG,
  providerList,
  repo,
  type Store,
  updateRecord,
  validateExport,
} from "../core/storage";
import type { Draft, Provider, ReplyMode, Settings as SettingsT, Template } from "../core/types";
import { lintProvider, lintWrapper } from "../core/wrap";
import { focusLater, useApp, useStoreVersion } from "./context";
import { Notice } from "./Notice";
import { StorageMeter } from "./StorageMeter";
import { TemplateEditor } from "./TemplateEditor";
import { UPDATED_BUILTIN } from "./Builder";

const setSettings = (s: Store, p: Partial<SettingsT>) =>
  updateRecord<Partial<SettingsT>>(s, KEYS.settings, {}, (x) => ({ ...x, ...p }));

export function Settings() {
  useStoreVersion();
  return (
    <section aria-labelledby="settings-heading" class="settings">
      <h2 id="settings-heading">Settings</h2>
      <Templates />
      <Modes />
      <WrapperSettings />
      <Providers />
      <Appearance />
      <Data />
    </section>
  );
}

function Templates() {
  const { store, dialogs, announce } = useApp();
  const r = repo(store);
  const stored = r.templates();
  const templates = effectiveTemplates(stored);
  const modes = effectiveModes(r.modes());
  const app = useApp();
  const [editing, setEditing] = useState<{ t: Template; title: string } | null>(() => {
    if (!app.openNewTemplate.current) return null;
    app.openNewTemplate.current = false;
    focusLater("tpl-name");
    return { t: blankTemplate(), title: "New template" };
  });

  const save = (t: Template) => {
    const b = builtinTemplate(t.id);
    const { version: _, basedOn: __, ...rest } = t;
    const rec: Template = b ? { ...rest, basedOn: { id: b.id, version: b.version! } } : rest;
    updateRecord<Record<string, Template>>(store, KEYS.templates, {}, (all) => ({ ...all, [t.id]: rec }));
    announce(`${t.name} saved`);
  };
  const remove = (id: string) =>
    updateRecord<Record<string, Template>>(store, KEYS.templates, {}, (all) => omit(all, id));

  if (editing)
    return (
      <TemplateEditor
        initial={editing.t}
        title={editing.title}
        modes={modes}
        onSave={save}
        onClose={() => {
          const id = editing.t.id;
          setEditing(null);
          focusLater(`tpl-edit-${id}`, "tpl-new");
        }}
      />
    );

  return (
    <section aria-labelledby="templates-heading">
      <h3 id="templates-heading">Templates</h3>
      <ul class="list">
        {templates.map((t) => {
          const b = builtinTemplate(t.id);
          const custom = !!stored[t.id];
          return (
            <li key={t.id} class="list-row">
              <p>
                <strong>{t.name}</strong> <span class="tag">{b ? (custom ? "Built-in, customised" : "Built-in") : "Custom"}</span>
              </p>
              {b && hasUpdate(stored[t.id], b) && (
                <Notice>
                  {UPDATED_BUILTIN}{" "}
                  <button type="button" onClick={() => remove(t.id)}>
                    Reset
                  </button>{" "}
                  <button type="button" onClick={() => save({ ...stored[t.id], basedOn: undefined })}>
                    Keep mine
                  </button>
                </Notice>
              )}
              <div class="item-actions">
                <button type="button" id={`tpl-edit-${t.id}`} aria-label={`Edit: ${t.name}`} onClick={() => setEditing({ t: structuredClone(t), title: `Edit ${t.name}` })}>
                  Edit
                </button>
                <button
                  type="button"
                  aria-label={`Duplicate: ${t.name}`}
                  onClick={() => {
                    const { version: _, basedOn: __, ...rest } = structuredClone(t);
                    const copy = { ...rest, id: randomId("c-"), name: `${t.name} (copy)` };
                    save(copy);
                    announce(`Created ${copy.name}`);
                  }}
                >
                  Duplicate
                </button>
                {b && custom && (
                  <button
                    type="button"
                    aria-label={`Reset: ${t.name}`}
                    onClick={async () => {
                      const res = await dialogs.confirm({ title: `Reset ${t.name}?`, body: "Your customised version is deleted and the current built-in is shown.", confirm: "Reset", danger: true });
                      if (res.choice === "confirm") {
                        remove(t.id);
                        announce(`${b.name} reset`);
                      }
                    }}
                  >
                    Reset
                  </button>
                )}
                {!b && (
                  <button
                    type="button"
                    aria-label={`Delete: ${t.name}`}
                    onClick={async () => {
                      const res = await dialogs.confirm({
                        title: `Delete ${t.name}?`,
                        body: "Its draft is deleted too. History entries are kept.",
                        confirm: "Delete",
                        danger: true,
                      });
                      if (res.choice !== "confirm") return;
                      remove(t.id);
                      updateRecord<Record<string, Draft>>(store, KEYS.drafts, {}, (all) => omit(all, t.id));
                      announce(`${t.name} deleted`);
                      focusLater("tpl-new");
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <button type="button" id="tpl-new" onClick={() => setEditing({ t: blankTemplate(), title: "New template" })}>
        New template
      </button>
    </section>
  );
}

function Modes() {
  const { store, dialogs, announce, setLeaveGuard } = useApp();
  const r = repo(store);
  const stored = r.modes();
  const modes = effectiveModes(stored);
  const [editing, setEditing] = useState<ReplyMode | null>(null);
  const [orig, setOrig] = useState<ReplyMode | null>(null);
  const dirty = !!editing && JSON.stringify(editing) !== JSON.stringify(orig);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const confirmLeave = async () =>
    !dirtyRef.current ||
    (await dialogs.confirm({ title: "Discard unsaved changes?", cancel: "Keep editing", confirm: "Discard", danger: true })).choice === "confirm";
  useEffect(() => {
    if (!editing) return;
    setLeaveGuard(confirmLeave);
    return () => setLeaveGuard(null);
  }, [!!editing]);

  const write = (fn: (all: Record<string, ReplyMode>) => Record<string, ReplyMode>) =>
    updateRecord<Record<string, ReplyMode>>(store, KEYS.modes, {}, fn);
  const errs = editing ? [!editing.label.trim() && "The label must not be empty.", !editing.instruction.trim() && "The instruction must not be empty."].filter(Boolean) : [];
  const open = (m: ReplyMode) => {
    setEditing(m);
    setOrig(m);
    focusLater("mode-label");
  };

  return (
    <section aria-labelledby="modes-heading">
      <h3 id="modes-heading">Reply modes</h3>
      <ul class="list">
        <li class="list-row">
          <p>
            <strong>{STANDARD_MODE.label}</strong> <span class="tag">Fixed</span> Adds nothing to the prompt. Always offered first.
          </p>
        </li>
        {modes.map((m) => {
          const b = builtinMode(m.id);
          const custom = !!stored[m.id];
          return (
            <li key={m.id} class="list-row">
              <p>
                <strong>{m.label}</strong> <span class="tag">{b ? (custom ? "Built-in, customised" : "Built-in") : "Custom"}</span>
              </p>
              {b && hasUpdate(stored[m.id], b) && (
                <Notice>
                  The built-in version of this reply mode was updated after you customised it.{" "}
                  <button type="button" onClick={() => write((all) => omit(all, m.id))}>
                    Reset
                  </button>{" "}
                  <button type="button" onClick={() => write((all) => ({ ...all, [m.id]: { ...m, basedOn: { id: b.id, version: b.version! } } }))}>
                    Keep mine
                  </button>
                </Notice>
              )}
              <div class="item-actions">
                <button type="button" id={`mode-edit-${m.id}`} aria-label={`Edit: ${m.label}`} onClick={() => open({ ...m })}>
                  Edit
                </button>
                {b && custom && (
                  <button type="button" aria-label={`Reset: ${m.label}`} onClick={() => write((all) => omit(all, m.id))}>
                    Reset
                  </button>
                )}
                {!b && (
                  <button
                    type="button"
                    aria-label={`Delete: ${m.label}`}
                    onClick={async () => {
                      const users = templatesListingMode(effectiveTemplates(r.templates()), m.id);
                      const res = await dialogs.confirm({
                        title: `Delete the reply mode ${m.label}?`,
                        body: users.length
                          ? `These templates list it and will no longer offer it: ${users.map((t) => t.name).join(", ")}.`
                          : "No template lists it by id.",
                        confirm: "Delete",
                        danger: true,
                      });
                      if (res.choice !== "confirm") return;
                      write((all) => omit(all, m.id));
                      announce(`${m.label} deleted`);
                      focusLater("mode-new");
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {editing ? (
        <div class="editor">
          <div class="field">
            <label for="mode-label">Label</label>
            <input id="mode-label" type="text" value={editing.label} onInput={(e) => setEditing({ ...editing, label: e.currentTarget.value })} />
          </div>
          <div class="field">
            <label for="mode-instruction">Instruction (required)</label>
            <textarea
              id="mode-instruction"
              rows={8}
              value={editing.instruction}
              onInput={(e) => setEditing({ ...editing, instruction: e.currentTarget.value })}
            />
          </div>
          {errs.length > 0 && (
            <ul class="lint" role="alert">
              {errs.map((e) => (
                <li key={e as string}>{e}</li>
              ))}
            </ul>
          )}
          <div class="actions">
            <button
              type="button"
              class="primary"
              disabled={errs.length > 0}
              onClick={() => {
                const b = builtinMode(editing.id);
                const { version: _, ...rest } = editing;
                write((all) => ({ ...all, [editing.id]: b ? { ...rest, basedOn: { id: b.id, version: b.version! } } : rest }));
                setOrig(editing);
                announce(`${editing.label} saved`);
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!(await confirmLeave())) return;
                const id = editing.id;
                setEditing(null);
                focusLater(`mode-edit-${id}`, "mode-new");
              }}
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <button type="button" id="mode-new" onClick={() => open({ id: randomId("m-"), label: "", instruction: "" })}>
          New reply mode
        </button>
      )}
    </section>
  );
}

function WrapperSettings() {
  const { store, announce } = useApp();
  const stored = repo(store).wrapper();
  const current = stored?.text ?? BUILTIN_WRAPPER.text;
  const [text, setText] = useState(current);
  useEffect(() => setText(current), [current]);
  const errs = lintWrapper(text);
  return (
    <section aria-labelledby="wrapper-heading">
      <h3 id="wrapper-heading">Review wrapper</h3>
      {hasUpdate(stored ? { id: "wrapper", basedOn: stored.basedOn } : null, BUILTIN_WRAPPER) && (
        <Notice>
          The built-in review wrapper was updated after you customised it.{" "}
          <button type="button" onClick={() => store.remove(KEYS.wrapper)}>
            Reset
          </button>{" "}
          <button type="button" onClick={() => store.setJson(KEYS.wrapper, { text: current, basedOn: { id: "wrapper", version: BUILTIN_WRAPPER.version } })}>
            Keep mine
          </button>
        </Notice>
      )}
      <div class="field">
        <label for="wrapper-text">Wrapper text. {"{{prompt}}"} on its own line marks where the prompt goes.</label>
        <textarea id="wrapper-text" class="output" rows={14} value={text} onInput={(e) => setText(e.currentTarget.value)} aria-describedby="wrapper-lint" />
      </div>
      <div id="wrapper-lint" role="alert">
        {errs.length > 0 && (
          <ul class="lint">
            {errs.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>
      <div class="actions">
        <button
          type="button"
          class="primary"
          disabled={errs.length > 0 || text === current}
          onClick={() => {
            store.setJson(KEYS.wrapper, { text, basedOn: { id: "wrapper", version: BUILTIN_WRAPPER.version } });
            announce("Review wrapper saved");
          }}
        >
          Save
        </button>
        <button
          type="button"
          disabled={!stored}
          onClick={() => {
            store.remove(KEYS.wrapper);
            setText(BUILTIN_WRAPPER.text);
            announce("Review wrapper reset");
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}

function Providers() {
  const { store, announce } = useApp();
  const settings = repo(store).settings();
  return (
    <section aria-labelledby="providers-heading">
      <h3 id="providers-heading">Chatbot links</h3>
      {providerList(store).map((p) => (
        <ProviderEditor key={p.id} p={p} />
      ))}
      <h4>Confirmations</h4>
      {BUILTIN_PROVIDERS.map((p) =>
        settings.confirmedProviders.includes(p.id) ? (
          <p key={p.id}>
            {p.label}: not asked again.{" "}
            <button
              type="button"
              onClick={() => {
                setSettings(store, { confirmedProviders: settings.confirmedProviders.filter((x) => x !== p.id) });
                announce(`${p.label} will ask again`);
              }}
            >
              Ask again for {p.label}
            </button>
          </p>
        ) : (
          <p key={p.id}>{p.label}: asks before sending.</p>
        ),
      )}
    </section>
  );
}

function ProviderEditor({ p }: { p: Provider }) {
  const { store, announce } = useApp();
  const builtin = BUILTIN_PROVIDERS.find((b) => b.id === p.id)!;
  const [v, setV] = useState({ label: p.label, link: p.link, home: p.home });
  const errs = lintProvider(v);
  const overridden = !!repo(store).providers()[p.id];
  const changed = v.label !== p.label || v.link !== p.link || v.home !== p.home;
  const id = `prov-${p.id}`;
  return (
    <fieldset>
      <legend>{builtin.label}</legend>
      {(
        [
          ["label", "Label"],
          ["link", "Link template ({prompt} marks the prompt; empty: copy and open the home URL)"],
          ["home", "Home URL"],
        ] as const
      ).map(([k, l]) => (
        <div class="field" key={k}>
          <label for={`${id}-${k}`}>{l}</label>
          <input id={`${id}-${k}`} type="text" value={v[k]} onInput={(e) => setV({ ...v, [k]: e.currentTarget.value })} aria-describedby={`${id}-lint`} />
        </div>
      ))}
      <div id={`${id}-lint`} role="alert">
        {errs.length > 0 && (
          <ul class="lint">
            {errs.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>
      <div class="actions">
        <button
          type="button"
          class="primary"
          disabled={errs.length > 0 || !changed}
          onClick={() => {
            updateRecord<Record<string, Partial<Provider>>>(store, KEYS.providers, {}, (all) => ({ ...all, [p.id]: v }));
            announce(`${v.label} link saved`);
          }}
        >
          Save
        </button>
        <button
          type="button"
          disabled={!overridden}
          onClick={() => {
            updateRecord<Record<string, Partial<Provider>>>(store, KEYS.providers, {}, (all) => omit(all, p.id));
            setV({ label: builtin.label, link: builtin.link, home: builtin.home });
            announce(`${builtin.label} link reset`);
          }}
        >
          Reset
        </button>
      </div>
    </fieldset>
  );
}

function Appearance() {
  const { store } = useApp();
  const theme = repo(store).settings().theme;
  return (
    <section aria-labelledby="appearance-heading">
      <h3 id="appearance-heading">Appearance</h3>
      <fieldset>
        <legend>Theme</legend>
        {(
          [
            ["system", "System"],
            ["light", "Light"],
            ["dark", "Dark"],
          ] as const
        ).map(([v, l]) => (
          <label class="radio" key={v}>
            <input type="radio" name="theme" checked={theme === v} onChange={() => setSettings(store, { theme: v })} /> {l}
          </label>
        ))}
      </fieldset>
    </section>
  );
}

function Data() {
  const { store, dialogs, announce } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const knownModes = effectiveModes(repo(store).modes()).map((m) => m.id);

  const doExport = () => {
    const now = new Date();
    const blob = new Blob([JSON.stringify(exportData(store, now), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFileName(now);
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce("Export downloaded");
  };

  const doImport = async (file: File) => {
    setProblems([]);
    let data: unknown;
    try {
      data = JSON.parse(await file.text());
    } catch {
      setProblems(["The file is not valid JSON."]);
      return;
    }
    const p = validateExport(data, knownModes);
    if (p.length) {
      setProblems(p);
      return;
    }
    const f = data as ExportFile;
    const how = await dialogs.confirm({
      title: "Import data",
      body: `The file holds ${Object.keys(f.templates).length} templates, ${Object.keys(f.modes).length} reply modes, ${Object.keys(f.drafts).length} drafts and ${f.history.length} history entries.`,
      extra: [{ label: "Merge", value: "merge" }],
      confirm: "Replace all",
      danger: true,
    });
    if (how.choice === "cancel") return;
    let ok: boolean;
    if (how.choice === "merge") {
      const clash = importConflicts(store, f);
      let overwrite = false;
      if (clash.length) {
        const r = await dialogs.confirm({
          title: "Overwrite matching items?",
          body: `${clash.length} items in the file have the same id as yours: ${clash.join(", ")}.`,
          cancel: "Keep mine",
          confirm: "Overwrite",
          danger: true,
        });
        overwrite = r.choice === "confirm";
      }
      ok = importData(store, f, "merge", overwrite);
    } else {
      const r = await dialogs.confirm({ title: "Replace all current data with this file? This cannot be undone.", confirm: "Replace all", danger: true });
      if (r.choice !== "confirm") return;
      ok = importData(store, f, "replace");
    }
    if (ok) announce("Import complete");
    else setProblems([store.writable ? MSG.importFull : "Import is not available while storage is read-only or unavailable."]);
  };

  const copies = store.corruptCopies();
  return (
    <section aria-labelledby="data-heading">
      <h3 id="data-heading">Data</h3>
      <StorageMeter />
      <p class="hint">
        Everything is kept in this browser only. Clearing site data deletes it, and moving or renaming this file can hide it
        in some browsers: export first.
      </p>
      <div class="actions">
        <button type="button" class="primary" onClick={doExport}>
          Export all
        </button>
        <label class="button" for="import-file">
          Import…
        </label>
        <input
          id="import-file"
          ref={fileRef}
          class="sr-only"
          type="file"
          accept="application/json,.json"
          onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            e.currentTarget.value = "";
            if (f) doImport(f);
          }}
        />
      </div>
      {problems.length > 0 && (
        <div role="alert" class="lint">
          <p>The file was not imported:</p>
          <ul>
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      <h4>Copies of unreadable data</h4>
      {copies.length === 0 ? (
        <p>None.</p>
      ) : (
        <ul class="list">
          {copies.map((c) => (
            <li key={c.key} class="list-row">
              <p>
                <code>{c.key}</code>
              </p>
              <div class="item-actions">
                <button
                  type="button"
                  aria-label={`View: ${c.key}`}
                  onClick={() =>
                    dialogs.show(c.key, (close) => (
                      <>
                        <label for="corrupt-view">Raw value</label>
                        <textarea id="corrupt-view" class="output" rows={12} readOnly value={c.value} />
                        <div class="actions">
                          <button type="button" data-initial onClick={close}>
                            Close
                          </button>
                        </div>
                      </>
                    ))
                  }
                >
                  View
                </button>
                <button
                  type="button"
                  aria-label={`Delete: ${c.key}`}
                  onClick={async () => {
                    const r = await dialogs.confirm({ title: "Delete this copy?", confirm: "Delete", danger: true });
                    if (r.choice === "confirm") store.remove(c.key);
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
