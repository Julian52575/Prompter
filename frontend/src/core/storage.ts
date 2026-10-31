import { BUILTIN_PROVIDERS } from "./builtins";
import { isValidTemplate } from "./lint";
import type { Draft, HistoryEntry, HistoryIndexRow, Provider, ReplyMode, Settings, Template, Wrapper } from "./types";

export const STORAGE_VERSION = 1;
export const EXPORT_VERSION = 1;
export const QUOTA_BYTES = 5 * 1024 * 1024;
const PREFIX = "pb.";

export const KEYS = {
  version: "pb.version",
  settings: "pb.settings",
  templates: "pb.templates",
  modes: "pb.modes",
  wrapper: "pb.wrapper",
  providers: "pb.providers",
  drafts: "pb.drafts",
  history: "pb.history",
  entry: (id: string) => `pb.h.${id}`,
} as const;

const RECORD_NAMES: Record<string, string> = {
  [KEYS.settings]: "settings",
  [KEYS.templates]: "templates",
  [KEYS.modes]: "reply modes",
  [KEYS.wrapper]: "review wrapper",
  [KEYS.providers]: "chatbot links",
  [KEYS.drafts]: "drafts",
  [KEYS.history]: "history index",
};
export const recordName = (key: string) =>
  RECORD_NAMES[key] ?? (key.startsWith("pb.h.") ? "history entry" : key);

export const MSG = {
  full: "Your last change was not saved because browser storage is full. Delete history entries or export your data to free space.",
  unavailable: "Storage is unavailable. Nothing will be kept after you close this page. Use Export to save your work.",
  newer: "This data was saved by a newer version of Prompt Builder. It is open read-only: nothing you change will be saved. Export still works.",
  migrationFailed: "Your saved data could not be upgraded to this version. It is open read-only: nothing you change will be saved. Export still works.",
  importFull: "Import failed: not enough storage. Nothing was changed.",
};

export interface Backend {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  keys(): string[];
}

export function localBackend(): Backend | null {
  try {
    const ls = window.localStorage;
    ls.setItem("pb.__probe", "1");
    ls.removeItem("pb.__probe");
    return {
      get: (k) => ls.getItem(k),
      set: (k, v) => ls.setItem(k, v),
      remove: (k) => ls.removeItem(k),
      keys: () => Array.from({ length: ls.length }, (_, i) => ls.key(i)!).filter(Boolean),
    };
  } catch {
    return null;
  }
}

export function memoryBackend(init: Record<string, string> = {}, quota = Infinity): Backend {
  const m = new Map(Object.entries(init));
  const size = () => [...m].reduce((n, [k, v]) => n + k.length + v.length, 0);
  return {
    get: (k) => m.get(k) ?? null,
    set: (k, v) => {
      const prev = m.get(k);
      m.set(k, v);
      if (size() > quota) {
        if (prev === undefined) m.delete(k);
        else m.set(k, prev);
        throw new DOMException("full", "QuotaExceededError");
      }
    },
    remove: (k) => void m.delete(k),
    keys: () => [...m.keys()],
  };
}

export type StoreMode = "ok" | "memory" | "readonly";
export interface Notice {
  id: string;
  kind: "alert" | "banner";
  text: string;
}

type Migration = (mem: Map<string, string>) => void;
/** MIGRATIONS[n] upgrades storage version n to n + 1. */
const MIGRATIONS: Record<number, Migration> = {};

export class Store {
  /** This tab's copy of every pb.* key: the app reads from here, never from the backend. */
  readonly mem = new Map<string, string>();
  mode: StoreMode = "ok";
  /** Corrupt records with no room for a copy: kept in memory, never overwritten. */
  private memOnly = new Set<string>();
  private failed = new Set<string>();
  private notices = new Map<string, Notice>();
  private listeners = new Set<(key: string | null, external: boolean) => void>();

  constructor(private backend: Backend | null) {
    this.load();
  }

