/** A branch of the plan: prompts in order, each building on the one before. */
export interface Thread {
  id: string;
  name: string;
  /** Keep ids, first to last. */
  items: string[];
  /** Prompt this thread branches from; null for a root thread. */
  from: string | null;
  side: "left" | "right";
}

/** One project's plan. */
export interface Roadmap {
  threads: Thread[];
  /** When a prompt went back to the list, so it shows first there. */
  returned: Record<string, number>;
}

export type Drop = "before" | "after" | "left" | "right";

export const emptyRoadmap = (): Roadmap => ({ threads: [], returned: {} });

export const placedIds = (rm: Roadmap): Set<string> => new Set(rm.threads.flatMap((t) => t.items));

export const threadOf = (rm: Roadmap, id: string): Thread | undefined => rm.threads.find((t) => t.items.includes(id));

/** "Thread n" for a root thread, "<parent> - n" for a branch; the lowest n not yet used. */
export function autoName(rm: Roadmap, from: string | null): string {
  const used = new Set(rm.threads.map((t) => t.name));
  const parent = from ? threadOf(rm, from) : undefined;
  const stem = from ? `${parent?.name.trim() || "Thread"} - ` : "Thread ";
  let n = 1;
  while (used.has(stem + n)) n++;
  return stem + n;
}

/** Takes a prompt out; threads anchored on it move to its predecessor so nothing else shifts. */
export function removePrompt(rm: Roadmap, id: string): Roadmap {
  const th = threadOf(rm, id);
  if (!th) return rm;
  const idx = th.items.indexOf(id);
  const items = th.items.filter((x) => x !== id);
  const anchor = items[idx - 1] ?? th.from;
  const threads = rm.threads
    .filter((t) => t.id !== th.id || items.length > 0)
    .map((t) => {
      if (t.id === th.id) return { ...t, items };
      return t.from === id ? { ...t, from: anchor } : t;
    });
  return { ...rm, threads };
}

/** Back to the project list, at its start. */
export function unplace(rm: Roadmap, id: string, now: number): Roadmap {
  const next = removePrompt(rm, id);
  return next === rm ? rm : { ...next, returned: { ...next.returned, [id]: now } };
}

/** Drops `id` next to `target`: before/after continue its thread, left/right start a new one. */
export function place(rm: Roadmap, id: string, target: string | null, pos: Drop, newThreadId: string): Roadmap {
  if (id === target) return rm;
  const base = removePrompt(rm, id);
  const returned = { ...base.returned };
  delete returned[id];
  const th = target ? threadOf(base, target) : undefined;
  if (!target || !th) {
    const name = autoName(base, null);
    return { returned, threads: [...base.threads, { id: newThreadId, name, items: [id], from: null, side: "right" }] };
  }
  if (pos === "left" || pos === "right") {
    const name = autoName(base, target);
    return { returned, threads: [...base.threads, { id: newThreadId, name, items: [id], from: target, side: pos }] };
  }
  const at = th.items.indexOf(target) + (pos === "after" ? 1 : 0);
  const threads = base.threads.map((t) =>
    t.id === th.id ? { ...t, items: [...t.items.slice(0, at), id, ...t.items.slice(at)] } : t,
  );
  return { returned, threads };
}

/** Adds to the end of a thread, or as a new root thread. */
export function append(rm: Roadmap, id: string, threadId: string | null, newThreadId: string): Roadmap {
  const th = rm.threads.find((t) => t.id === threadId);
  return th ? place(rm, id, th.items[th.items.length - 1], "after", newThreadId) : place(rm, id, null, "after", newThreadId);
}

export const renameThread = (rm: Roadmap, threadId: string, name: string): Roadmap => ({
  ...rm,
  threads: rm.threads.map((t) => (t.id === threadId ? { ...t, name } : t)),
});

/** Drops prompts that no longer exist (deleted, or from an import). */
export function prune(rm: Roadmap, valid: Set<string>): Roadmap {
  let out = rm;
  for (const id of placedIds(rm)) if (!valid.has(id)) out = removePrompt(out, id);
  return out;
}

export interface Cell {
  id: string;
  col: number;
  row: number;
  threadId: string;
  first: boolean;
}
export interface Layout {
  cells: Cell[];
  /** Branch lines: from an anchor prompt to the first prompt of the thread it starts. */
  edges: { from: string; to: string }[];
  cols: number;
  rows: number;
}

/** Threads are columns; a branch sits beside its anchor and starts on its row. */
export function layout(rm: Roadmap): Layout {
  const threads = rm.threads.filter((t) => t.items.length > 0);
  const owner = new Map<string, Thread>();
  for (const t of threads) for (const id of t.items) owner.set(id, t);
  const anchored = (t: Thread) => (t.from && owner.get(t.from) && owner.get(t.from) !== t ? t.from : null);

  const rowOf = (id: string, seen = new Set<string>()): number => {
    const t = owner.get(id)!;
    const a = anchored(t);
    if (!a || seen.has(t.id)) return t.items.indexOf(id);
    seen.add(t.id);
    return rowOf(a, seen) + t.items.indexOf(id);
  };
  const cols = new Map<string, number>();
  let next = 0;
  const visit = (t: Thread) => {
    if (cols.has(t.id)) return;
    cols.set(t.id, -1);
    const kids = (side: Thread["side"]) => threads.filter((c) => anchored(c) && owner.get(c.from!) === t && c.side === side);
    // Earliest branch nearest its parent.
    for (const c of kids("left").reverse()) visit(c);
    cols.set(t.id, next++);
    for (const c of kids("right")) visit(c);
  };
  for (const t of threads) if (!anchored(t)) visit(t);
  for (const t of threads) visit(t);

  const cells = threads.flatMap((t) =>
    t.items.map((id, i) => ({ id, col: cols.get(t.id)!, row: rowOf(id), threadId: t.id, first: i === 0 })),
  );
  const edges = threads.flatMap((t) => (anchored(t) ? [{ from: t.from!, to: t.items[0] }] : []));
  return { cells, edges, cols: next, rows: Math.max(0, ...cells.map((c) => c.row + 1)) };
}

const label = (s: string) => s.replace(/\s+/g, " ").trim().replace(/"/g, "#quot;");

/** Mermaid flowchart of the plan; blocks carry the prompt name only. */
export function toMermaid(rm: Roadmap, nameOf: (id: string) => string): string {
  const threads = rm.threads.filter((t) => t.items.length > 0);
  const ids = new Map<string, string>();
  for (const t of threads) for (const id of t.items) ids.set(id, `p${ids.size + 1}`);
  const node = (id: string) => `${ids.get(id)}["${label(nameOf(id))}"]`;
  const lines = ["flowchart TD"];
  threads.forEach((t, i) => {
    const named = label(t.name) !== "";
    const pad = named ? "    " : "  ";
    if (named) lines.push(`  subgraph t${i + 1}["${label(t.name)}"]`);
    for (const id of t.items) lines.push(pad + node(id));
    if (named) lines.push("  end");
  });
  for (const t of threads) {
    for (let i = 1; i < t.items.length; i++) lines.push(`  ${ids.get(t.items[i - 1])} --> ${ids.get(t.items[i])}`);
    if (t.from && ids.has(t.from) && ids.has(t.items[0]) && !t.items.includes(t.from))
      lines.push(`  ${ids.get(t.from)} --> ${ids.get(t.items[0])}`);
  }
  return lines.join("\n") + "\n";
}
