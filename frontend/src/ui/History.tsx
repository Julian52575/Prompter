import { useRef } from "preact/hooks";
import { effectiveTemplates, matchValues, newDraft } from "../core/catalog";
import { isEmpty } from "../core/render";
import { deleteHistoryEntries, KEYS, repo, updateRecord } from "../core/storage";
import type { Draft, HistoryEntry, Settings } from "../core/types";
import { copyText } from "./clipboard";
import { useApp, useStoreVersion } from "./context";
import { localizeTemplate, tr } from "./i18n";
import { StorageMeter } from "./StorageMeter";


/** Row and item keys are random, so they are left out when comparing inputs. */
const noKeys = (k: string, v: unknown) => (k === "k" ? undefined : v);


export function History() {
  const app = useApp();
  const { store, dialogs, announce, t } = app;
  const fmt = new Intl.DateTimeFormat(t.locale, { dateStyle: "medium", timeStyle: "short" });
  useStoreVersion();
  const r = repo(store);
  const rows = r.historyIndex();
  const templates = effectiveTemplates(r.templates());

  const copy = async (text: string, field?: HTMLTextAreaElement | null) => {
    const res = await copyText(text, field);
    announce(res === "copied" ? t.common.copied : t.common.copyManual);
  };

  const restore = async (e: HistoryEntry) => {
    const tpl = templates.find((x) => x.id === e.templateId)!;
    const current = r.drafts()[tpl.id];
    const hasContent =
      current && (current.output.trim() !== "" || tpl.fields.some((f) => !isEmpty(f, current.values?.[f.id])));
    const sameInputs = JSON.stringify(matchValues(tpl.fields, current?.values ?? {}).values, noKeys) ===
      JSON.stringify(matchValues(tpl.fields, e.inputs).values, noKeys);
    if (hasContent && (current.output !== e.prompt || !sameInputs)) {
      const res = await dialogs.confirm({
        title: t.history.replaceDraftTitle,
        body: t.history.replaceDraftBody(localizeTemplate(t, tpl).name),
        confirm: t.common.replace,
        danger: true,
      });
      if (res.choice !== "confirm") return;
    }
    const m = matchValues(tpl.fields, e.inputs);
    const d: Draft = {
      ...newDraft(tpl),
      outputType: current?.outputType ?? "bare",
      values: m.values,
      mode: e.mode,
      scope: e.scope,
      output: e.prompt,
      baseline: e.prompt,
      entryId: null,
    };
    updateRecord<Record<string, Draft>>(store, KEYS.drafts, {}, (all) => ({ ...all, [tpl.id]: d }));
    updateRecord<Partial<Settings>>(store, KEYS.settings, {}, (s) => ({ ...s, lastTemplate: tpl.id }));
    app.builderNotice.current = m.dropped ? "inputsDropped" : null;
    app.navigate("builder");
  };

  const view = (e: HistoryEntry) =>
    dialogs.show(t.history.promptFrom(fmt.format(e.createdAt)), (close) => <ViewPrompt e={e} close={close} copy={copy} />);

  return (
    <section aria-labelledby="history-heading">
      <div class="view-head">
        <h2 id="history-heading">{t.history.heading}</h2>
        <StorageMeter />
      </div>
      {rows.length === 0 ? (
        <p>{t.history.empty}</p>
      ) : (
        <>
          <p>
            <button
              type="button"
              class="danger"
              onClick={async () => {
                const res = await dialogs.confirm({
                  title: t.history.clearAllTitle(rows.length),
                  confirm: t.history.deleteAll,
                  danger: true,
                });
                if (res.choice === "confirm") {
                  deleteHistoryEntries(store, rows.map((x) => x.id));
                  announce(t.history.cleared);
                }
              }}
            >
              {t.history.clearAll}
            </button>
          </p>
          <ol class="history">
            {rows.map((row) => {
              const deleted = !templates.some((x) => x.id === row.templateId);
              const entry = () => r.entry(row.id);
              return (
                <li key={row.id} class="history-row">
                  <p class="meta">
                    <time dateTime={new Date(row.createdAt).toISOString()}>{fmt.format(row.createdAt)}</time>
                    {" · "}
                    {tr(t, row.templateName)}
                    {deleted && <span class="tag">{t.history.templateDeleted}</span>}
                    {row.edited && <span class="tag">{t.history.edited}</span>}
                  </p>
                  <p class="summary">{row.summary || t.history.noSummary}</p>
                  <div class="item-actions">
                    {deleted ? (
                      <button type="button" onClick={() => entry() && view(entry()!)} aria-label={t.common.named(t.history.viewPrompt, row.summary)}>
                        {t.history.viewPrompt}
                      </button>
                    ) : (
                      <button type="button" onClick={() => entry() && restore(entry()!)} aria-label={t.common.named(t.history.restore, row.summary)}>
                        {t.history.restore}
                      </button>
                    )}
                    <button type="button" onClick={() => copy(entry()?.prompt ?? "")} aria-label={t.common.named(t.history.copyPrompt, row.summary)}>
                      {t.history.copyPrompt}
                    </button>
                    <button
                      type="button"
                      aria-label={t.common.named(t.common.delete, row.summary)}
                      onClick={async () => {
                        const res = await dialogs.confirm({ title: t.history.deleteTitle, confirm: t.common.delete, danger: true });
                        if (res.choice === "confirm") {
                          deleteHistoryEntries(store, [row.id]);
                          announce(t.history.deleted);
                        }
                      }}
                    >
                      {t.common.delete}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}

function ViewPrompt({
  e,
  close,
  copy,
}: {
  e: HistoryEntry;
  close: () => void;
  copy: (t: string, f?: HTMLTextAreaElement | null) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const { t } = useApp();
  return (
    <>
      <label for="view-prompt">{t.history.prompt}</label>
      <textarea id="view-prompt" ref={ref} class="output" rows={14} readOnly value={e.prompt} />
      <div class="actions">
        <button type="button" data-initial onClick={close}>
          {t.common.close}
        </button>
        <button type="button" class="primary" onClick={() => copy(e.prompt, ref.current)}>
          {t.common.copy}
        </button>
      </div>
    </>
  );
}
