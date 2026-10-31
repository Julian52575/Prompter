import { useEffect, useRef, useState } from "preact/hooks";
import { BUILTIN_PROVIDERS, STANDARD_MODE } from "../core/builtins";
import {
  builtinTemplate,
  omit,
  effectiveModes,
  effectiveTemplates,
  effectiveWrapper,
  hasUpdate,
  matchValues,
  newDraft,
  offeredModes,
  randomId,
} from "../core/catalog";
import { render, summarize } from "../core/render";
import { addHistoryEntry, KEYS, providerList, repo, saveHistoryEntry, updateRecord } from "../core/storage";
import type { Draft, OutputType, Provider, Scope, Settings, Template } from "../core/types";
import { domId, type InputError, validateInputs } from "../core/validate";
import { buildLink, wrapPrompt } from "../core/wrap";
import { copyText } from "./clipboard";
import { focusLater, focusNow, useApp, useStoreVersion } from "./context";
import { Form } from "./Form";
import { localizeMode, localizeTemplate } from "./i18n";
import { Notice } from "./Notice";

const DEBOUNCE = 500;
/** Row and item keys are random, so they are left out when comparing values. */
const noKeys = (k: string, v: unknown) => (k === "k" ? undefined : v);
/** One-off notices, as codes so they follow the UI language. */
export type BuilderNotice = "missingMode" | "inputsDropped";