  private load(): void {
    const b = this.backend;
    if (!b) {
      this.mode = "memory";
      this.notice({ id: "unavailable", kind: "banner", text: MSG.unavailable });
      return;
    }
    const raw = new Map<string, string>();
    for (const k of b.keys()) if (k.startsWith(PREFIX) && k !== "pb.__probe") raw.set(k, b.get(k) ?? "");
    const version = Number(raw.get(KEYS.version) ?? (raw.size ? 1 : STORAGE_VERSION));
    if (!(version <= STORAGE_VERSION)) {
      this.mode = "readonly";
      this.notice({ id: "readonly", kind: "banner", text: MSG.newer });
    }
    for (const [k, v] of raw) {
      if (k.startsWith("pb.corrupt.") || k === KEYS.version) {
        this.mem.set(k, v);
        continue;
      }
      try {
        JSON.parse(v);
        this.mem.set(k, v);
      } catch {
        this.quarantine(k, v);
      }
    }
    if (this.mode === "readonly") return;
    if (version < STORAGE_VERSION) {
      const next = new Map(this.mem);
      try {
        for (let v = version; v < STORAGE_VERSION; v++) MIGRATIONS[v](next);
        next.set(KEYS.version, String(STORAGE_VERSION));
      } catch {
        this.mode = "readonly";
        this.notice({ id: "readonly", kind: "banner", text: MSG.migrationFailed });
        return;
      }
      for (const [k, v] of next) if (this.mem.get(k) !== v) this.set(k, v, true);
    } else if (!raw.has(KEYS.version)) this.set(KEYS.version, String(STORAGE_VERSION), true);
    this.repairHistoryIndex();
  }

  private quarantine(key: string, value: string): void {
    const name = recordName(key);
    if (this.mode === "readonly") {
      this.memOnly.add(key);
      return;
    }
    const copy = `pb.corrupt.${key}.${Date.now()}`;
    try {
      this.backend!.set(copy, value);
      this.mem.set(copy, value);
      this.backend!.remove(key);
      this.notice({
        id: `corrupt-${key}`,
        kind: "alert",
        text: `The saved ${name} could not be read and was reset. A copy of the broken data is kept in Settings, Data.`,
      });
    } catch {
      this.memOnly.add(key);
      this.notice({
        id: `corrupt-${key}`,
        kind: "alert",
        text: `The saved ${name} could not be read, and there is no room to keep a copy. The broken data is left untouched; changes to the ${name} are kept in memory only.`,
      });
    }
  }

  private repairHistoryIndex(): void {
    const index = this.get<HistoryIndexRow[]>(KEYS.history, []);
    const entries = new Map<string, HistoryEntry>();
    for (const k of this.mem.keys())
      if (k.startsWith("pb.h.")) {
        const e = this.get<HistoryEntry | null>(k, null);
        if (e && typeof e.id === "string") entries.set(e.id, e);
      }
    const kept = index.filter((r) => entries.has(r.id));
    const known = new Set(kept.map((r) => r.id));
    for (const e of entries.values()) if (!known.has(e.id)) kept.push(indexRow(e));
    kept.sort((a, b) => b.createdAt - a.createdAt);
    if (JSON.stringify(kept) !== JSON.stringify(index) && (kept.length || this.mem.has(KEYS.history)))
      this.setJson(KEYS.history, kept);
  }

  // --- notices -------------------------------------------------------------

  notice(n: Notice): void {
    this.notices.set(n.id, n);
    this.emit(null);
  }
  dismiss(id: string): void {
    if (this.notices.delete(id)) this.emit(null);
  }
  getNotices(): Notice[] {
    return [...this.notices.values()];
  }

  // --- change events -------------------------------------------------------

  /** `external`: the change came from another tab. */
  subscribe(fn: (key: string | null, external: boolean) => void): () => void {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  }
  private emit(key: string | null, external = false): void {
    for (const fn of this.listeners) fn(key, external);
  }

