import { threadOf, toMermaid, type Roadmap, type Thread } from "./roadmap";

/** Choices that become wording in the archive's AGENTS.md. */
export interface ArchiveOptions {
  rePrompt: boolean;
  subAgents: boolean;
  /** Only meaningful with sub-agents: they share one short brief instead of each exploring the project. */
  sharedContext: boolean;
  multiBranch: boolean;
  worktree: boolean;
  pause: boolean;
}

export const DEFAULT_ARCHIVE_OPTIONS: ArchiveOptions = {
  rePrompt: false,
  subAgents: false,
  sharedContext: false,
  multiBranch: false,
  worktree: false,
  pause: false,
};

export interface ArchivePrompt {
  name: string;
  /** Final text of Prompt.md after the front matter. */
  text: string;
  status?: "copied" | "completed" | "cancelled" | "downloaded";
}

export interface ArchiveInput {
  project: string;
  /** Only the threads to include; a thread whose anchor is missing becomes a root. */
  roadmap: Roadmap;
  prompts: Record<string, ArchivePrompt>;
  /** Prompts a root thread branches from that are finished and not in the archive, by prompt id. */
  external?: Record<string, { name: string; thread: string }>;
  /** Helper scripts to bundle, with paths like `scripts/shared/README.tsv`. */
  scripts?: ArchiveFile[];
  options: ArchiveOptions;
}

export interface ArchiveFile {
  path: string;
  content: string;
}

interface Node {
  thread: Thread;
  name: string;
  dir: string;
  branch: string;
  worktree: string;
  anchorPath: string | null;
  /** The finished prompt outside the archive this thread starts from, if any. */
  prereq: { name: string; thread: string } | null;
  prompts: { id: string; path: string }[];
  children: Node[];
}

const RESERVED = /^(con|prn|aux|nul|com\d|lpt\d)$/i;

/** Letters and digits only, so the name is safe on every file system. */
function safe(name: string, max: number): string {
  return name
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
}

function unique(base: string, used: Set<string>): string {
  let out = base;
  for (let n = 2; used.has(out.toLowerCase()); n++) out = `${base}-${n}`;
  used.add(out.toLowerCase());
  return out;
}

function threadSlug(name: string, fallback: string): string {
  let s = safe(name, 40).toLowerCase() || fallback;
  if (RESERVED.test(s)) s += "-thread";
  // A leading "01-" would read as a prompt folder.
  if (/^\d+-/.test(s)) s = `t-${s}`;
  return s;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** The folder tree, branches nested in the thread they leave. */
function layoutNodes(input: ArchiveInput): Node[] {
  const rm = input.roadmap;
  const known = new Set(Object.keys(input.prompts));
  const threads = rm.threads
    .map((t) => ({ ...t, items: t.items.filter((id) => known.has(id)) }))
    .filter((t) => t.items.length > 0);
  const clean: Roadmap = { threads, returned: {} };
  const parentOf = (t: Thread) => {
    const p = t.from ? threadOf(clean, t.from) : undefined;
    return p && p.id !== t.id ? p : undefined;
  };
  const projectSlug = safe(input.project, 30).toLowerCase() || "project";
  const branches = new Set<string>();
  const fallbackFor = new Map<string | null, number>();

  const build = (t: Thread, parent: Node | null, used: Set<string>): Node => {
    const key = parent ? parent.thread.id : null;
    const n = (fallbackFor.get(key) ?? 0) + 1;
    fallbackFor.set(key, n);
    const slug = unique(threadSlug(t.name, `thread-${n}`), used);
    const dir = parent ? `${parent.dir}/${slug}` : slug;
    const branch = unique(`${projectSlug}/${dir.replace(/\//g, "-")}`, branches);
    const promptDirs = new Set<string>();
    const prompts = t.items.map((id, i) => {
      const folder = unique(`${pad(i + 1)}-${safe(input.prompts[id].name, 40) || "prompt"}`, promptDirs);
      return { id, path: `${dir}/${folder}/Prompt.md` };
    });
    const node: Node = {
      thread: t,
      name: t.name.trim() || slug,
      dir,
      branch,
      worktree: dir.replace(/\//g, "-"),
      anchorPath: null,
      prereq: !parent && t.from ? (input.external?.[t.from] ?? null) : null,
      prompts,
      children: [],
    };
    const childUsed = new Set<string>(prompts.map((p) => p.path.split("/").slice(-2)[0].toLowerCase()));
    for (const c of threads.filter((x) => parentOf(x)?.id === t.id)) node.children.push(build(c, node, childUsed));
    return node;
  };

  const rootUsed = new Set<string>();
  return threads.filter((t) => !parentOf(t)).map((t) => build(t, null, rootUsed));
}

function flatten(nodes: Node[]): Node[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children)]);
}

