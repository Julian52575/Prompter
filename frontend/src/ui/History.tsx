import { useRef } from "preact/hooks";
import { effectiveTemplates, matchValues, newDraft } from "../core/catalog";
import { isEmpty } from "../core/render";
import { deleteHistoryEntries, KEYS, repo, updateRecord } from "../core/storage";
import type { Draft, HistoryEntry, Settings } from "../core/types";
import { COPY_MANUAL, copyText } from "./clipboard";
import { useApp, useStoreVersion } from "./context";
import { StorageMeter } from "./StorageMeter";

export const INPUTS_DROPPED = "Some saved inputs no longer match this template and were not restored.";

/** Row and item keys are random, so they are left out when comparing inputs. */
const noKeys = (k: string, v: unknown) => (k === "k" ? undefined : v);

const fmt = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export function History() {
  const app = useApp();
  const { store, dialogs, announce } = app;
  useStoreVersion();
  const r = repo(store);
  const rows = r.historyIndex();
  const templates = effectiveTemplates(r.templates());

  const copy = async (text: string, field?: HTMLTextAreaElement | null) => {
    const res = await copyText(text, field);
    announce(res === "copied" ? "Copied" : COPY_MANUAL);
  };

  const restore = async (e: HistoryEntry) => {
    const t = templates.find((x) => x.id === e.templateId)!;
    const current = r.drafts()[t.id];
    const hasContent =
      current && (current.output.trim() !== "" || t.fields.some((f) => !isEmpty(f, current.values?.[f.id])));
    const sameInputs = JSON.stringify(matchValues(t.fields, current?.values ?? {}).values, noKeys) ===
      JSON.stringify(matchValues(t.fields, e.inputs).values, noKeys);
    if (hasContent && (current.output !== e.prompt || !sameInputs)) {
      const res = await dialogs.confirm({ title: "Replace the current draft?", body: `Your ${t.name} draft is replaced by this entry.`, confirm: "Replace", danger: true });
      if (res.choice !== "confirm") return;
    }
    const m = matchValues(t.fields, e.inputs);
    const d: Draft = {
      ...newDraft(t),
      outputType: current?.outputType ?? "bare",
      values: m.values,
      mode: e.mode,
      scope: e.scope,
      output: e.prompt,
      baseline: e.prompt,
      entryId: null,
    };
    updateRecord<Record<string, Draft>>(store, KEYS.drafts, {}, (all) => ({ ...all, [t.id]: d }));
    updateRecord<Partial<Settings>>(store, KEYS.settings, {}, (s) => ({ ...s, lastTemplate: t.id }));
    app.builderNotice.current = m.dropped ? INPUTS_DROPPED : null;
    app.navigate("builder");
  };

  const view = (e: HistoryEntry) =>
    dialogs.show(`Prompt from ${fmt.format(e.createdAt)}`, (close) => <ViewPrompt e={e} close={close} copy={copy} />);

  return (
    <section aria-labelledby="history-heading">
      <div class="view-head">
        <h2 id="history-heading">History</h2>
        <StorageMeter />
      </div>
      {rows.length === 0 ? (
        <p>No prompts yet. Each Generate adds one here.</p>
      ) : (
        <>
          <p>
            <button
              type="button"
              class="danger"
              onClick={async () => {
                const res = await dialogs.confirm({
                  title: `Delete all ${rows.length} history entries? This cannot be undone.`,
                  confirm: "Delete all",
                  danger: true,
                });
                if (res.choice === "confirm") {
                  deleteHistoryEntries(store, rows.map((x) => x.id));
                  announce("History cleared");
                }
              }}
            >
              Clear all
            </button>
          </p>
          <ol class="history">
            {rows.map((row) => {
              const deleted = !templates.some((t) => t.id === row.templateId);
              const entry = () => r.entry(row.id);
              return (
                <li key={row.id} class="history-row">
                  <p class="meta">
                    <time dateTime={new Date(row.createdAt).toISOString()}>{fmt.format(row.createdAt)}</time>
                    {" · "}
                    {row.templateName}
                    {deleted && <span class="tag">Template deleted</span>}
                    {row.edited && <span class="tag">Edited</span>}
                  </p>
                  <p class="summary">{row.summary || "(no summary)"}</p>
                  <div class="item-actions">
                    {deleted ? (
                      <button type="button" onClick={() => entry() && view(entry()!)} aria-label={`View prompt: ${row.summary}`}>
                        View prompt
                      </button>
                    ) : (
                      <button type="button" onClick={() => entry() && restore(entry()!)} aria-label={`Restore: ${row.summary}`}>
                        Restore
                      </button>
                    )}
                    <button type="button" onClick={() => copy(entry()?.prompt ?? "")} aria-label={`Copy prompt: ${row.summary}`}>
                      Copy prompt
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete: ${row.summary}`}
                      onClick={async () => {
                        const res = await dialogs.confirm({ title: "Delete this history entry?", confirm: "Delete", danger: true });
                        if (res.choice === "confirm") {
                          deleteHistoryEntries(store, [row.id]);
                          announce("Entry deleted");
                        }
                      }}
                    >
                      Delete
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
  return (
    <>
      <label for="view-prompt">Prompt</label>
      <textarea id="view-prompt" ref={ref} class="output" rows={14} readOnly value={e.prompt} />
      <div class="actions">
        <button type="button" data-initial onClick={close}>
          Close
        </button>
        <button type="button" class="primary" onClick={() => copy(e.prompt, ref.current)}>
          Copy
        </button>
      </div>
    </>
  );
}