  /** A `storage` event from another tab; `key` null means storage was cleared. */
  external(key: string | null, value: string | null): void {
    if (this.mode !== "ok") return;
    if (key === null) {
      this.mem.clear();
      for (const k of this.backend!.keys()) if (k.startsWith(PREFIX)) this.mem.set(k, this.backend!.get(k) ?? "");
    } else if (!key.startsWith(PREFIX) || this.memOnly.has(key)) return;
    else if (value === null) this.mem.delete(key);
    else this.mem.set(key, value);
    this.emit(key, true);
  }

  // --- reads and writes ----------------------------------------------------

  get<T>(key: string, fallback: T): T {
    const v = this.mem.get(key);
    if (v === undefined) return fallback;
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  }

  get writable(): boolean {
    return this.mode === "ok";
  }

  setJson(key: string, value: unknown): boolean {
    return this.set(key, JSON.stringify(value));
  }

  /** Updates this tab's copy, then persists it. False when the write did not reach storage. */
  set(key: string, value: string, quiet = false): boolean {
    this.mem.set(key, value);
    const ok = this.persist([key]);
    if (!quiet) this.emit(key);
    return ok;
  }

  remove(key: string): void {
    this.mem.delete(key);
    this.failed.delete(key);
    if (this.mode === "ok" && !this.memOnly.has(key))
      try {
        this.backend!.remove(key);
      } catch {
        // removing never needs room
      }
    this.emit(key);
  }

  /** Writes the given keys, retrying earlier failures first ("retry on the next change"). */
  private persist(keys: string[]): boolean {
    if (this.mode !== "ok") return false;
    let ok = true;
    for (const k of new Set([...this.failed, ...keys])) {
      if (this.memOnly.has(k)) continue;
      const v = this.mem.get(k);
      try {
        if (v === undefined) this.backend!.remove(k);
        else this.backend!.set(k, v);
        this.failed.delete(k);
      } catch {
        this.failed.add(k);
        if (keys.includes(k)) ok = false;
      }
    }
    if (this.failed.size) this.notice({ id: "full", kind: "alert", text: MSG.full });
    else this.dismiss("full");
    return ok;
  }

  /** All-or-nothing write; `null` removes. Restores every key if any write fails. */
  writeAll(changes: Map<string, string | null>): boolean {
    if (this.mode !== "ok") return false;
    const before = new Map<string, string | null>();
    for (const k of changes.keys()) before.set(k, this.backend!.get(k));
    try {
      for (const [k, v] of changes) {
        if (v === null) this.backend!.remove(k);
        else this.backend!.set(k, v);
      }
    } catch {
      for (const [k, v] of before)
        try {
          if (v === null) this.backend!.remove(k);
          else this.backend!.set(k, v);
        } catch {
          // restoring an earlier value fits: it was there before
        }
      return false;
    }
    for (const [k, v] of changes) {
      if (v === null) this.mem.delete(k);
      else this.mem.set(k, v);
      this.memOnly.delete(k);
      this.failed.delete(k);
    }
    this.emit(null);
    return true;
  }

  bytesUsed(): number {
    let n = 0;
    for (const [k, v] of this.mem) n += (k.length + v.length) * 2;
    return n;
  }

  corruptCopies(): { key: string; value: string }[] {
    return [...this.mem]
      .filter(([k]) => k.startsWith("pb.corrupt."))
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }
}

export function indexRow(e: HistoryEntry): HistoryIndexRow {
  const { id, createdAt, templateId, templateName, summary, edited } = e;
  return { id, createdAt, templateId, templateName, summary, edited };
}

