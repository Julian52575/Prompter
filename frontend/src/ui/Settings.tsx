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
import { browserLanguage, DICTS, LANGUAGES, localizeMode, localizeTemplate } from "./i18n";

const setSettings = (s: Store, p: Partial<SettingsT>) =>
  updateRecord<Partial<SettingsT>>(s, KEYS.settings, {}, (x) => ({ ...x, ...p }));

export function Settings() {
  useStoreVersion();
  const { t } = useApp();
  return (
    <section aria-labelledby="settings-heading" class="settings">
      <h2 id="settings-heading">{t.settings.heading}</h2>
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
  const { store, dialogs, announce, t } = useApp();
  const r = repo(store);
  const stored = r.templates();
  const templates = effectiveTemplates(stored);
  const modes = effectiveModes(r.modes());
  const app = useApp();
  const [editing, setEditing] = useState<{ t: Template; title: string } | null>(() => {
    if (!app.openNewTemplate.current) return null;
    app.openNewTemplate.current = false;
    focusLater("tpl-name");
    return { t: blankTemplate(), title: app.t.settings.newTemplate };
  });

  const save = (tpl: Template) => {
    const b = builtinTemplate(tpl.id);
    const { version: _, basedOn: __, ...rest } = tpl;
    const rec: Template = b ? { ...rest, basedOn: { id: b.id, version: b.version! } } : rest;
    updateRecord<Record<string, Template>>(store, KEYS.templates, {}, (all) => ({ ...all, [tpl.id]: rec }));
    announce(t.settings.saved(localizeTemplate(t, tpl).name));
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
      <h3 id="templates-heading">{t.settings.templates}</h3>
      <ul class="list">
        {templates.map((tpl) => {
          const b = builtinTemplate(tpl.id);
          const custom = !!stored[tpl.id];
          return (
            <li key={tpl.id} class="list-row">
              <p>
                <strong>{localizeTemplate(t, tpl).name}</strong>{" "}
                <span class="tag">{b ? (custom ? t.common.builtinCustomised : t.common.builtin) : t.common.custom}</span>
              </p>
              {b && hasUpdate(stored[tpl.id], b) && (
                <Notice>
                  {t.builder.updatedBuiltin}{" "}
                  <button type="button" onClick={() => remove(tpl.id)}>
                    {t.common.reset}
                  </button>{" "}
                  <button type="button" onClick={() => save({ ...stored[tpl.id], basedOn: undefined })}>
                    {t.common.keepMine}
                  </button>
                </Notice>
              )}
              <div class="item-actions">
                <button type="button" id={`tpl-edit-${tpl.id}`} aria-label={t.common.named(t.common.edit, localizeTemplate(t, tpl).name)} onClick={() => setEditing({ t: structuredClone(tpl), title: t.settings.editTitle(localizeTemplate(t, tpl).name) })}>
                  {t.common.edit}
                </button>
                <button
                  type="button"
                  aria-label={t.common.named(t.common.duplicate, localizeTemplate(t, tpl).name)}
                  onClick={() => {
                    const { version: _, basedOn: __, ...rest } = structuredClone(tpl);
                    const copy = { ...rest, id: randomId("c-"), name: t.settings.copyName(localizeTemplate(t, tpl).name) };
                    save(copy);
                    announce(t.settings.created(copy.name));
                  }}
                >
                  {t.common.duplicate}
                </button>
                {b && custom && (
                  <button
                    type="button"
                    aria-label={t.common.named(t.common.reset, localizeTemplate(t, tpl).name)}
                    onClick={async () => {
                      const res = await dialogs.confirm({ title: t.common.resetTitle(localizeTemplate(t, tpl).name), body: t.common.resetBody, confirm: t.common.reset, danger: true });
                      if (res.choice === "confirm") {
                        remove(tpl.id);
                        announce(t.settings.resetDone(localizeTemplate(t, b).name));
                      }
                    }}
                  >
                    {t.common.reset}
                  </button>
                )}
                {!b && (
                  <button
                    type="button"
                    aria-label={t.common.named(t.common.delete, tpl.name)}
                    onClick={async () => {
                      const res = await dialogs.confirm({
                        title: t.settings.deleteTitle(tpl.name),
                        body: t.settings.deleteTemplateBody,
                        confirm: t.common.delete,
                        danger: true,
                      });
                      if (res.choice !== "confirm") return;
                      remove(tpl.id);
                      updateRecord<Record<string, Draft>>(store, KEYS.drafts, {}, (all) => omit(all, tpl.id));
                      announce(t.settings.deletedName(tpl.name));
                      focusLater("tpl-new");
                    }}
                  >
                    {t.common.delete}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <button type="button" id="tpl-new" onClick={() => setEditing({ t: blankTemplate(), title: t.settings.newTemplate })}>
        {t.settings.newTemplate}
      </button>
    </section>
  );
}

function Modes() {
  const { store, dialogs, announce, setLeaveGuard, t } = useApp();
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
    (await dialogs.confirm({ title: t.common.discardTitle, cancel: t.common.keepEditing, confirm: t.common.discard, danger: true })).choice === "confirm";
  useEffect(() => {
    if (!editing) return;
    setLeaveGuard(confirmLeave);
    return () => setLeaveGuard(null);
  }, [!!editing]);

  const write = (fn: (all: Record<string, ReplyMode>) => Record<string, ReplyMode>) =>
    updateRecord<Record<string, ReplyMode>>(store, KEYS.modes, {}, fn);
  const errs = editing ? [!editing.label.trim() && t.settings.modeLabelEmpty, !editing.instruction.trim() && t.settings.modeInstructionEmpty].filter(Boolean) : [];
  const open = (m: ReplyMode) => {
    setEditing(m);
    setOrig(m);
    focusLater("mode-label");
  };

  return (
    <section aria-labelledby="modes-heading">
      <h3 id="modes-heading">{t.settings.modes}</h3>
      <ul class="list">
        <li class="list-row">
          <p>
            <strong>{localizeMode(t, STANDARD_MODE).label}</strong> <span class="tag">{t.settings.fixed}</span> {t.settings.standardInfo}
          </p>
        </li>
        {modes.map((raw) => {
          const m = localizeMode(t, raw);
          const b = builtinMode(m.id);
          const custom = !!stored[m.id];
          return (
            <li key={m.id} class="list-row">
              <p>
                <strong>{m.label}</strong>{" "}
                <span class="tag">{b ? (custom ? t.common.builtinCustomised : t.common.builtin) : t.common.custom}</span>
              </p>
              {b && hasUpdate(stored[m.id], b) && (
                <Notice>
                  {t.settings.modeUpdated}{" "}
                  <button type="button" onClick={() => write((all) => omit(all, m.id))}>
                    {t.common.reset}
                  </button>{" "}
                  <button type="button" onClick={() => write((all) => ({ ...all, [m.id]: { ...raw, basedOn: { id: b.id, version: b.version! } } }))}>
                    {t.common.keepMine}
                  </button>
                </Notice>
              )}
              <div class="item-actions">
                <button type="button" id={`mode-edit-${m.id}`} aria-label={t.common.named(t.common.edit, m.label)} onClick={() => open({ ...raw })}>
                  {t.common.edit}
                </button>
                {b && custom && (
                  <button type="button" aria-label={t.common.named(t.common.reset, m.label)} onClick={() => write((all) => omit(all, m.id))}>
                    {t.common.reset}
                  </button>
                )}
                {!b && (
                  <button
                    type="button"
                    aria-label={t.common.named(t.common.delete, m.label)}
                    onClick={async () => {
                      const users = templatesListingMode(effectiveTemplates(r.templates()), m.id);
                      const res = await dialogs.confirm({
                        title: t.settings.deleteModeTitle(m.label),
                        body: users.length
                          ? t.settings.deleteModeUsed(users.map((x) => localizeTemplate(t, x).name).join(", "))
                          : t.settings.deleteModeUnused,
                        confirm: t.common.delete,
                        danger: true,
                      });
                      if (res.choice !== "confirm") return;
                      write((all) => omit(all, m.id));
                      announce(t.settings.deletedName(m.label));
                      focusLater("mode-new");
                    }}
                  >
                    {t.common.delete}
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
            <label for="mode-label">{t.settings.modeLabel}</label>
            <input id="mode-label" type="text" value={editing.label} onInput={(e) => setEditing({ ...editing, label: e.currentTarget.value })} />
          </div>
          <div class="field">
            <label for="mode-instruction">{t.settings.modeInstruction}</label>
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
                announce(t.settings.saved(editing.label));
              }}
            >
              {t.common.save}
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
              {t.common.close}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" id="mode-new" onClick={() => open({ id: randomId("m-"), label: "", instruction: "" })}>
          {t.settings.newMode}
        </button>
      )}
    </section>
  );
}

function WrapperSettings() {
  const { store, announce, t } = useApp();
  const stored = repo(store).wrapper();
  const current = stored?.text ?? BUILTIN_WRAPPER.text;
  const [text, setText] = useState(current);
  useEffect(() => setText(current), [current]);
  const errs = lintWrapper(text);
  return (
    <section aria-labelledby="wrapper-heading">
      <h3 id="wrapper-heading">{t.settings.wrapper}</h3>
      {hasUpdate(stored ? { id: "wrapper", basedOn: stored.basedOn } : null, BUILTIN_WRAPPER) && (
        <Notice>
          {t.settings.wrapperUpdated}{" "}
          <button type="button" onClick={() => store.remove(KEYS.wrapper)}>
            {t.common.reset}
          </button>{" "}
          <button type="button" onClick={() => store.setJson(KEYS.wrapper, { text: current, basedOn: { id: "wrapper", version: BUILTIN_WRAPPER.version } })}>
            {t.common.keepMine}
          </button>
        </Notice>
      )}
      <div class="field">
        <label for="wrapper-text">{t.settings.wrapperLabel}</label>
        <textarea id="wrapper-text" class="output" rows={14} value={text} onInput={(e) => setText(e.currentTarget.value)} aria-describedby="wrapper-lint" />
      </div>
      <div id="wrapper-lint" role="alert">
        {errs.length > 0 && (
          <ul class="lint">
            {errs.map((e) => (
              <li key={e}>{t.settings.wrapperIssue(e)}</li>
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
            announce(t.settings.wrapperSaved);
          }}
        >
          {t.common.save}
        </button>
        <button
          type="button"
          disabled={!stored}
          onClick={() => {
            store.remove(KEYS.wrapper);
            setText(BUILTIN_WRAPPER.text);
            announce(t.settings.wrapperReset);
          }}
        >
          {t.common.reset}
        </button>
      </div>
    </section>
  );
}

function Providers() {
  const { store, announce, t } = useApp();
  const settings = repo(store).settings();
  return (
    <section aria-labelledby="providers-heading">
      <h3 id="providers-heading">{t.settings.providers}</h3>
      {providerList(store).map((p) => (
        <ProviderEditor key={p.id} p={p} />
      ))}
      <h4>{t.settings.confirmations}</h4>
      {BUILTIN_PROVIDERS.map((p) =>
        settings.confirmedProviders.includes(p.id) ? (
          <p key={p.id}>
            {t.settings.notAsked(p.label)}{" "}
            <button
              type="button"
              onClick={() => {
                setSettings(store, { confirmedProviders: settings.confirmedProviders.filter((x) => x !== p.id) });
                announce(t.settings.willAsk(p.label));
              }}
            >
              {t.settings.askAgain(p.label)}
            </button>
          </p>
        ) : (
          <p key={p.id}>{t.settings.asks(p.label)}</p>
        ),
      )}
    </section>
  );
}

function ProviderEditor({ p }: { p: Provider }) {
  const { store, announce, t } = useApp();
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
          ["label", t.settings.providerLabel],
          ["link", t.settings.providerLink],
          ["home", t.settings.providerHome],
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
              <li key={e}>{t.settings.providerIssue(e)}</li>
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
            announce(t.settings.providerSaved(v.label));
          }}
        >
          {t.common.save}
        </button>
        <button
          type="button"
          disabled={!overridden}
          onClick={() => {
            updateRecord<Record<string, Partial<Provider>>>(store, KEYS.providers, {}, (all) => omit(all, p.id));
            setV({ label: builtin.label, link: builtin.link, home: builtin.home });
            announce(t.settings.providerReset(builtin.label));
          }}
        >
          {t.common.reset}
        </button>
      </div>
    </fieldset>
  );
}

function Appearance() {
  const { store, t } = useApp();
  const { theme, language } = repo(store).settings();
  return (
    <section aria-labelledby="appearance-heading">
      <h3 id="appearance-heading">{t.settings.appearance}</h3>
      <fieldset>
        <legend>{t.settings.theme}</legend>
        {(["system", "light", "dark", "platformer", "dragon", "adventure"] as const).map((v) => (
          <label class="radio" key={v}>
            <input type="radio" name="theme" checked={theme === v} onChange={() => setSettings(store, { theme: v })} /> {t.settings.themes[v]}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>{t.settings.language}</legend>
        <label class="radio">
          <input type="radio" name="language" checked={language === null} onChange={() => setSettings(store, { language: null })} />{" "}
          {t.settings.browserDefault(DICTS[browserLanguage()].languageName)}
        </label>
        {LANGUAGES.map((l) => (
          <label class="radio" key={l}>
            <input type="radio" name="language" checked={language === l} onChange={() => setSettings(store, { language: l })} />{" "}
            {/* Each language is named in itself, so it can be found from any UI language. */}
            <span lang={l}>{DICTS[l].languageName}</span>
          </label>
        ))}
      </fieldset>
    </section>
  );
}

function Data() {
  const { store, dialogs, announce, t } = useApp();
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
    announce(t.settings.exported);
  };

  const doImport = async (file: File) => {
    setProblems([]);
    let data: unknown;
    try {
      data = JSON.parse(await file.text());
    } catch {
      setProblems([t.settings.notJson]);
      return;
    }
    const p = validateExport(data, knownModes);
    if (p.length) {
      setProblems(p);
      return;
    }
    const f = data as ExportFile;
    const how = await dialogs.confirm({
      title: t.settings.importTitle,
      body: t.settings.importBody(Object.keys(f.templates).length, Object.keys(f.modes).length, Object.keys(f.drafts).length, f.history.length),
      extra: [{ label: t.settings.merge, value: "merge" }],
      confirm: t.settings.replaceAll,
      danger: true,
    });
    if (how.choice === "cancel") return;
    let ok: boolean;
    if (how.choice === "merge") {
      const clash = importConflicts(store, f);
      let overwrite = false;
      if (clash.length) {
        const r = await dialogs.confirm({
          title: t.settings.overwriteTitle,
          body: t.settings.overwriteBody(clash.length, clash.join(", ")),
          cancel: t.common.keepMine,
          confirm: t.settings.overwrite,
          danger: true,
        });
        overwrite = r.choice === "confirm";
      }
      ok = importData(store, f, "merge", overwrite);
    } else {
      const r = await dialogs.confirm({ title: t.settings.replaceAllTitle, confirm: t.settings.replaceAll, danger: true });
      if (r.choice !== "confirm") return;
      ok = importData(store, f, "replace");
    }
    if (ok) announce(t.settings.imported);
    else setProblems([store.writable ? t.settings.importFull : t.settings.importUnavailable]);
  };

  const copies = store.corruptCopies();
  return (
    <section aria-labelledby="data-heading">
      <h3 id="data-heading">{t.settings.data}</h3>
      <StorageMeter />
      <p class="hint">{t.settings.dataHint}</p>
      <div class="actions">
        <button type="button" class="primary" onClick={doExport}>
          {t.settings.exportAll}
        </button>
        <label class="button" for="import-file">
          {t.settings.import}
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
          <p>{t.settings.notImported}</p>
          <ul>
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      <h4>{t.settings.corrupt}</h4>
      {copies.length === 0 ? (
        <p>{t.settings.none}</p>
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
                  aria-label={t.common.named(t.settings.view, c.key)}
                  onClick={() =>
                    dialogs.show(c.key, (close) => (
                      <>
                        <label for="corrupt-view">{t.settings.rawValue}</label>
                        <textarea id="corrupt-view" class="output" rows={12} readOnly value={c.value} />
                        <div class="actions">
                          <button type="button" data-initial onClick={close}>
                            {t.common.close}
                          </button>
                        </div>
                      </>
                    ))
                  }
                >
                  {t.settings.view}
                </button>
                <button
                  type="button"
                  aria-label={t.common.named(t.common.delete, c.key)}
                  onClick={async () => {
                    const r = await dialogs.confirm({ title: t.settings.deleteCopyTitle, confirm: t.common.delete, danger: true });
                    if (r.choice === "confirm") store.remove(c.key);
                  }}
                >
                  {t.common.delete}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