export function Builder() {
  const app = useApp();
  const { store, dialogs, announce, t, lang } = app;
  useStoreVersion();
  const r = repo(store);
  const templates = effectiveTemplates(r.templates());
  const settings = r.settings();
  const [tid, setTid] = useState(() =>
    templates.some((x) => x.id === settings.lastTemplate) ? settings.lastTemplate! : templates[0].id,
  );
  const template = templates.find((x) => x.id === tid) ?? templates[0];
  // The form shows `view` (translated labels); the prompt is rendered from `template`.
  const view = localizeTemplate(t, template);
  const offered = offeredModes(template, effectiveModes(r.modes()));
  const wrapper = effectiveWrapper(r.wrapper());
  const providers = providerList(store);

  const [notices, setNotices] = useState<BuilderNotice[]>(() => {
    const n = app.builderNotice.current as BuilderNotice | null;
    app.builderNotice.current = null;
    return n ? [n] : [];
  });
  const addNotice = (n: BuilderNotice) => setNotices((ns) => (ns.includes(n) ? ns : [...ns, n]));

  const loadDraft = (tpl: Template): Draft => {
    const stored = repo(store).drafts()[tpl.id];
    // Fresh values come from the translated template, so default block names follow the UI language.
    const fresh = newDraft(localizeTemplate(t, tpl));
    const d: Draft = stored ? { ...fresh, ...stored, values: matchValues(tpl.fields, stored.values ?? {}).values } : fresh;
    const modes = offeredModes(tpl, effectiveModes(repo(store).modes()));
    if (modes.length && !modes.some((m) => m.id === d.mode)) {
      if (d.mode !== STANDARD_MODE.id) setTimeout(() => addNotice("missingMode"), 0);
      d.mode = STANDARD_MODE.id;
    }
    return d;
  };

  const [draft, setDraftState] = useState<Draft>(() => loadDraft(template));
  const draftRef = useRef(draft);
  const tidRef = useRef(template.id);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const entryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<InputError[]>([]);
  const outRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLTextAreaElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const held = useRef(false);
  const saveDraft = () => {
    if (held.current || saveTimer.current === undefined) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = undefined;
    const d = { ...draftRef.current, updatedAt: Date.now() };
    updateRecord<Record<string, Draft>>(store, KEYS.drafts, {}, (all) => ({ ...all, [tidRef.current]: d }));
    if (store.writable) setStatus(t.builder.draftSaved);
  };

  const setDraft = (d: Draft) => {
    draftRef.current = d;
    setDraftState(d);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveDraft, DEBOUNCE);
  };
  const patch = (p: Partial<Draft>) => setDraft({ ...draftRef.current, ...p });

  useEffect(() => {
    const flush = () => saveDraft();
    addEventListener("pagehide", flush);
    const unDirty = app.registerDirty({
      key: KEYS.drafts,
      isDirty: () => saveTimer.current !== undefined,
      hold: (on) => {
        held.current = on;
        if (!on && saveTimer.current !== undefined) {
          clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(saveDraft, DEBOUNCE);
        }
      },
      reload: () => {
        clearTimeout(saveTimer.current);
        saveTimer.current = undefined;
        const d = loadDraft(templateById(tidRef.current));
        draftRef.current = d;
        setDraftState(d);
      },
    });
    const unsub = store.subscribe((key, external) => {
      if (external && (key === KEYS.drafts || key === null) && saveTimer.current === undefined) {
        const d = loadDraft(templateById(tidRef.current));
        draftRef.current = d;
        setDraftState(d);
      }
    });
    return () => {
      removeEventListener("pagehide", flush);
      flush();
      unDirty();
      unsub();
    };
  }, []);

  const templateById = (id: string) => {
    const all = effectiveTemplates(repo(store).templates());
    return all.find((t) => t.id === id) ?? all[0];
  };

  const updateSettings = (p: Partial<Settings>) =>
    updateRecord<Partial<Settings>>(store, KEYS.settings, {}, (s) => ({ ...s, ...p }));

  const switchTemplate = (id: string) => {
    saveDraft();
    const next = templateById(id);
    tidRef.current = next.id;
    setTid(next.id);
    const d = loadDraft(next);
    draftRef.current = d;
    setDraftState(d);
    setErrors([]);
    setNotices([]);
    updateSettings({ lastTemplate: next.id });
  };

  const builtin = builtinTemplate(template.id);
  const showUpdate = builtin && hasUpdate(r.templates()[template.id], builtin);

  const generate = async () => {
    const d = draftRef.current;
    const errs = validateInputs(view, d.values, d.scope, t.inputs);
    setErrors(errs);
    if (errs.length) {
      focusLater("error-summary");
      return;
    }
    if (d.output !== d.baseline) {
      const res = await dialogs.confirm({
        title: t.builder.replaceEditsTitle,
        body: t.builder.replaceEditsBody,
        cancel: t.common.keepEditing,
        confirm: t.common.replace,
        danger: true,
      });
      if (res.choice !== "confirm") return;
    }
    const mode = offered.find((m) => m.id === d.mode) ?? null;
    const text = render({ template, inputs: d.values, mode, scope: d.scope, language: lang });
    const rr = repo(store);
    const lastRow = rr.historyIndex().find((row) => row.templateId === template.id);
    const last = lastRow && rr.entry(lastRow.id);
    let entryId: string;
    if (last && last.generated === text && !last.edited) {
      entryId = last.id;
      setStatus(t.builder.generatedIdentical);
    } else {
      entryId = randomId();
      const inputs = structuredClone(d.values);
      addHistoryEntry(store, {
        id: entryId,
        createdAt: Date.now(),
        templateId: template.id,
        templateName: template.name,
        inputs,
        mode: mode?.id ?? STANDARD_MODE.id,
        modeLabel: mode?.label ?? STANDARD_MODE.label,
        scope: d.scope,
        generated: text,
        prompt: text,
        edited: false,
        summary: summarize(template, inputs, text),
      });
      setStatus(t.builder.generated);
    }
    patch({ output: text, baseline: text, entryId });
    setTimeout(() => outRef.current?.focus(), 0);
    announce(t.builder.generated);
  };

  const clearForm = async () => {
    const d = draftRef.current;
    const fresh = newDraft(view);
    const unchanged = d.output === "" && JSON.stringify(d.values, noKeys) === JSON.stringify(fresh.values, noKeys);
    if (!unchanged) {
      const res = await dialogs.confirm({
        title: t.builder.clearTitle,
        body: t.builder.clearBody,
        confirm: t.builder.clear,
        danger: true,
      });
      if (res.choice !== "confirm") return;
    }
    clearTimeout(entryTimer.current);
    patch({ ...fresh, outputType: d.outputType });
    setErrors([]);
    setStatus(t.builder.cleared);
    announce(t.builder.cleared);
    const first = template.fields[0];
    if (first) focusLater(domId.field(first.id), `tab-${template.id}`);
  };

  const onOutput = (v: string) => {
    patch({ output: v });
    const id = draftRef.current.entryId;
    if (!id) return;
    clearTimeout(entryTimer.current);
    entryTimer.current = setTimeout(() => {
      const e = repo(store).entry(id);
      if (e) saveHistoryEntry(store, { ...e, prompt: v, edited: v !== e.generated });
    }, DEBOUNCE);
  };

  const finalText = (type: OutputType = draft.outputType) =>
    type === "review" ? wrapPrompt(wrapper.text, draft.output) : draft.output;

  const fallbackField = () => {
    if (draft.outputType === "review" && detailsRef.current) detailsRef.current.open = true;
    return draft.outputType === "review" ? previewRef.current : outRef.current;
  };

  const copy = async () => {
    const res = await copyText(finalText(), fallbackField());
    const msg = res === "copied" ? t.common.copied : t.common.copyManual;
    setStatus(msg);
    announce(msg);
  };

  const openProvider = async (p: Provider) => {
    if (!repo(store).settings().confirmedProviders.includes(p.id)) {
      const res = await dialogs.confirm({
        title: t.builder.sendTitle(p.label),
        body: t.builder.sendBody(hostOf(p), p.company),
        confirm: t.builder.openProvider(p.label),
        checkbox: t.builder.dontAsk(p.label),
      });
      if (res.choice !== "confirm") return;
      if (res.checked)
        updateSettings({ confirmedProviders: [...new Set([...repo(store).settings().confirmedProviders, p.id])] });
    }
    const text = finalText();
    const copying = copyText(text, fallbackField());
    const { url, kind } = buildLink(p, text);
    window.open(url, "_blank", "noopener,noreferrer");
    const copied = (await copying) === "copied";
    const b = t.builder;
    const msg = (
      kind === "link"
        ? copied
          ? b.openedLink
          : b.openedLinkNoCopy
        : kind === "long"
          ? copied
            ? b.tooLong
            : b.tooLongNoCopy
          : copied
            ? b.openedHome
            : b.openedHomeNoCopy
    )(p.label);
    setStatus(msg);
    announce(msg);
  };

  const errorMap = new Map<string, string>();
  for (const e of errors) if (!errorMap.has(e.target)) errorMap.set(e.target, e.message);
  const empty = draft.output === "";
  const scopeField = template.sourceScope?.field;

  return (
    <div class="builder">
      <div class="tabbed">
      <div class="tabs">
        <button
          type="button"
          class="tab-add"
          aria-label={t.builder.newTemplate}
          title={t.builder.newTemplate}
          onClick={() => {
            app.openNewTemplate.current = true;
            app.navigate("settings");
          }}
        >
          +
        </button>
        <div class="tablist" role="tablist" aria-label={t.builder.template}>
        {templates.map((x, i) => (
          <button
            type="button"
            role="tab"
            key={x.id}
            id={`tab-${x.id}`}
            aria-selected={x.id === template.id}
            aria-controls="form-panel"
            tabIndex={x.id === template.id ? 0 : -1}
            onClick={() => x.id !== template.id && switchTemplate(x.id)}
            onKeyDown={(e) => {
              // Automatic activation: arrows, Home and End select the tab they move to.
              const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: templates.length - 1 }[e.key];
              if (to === undefined) return;
              e.preventDefault();
              const next = templates[(to + templates.length) % templates.length];
              switchTemplate(next.id);
              focusLater(`tab-${next.id}`);
            }}
          >
            {localizeTemplate(t, x).name}
          </button>
        ))}
        </div>
        <div class="tab-fill" aria-hidden="true" />
      </div>
      <section class="pane tab-panel" id="form-panel" role="tabpanel" aria-labelledby={`tab-${template.id}`}>
        <h2 id="form-heading">{t.builder.form}</h2>
        {showUpdate && (
          <Notice>
            {t.builder.updatedBuiltin}{" "}
            <span class="inline-actions">
              <button
                type="button"
                onClick={async () => {
                  const res = await dialogs.confirm({
                    title: t.common.resetTitle(view.name),
                    body: t.common.resetBody,
                    confirm: t.common.reset,
                    danger: true,
                  });
                  if (res.choice === "confirm")
                    updateRecord<Record<string, Template>>(store, KEYS.templates, {}, (all) => omit(all, template.id));
                }}
              >
                {t.common.reset}
              </button>
              <button
                type="button"
                onClick={() =>
                  updateRecord<Record<string, Template>>(store, KEYS.templates, {}, (all) => ({
                    ...all,
                    [template.id]: { ...all[template.id], basedOn: { id: builtin.id, version: builtin.version! } },
                  }))
                }
              >
                {t.common.keepMine}
              </button>
            </span>
          </Notice>
        )}
        {notices.map((n) => (
          <Notice key={n} onDismiss={() => setNotices((ns) => ns.filter((x) => x !== n))}>
            {n === "missingMode" ? t.builder.missingMode : t.history.inputsDropped}
          </Notice>
        ))}
        {errors.length > 0 && (
          <div id="error-summary" class="error-summary" tabIndex={-1} role="group" aria-labelledby="error-summary-title">
            <h3 id="error-summary-title">
              {t.builder.problems(errors.length)}
            </h3>
            <ul>
              {errors.map((e) => (
                <li key={e.target + e.message}>
                  <a
                    href={`#${e.target}`}
                    onClick={(ev) => {
                      ev.preventDefault();
                      focusNow(e.target);
                    }}
                  >
                    {e.message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {(() => {
          const modeNode = offered.length > 0 && (
            <fieldset>
              <legend>{t.builder.replyMode}</legend>
              {offered.map((m) => localizeMode(t, m)).map((m) => (
                <label class="radio" key={m.id}>
                  <input type="radio" name="reply-mode" checked={draft.mode === m.id} onChange={() => patch({ mode: m.id })} /> {m.label}
                </label>
              ))}
            </fieldset>
          );
          const scopeNode = scopeField && (
            <fieldset>
              <legend>{t.builder.sourceScope}</legend>
              {(
                [
                  ["open", t.builder.scopeOpen],
                  ["restricted", t.builder.scopeRestricted],
                ] as [Scope, string][]
              ).map(([v, l]) => (
                <label class="radio" key={v}>
                  <input type="radio" name="scope" checked={draft.scope === v} onChange={() => patch({ scope: v })} /> {l}
                </label>
              ))}
            </fieldset>
          );
          const modeAfter = template.fields.some((f) => f.id === template.replyModesAfter) ? template.replyModesAfter! : null;
          return (
            <>
              <Form
                key={template.id}
                fields={view.fields}
                values={draft.values}
                onChange={(values) => patch({ values })}
                errors={errorMap}
                before={scopeField ? { [scopeField]: scopeNode } : undefined}
                after={modeAfter ? { [modeAfter]: modeNode } : undefined}
              />
              {!modeAfter && modeNode}
            </>
          );
        })()}
        <button type="button" id="generate" class="primary big" onClick={generate}>
          {t.builder.generate}
        </button>{" "}
        <button type="button" id="clear-form" onClick={clearForm}>
          {t.builder.clearForm}
        </button>
      </section>
      </div>

      <section class="pane" aria-labelledby="output-heading">
        <h2 id="output-heading">{t.builder.prompt}</h2>
        <div class="field">
          <label for="output">{t.builder.generatedPrompt}</label>
          <textarea
            id="output"
            ref={outRef}
            class="output"
            rows={18}
            spellcheck={false}
            value={draft.output}
            onInput={(e) => onOutput(e.currentTarget.value)}
          />
        </div>
        <fieldset>
          <legend>{t.builder.outputType}</legend>
          {(
            [
              ["bare", t.builder.bare],
              ["review", t.builder.review],
            ] as [OutputType, string][]
          ).map(([v, l]) => (
            <label class="radio" key={v}>
              <input type="radio" name="output-type" checked={draft.outputType === v} onChange={() => patch({ outputType: v })} /> {l}
            </label>
          ))}
        </fieldset>
        {draft.outputType === "review" && (
          <details ref={detailsRef}>
            <summary>{t.builder.preview}</summary>
            <label for="review-preview" class="sr-only">
              {t.builder.preview}
            </label>
            <textarea id="review-preview" ref={previewRef} class="output" rows={12} readOnly value={finalText("review")} />
          </details>
        )}
        <div class="actions">
          <button type="button" class="primary" onClick={copy} disabled={empty}>
            {t.common.copy}
          </button>
          {providers.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => openProvider(p)}
              disabled={empty}
              aria-label={t.builder.openInLabel(p.label)}
            >
              {t.builder.openIn(p.label)}
              <ExternalIcon />
            </button>
          ))}
        </div>
        <p class="status" id="status">
          {status}
        </p>
      </section>
    </div>
  );
}

function hostOf(p: Provider): string {
  try {
    return new URL(p.link ? p.link.replace("{prompt}", "") : p.home).host;
  } catch {
    return BUILTIN_PROVIDERS.find((b) => b.id === p.id)?.host ?? p.label;
  }
}

function ExternalIcon() {
  return (
    <svg class="icon" viewBox="0 0 8 8" width="16" height="16" aria-hidden="true" shape-rendering="crispEdges">
      <path d="M1 1h3v1H2v4h4V4h1v3H1zM5 1h2v2H6V2.7L4.4 4.3 3.7 3.6 5.3 2H5z" fill="currentColor" />
    </svg>
  );
}
