import type { Keep } from "./types";

/** The outcomes an agent can report for a prompt. */
export type ReportStatus = "completed" | "partial" | "not-done" | "cancelled";

export const COMPLETION_FORMAT = "prompter-completion";
export const COMPLETION_VERSION = 1;

export interface CompletionPrompt {
  id?: string;
  name?: string;
  thread: string;
  status: ReportStatus;
}

export interface Completion {
  project: string;
  prompts: CompletionPrompt[];
  /** Entries skipped for lacking a name or id, or for an unknown status. */
  skipped: number;
}

export type ParseResult =
  { ok: true; report: Completion } | { ok: false; error: "empty" | "notJson" | "notReport" | "newer" };

const STATUSES: ReportStatus[] = ["completed", "partial", "not-done", "cancelled"];

/** Accepts the JSON bare, in a code fence, or with a line of prose around it. */
function extractJson(text: string): unknown {
  const t = text.trim();
  const fenced = /^```[\w-]*\s*\n([\s\S]*?)\n```\s*$/.exec(t);
  const candidates = [fenced?.[1], t, t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1)];
  for (const c of candidates) {
    if (!c) continue;
    try {
      return JSON.parse(c);
    } catch {
      /* try the next shape */
    }
  }
  throw new Error("not json");
}

export function parseCompletion(text: string): ParseResult {
  if (text.trim() === "") return { ok: false, error: "empty" };
  let data: unknown;
  try {
    data = extractJson(text);
  } catch {
    return { ok: false, error: "notJson" };
  }
  const o = data as Record<string, unknown> | null;
  if (!o || typeof o !== "object" || o.format !== COMPLETION_FORMAT || !Array.isArray(o.threads))
    return { ok: false, error: "notReport" };
  if (typeof o.version === "number" && o.version > COMPLETION_VERSION) return { ok: false, error: "newer" };
  const prompts: CompletionPrompt[] = [];
  let skipped = 0;
  for (const th of o.threads as Record<string, unknown>[]) {
    const threadName = typeof th?.name === "string" ? th.name : typeof th?.path === "string" ? th.path : "";
    const list = Array.isArray(th?.prompts) ? (th.prompts as Record<string, unknown>[]) : [];
    for (const p of list) {
      const id = typeof p?.id === "string" && p.id !== "" ? p.id : undefined;
      const name = typeof p?.name === "string" && p.name !== "" ? p.name : undefined;
      const status = STATUSES.find((s) => s === p?.status);
      if ((!id && !name) || !status) skipped++;
      else prompts.push({ id, name, thread: threadName, status });
    }
  }
  return { ok: true, report: { project: typeof o.project === "string" ? o.project : "", prompts, skipped } };
}

/** What each reported outcome becomes in Prompter. Not done clears the status so the prompt can be sent again. */
export const STATUS_FOR: Record<ReportStatus, Keep["status"]> = {
  completed: "completed",
  cancelled: "cancelled",
  partial: "copied",
  "not-done": undefined,
};

export interface Change {
  id: string;
  name: string;
  from: Keep["status"];
  to: Keep["status"];
}

export interface Plan {
  changes: Change[];
  /** Reported prompts that already have that status. */
  unchanged: number;
  /** Names (or ids) of reported prompts that match nothing in Prompter. */
  unknown: string[];
}

/** Matches by prompt id, else by name within the report's project, and lists the status changes. */
export function planCompletion(report: Completion, keeps: Keep[]): Plan {
  const byId = new Map(keeps.map((k) => [k.id, k]));
  const changes: Change[] = [];
  const unknown: string[] = [];
  const seen = new Set<string>();
  let unchanged = 0;
  for (const p of report.prompts) {
    const k =
      (p.id ? byId.get(p.id) : undefined) ??
      keeps.find(
        (x) => p.name !== undefined && x.name === p.name && (report.project === "" || x.project === report.project),
      );
    if (!k) {
      unknown.push(p.name ?? p.id ?? "?");
      continue;
    }
    if (seen.has(k.id)) continue;
    seen.add(k.id);
    const to = STATUS_FOR[p.status];
    if (to === k.status) unchanged++;
    else changes.push({ id: k.id, name: k.name, from: k.status, to });
  }
  return { changes, unchanged, unknown };
}
