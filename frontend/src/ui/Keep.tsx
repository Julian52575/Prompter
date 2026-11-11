import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import {
  effectiveModes,
  effectiveTemplates,
  effectiveWrapper,
  matchValues,
  newDraft,
  offeredModes,
  randomId,
} from "../core/catalog";
import {
  archiveName,
  buildArchive,
  DEFAULT_ARCHIVE_OPTIONS,
  treeLines,
  zipStore,
  type ArchiveOptions,
  type ArchivePrompt,
} from "../core/archive";
import { parseCompletion, planCompletion, type Change } from "../core/completion";
import { keepColor } from "../core/keepColor";
import { SHARED_SCRIPTS } from "../core/scripts";
import { isEmpty, render } from "../core/render";
import {
  append,
  emptyRoadmap,
  layout,
  place,
  placedIds,
  prune,
  removePrompt,
  renameThread,
  threadOf,
  toMermaid,
  unplace,
  type Drop,
  type Roadmap,
} from "../core/roadmap";
import { KEYS, repo, updateRecord } from "../core/storage";
import type { Draft, Keep as KeepItem, Settings } from "../core/types";
import { validateInputs } from "../core/validate";
import { copyText } from "./clipboard";
import { useApp, useStoreVersion } from "./context";
import { localizeTemplate } from "./i18n";
import { agentWrapper, wrapPrompt } from "../core/wrap";

/** Actions shared by the List and the Prompt Roadmap views. */
function useKeepActions() {
  const app = useApp();
  const { store, dialogs, announce, t, lang } = app;
  const r = repo(store);
  const templates = effectiveTemplates(r.templates());

  const open = async (k: KeepItem) => {
    const tpl = templates.find((x) => x.id === k.templateId)!;
    const current = r.drafts()[tpl.id];
    const hasContent =
      current && (current.output.trim() !== "" || tpl.fields.some((f) => !isEmpty(f, current.values?.[f.id])));
    if (hasContent) {
      const res = await dialogs.confirm({
        title: t.keep.replaceDraftTitle,
        body: t.keep.replaceDraftBody(localizeTemplate(t, tpl).name),
        confirm: t.common.replace,
        danger: true,
      });
      if (res.choice !== "confirm") return;
    }
    const m = matchValues(tpl.fields, k.values);
    const d: Draft = {
      ...newDraft(tpl),
      outputType: current?.outputType ?? "bare",
      values: m.values,
      modes: k.modes,
      scope: k.scope,
    };
    updateRecord<Record<string, Draft>>(store, KEYS.drafts, {}, (all) => ({
      ...all,
      [tpl.id]: d,
    }));
    updateRecord<Partial<Settings>>(store, KEYS.settings, {}, (s) => ({
      ...s,
      lastTemplate: tpl.id,
    }));
    app.builderNotice.current = m.dropped ? "inputsDropped" : null;
    app.editingKeep.current = { name: k.name, project: k.project };
    app.navigate("builder");
  };

  const setStatus = (k: KeepItem, status: KeepItem["status"]) =>
    updateRecord<KeepItem[]>(store, KEYS.keeps, [], (all) =>
      all.map((x) => {
        if (x.id !== k.id) return x;
        const { status: _old, ...rest } = x;
        return status ? { ...rest, status } : rest;
      }),
    );

  /** The prompt as Copy gives it (bare, or wrapped in the Re-Prompt Request); null when its template is gone. */
  const text = (k: KeepItem, kind: "bare" | "review" | "agent" = "bare"): string | null => {
    const tpl = templates.find((x) => x.id === k.templateId);
    if (!tpl) return null;
    const modes = offeredModes(tpl, effectiveModes(r.modes())).filter((m) => k.modes.includes(m.id));
    const out = render({
      template: tpl,
      inputs: matchValues(tpl.fields, k.values).values,
      modes,
      scope: k.scope,
      language: lang,
    });
    if (kind === "bare") return out;
    const wrapper = effectiveWrapper(r.wrapper()).text;
    // "agent": the wording for an agent that carries the prompt out itself, used only in the project download.
    return wrapPrompt(kind === "agent" ? agentWrapper(wrapper) : wrapper, out);
  };

  const copy = async (k: KeepItem, kind: "bare" | "review" = "bare") => {
    const out = text(k, kind);
    if (out === null) return;
    const res = await copyText(out);
    if (res === "copied") {
      // Cancelled and downloaded are only cleared by hand (Unmark).
      if (k.status !== "cancelled" && k.status !== "downloaded") setStatus(k, "copied");
      announce(t.keep.copiedMsg);
    } else announce(t.keep.copyFailed);
  };

  const remove = async (k: KeepItem): Promise<boolean> => {
    const res = await dialogs.confirm({
      title: t.keep.deleteTitle,
      confirm: t.keep.delete,
      danger: true,
    });
    if (res.choice !== "confirm") return false;
    updateRecord<KeepItem[]>(store, KEYS.keeps, [], (all) => all.filter((x) => x.id !== k.id));
    updateRecord<Record<string, Roadmap>>(store, KEYS.roadmaps, {}, (all) =>
      all[k.project] ? { ...all, [k.project]: removePrompt(all[k.project], k.id) } : all,
    );
    announce(t.keep.deleted);
    return true;
  };

  /** True when a required field is empty, or the template is gone so the prompt cannot be built. */
  const incomplete = (k: KeepItem) => {
    const tpl = templates.find((x) => x.id === k.templateId);
    if (!tpl) return true;
    return validateInputs(tpl, matchValues(tpl.fields, k.values).values, k.scope, t.inputs).length > 0;
  };

  return { open, copy, text, remove, setStatus, incomplete, templates };
}

const statusText = (t: ReturnType<typeof useApp>["t"], s: KeepItem["status"]) =>
  s === "copied"
    ? t.keep.statusCopied
    : s === "completed"
      ? t.keep.statusCompleted
      : s === "cancelled"
        ? t.keep.statusCancelled
        : s === "downloaded"
          ? t.keep.statusDownloaded
          : "";

function Status({ k }: { k: KeepItem }) {
  const { t } = useApp();
  return k.status ? <span class={`tag status status-${k.status}`}>{statusText(t, k.status)}</span> : null;
}

export function Keep() {
  const { t } = useApp();
  return (
    <section aria-labelledby="keep-heading">
      <div class="view-head">
        <h2 id="keep-heading">{t.keep.heading}</h2>
      </div>
      <KeepList />
    </section>
  );
}

export function Roadmap() {
  const { t } = useApp();
  return (
    <section aria-labelledby="roadmap-heading">
      <div class="view-head">
        <h2 id="roadmap-heading">{t.keep.roadmapView}</h2>
      </div>
      <KeepRoadmap />
    </section>
  );
}