const STATUS_WORD = {
  copied: "in-progress",
  completed: "completed",
  cancelled: "cancelled",
  downloaded: "downloaded",
} as const;

function frontMatter(
  id: string,
  node: Node,
  index: number,
  previous: string | null,
  status: ArchivePrompt["status"],
): string {
  const q = (v: string) => JSON.stringify(v);
  // The project and thread path are in AGENTS.md and the file's own path, so they are not repeated per prompt.
  return [
    "---",
    `id: ${q(id)}`,
    `thread: ${q(node.name)}`,
    `step: ${q(`${index + 1} of ${node.prompts.length}`)}`,
    `builds-on: ${previous ? q(previous) : "none"}`,
    ...(index === 0 && node.prereq
      ? [`prerequisite: ${q(`${node.prereq.name} (thread ${node.prereq.thread}); done, not in this archive`)}`]
      : []),
    ...(status ? [`status: ${STATUS_WORD[status]}`] : []),
    "---",
    "",
  ].join("\n");
}

function optionLines(o: ArchiveOptions, worktrees: number): string[] {
  const lines: string[] = [];
  lines.push(
    o.rePrompt
      ? "- **Re-prompt first: ON.** Each `Prompt.md` is a Re-Prompt Request for you: review the prompt, write the revised version, carry out that, not the original. If the revision changes the scope, say so before acting."
      : "- **Re-prompt first: OFF.** Carry out each prompt as written.",
  );
  lines.push(
    o.subAgents
      ? `- **Sub-agent delegation: ON.** You orchestrate and are my only contact; sub-agents report to you, never to me. Use your sub-agent mechanism (Claude Code: the Agent tool). A sub-agent knows only its briefing, so make it self-contained: goal, the path of its \`Prompt.md\` (it reads it; never paste prompt text through your context), the paths of the prompts it builds on, branch and worktree, the brief's path if any, the rules here that apply, the return format. Typically one per thread. Run the pre-flight first (see First), then continue those sub-agents with my answers (Claude Code: SendMessage). Keep each sub-agent's identifier so you can resume it; if one cannot be resumed, start a new one with its briefing, my answers and the brief if any. Start independent threads together in one batch; start a prompt that builds on another only after you have checked that result. Use the lightest model that can do the job. Bring sub-agents' questions and decisions to me yourself, with context; no guessing on what matters. The same git and worktree rules apply to them; they never push, merge or open pull requests. **Return format:** completion entries (the \`prompts\` objects of the record, as JSON) plus at most five lines of open questions; you merge entries as they arrive. Your final report covers what each did. If you cannot delegate, work alone, one prompt at a time, reading every prompt first (see First), and say so.${o.rePrompt ? " The re-prompt step runs inside the sub-agent; its return says only whether the revision changed the scope." : ""}`
      : "- **Sub-agent delegation: OFF.** Do all the work yourself, one prompt at a time.",
  );
  if (o.subAgents) {
    lines.push(
      o.sharedContext
        ? "- **Shared context: ON.** Share one short brief, not your context. After First and before delegating, explore the project once and write it (about 60 lines): layout, conventions, build, test and lint commands, decisions so far. Keep it as `agent-brief.md` in the git directory (`git rev-parse --git-common-dir`: shared by all worktrees, never committed), or in a file outside the project if that is not possible. Give each sub-agent the brief's absolute path, its prompt paths and nothing else of your context. Each adds one line for anything new the others need. Pass on their returns, not transcripts."
        : "- **Shared context: OFF.** Give each sub-agent the context its prompt needs.",
    );
  }
  const branches = o.multiBranch || o.worktree;
  lines.push(
    branches
      ? "- **Git branches: ON.** Use the repository you were given; if there is none, stop and ask me. One branch per thread, named in the Plan: a root thread's from the current branch, a branch's from the commit that completed the prompt it starts from. One commit per prompt, message `<thread name>: <prompt name>`. Never push, merge, rebase or open a pull request unless I ask."
      : "- **Git branches: OFF.** Stay on the current branch; commit only if I ask.",
  );
  lines.push(
    o.worktree
      ? `- **Worktrees: ON** (needs git branches). Work each thread in its own git worktree on its branch at the Plan's path (relative to the repository root, outside it; \`<repository>\` is its folder name), made with your tool's worktree isolation if it supports that path and branch (Claude Code: the Agent tool's isolation), else \`git worktree add\`. Never two threads in one directory. This plan needs ${worktrees} worktree${worktrees === 1 ? "" : "s"}. Before the first, estimate the space (working tree size without \`.git\` times the worktrees that will exist at once) against the free disk space; if short or unknown, stop, report the figures and wait for me. Remove worktrees only when I ask.`
      : "- **Worktrees: OFF.** Work in the repository's own directory.",
  );
  lines.push(
    o.pause
      ? "- **Pauses: ON.** After each prompt, summarise what you did and the state, and wait for my approval before the next. With parallel threads, report each prompt as it finishes and start nothing that builds on it until I approve."
      : "- **Pauses: OFF.** Continue without waiting; stop only if blocked or a prompt says so.",
  );
  return lines;
}