export function formatMeter(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  const used = mb < 0.1 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${mb.toFixed(1)} MB`;
  return `Storage used: about ${used} of 5 MB`;
}

// --- typed records -----------------------------------------------------------

export const DEFAULT_SETTINGS: Settings = { theme: "system", lastTemplate: null, dismissed: [], confirmedProviders: [] };

export const repo = (s: Store) => ({
  settings: (): Settings => ({ ...DEFAULT_SETTINGS, ...s.get<Partial<Settings>>(KEYS.settings, {}) }),
  templates: () => s.get<Record<string, Template>>(KEYS.templates, {}),
  modes: () => s.get<Record<string, ReplyMode>>(KEYS.modes, {}),
  wrapper: () => s.get<Wrapper | null>(KEYS.wrapper, null),
  providers: () => s.get<Partial<Record<string, Partial<Provider>>>>(KEYS.providers, {}),
  drafts: () => s.get<Record<string, Draft>>(KEYS.drafts, {}),
  historyIndex: () => s.get<HistoryIndexRow[]>(KEYS.history, []),
  entry: (id: string) => s.get<HistoryEntry | null>(KEYS.entry(id), null),
});

export function updateRecord<T extends object>(s: Store, key: string, fallback: T, fn: (v: T) => T): boolean {
  return s.setJson(key, fn(s.get<T>(key, fallback)));
}

export function addHistoryEntry(s: Store, e: HistoryEntry): void {
  // The entry first, then the index: a crash between the two is repaired on load.
  s.setJson(KEYS.entry(e.id), e);
  updateRecord<HistoryIndexRow[]>(s, KEYS.history, [], (idx) => [indexRow(e), ...idx.filter((r) => r.id !== e.id)]);
}

export function saveHistoryEntry(s: Store, e: HistoryEntry): void {
  s.setJson(KEYS.entry(e.id), e);
  updateRecord<HistoryIndexRow[]>(s, KEYS.history, [], (idx) => idx.map((r) => (r.id === e.id ? indexRow(e) : r)));
}

export function deleteHistoryEntries(s: Store, ids: string[]): void {
  const set = new Set(ids);
  updateRecord<HistoryIndexRow[]>(s, KEYS.history, [], (idx) => idx.filter((r) => !set.has(r.id)));
  for (const id of ids) s.remove(KEYS.entry(id));
}

// --- export and import ---------------------------------------------------------

export interface ExportFile {
  app: "prompt-builder";
  exportVersion: number;
  storageVersion: number;
  exportedAt: string;
  settings: Settings;
  templates: Record<string, Template>;
  modes: Record<string, ReplyMode>;
  wrapper: Wrapper | null;
  providers: Record<string, Partial<Provider>>;
  drafts: Record<string, Draft>;
  history: HistoryEntry[];
}

export function exportData(s: Store, now = new Date()): ExportFile {
  const r = repo(s);
  return {
    app: "prompt-builder",
    exportVersion: EXPORT_VERSION,
    storageVersion: STORAGE_VERSION,
    exportedAt: now.toISOString(),
    settings: r.settings(),
    templates: r.templates(),
    modes: r.modes(),
    wrapper: r.wrapper(),
    providers: r.providers() as Record<string, Partial<Provider>>,
    drafts: r.drafts(),
    history: r
      .historyIndex()
      .map((row) => r.entry(row.id))
      .filter((e): e is HistoryEntry => e !== null),
  };
}

export function exportFileName(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `prompt-builder-export-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`;
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

export function validateExport(data: unknown, knownModes: string[]): string[] {
  if (!isObj(data) || data.app !== "prompt-builder") return ["This is not a Prompt Builder export file."];
  const p: string[] = [];
  if (typeof data.storageVersion !== "number") p.push("The file has no storage version.");
  else if (data.storageVersion > STORAGE_VERSION)
    return [`The file was exported by a newer version of Prompt Builder (storage version ${data.storageVersion}).`];
  if (typeof data.exportVersion !== "number" || data.exportVersion > EXPORT_VERSION) p.push("Unsupported export version.");
  if (!isObj(data.settings)) p.push("Settings are missing.");
  for (const k of ["templates", "modes", "providers", "drafts"] as const)
    if (!isObj(data[k])) p.push(`"${k}" must be an object.`);
  if (data.wrapper !== null && !(isObj(data.wrapper) && typeof data.wrapper.text === "string"))
    p.push("The review wrapper is malformed.");
  if (!Array.isArray(data.history)) p.push('"history" must be a list.');
  if (p.length) return p;
  const modeIds = [...knownModes, ...Object.keys(data.modes as Obj)];
  for (const [id, t] of Object.entries(data.templates as Obj))
    if (!isValidTemplate(t, modeIds) || (t as Template).id !== id) p.push(`Template "${id}" is invalid.`);
  for (const [id, m] of Object.entries(data.modes as Obj))
    if (!isObj(m) || m.id !== id || typeof m.label !== "string" || typeof m.instruction !== "string")
      p.push(`Reply mode "${id}" is invalid.`);
  for (const [id, d] of Object.entries(data.drafts as Obj))
    if (!isObj(d) || !isObj(d.values) || typeof d.output !== "string") p.push(`The draft for "${id}" is invalid.`);
  (data.history as unknown[]).forEach((e, i) => {
    if (
      !isObj(e) ||
      typeof e.id !== "string" ||
      typeof e.createdAt !== "number" ||
      typeof e.templateId !== "string" ||
      typeof e.prompt !== "string" ||
      typeof e.generated !== "string" ||
      !isObj(e.inputs)
    )
      p.push(`History entry ${i + 1} is invalid.`);
  });
  return p;
}

/** Ids in the file that already exist here (templates, modes, drafts). */
export function importConflicts(s: Store, f: ExportFile): string[] {
  const r = repo(s);
  const out: string[] = [];
  for (const [label, mine, theirs] of [
    ["template", r.templates(), f.templates],
    ["reply mode", r.modes(), f.modes],
    ["draft", r.drafts(), f.drafts],
  ] as const)
    for (const id of Object.keys(theirs)) if (id in mine) out.push(`${label} ${id}`);
  return out;
}

export function importData(s: Store, f: ExportFile, how: "replace" | "merge", overwrite = false): boolean {
  const changes = new Map<string, string | null>();
  const j = (v: unknown) => JSON.stringify(v);
  if (how === "replace") {
    for (const k of s.mem.keys()) if (!k.startsWith("pb.corrupt.")) changes.set(k, null);
    changes.set(KEYS.version, String(STORAGE_VERSION));
    changes.set(KEYS.settings, j(f.settings));
    changes.set(KEYS.templates, j(f.templates));
    changes.set(KEYS.modes, j(f.modes));
    if (f.wrapper) changes.set(KEYS.wrapper, j(f.wrapper));
    changes.set(KEYS.providers, j(f.providers));
    changes.set(KEYS.drafts, j(f.drafts));
    for (const e of f.history) changes.set(KEYS.entry(e.id), j(e));
    changes.set(KEYS.history, j(f.history.map(indexRow).sort((a, b) => b.createdAt - a.createdAt)));
  } else {
    const r = repo(s);
    const merge = <T>(mine: Record<string, T>, theirs: Record<string, T>) => {
      const out = { ...mine };
      for (const [id, v] of Object.entries(theirs)) if (overwrite || !(id in mine)) out[id] = v;
      return out;
    };
    changes.set(KEYS.templates, j(merge(r.templates(), f.templates)));
    changes.set(KEYS.modes, j(merge(r.modes(), f.modes)));
    changes.set(KEYS.drafts, j(merge(r.drafts(), f.drafts)));
    const index = r.historyIndex();
    const have = new Set(index.map((x) => x.id));
    const added = f.history.filter((e) => !have.has(e.id));
    for (const e of added) changes.set(KEYS.entry(e.id), j(e));
    changes.set(KEYS.history, j([...index, ...added.map(indexRow)].sort((a, b) => b.createdAt - a.createdAt)));
  }
  return s.writeAll(changes);
}

export function providerList(s: Store): Provider[] {
  const o = repo(s).providers();
  return BUILTIN_PROVIDERS.map((p) => ({ ...p, ...o[p.id], id: p.id, company: p.company, host: p.host }));
}