function KeepList() {
  const app = useApp();
  const { store, t } = app;
  useStoreVersion();
  const act = useKeepActions();
  const r = repo(store);
  const keeps = r.keeps();
  const projects = [...new Set(keeps.map((k) => k.project))].sort((a, b) => a.localeCompare(b));
  const [filter, setFilter] = useState("");
  const active = projects.includes(filter) ? filter : "";
  const shown = active ? keeps.filter((k) => k.project === active) : keeps;
  const fmt = new Intl.DateTimeFormat(t.locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      {keeps.length === 0 ? (
        <p>{t.keep.empty}</p>
      ) : (
        <>
          <p class="field">
            <label for="keep-filter">{t.keep.filter}</label>{" "}
            <select id="keep-filter" value={active} onChange={(e) => setFilter(e.currentTarget.value)}>
              <option value="">{t.keep.allProjects}</option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </p>
          <ol class="history">
            {shown.map((k) => {
              const deleted = !act.templates.some((x) => x.id === k.templateId);
              const c = keepColor(k.project);
              return (
                <li key={k.id} class="history-row keep-row">
                  <h3 class="keep-project" style={`--kh:${c.hue};--ks:${c.saturation}%;--kl:${c.lightness}%`}>
                    {k.project}
                  </h3>
                  <h4 class="keep-name">{k.name}</h4>
                  <p class="meta">
                    {tag(deleted, t.keep.templateDeleted)}
                    <Status k={k} />
                    <time dateTime={new Date(k.savedAt).toISOString()}>{t.keep.savedOn(fmt.format(k.savedAt))}</time>
                  </p>
                  <div class="item-actions">
                    <button
                      type="button"
                      disabled={deleted}
                      onClick={() => act.copy(k)}
                      aria-label={t.common.named(t.keep.copy, k.name)}
                    >
                      {t.keep.copy}
                    </button>
                    <button
                      type="button"
                      disabled={deleted}
                      onClick={() => act.open(k)}
                      aria-label={t.common.named(t.keep.open, k.name)}
                    >
                      {t.keep.open}
                    </button>
                    <button
                      type="button"
                      aria-label={t.common.named(t.keep.delete, k.name)}
                      onClick={() => act.remove(k)}
                    >
                      {t.keep.delete}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </>
  );
}

/** a name longer than two lines of text is cut and ends in "..."; the full name stays in the title and for screen readers. */
const NAME_MAX = 36;
const TEMPLATE_MAX = 24;
const shorten = (name: string, max = NAME_MAX) => {
  const chars = Array.from(name);
  return chars.length > max ? `${chars.slice(0, max - 3).join("")}...` : name;
};

// Zoom is stored as the real scale (0.1 to 0.7) and shown as 10% to 100%, so the old 10-70% range reads as the full scale.
const Z_MIN = 0.1;
const Z_MAX = 0.7;
const Z_DEFAULT = 0.5;
const Z_STEP = 0.1 / 1.5;
const zoomPct = (z: number) => Math.round(10 + (z - Z_MIN) * 150);

// Roadmap height: a multiple of the minimum (36vh). Click steps through these (+50% each); dragging sets any value of 1 or more.
const H_PRESETS = [1, 1.5, 2, 2.5, 3];
const H_BASE_VH = 36;

// Roadmap geometry in em; zoom scales the whole grid so fixed-size borders and padding shrink with it.
const COL = 17;
const ROW = 10;
const BLOCK_W = 14;
const BLOCK_H = 5.5;
const NEAR = 2;
// Height of the thread-name tab under a thread's first block.
const TAB_H = 2.4;

function KeepRoadmap() {
  const app = useApp();
  const { store, dialogs, announce, t } = app;
  useStoreVersion();
  const act = useKeepActions();
  const keeps = repo(store).keeps();
  const projects = [...new Set(keeps.map((k) => k.project))].sort((a, b) => a.localeCompare(b));
  const patchSettings = (patch: Partial<Settings>) =>
    updateRecord<Partial<Settings>>(store, KEYS.settings, {}, (st) => ({
      ...st,
      ...patch,
    }));
  // Kept in settings, not component state, so a reload brings back the same project and prompt.
  const chosen = repo(store).settings().roadmapProject ?? "";
  const setChosen = (p: string) => patchSettings({ roadmapProject: p, roadmapListScroll: 0 });
  const listEl = useRef<HTMLUListElement>(null);
  const scrollTimer = useRef<number | undefined>(undefined);
  const savedListScroll = useRef(repo(store).settings().roadmapListScroll ?? 0);
  useEffect(() => {
    if (listEl.current) listEl.current.scrollTop = savedListScroll.current;
    return () => window.clearTimeout(scrollTimer.current);
  }, []);
  const project = projects.includes(chosen) ? chosen : (projects[0] ?? "");
  const mine = keeps.filter((k) => k.project === project);
  const byId = new Map(mine.map((k) => [k.id, k]));
  const stored = repo(store).roadmaps()[project] ?? emptyRoadmap();
  const rm = prune(stored, new Set(byId.keys()));
  const placed = placedIds(rm);
  const unplaced = mine
    .filter((k) => !placed.has(k.id))
    .sort((a, b) => Math.max(b.savedAt, rm.returned[b.id] ?? 0) - Math.max(a.savedAt, rm.returned[a.id] ?? 0));
  const L = layout(rm);

  const savedSelected = repo(store).settings().roadmapSelected;
  const selectedId = savedSelected && byId.has(savedSelected) ? savedSelected : null;
  const setSelectedId = (id: string | null) => patchSettings({ roadmapSelected: id ?? undefined });
  const selected = selectedId ? (byId.get(selectedId) ?? null) : null;
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const saved = repo(store).settings().roadmapZoom;
  const zoom = typeof saved === "number" ? Math.min(Z_MAX, Math.max(Z_MIN, saved)) : Z_DEFAULT;
  const showTpl = repo(store).settings().roadmapShowTemplates !== false;
  const showInc = repo(store).settings().roadmapShowIncomplete !== false;
  const incompleteIds = new Set(mine.filter((k) => act.incomplete(k)).map((k) => k.id));
  const inc = (k: KeepItem) =>
    showInc && incompleteIds.has(k.id) ? <span class="tag rm-incomplete">{t.keep.incomplete}</span> : null;
  const setShowTpl = (on: boolean) =>
    updateRecord<Partial<Settings>>(store, KEYS.settings, {}, (st) => ({
      ...st,
      roadmapShowTemplates: on,
    }));
  const tplName = (k: KeepItem) => {
    const tpl = act.templates.find((x) => x.id === k.templateId);
    return tpl ? localizeTemplate(t, tpl).name : k.templateName;
  };
  const savedH = repo(store).settings().roadmapHeight;
  const heightF = typeof savedH === "number" && savedH >= 1 ? savedH : 1;
  const setHeightF = (f: number) =>
    updateRecord<Partial<Settings>>(store, KEYS.settings, {}, (st) => ({
      ...st,
      roadmapHeight: Math.max(1, Math.round(f * 1000) / 1000),
    }));
  const resize = useRef<{
    y: number;
    offset: number;
    moved: boolean;
    stop: () => void;
    apply: () => void;
  } | null>(null);
  const canvasEl = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);
  const lastY = useRef(0);
  const cyclePreset = () => {
    const next = H_PRESETS.find((p) => p > heightF + 1e-6) ?? H_PRESETS[0];
    setHeightF(next);
    announce(t.keep.roadmapHeightLabel(Math.round(next * 100)));
  };
  const setZoom = (z: number) =>
    updateRecord<Partial<Settings>>(store, KEYS.settings, {}, (st) => ({
      ...st,
      roadmapZoom: z,
    }));
  const [hint, setHint] = useState<{ id: string; pos: Drop } | "empty" | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [overList, setOverList] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const pan = useRef<{ x: number; y: number } | null>(null);
  const [panning, setPanning] = useState(false);

  const edit = (fn: (r: Roadmap) => Roadmap) =>
    updateRecord<Record<string, Roadmap>>(store, KEYS.roadmaps, {}, (all) => ({
      ...all,
      [project]: fn(prune(all[project] ?? emptyRoadmap(), new Set(byId.keys()))),
    }));

  const select = (id: string) => {
    setSelectedId(id);
    const th = threadOf(rm, id);
    if (th) setActiveThread(th.id);
  };
  useEffect(() => {
    if (selectedId)
      document.getElementById(`rm-b-${selectedId}`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedId]);

  const target = (e: DragEvent): { id: string; pos: Drop } | null => {
    const g = grid.current;
    if (!g) return null;
    const rect = g.getBoundingClientRect();
    const em = parseFloat(getComputedStyle(g).fontSize);
    const x = (e.clientX - rect.left) / (em * zoom);
    const y = (e.clientY - rect.top) / (em * zoom);
    for (const c of L.cells) {
      const cx = (c.col + 1) * COL;
      const cy = c.row * ROW;
      // A thread's first block owns the name tab below it, so its drop area includes the tab.
      const bottom = cy + BLOCK_H + (c.first ? TAB_H : 0);
      if (x < cx - NEAR || x > cx + BLOCK_W + NEAR || y < cy - NEAR || y > bottom + NEAR) continue;
      if (c.id === dragging) return null;
      const dx = (x - (cx + BLOCK_W / 2)) / (BLOCK_W / 2);
      const dy = (y - (cy + BLOCK_H / 2)) / (BLOCK_H / 2);
      let pos: Drop =
        y > cy + BLOCK_H || Math.abs(dx) <= Math.abs(dy) ? (dy < 0 ? "before" : "after") : dx < 0 ? "left" : "right";
      // Nothing goes above a thread's first block: the drop lands below its name instead.
      if (c.first && pos === "before") pos = "after";
      return { id: c.id, pos };
    }
    return null;
  };

  const over = (e: DragEvent) => {
    if (!dragging) return;
    if (L.cells.length === 0) {
      e.preventDefault();
      setHint("empty");
      return;
    }
    const tg = target(e);
    if (tg) e.preventDefault();
    setHint(tg);
  };
  const drop = (e: DragEvent) => {
    e.preventDefault();
    const id = dragging;
    const tg = L.cells.length === 0 ? { id: null, pos: "after" as Drop } : target(e);
    setHint(null);
    setDragging(null);
    if (!id || !tg) return;
    edit((x) => place(x, id, tg.id, tg.pos, randomId("t-")));
    select(id);
  };
  const listOver = (e: DragEvent) => {
    if (dragging && placed.has(dragging)) {
      e.preventDefault();
      setOverList(true);
    }
  };
  const listDrop = (e: DragEvent) => {
    e.preventDefault();
    const id = dragging;
    setOverList(false);
    setDragging(null);
    if (!id || !placed.has(id)) return;
    edit((x) => unplace(x, id, Date.now()));
    announce(t.keep.removed);
  };
  const dragProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      e.dataTransfer?.setData("text/plain", id);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
      setDragging(id);
    },
    onDragEnd: () => {
      setDragging(null);
      setHint(null);
      setOverList(false);
    },
  });

  const exportMermaid = () => {
    const code = toMermaid(rm, (id) => byId.get(id)?.name ?? "");
    dialogs.show(t.keep.mermaidTitle, (close) => (
      <div>
        <div class="field">
          <label for="mermaid-code">{t.keep.mermaidCode}</label>
          <textarea id="mermaid-code" readOnly rows={12} value={code} data-initial />
        </div>
        <div class="actions">
          <button type="button" onClick={close}>
            {t.common.close}
          </button>
          <button
            type="button"
            onClick={async () => {
              if ((await copyText(code)) === "copied") announce(t.common.copied);
            }}
          >
            {t.common.copy}
          </button>
          <button
            type="button"
            class="primary"
            onClick={() => {
              const a = document.createElement("a");
              a.href = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
              a.download = `${project.replace(/[^\p{L}\p{N}_-]+/gu, "-") || "roadmap"}-roadmap.mmd`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            {t.keep.download}
          </button>
        </div>
      </div>
    ));
  };

  const issuesOf = (k: KeepItem): string[] => [
    ...(act.incomplete(k) ? [t.keep.incomplete] : []),
    ...(k.status === "completed" ? [t.keep.statusCompleted] : []),
    ...(k.status === "cancelled" ? [t.keep.statusCancelled] : []),
    ...(k.status === "downloaded" ? [t.keep.statusDownloaded] : []),
  ];

  const openDownload = () => {
    const threads = rm.threads.filter((x) => x.items.length > 0);
    const parentOf = (x: (typeof threads)[number]) => {
      const p = x.from ? threadOf(rm, x.from) : undefined;
      return p && p.id !== x.id ? p.id : null;
    };
    const rows: DownloadRow[] = threads.map((x) => ({
      id: x.id,
      name: x.name.trim() || t.keep.unnamedThread,
      parent: parentOf(x),
      // The prompt this thread branches from, when it sits in a parent thread.
      anchor: (() => {
        const a = parentOf(x) && x.from ? byId.get(x.from) : undefined;
        return a ? { name: a.name, done: a.status === "completed" } : null;
      })(),
      prompts: x.items.map((id) => ({
        id,
        name: byId.get(id)!.name,
        issues: issuesOf(byId.get(id)!),
      })),
    }));
    const saved = repo(store).settings();
    dialogs.show(
      t.keep.downloadTitle,
      (close) => (
        <DownloadForm
          project={project}
          rows={rows}
          initialOptions={{
            ...DEFAULT_ARCHIVE_OPTIONS,
            ...saved.downloadOptions,
          }}
          initialExcluded={saved.downloadExcluded ?? []}
          onChoices={(options, excluded) =>
            patchSettings({
              downloadOptions: options,
              downloadExcluded: excluded,
            })
          }
          preview={(ids) =>
            treeLines(
              archiveName(project),
              archiveFor(ids, DEFAULT_ARCHIVE_OPTIONS, false).map((f) => f.path),
            )
          }
          close={close}
          onDownload={(ids, options) => {
            download(ids, options);
            close();
          }}
        />
      ),
      { closeOnOutsideClick: true },
    );
  };

  /** The files for the chosen threads. A thread whose parent thread is left out starts from a finished prompt. */
  const archiveFor = (ids: string[], options: ArchiveOptions, withText: boolean) => {
    const chosenThreads = rm.threads.filter((x) => ids.includes(x.id));
    const prompts: Record<string, ArchivePrompt> = {};
    for (const th of chosenThreads)
      for (const id of th.items) {
        const k = byId.get(id)!;
        prompts[id] = {
          name: k.name,
          status: k.status,
          text: withText ? (act.text(k, options.rePrompt ? "agent" : "bare") ?? "") : "",
        };
      }
    const external: Record<string, { name: string; thread: string }> = {};
    for (const th of chosenThreads) {
      const parent = th.from ? threadOf(rm, th.from) : undefined;
      if (th.from && parent && parent.id !== th.id && !ids.includes(parent.id) && byId.has(th.from))
        external[th.from] = { name: byId.get(th.from)!.name, thread: parent.name.trim() || t.keep.unnamedThread };
    }
    return buildArchive({
      project,
      roadmap: { threads: chosenThreads, returned: {} },
      prompts,
      external,
      scripts: SHARED_SCRIPTS,
      options,
    });
  };

  const importCompletion = () =>
    dialogs.show(t.keep.importTitle, (close) => (
      <ImportCompletionForm
        keeps={repo(store).keeps()}
        close={close}
        onApply={(changes) => {
          const byId = new Map(changes.map((c) => [c.id, c.to]));
          updateRecord<KeepItem[]>(store, KEYS.keeps, [], (all) =>
            all.map((k) => {
              if (!byId.has(k.id)) return k;
              const { status: _old, ...rest } = k;
              const to = byId.get(k.id);
              return to ? { ...rest, status: to } : rest;
            }),
          );
          announce(t.keep.importApplied(changes.length));
          close();
        }}
      />
    ));

  const download = (ids: string[], options: ArchiveOptions) => {
    const chosenThreads = rm.threads.filter((x) => ids.includes(x.id));
    const files = archiveFor(ids, options, true);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([zipStore(files) as BlobPart], { type: "application/zip" }));
    a.download = archiveName(project);
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    // Downloaded prompts are blocked from the next download until the user unmarks them.
    const sent = new Set(chosenThreads.flatMap((th) => th.items));
    updateRecord<KeepItem[]>(store, KEYS.keeps, [], (all) =>
      all.map((k) => (sent.has(k.id) ? { ...k, status: "downloaded" as const } : k)),
    );
    announce(t.keep.downloaded);
  };

  const create = () =>
    dialogs.show(t.keep.createTitle, (close) => (
      <CreateForm
        templates={act.templates.map((x) => localizeTemplate(t, x))}
        threads={rm.threads
          .filter((x) => x.items.length > 0)
          .map((x) => ({
            id: x.id,
            name: x.name.trim() || t.keep.unnamedThread,
          }))}
        taken={(n) => mine.some((k) => k.name === n)}
        close={close}
        onCreate={(tplId, name, threadId) => {
          const tpl = act.templates.find((x) => x.id === tplId)!;
          const d = newDraft(tpl);
          const item: KeepItem = {
            id: randomId(),
            name,
            project,
            savedAt: Date.now(),
            templateId: tpl.id,
            templateName: tpl.name,
            values: d.values,
            modes: [],
            scope: d.scope,
          };
          updateRecord<KeepItem[]>(store, KEYS.keeps, [], (all) => [item, ...all]);
          if (threadId) {
            // Written after the keep exists so prune keeps it.
            updateRecord<Record<string, Roadmap>>(store, KEYS.roadmaps, {}, (all) => ({
              ...all,
              [project]: append(all[project] ?? emptyRoadmap(), item.id, threadId, randomId("t-")),
            }));
            select(item.id);
          }
          announce(t.keep.created);
        }}
      />
    ));

  if (keeps.length === 0) return <p>{t.keep.empty}</p>;

  const thread = selected ? threadOf(rm, selected.id) : undefined;
  const threadName = (id: string) => rm.threads.find((x) => x.id === id)?.name.trim() || t.keep.unnamedThread;
  const selDeleted = selected ? !act.templates.some((x) => x.id === selected.templateId) : false;
  // One spare column on each side and one row below, so a drop preview always fits.
  const w = (L.cols + 2) * COL;
  const h = (L.rows + 1) * ROW;
  const pct = zoomPct(zoom);
  const setZ = (z: number) => setZoom(Math.min(Z_MAX, Math.max(Z_MIN, Math.round(z * 1000) / 1000)));

  /** Every place a drop is possible, as a straight line at the block edge; the one under the pointer is accent. */
  const dropLines = () =>
    L.cells
      .filter((c) => c.id !== dragging)
      .flatMap((c) => {
        const x = (c.col + 1) * COL;
        const y = c.row * ROW;
        const below = y + BLOCK_H + (c.first ? TAB_H : 0) + 0.35;
        const lines: [Drop, number[]][] = [
          ["after", [x, below, BLOCK_W, 0.35]],
          ["left", [x - 1.2, y, 0.35, BLOCK_H]],
          ["right", [x + BLOCK_W + 0.85, y, 0.35, BLOCK_H]],
        ];
        // Nothing goes above a thread's first block.
        if (!c.first) lines.push(["before", [x, y - 0.7, BLOCK_W, 0.35]]);
        return lines.map(([pos, b]) => (
          <div
            key={`${c.id}-${pos}`}
            class={`rm-line${typeof hint === "object" && hint?.id === c.id && hint.pos === pos ? " rm-line-on" : ""}`}
            aria-hidden="true"
            style={`left:${b[0]}em;top:${b[1]}em;width:${b[2]}em;height:${b[3]}em`}
          />
        ));
      });

  const hintBox = (id: string, pos: Drop) => {
    const c = L.cells.find((x) => x.id === id)!;
    const x = (c.col + 1) * COL;
    const y = c.row * ROW;
    // A dotted frame where the block would land; it surrounds any block already there.
    const [gx, gy] = {
      before: [x, y - ROW],
      after: [x, y + ROW],
      left: [x - COL, y],
      right: [x + COL, y],
    }[pos];
    const box = [gx - 0.5, gy - 0.5, BLOCK_W + 1, BLOCK_H + 1];
    return (
      <div
        class="rm-hint"
        aria-hidden="true"
        style={`left:${box[0]}em;top:${box[1]}em;width:${box[2]}em;height:${box[3]}em`}
      />
    );
  };

  return (
    <div class="roadmap">
      <div class="rm-main">
        {full && <div class="rm-backdrop" aria-hidden="true" onClick={() => setFull(false)} />}
        <div
          class={`rm-left pane${full ? " rm-full" : ""}`}
          role={full ? "dialog" : undefined}
          aria-modal={full ? "true" : undefined}
          aria-labelledby={full ? "rm-heading" : undefined}
        >
          <div class="rm-bar">
            <h3 id="rm-heading">{t.keep.roadmap}</h3>
            <div class="item-actions">
              <button
                type="button"
                id="rm-fullscreen"
                onClick={() => setFull(!full)}
                aria-label={full ? t.keep.exitFullscreen : t.keep.fullscreen}
                title={full ? t.keep.exitFullscreen : t.keep.fullscreen}
              >
                {full ? "✕" : "⛶"}
              </button>
              <button
                type="button"
                onClick={() => setZ(zoom - Z_STEP)}
                aria-label={t.keep.zoomOut}
                disabled={zoom <= Z_MIN + 1e-6}
              >
                −
              </button>
              <button type="button" onClick={() => setZoom(Z_DEFAULT)} aria-label={t.keep.zoomReset}>
                {t.keep.zoomLabel(pct)}
              </button>
              <button
                type="button"
                onClick={() => setZ(zoom + Z_STEP)}
                aria-label={t.keep.zoomIn}
                disabled={zoom >= Z_MAX - 1e-6}
              >
                +
              </button>
              <button
                type="button"
                id="rm-export"
                class="primary"
                onClick={exportMermaid}
                disabled={L.cells.length === 0}
              >
                {t.keep.exportMermaid}
              </button>
              <button
                type="button"
                id="rm-download"
                class="primary"
                onClick={openDownload}
                disabled={L.cells.length === 0}
              >
                {t.keep.downloadProject}
              </button>
              <button type="button" id="rm-import" onClick={importCompletion}>
                {t.keep.importCompletion}
              </button>
            </div>
          </div>
          <div
            ref={canvasEl}
            style={full ? "flex:1;min-height:0;max-height:none" : `height:${H_BASE_VH * heightF}vh;max-height:none`}
            class={`rm-canvas${hint === "empty" ? " rm-over" : ""}${panning ? " rm-panning" : ""}`}
            // Dragging empty space scrolls the roadmap; blocks and thread names keep their own behaviour.
            onPointerDown={(e) => {
              const el = e.currentTarget as HTMLElement;
              if (e.button !== 0 || (e.target as HTMLElement).closest(".rm-cell")) return;
              // A press on the scrollbar is not a pan.
              if (e.target === el && (e.offsetX > el.clientWidth || e.offsetY > el.clientHeight)) return;
              pan.current = { x: e.clientX, y: e.clientY };
              el.setPointerCapture(e.pointerId);
              setPanning(true);
            }}
            onPointerMove={(e) => {
              const p = pan.current;
              if (!p) return;
              const el = e.currentTarget as HTMLElement;
              // Relative to the last move, so wheel scrolling during the drag adds to it instead of being undone.
              el.scrollLeft -= e.clientX - p.x;
              el.scrollTop -= e.clientY - p.y;
              p.x = e.clientX;
              p.y = e.clientY;
            }}
            onPointerUp={() => {
              pan.current = null;
              setPanning(false);
            }}
            onPointerCancel={() => {
              pan.current = null;
              setPanning(false);
            }}
            role="region"
            aria-labelledby="rm-heading"
            tabIndex={0}
            onDragOver={over}
            onDragLeave={(e) => {
              if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setHint(null);
            }}
            onDrop={drop}
          >
            {L.cells.length === 0 ? (
              <p class="rm-empty">{t.keep.roadmapEmpty}</p>
            ) : (
              <div class="rm-scale" style={`width:${w * zoom}em;height:${h * zoom}em`}>
                <div ref={grid} class="rm-grid" style={`width:${w}em;height:${h}em;transform:scale(${zoom})`}>
                  <svg class="rm-lines" width={`${w}em`} height={`${h}em`} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
                    <defs>
                      <marker
                        id="rm-arrow"
                        markerUnits="userSpaceOnUse"
                        markerWidth="0.9"
                        markerHeight="0.9"
                        refX="0.8"
                        refY="0.45"
                        orient="auto"
                      >
                        <path d="M0,0 L0.9,0.45 L0,0.9 z" fill="currentColor" stroke="none" />
                      </marker>
                    </defs>
                    {rm.threads.flatMap((th) =>
                      th.items.slice(1).map((id, i) => {
                        const a = L.cells.find((c) => c.id === th.items[i])!;
                        const b = L.cells.find((c) => c.id === id)!;
                        const x = (a.col + 1) * COL + BLOCK_W / 2;
                        const y1 = a.row * ROW + (a.first ? BLOCK_H + TAB_H : BLOCK_H);
                        return <line key={id} marker-end="url(#rm-arrow)" x1={x} y1={y1} x2={x} y2={b.row * ROW} />;
                      }),
                    )}
                    {L.edges.map((e) => {
                      const a = L.cells.find((c) => c.id === e.from)!;
                      const b = L.cells.find((c) => c.id === e.to)!;
                      const right = b.col > a.col;
                      const y = a.row * ROW + BLOCK_H / 2;
                      return (
                        <line
                          key={e.to}
                          class="rm-branch"
                          marker-end="url(#rm-arrow)"
                          x1={(a.col + 1) * COL + (right ? BLOCK_W : 0)}
                          y1={y}
                          x2={(b.col + 1) * COL + (right ? 0 : BLOCK_W)}
                          y2={b.row * ROW + BLOCK_H / 2}
                        />
                      );
                    })}
                  </svg>
                  {L.cells.map((c) => {
                    const k = byId.get(c.id)!;
                    const th = rm.threads.find((x) => x.id === c.threadId)!;
                    const step = th.items.indexOf(c.id) + 1;
                    return (
                      <div key={c.id} class="rm-cell" style={`left:${(c.col + 1) * COL}em;top:${c.row * ROW}em`}>
                        <div
                          id={`rm-b-${c.id}`}
                          class={`rm-block ${c.first ? "rm-head" : "rm-child"}${selectedId === c.id ? " rm-selected" : ""}${k.status ? ` rm-${k.status}` : ""}${dragging === c.id ? " rm-dragging" : ""}`}
                          {...dragProps(c.id)}
                        >
                          <span class="rm-step" aria-hidden="true">
                            {step}
                          </span>
                          <button type="button" aria-pressed={selectedId === c.id} onClick={() => select(c.id)}>
                            <span class="rm-name" aria-hidden="true" title={k.name}>
                              {shorten(k.name)}
                            </span>
                            {showTpl && (
                              <span class="rm-tpl" aria-hidden="true" title={tplName(k)}>
                                {shorten(tplName(k), TEMPLATE_MAX)}
                              </span>
                            )}
                            <span class="sr-only">
                              {k.name}. {showTpl ? `${t.keep.template}: ${tplName(k)}. ` : ""}
                              {showInc && incompleteIds.has(k.id) ? `${t.keep.incomplete}. ` : ""}
                              {c.first ? `${t.keep.threadStart}. ` : ""}
                              {t.keep.stepOf(step, th.items.length)}
                            </span>
                            <Status k={k} />
                            {inc(k)}
                          </button>
                        </div>
                        {c.first && (
                          <input
                            class="rm-thread-name"
                            type="text"
                            value={th.name}
                            placeholder={t.keep.threadName}
                            aria-label={t.keep.threadName}
                            onInput={(e) => edit((x) => renameThread(x, th.id, e.currentTarget.value))}
                          />
                        )}
                      </div>
                    );
                  })}
                  {dragging && dropLines()}
                  {hint && hint !== "empty" && hintBox(hint.id, hint.pos)}
                </div>
              </div>
            )}
          </div>
          {!full && (
            <button
              type="button"
              class="rm-resize"
              title={t.keep.resizeHint}
              aria-label={`${t.keep.resizeRoadmap}. ${t.keep.roadmapHeightLabel(Math.round(heightF * 100))}`}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                const top = canvasEl.current?.getBoundingClientRect().top ?? 0;
                const r = {
                  y: e.clientY,
                  // How far below the roadmap's bottom edge the pointer was grabbed, kept while dragging.
                  offset: (canvasEl.current?.offsetHeight ?? 0) - (e.clientY - top),
                  moved: false,
                  stop: () => {},
                  apply: () => {},
                };
                // The height is the pointer's distance from the roadmap's top edge, measured live, so it follows the
                // pointer while the wheel scrolls the page and cannot feed back on its own growth.
                const apply = () => {
                  const t0 = canvasEl.current?.getBoundingClientRect().top ?? 0;
                  setHeightF((lastY.current - t0 + r.offset) / ((H_BASE_VH / 100) * window.innerHeight));
                };
                const onScroll = () => r.moved && apply();
                window.addEventListener("scroll", onScroll);
                // The browser would otherwise keep a node below the roadmap in place as it grows, which scrolls the
                // page, which grows the roadmap again.
                const root = document.documentElement;
                const anchoring = root.style.overflowAnchor;
                root.style.overflowAnchor = "none";
                r.stop = () => {
                  window.removeEventListener("scroll", onScroll);
                  root.style.overflowAnchor = anchoring;
                };
                lastY.current = e.clientY;
                resize.current = r;
                r.apply = apply;
              }}
              onPointerMove={(e) => {
                const r = resize.current;
                if (!r) return;
                lastY.current = e.clientY;
                if (Math.abs(e.clientY - r.y) > 3) r.moved = true;
                if (r.moved) r.apply();
              }}
              onPointerUp={() => {
                const r = resize.current;
                r?.stop();
                resize.current = null;
                // A press without a drag steps to the next preset.
                if (r && !r.moved) cyclePreset();
              }}
              onPointerCancel={() => {
                resize.current?.stop();
                resize.current = null;
              }}
              onKeyDown={(e) => {
                // Enter and Space act as a click; arrows give fine control.
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  cyclePreset();
                } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setHeightF(heightF + (e.key === "ArrowDown" ? 0.1 : -0.1));
                }
              }}
            >
              <span aria-hidden="true">⋯</span>
            </button>
          )}
        </div>

        <section class="pane rm-selected-pane" aria-labelledby="rm-sel-h">
          <h3 id="rm-sel-h">{t.keep.selectedPrompt}</h3>
          {!selected ? (
            <p class="meta">{t.keep.nothingSelected}</p>
          ) : (
            <div id="rm-details">
              <div
                class={`rm-block rm-detail ${thread && thread.items[0] === selected.id ? "rm-head" : "rm-child"}${selected.status ? ` rm-${selected.status}` : ""}`}
              >
                {thread && (
                  <span class="rm-step" aria-hidden="true">
                    {thread.items.indexOf(selected.id) + 1}
                  </span>
                )}
                <h4 class="rm-name">
                  <RenameTitle
                    key={selected.id}
                    name={selected.name}
                    taken={(n) => mine.some((k) => k.id !== selected.id && k.name === n)}
                    onRename={(n) => {
                      updateRecord<KeepItem[]>(store, KEYS.keeps, [], (all) =>
                        all.map((x) => (x.id === selected.id ? { ...x, name: n } : x)),
                      );
                      announce(t.keep.renamed);
                    }}
                  />
                </h4>
                {showTpl && <span class="rm-tpl">{tplName(selected)}</span>}
                <Status k={selected} />
                {inc(selected)}
              </div>
              <div class="item-actions">
                <ActionMenu
                  id="rm-copy-menu"
                  label={t.keep.copy}
                  ariaLabel={t.common.named(t.keep.copy, selected.name)}
                  primary
                  disabled={selDeleted}
                  items={[
                    { label: t.keep.copy, run: () => act.copy(selected) },
                    {
                      label: t.keep.copyReprompt,
                      run: () => act.copy(selected, "review"),
                    },
                  ]}
                />
                <button
                  type="button"
                  class="primary"
                  disabled={selDeleted}
                  onClick={() => act.open(selected)}
                  aria-label={t.common.named(t.keep.edit, selected.name)}
                >
                  {t.keep.edit}
                </button>
                <ActionMenu
                  id="rm-mark-menu"
                  label={t.keep.markAs}
                  primary
                  items={[
                    {
                      label: t.keep.markCopied,
                      run: () => act.setStatus(selected, "copied"),
                    },
                    {
                      label: t.keep.markCompleted,
                      run: () => act.setStatus(selected, "completed"),
                    },
                    {
                      label: t.keep.markCancelled,
                      run: () => act.setStatus(selected, "cancelled"),
                    },
                    ...(selected.status
                      ? [
                          {
                            label: t.keep.unmark,
                            run: () => act.setStatus(selected, undefined),
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
              <div class="item-actions">
                <button
                  type="button"
                  aria-label={t.common.named(t.keep.delete, selected.name)}
                  onClick={async () => {
                    if (await act.remove(selected)) setSelectedId(null);
                  }}
                >
                  {t.keep.delete}
                </button>
                {thread ? (
                  <button
                    type="button"
                    onClick={() => {
                      edit((x) => unplace(x, selected.id, Date.now()));
                      announce(t.keep.removed);
                    }}
                  >
                    {t.keep.removeFromRoadmap}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const to = rm.threads.some((x) => x.id === activeThread) ? activeThread : null;
                      edit((x) => append(x, selected.id, to, randomId("t-")));
                    }}
                  >
                    {t.keep.addToRoadmap}
                  </button>
                )}
              </div>
              {thread && (
                <>
                  <div role="group" aria-label={t.keep.threadPrompts(threadName(thread.id))}>
                    <input
                      class="rm-thread-banner"
                      type="text"
                      value={thread.name}
                      placeholder={t.keep.threadName}
                      aria-label={t.keep.threadName}
                      onInput={(e) => edit((x) => renameThread(x, thread.id, e.currentTarget.value))}
                    />
                    <ol class="rm-list rm-thread-list">
                      {thread.items.map((id, i) => {
                        const k = byId.get(id)!;
                        return (
                          <li
                            key={id}
                            class={`${id === selected.id ? "rm-selected" : ""}${k.status === "cancelled" ? " rm-cancelled" : ""}`}
                          >
                            <span class="rm-num" aria-hidden="true">
                              {i + 1}
                            </span>
                            <button
                              type="button"
                              aria-current={id === selected.id ? "true" : undefined}
                              onClick={() => select(id)}
                            >
                              {k.name}
                              <span class="sr-only">. {t.keep.stepOf(i + 1, thread.items.length)}</span>
                            </button>
                            <Status k={k} />
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      <div class="rm-right">
        <section class="pane" aria-labelledby="rm-prompts-h">
          <h3 id="rm-prompts-h">{t.keep.projectPrompts}</h3>
          <p class="field rm-check">
            <input
              id="rm-show-templates"
              type="checkbox"
              checked={showTpl}
              onChange={(e) => setShowTpl(e.currentTarget.checked)}
            />{" "}
            <label for="rm-show-templates">{t.keep.showTemplates}</label>
          </p>
          <p class="field rm-check">
            <input
              id="rm-show-incomplete"
              type="checkbox"
              checked={showInc}
              onChange={(e) =>
                patchSettings({
                  roadmapShowIncomplete: e.currentTarget.checked,
                })
              }
            />{" "}
            <label for="rm-show-incomplete">{t.keep.showIncomplete}</label>
          </p>
          <p class="field">
            <label for="rm-project">{t.keep.project}</label>{" "}
            <select
              id="rm-project"
              value={project}
              onChange={(e) => {
                setChosen(e.currentTarget.value);
                if (listEl.current) listEl.current.scrollTop = 0;
                setSelectedId(null);
                setActiveThread(null);
              }}
            >
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </p>
          <div class="item-actions">
            <button type="button" id="rm-create" class="primary" onClick={create}>
              {t.keep.createEmpty}
            </button>
          </div>
          <ul
            ref={listEl}
            class={`rm-list${overList ? " rm-over" : ""}`}
            onScroll={(e) => {
              const top = e.currentTarget.scrollTop;
              // Debounced: scrolling fires far more often than a saved setting should change.
              window.clearTimeout(scrollTimer.current);
              scrollTimer.current = window.setTimeout(() => patchSettings({ roadmapListScroll: Math.round(top) }), 150);
            }}
            onDragOver={listOver}
            onDragLeave={() => setOverList(false)}
            onDrop={listDrop}
          >
            {unplaced.length === 0 && <li class="meta">{t.keep.noPromptsLeft}</li>}
            {unplaced.map((k) => (
              <li
                key={k.id}
                class={`${selectedId === k.id ? "rm-selected" : ""}${k.status === "cancelled" ? " rm-cancelled" : ""}`}
                {...dragProps(k.id)}
              >
                <button type="button" aria-pressed={selectedId === k.id} onClick={() => select(k.id)}>
                  {k.name}
                  {showTpl && (
                    <>
                      <span class="rm-tpl" aria-hidden="true" title={tplName(k)}>
                        {shorten(tplName(k), TEMPLATE_MAX)}
                      </span>
                      <span class="sr-only">
                        . {t.keep.template}: {tplName(k)}
                      </span>
                    </>
                  )}
                </button>
                <Status k={k} />
                {inc(k)}
              </li>
            ))}
          </ul>
          <p class="meta">{t.keep.dragHint}</p>
        </section>
      </div>
    </div>
  );
}

const tag = (show: boolean, text: string) =>
  show ? (
    <>
      <span class="tag">{text}</span>{" "}
    </>
  ) : null;

/** Dialog body: prompt name plus a project picked from earlier ones or typed. */
export function SaveKeepForm({
  projects,
  initial,
  onSave,
  close,
}: {
  projects: string[];
  initial?: { name: string; project: string } | null;
  /** Resolves false to keep the dialog open (overwrite declined). */
  onSave: (name: string, project: string) => boolean | Promise<boolean>;
  close: () => void;
}) {
  const { t } = useApp();
  const NEW = "";
  const [name, setName] = useState(initial?.name ?? "");
  const [choice, setChoice] = useState(
    initial && projects.includes(initial.project) ? initial.project : (projects[0] ?? NEW),
  );
  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState<{ name?: string; project?: string }>({});
  const creating = choice === NEW;

  const submit = async (e: Event) => {
    e.preventDefault();
    const n = name.trim();
    const p = (creating ? typed : choice).trim();
    const errs = {
      name: n ? undefined : t.keep.nameRequired,
      project: p ? undefined : t.keep.projectRequired,
    };
    setErrors(errs);
    if (errs.name || errs.project) return;
    if (await onSave(n, p)) close();
  };

  return (
    <form onSubmit={submit} noValidate>
      <div class="field">
        <label for="keep-name">{t.keep.promptName}</label>
        <input
          id="keep-name"
          type="text"
          data-initial
          value={name}
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "keep-name-err" : undefined}
          onInput={(e) => setName(e.currentTarget.value)}
        />
        {errors.name && (
          <p class="field-error" id="keep-name-err">
            {errors.name}
          </p>
        )}
      </div>
      {projects.length > 0 && (
        <div class="field">
          <label for="keep-project">{t.keep.project}</label>
          <select id="keep-project" value={choice} onChange={(e) => setChoice(e.currentTarget.value)}>
            {projects.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value={NEW}>{t.keep.newProject}</option>
          </select>
        </div>
      )}
      {creating && (
        <div class="field">
          <label for="keep-project-new">{t.keep.projectName}</label>
          <input
            id="keep-project-new"
            type="text"
            value={typed}
            aria-invalid={errors.project ? "true" : undefined}
            aria-describedby={errors.project ? "keep-project-err" : undefined}
            onInput={(e) => setTyped(e.currentTarget.value)}
          />
          {errors.project && (
            <p class="field-error" id="keep-project-err">
              {errors.project}
            </p>
          )}
        </div>
      )}
      <div class="actions">
        <button type="button" onClick={close}>
          {t.common.cancel}
        </button>
        <button type="submit" class="primary">
          {t.keep.save}
        </button>
      </div>
    </form>
  );
}

/** Dialog body: a template, a name and optionally a thread to append to. */
function CreateForm({
  templates,
  threads,
  taken,
  onCreate,
  close,
}: {
  templates: { id: string; name: string }[];
  threads: { id: string; name: string }[];
  taken: (name: string) => boolean;
  onCreate: (templateId: string, name: string, threadId: string) => void;
  close: () => void;
}) {
  const { t } = useApp();
  const [tpl, setTpl] = useState(templates[0]?.id ?? "");
  const [name, setName] = useState("");
  const [thread, setThread] = useState("");
  const [error, setError] = useState("");
  const submit = (e: Event) => {
    e.preventDefault();
    const n = name.trim();
    const err = !n ? t.keep.nameRequired : taken(n) ? t.keep.nameTaken : "";
    setError(err);
    if (err) return;
    onCreate(tpl, n, thread);
    close();
  };
  return (
    <form onSubmit={submit} noValidate>
      <div class="field">
        <label for="create-name">{t.keep.promptName}</label>
        <input
          id="create-name"
          type="text"
          data-initial
          value={name}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "create-name-err" : undefined}
          onInput={(e) => setName(e.currentTarget.value)}
        />
        {error && (
          <p class="field-error" id="create-name-err">
            {error}
          </p>
        )}
      </div>
      <div class="field">
        <label for="create-template">{t.keep.template}</label>
        <select id="create-template" value={tpl} onChange={(e) => setTpl(e.currentTarget.value)}>
          {templates.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </div>
      <div class="field">
        <label for="create-thread">{t.keep.thread}</label>
        <select id="create-thread" value={thread} onChange={(e) => setThread(e.currentTarget.value)}>
          <option value="">{t.keep.noThread}</option>
          {threads.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </div>
      <div class="actions">
        <button type="button" onClick={close}>
          {t.common.cancel}
        </button>
        <button type="submit" class="primary">
          {t.keep.create}
        </button>
      </div>
    </form>
  );
}

/** A button that opens a short list of actions (disclosure pattern); Esc or a click elsewhere closes it. */
function ActionMenu({
  id,
  label,
  ariaLabel,
  primary,
  disabled,
  items,
}: {
  id: string;
  label: ComponentChildren;
  ariaLabel?: string;
  primary?: boolean;
  disabled?: boolean;
  items: { label: string; run: () => void }[];
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => root.current && !root.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div class="menu" ref={root}>
      <button
        type="button"
        id={id}
        ref={trigger}
        class={primary ? "primary" : undefined}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onClick={() => setOpen(!open)}
      >
        {label} <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul class="menu-list" id={`${id}-list`}>
          {items.map((i) => (
            <li key={i.label}>
              <button
                type="button"
                onClick={() => {
                  // Run first: the clipboard write must start inside the click.
                  i.run();
                  setOpen(false);
                  trigger.current?.focus();
                }}
              >
                {i.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The prompt title; clicking it turns it into a field. Enter or leaving saves, Esc cancels. */
function RenameTitle({
  name,
  taken,
  onRename,
}: {
  name: string;
  taken: (name: string) => boolean;
  onRename: (name: string) => void;
}) {
  const { t } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState("");
  const field = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (editing) field.current?.select();
  }, [editing]);

  const commit = (leaving: boolean) => {
    const n = draft.trim();
    if (n === name) return setEditing(false);
    const err = !n ? t.keep.nameRequired : taken(n) ? t.keep.nameTaken : "";
    if (err && !leaving) return setError(err);
    // Leaving with an invalid name drops the edit rather than trapping the user.
    if (!err) onRename(n);
    setEditing(false);
    setError("");
  };

  if (!editing)
    return (
      <button
        type="button"
        class="rm-title-btn"
        title={t.keep.renameHint}
        aria-label={t.common.named(t.keep.rename, name)}
        onClick={() => {
          setDraft(name);
          setEditing(true);
        }}
      >
        {name}
      </button>
    );
  return (
    <>
      {/* The hidden copy of the text sizes the grid cell, so the field grows with it and wraps like the title. */}
      <div class="rm-grow" data-value={draft}>
        <textarea
          ref={field}
          class="rm-title-input"
          rows={1}
          value={draft}
          aria-label={t.keep.promptName}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "rm-title-err" : undefined}
          onInput={(e) => setDraft(e.currentTarget.value.replace(/\n/g, " "))}
          onBlur={() => commit(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit(false);
            } else if (e.key === "Escape") {
              e.preventDefault();
              setEditing(false);
              setError("");
            }
          }}
        />
      </div>
      {error && (
        <span class="field-error" id="rm-title-err">
          {error}
        </span>
      )}
    </>
  );
}

interface DownloadRow {
  id: string;
  name: string;
  parent: string | null;
  anchor: { name: string; done: boolean } | null;
  prompts: { id: string; name: string; issues: string[] }[];
}

/** Dialog body: which threads to include and how the agent should work. */
function DownloadForm({
  project,
  rows,
  initialOptions,
  initialExcluded,
  onChoices,
  preview,
  onDownload,
  close,
}: {
  project: string;
  rows: DownloadRow[];
  initialOptions: ArchiveOptions;
  initialExcluded: string[];
  /** Called when the choices change, so they can be remembered. */
  onChoices: (options: ArchiveOptions, excludedThreadIds: string[]) => void;
  preview: (threadIds: string[]) => string[];
  onDownload: (threadIds: string[], options: ArchiveOptions) => void;
  close: () => void;
}) {
  const { t } = useApp();
  const order = (parent: string | null, depth: number): { row: DownloadRow; depth: number }[] =>
    rows.filter((r) => r.parent === parent).flatMap((r) => [{ row: r, depth }, ...order(r.id, depth + 1)]);
  /** A thread needs its parent thread ticked, unless the prompt it branches from is already Completed. */
  const settle = (want: Set<string>) => {
    const on = new Set<string>();
    for (const { row } of order(null, 0))
      if (want.has(row.id) && (row.parent === null || on.has(row.parent) || row.anchor?.done)) on.add(row.id);
    return on;
  };
  const [picked, setPicked] = useState(() =>
    settle(new Set(rows.filter((r) => !initialExcluded.includes(r.id)).map((r) => r.id))),
  );
  const [options, setOptions] = useState<ArchiveOptions>(initialOptions);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChoices(
      options,
      rows.filter((r) => !picked.has(r.id)).map((r) => r.id),
    );
  }, [picked, options]);

  const toggle = (id: string) =>
    setPicked((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return settle(next);
    });

  const blockers = rows
    .filter((r) => picked.has(r.id))
    .flatMap((r) => r.prompts.filter((p) => p.issues.length > 0).map((p) => ({ thread: r.name, ...p })));
  const blocked = blockers.length > 0 || picked.size === 0;
  const set = (patch: Partial<ArchiveOptions>) => setOptions((o) => ({ ...o, ...patch }));

  const choices: { key: keyof ArchiveOptions; label: string; hint: string }[] = [
    {
      key: "rePrompt",
      label: t.keep.optRePrompt,
      hint: t.keep.optRePromptHint,
    },
    {
      key: "subAgents",
      label: t.keep.optSubAgents,
      hint: t.keep.optSubAgentsHint,
    },
    {
      key: "sharedContext",
      label: t.keep.optSharedContext,
      hint: t.keep.optSharedContextHint,
    },
    {
      key: "multiBranch",
      label: t.keep.optMultiBranch,
      hint: t.keep.optMultiBranchHint,
    },
    {
      key: "worktree",
      label: t.keep.optWorktree,
      hint: t.keep.optWorktreeHint,
    },
    { key: "pause", label: t.keep.optPause, hint: t.keep.optPauseHint },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!blocked) onDownload([...picked], options);
      }}
    >
      <p>{t.keep.downloadIntro(project)}</p>
      {picked.size === 0 && <p class="field-error">{t.keep.noThreadSelected}</p>}
      {blockers.length > 0 && (
        <div class="field-error" role="alert">
          <strong>{t.keep.blockedTitle}</strong>
          <p>{t.keep.blockedHelp}</p>
          <ul>
            {blockers.map((b) => (
              <li key={b.id}>{t.keep.blockedItem(b.thread, b.name, b.issues.join(", "))}</li>
            ))}
          </ul>
        </div>
      )}
      <fieldset class="dl-group">
        <legend>{t.keep.threadsLegend}</legend>
        {order(null, 0).map(({ row, depth }) => (
          <p class="dl-row" key={row.id} style={`margin-left:${depth * 1.5}rem`}>
            <input
              id={`dl-thread-${row.id}`}
              type="checkbox"
              checked={picked.has(row.id)}
              disabled={row.parent !== null && !picked.has(row.parent) && !row.anchor?.done}
              aria-describedby={row.anchor ? `dl-thread-${row.id}-note` : undefined}
              onChange={() => toggle(row.id)}
            />{" "}
            <label for={`dl-thread-${row.id}`}>
              {row.name} <span class="meta">({t.keep.promptCount(row.prompts.length)})</span>
            </label>
            {row.anchor && (
              <span class="meta dl-note" id={`dl-thread-${row.id}-note`}>
                {row.anchor.done ? t.keep.startsFromDone(row.anchor.name) : t.keep.needsParentDone(row.anchor.name)}
              </span>
            )}
          </p>
        ))}
      </fieldset>
      <fieldset class="dl-group">
        <legend>{t.keep.optionsLegend}</legend>
        {choices.map((c) => {
          // A worktree needs its own branch, so that option stays on; the shared brief only exists with sub-agents.
          const forced = c.key === "multiBranch" && options.worktree;
          const needsAgents = c.key === "sharedContext" && !options.subAgents;
          return (
            <div class="dl-row" key={c.key}>
              <input
                id={`dl-opt-${c.key}`}
                type="checkbox"
                checked={(options[c.key] && !needsAgents) || forced}
                disabled={forced || needsAgents}
                aria-describedby={`dl-opt-${c.key}-hint`}
                onChange={(e) => set({ [c.key]: e.currentTarget.checked })}
              />{" "}
              <label for={`dl-opt-${c.key}`}>{c.label}</label>
              <p class="meta" id={`dl-opt-${c.key}-hint`}>
                {c.hint}
              </p>
            </div>
          );
        })}
      </fieldset>
      <details class="dl-tree">
        <summary>{t.keep.structureTitle}</summary>
        <pre>{preview([...picked]).join("\n")}</pre>
      </details>
      <div class="actions">
        <button type="button" data-initial onClick={close}>
          {t.common.cancel}
        </button>
        <button type="submit" class="primary" disabled={blocked}>
          {t.keep.download}
        </button>
      </div>
    </form>
  );
}

/** Dialog body: paste the completion report an agent wrote, see what it changes, then apply it. */
function ImportCompletionForm({
  keeps,
  onApply,
  close,
}: {
  keeps: KeepItem[];
  onApply: (changes: Change[]) => void;
  close: () => void;
}) {
  const { t } = useApp();
  const [text, setText] = useState("");
  const parsed = parseCompletion(text);
  const plan = parsed.ok ? planCompletion(parsed.report, keeps) : null;
  const label = (s: KeepItem["status"]) => statusText(t, s) || t.keep.statusNone;
  const problem =
    text.trim() === ""
      ? ""
      : !parsed.ok
        ? { empty: "", notJson: t.keep.importNotJson, notReport: t.keep.importNotReport, newer: t.keep.importNewer }[
            parsed.error
          ]
        : "";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (plan && plan.changes.length > 0) onApply(plan.changes);
      }}
    >
      <p>{t.keep.importHelp}</p>
      <div class="field">
        <label for="import-text">{t.keep.importLabel}</label>
        <textarea
          id="import-text"
          rows={8}
          value={text}
          data-initial
          spellcheck={false}
          aria-invalid={problem ? "true" : undefined}
          aria-describedby="import-result"
          onInput={(e) => setText(e.currentTarget.value)}
        />
      </div>
      <div id="import-result" aria-live="polite">
        {problem && <p class="field-error">{problem}</p>}
        {plan && (
          <>
            {plan.changes.length === 0 ? (
              <p>{t.keep.importNothing}</p>
            ) : (
              <>
                <p>
                  <strong>{t.keep.importChanges(plan.changes.length)}</strong>
                </p>
                <ul class="import-list">
                  {plan.changes.map((c) => (
                    <li key={c.id}>
                      {c.name}: {label(c.from)} → {label(c.to)}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {plan.unknown.length > 0 && <p class="field-error">{t.keep.importUnknown(plan.unknown.join(", "))}</p>}
            {parsed.ok && parsed.report.skipped > 0 && (
              <p class="meta">{t.keep.importSkipped(parsed.report.skipped)}</p>
            )}
          </>
        )}
      </div>
      <div class="actions">
        <button type="button" onClick={close}>
          {t.common.cancel}
        </button>
        <button type="submit" class="primary" disabled={!plan || plan.changes.length === 0}>
          {t.keep.importApply}
        </button>
      </div>
    </form>
  );
}