function firstLines(o: ArchiveOptions, hasScripts: boolean): string[] {
  const scripts = hasScripts ? "; permission to run the scripts (see Scripts)" : "";
  if (!o.subAgents)
    return [
      "## First: settle uncertainties",
      "",
      `Before starting, read this file, \`Roadmap.mmd\` and every \`Prompt.md\`. Settle every uncertainty with me in one message (unclear, conflicting or incomplete prompts; the repository and tools; options or rules you cannot follow${scripts}) and wait for my answers. Start nothing until then.`,
      "",
    ];
  return [
    "## First: settle uncertainties",
    "",
    `Before any real work, settle every uncertainty with me. Read only this file, \`Roadmap.mmd\` and the Plan, not the prompts. Run a read-only pre-flight: give each sub-agent only the paths of its own prompts to read in full and report on, never to act (a general-purpose agent told not to edit, not a search-only one; the lightest model that reads carefully). It changes nothing: no edits, branches, commits, worktrees or scripts${o.rePrompt ? ", no revised prompts" : ""}. Each returns only questions and assumptions: unclear, conflicting or incomplete prompts, and what it cannot do. Merge them with your own questions about the repository, tools and options${scripts}, and ask me once, in one message. Wait for my answers. Start nothing until then; continue the same sub-agents with the answers so they do not read everything again.`,
    "",
  ];
}

function completionLines(input: ArchiveInput, all: Node[], branches: boolean): string[] {
  const slug = safe(input.project, 30).toLowerCase() || "project";
  const first = all[0];
  const q = (v: string) => JSON.stringify(v);
  const example = `{
  "format": "prompter-completion",
  "version": 1,
  "project": ${q(input.project)},
  "date": "YYYY-MM-DD",
  "agent": "optional",
  "threads": [{
    "path": ${q(first?.dir ?? "thread-1")}, "name": ${q(first?.name ?? "Thread 1")},
    "branch": null, "worktree": null, "startsFrom": null,
    "prompts": [{
      "id": "from the front matter", "name": "prompt name",
      "status": "completed | partial | not-done | cancelled",
      "summary": "1 to 3 sentences", "proof": "evidence the prompt asks for, or null",
      "pitfalls": ["problem met, and how it was handled"], "commits": ["<sha> <message>"],
      "files": ["main files changed"], "notes": "anything else needed to retrace the work, or null"
    }]
  }]
}`;
  return [
    "## Completion record",
    "",
    "Keep a trace as you work: per prompt, what was done, problems met, proof, branch, commits. Recording outcomes is the last task of every sub-agent, and of you when alone; merge sub-agent entries as they arrive, never from memory.",
    "",
    `At the end write two mandatory files in \`docs/prompter-project/${slug}-<date>/\` at the repository root (\`<date>\` is today, YYYY-MM-DD) unless I name another folder, apart from the repository's own docs (do not edit those):`,
    "",
    "- `completion.json`: valid JSON only, format below. I paste it into Prompter, which finds prompts by `id` and updates their status.",
    "- `roadmap.mmd`: `Roadmap.mmd` plus, appended, `classDef completed fill:#d4edda,stroke:#2f7d32;` `classDef partial fill:#fff3cd,stroke:#a06a00;` `classDef notdone fill:#eee,stroke:#888;` `classDef cancelled fill:#f8d7da,stroke:#b02a37;` and one `class pN <outcome>;` line per prompt node (`not-done` is written `notdone`).",
    "",
    "```json",
    example,
    "```",
    "",
    `\`branch\`, \`worktree\` and \`startsFrom\` (the id of the prompt the thread branches from) may be null. List every prompt, even those not done. Be factual and short; leave out what git shows. \`partial\` means started, not finished; \`cancelled\` only if I said so. \`completed\` only when the proof the prompt defines, if any, is met; record it. ${branches ? "Commit both files in their own commit on the branch you started from." : "Leave both uncommitted unless I ask."} Write a Markdown version only if I ask, following the repository's documentation conventions (\`scripts/shared/completion_to_md.py\` can draft it).`,
    "",
  ];
}

function scriptLines(): string[] {
  return [
    "## Scripts",
    "",
    "`scripts/shared/` holds helper scripts (Python 3 standard library, listed in `README.tsv`) from outside your repository.",
    "",
    "1. Read `scripts/shared/LIABILITY.md` in full before using or recreating any. Mandatory.",
    "2. Ask me for permission to run them, saying what they do. Run none, and let no sub-agent run any, until I say yes.",
    "3. If I say no or do not answer, delete the `.py` files; keep `README.tsv` and `LIABILITY.md`. You may recreate a script from its `README.tsv` description.",
    "4. If yes, run them only as `README.tsv` describes, on this project's files only.",
    "",
  ];
}

function agentsMd(input: ArchiveInput, nodes: Node[]): string {
  const all = flatten(nodes);
  const total = all.reduce((n, t) => n + t.prompts.length, 0);
  const o = input.options;
  const prereqs = all.filter((n) => n.prereq);
  const branches = o.multiBranch || o.worktree;
  const hasScripts = (input.scripts?.length ?? 0) > 0;
  const one = (v: string) => v.replace(/\s+/g, " ");
  const plan = all.flatMap((n) => {
    const from = n.anchorPath
      ? `\`${n.anchorPath}\``
      : n.prereq
        ? `"${one(n.prereq.name)}" of thread "${one(n.prereq.thread)}", already done and not in this archive`
        : "nothing";
    const rows = [
      `### ${one(n.name)} (\`${n.dir}\`)`,
      [
        `Starts from: ${from}.`,
        branches ? `Branch: \`${n.branch}\`.` : "",
        o.worktree ? `Worktree: \`../<repository>-worktrees/${n.worktree}\`.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    ];
    n.prompts.forEach((p, i) => {
      const st = input.prompts[p.id].status;
      const folder = p.path.split("/").slice(-2)[0];
      rows.push(`${i + 1}. ${one(input.prompts[p.id].name)} (\`${folder}\`)${st ? `, ${STATUS_WORD[st]}` : ""}`);
    });
    rows.push("");
    return rows;
  });

  return [
    "# AGENTS.md",
    "",
    `Project "${one(input.project)}": ${total} prompt${total === 1 ? "" : "s"} in ${all.length} thread${all.length === 1 ? "" : "s"}, exported from Prompter. Implement them in the order the rules allow. Paths are relative to this file's folder. This file covers this folder only: never merge it into or overwrite the repository's AGENTS.md. Do not edit or commit the archive's files.`,
    "",
    ...firstLines(o, hasScripts),
    "## Structure",
    "",
    "- `Roadmap.mmd`: Mermaid flowchart of the plan, the source of truth for order. Nodes are prompts, subgraphs are threads; an arrow goes from a prompt to the next in its thread, or from a branch point to the branch's first prompt. `%%` lines map node ids to files.",
    "- A thread is a folder holding its prompts as `<NN>-<name>/Prompt.md` (NN is the order) and, nested, the threads branching from it.",
    "- `Prompt.md` front matter: `id` (use it in the completion record), `thread`, `step`, `builds-on` (path of the prompt it follows, or `none`), `prerequisite` (a thread starting from a finished prompt outside this archive), `status` (`in-progress`, `completed`, `cancelled`, `downloaded`; absent means not started).",
    "",
    "## Rules",
    "",
    "1. A thread's prompts run in order; each may rely on the earlier ones.",
    "2. A branch's first prompt builds on the prompt it branches from (`builds-on` or `prerequisite`). Start it only once that prompt is done (finished and, with git branches on, committed), from its result, not later work.",
    "3. Then the branch and its parent thread are independent: neither waits for the other, and the branch must not rely on prompts after its start point. Without git branches you cannot return to that state: build on the repository as it is and say so.",
    "4. Unrelated threads are independent. Each prompt is standalone; take only the work earlier prompts produced.",
    "5. `in-progress`: someone may have started it; check the repository for existing work first.",
    "",
    ...(prereqs.length > 0
      ? [
          "## Prompts finished before this archive",
          "",
          ...prereqs.map(
            (n) => `- \`${n.dir}\` starts from "${one(n.prereq!.name)}" (thread "${one(n.prereq!.thread)}")`,
          ),
          "",
          "Before starting such a thread, find out what that work did from what you have: the repository's state, git history (`git log`, branch names), notes or reports from earlier work, the prompt's name. Verify, do not assume. If you cannot establish it is in place, stop and ask me.",
          "",
        ]
      : []),
    "## Procedure",
    "",
    "When settled, list the prompts in run order and do what each `Prompt.md` asks, nothing more. If one proves ambiguous, contradicts the code or cannot be done, stop on it and ask me. Record each outcome as below.",
    "",
    "## Options",
    "",
    ...optionLines(o, all.length),
    "",
    ...completionLines(input, all, branches),
    ...(hasScripts ? scriptLines() : []),
    "## Plan",
    "",
    ...plan,
  ].join("\n");
}

/** Every file of the archive, in the order they are written. */
export function buildArchive(input: ArchiveInput): ArchiveFile[] {
  const nodes = layoutNodes(input);
  const pathOf = new Map<string, string>();
  for (const n of flatten(nodes)) for (const p of n.prompts) pathOf.set(p.id, p.path);
  for (const n of flatten(nodes))
    for (const c of n.children) {
      const from = c.thread.from;
      c.anchorPath = from ? (pathOf.get(from) ?? null) : null;
    }

  const files: ArchiveFile[] = [];
  const mermaid = toMermaid(
    { threads: flatten(nodes).map((n) => ({ ...n.thread, items: n.prompts.map((p) => p.id) })), returned: {} },
    (id) => input.prompts[id].name,
    (id) => pathOf.get(id) ?? "",
    flatten(nodes)
      .filter((n) => n.prereq)
      .map((n) => `thread ${n.dir} starts from "${n.prereq!.name}", finished and not in this archive`),
  );
  // Everything sits in one folder, so unzipping never overwrites a repository's own AGENTS.md.
  const root = `Project-${safe(input.project, 40) || "project"}/`;
  files.push({ path: "AGENTS.md", content: agentsMd(input, nodes) + "\n" });
  files.push({ path: "Roadmap.mmd", content: mermaid });
  for (const n of flatten(nodes)) {
    n.prompts.forEach((p, i) => {
      const previous = i > 0 ? n.prompts[i - 1].path : n.anchorPath;
      const prompt = input.prompts[p.id];
      files.push({
        path: p.path,
        content: frontMatter(p.id, n, i, previous, prompt.status) + "\n" + prompt.text.replace(/\n*$/, "\n"),
      });
    });
  }
  for (const f of input.scripts ?? []) files.push(f);
  return files.map((f) => ({ ...f, path: root + f.path }));
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of data) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** A ZIP with every file stored uncompressed: valid everywhere and needs no library. Names are UTF-8. */
export function zipStore(files: ArchiveFile[], now = new Date()): Uint8Array {
  const enc = new TextEncoder();
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const date = ((Math.max(now.getFullYear(), 1980) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.path);
    const data = enc.encode(f.content);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(10, time, true);
    lv.setUint16(12, date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);
    const entry = new Uint8Array(46 + name.length);
    const cv = new DataView(entry.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(12, time, true);
    cv.setUint16(14, date, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    entry.set(name, 46);
    parts.push(local, data);
    central.push(entry);
    offset += local.length + data.length;
  }
  const size = central.reduce((n, c) => n + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, size, true);
  ev.setUint32(16, offset, true);
  const all = [...parts, ...central, end];
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of all) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** The paths as an indented tree (box-drawing characters), folders first-seen order, for a preview. */
export function treeLines(root: string, paths: string[]): string[] {
  type Dir = Map<string, Dir | null>;
  const top: Dir = new Map();
  for (const path of paths) {
    const parts = path.split("/");
    let dir = top;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) dir.set(part, null);
      else {
        let next = dir.get(part);
        if (!next) dir.set(part, (next = new Map()));
        dir = next;
      }
    });
  }
  const lines = [root];
  const walk = (dir: Dir, prefix: string) => {
    const entries = [...dir];
    entries.forEach(([name, child], i) => {
      const last = i === entries.length - 1;
      lines.push(`${prefix}${last ? "└── " : "├── "}${name}${child ? "/" : ""}`);
      if (child) walk(child, prefix + (last ? "    " : "│   "));
    });
  };
  walk(top, "");
  return lines;
}

/** File name for the download: the project name made safe, plus .zip. */
export const archiveName = (project: string) => `${safe(project, 40) || "project"}.zip`;
