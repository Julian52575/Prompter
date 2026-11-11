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
  prompts: { id: string; path: string }[];
  children: Node[];
}

const RESERVED = /^(con|prn|aux|nul|com\d|lpt\d)$/i;

/** Letters and digits only, so the name is safe on every file system. */
function safe(name: string, max: number): string {
  return name.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, max).replace(/-+$/g, "");
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
  input: ArchiveInput,
  node: Node,
  index: number,
  previous: string | null,
  status: ArchivePrompt["status"],
): string {
  const q = (s: string) => JSON.stringify(s);
  return [
    "---",
    `project: ${q(input.project)}`,
    `thread: ${q(node.name)}`,
    `thread-path: ${q(node.dir)}`,
    `step: ${q(`${index + 1} of ${node.prompts.length}`)}`,
    `builds-on: ${previous ? q(previous) : "none"}`,
    `status: ${status ? STATUS_WORD[status] : "not-started"}`,
    "---",
    "",
  ].join("\n");
}

function optionLines(o: ArchiveOptions, worktrees: number): string[] {
  const lines: string[] = [];
  lines.push(
    o.rePrompt
      ? "- **Re-prompt first: ON.** Each `Prompt.md` holds a Re-Prompt Request written for you, the agent: instructions to review a prompt and write a revised version of it, followed by the prompt itself in a code block. For each prompt, first do what the request asks and produce the revised prompt. Then carry out the revised prompt, not the original text. If the revised prompt changes the scope of the original, say so before acting."
      : "- **Re-prompt first: OFF.** Each `Prompt.md` holds the prompt itself. Carry it out as written.",
  );
  lines.push(
    o.subAgents
      ? "- **Sub-agent delegation: ON.** You are the orchestrator and my only point of contact: sub-agents report to you, never to me. You may delegate prompts to sub-agents, typically one per thread. Run threads in parallel only when the dependency rules show they are independent, and keep the prompts of one thread in order. Give each sub-agent the full text of its `Prompt.md`, the paths of the prompts it builds on, and the rules of this file that apply to its work, including the options below. Check each result yourself before starting a prompt that builds on it. If a sub-agent has a question or needs a decision, bring it to me yourself, with the context I need to answer; do not let a sub-agent guess on something that matters. Sub-agents follow the same branch, commit and worktree rules as you and never push, merge or open a pull request. Your final report covers the whole project, including what each sub-agent did. If you cannot delegate, do the work yourself, one prompt at a time, and tell me so."
      : "- **Sub-agent delegation: OFF.** Do all the work yourself, one prompt at a time.",
  );
  if (o.subAgents) {
    lines.push(
      o.sharedContext
        ? "- **Shared context: ON.** Keep token use down by sharing one short brief, not your whole context. Before delegating, explore the project once and write the brief (about 60 lines at most): the layout of the repository, its conventions, the build, test and lint commands, and the decisions already made. Store it where every agent can read and write it and nothing gets committed: by default `agent-brief.md` inside the repository's git directory (find it with `git rev-parse --git-common-dir`, which every worktree shares). If the project is not a git repository, or sub-agents cannot reach that directory, use a file outside the project folder. Give every sub-agent the absolute path of the brief, its own `Prompt.md` and the paths of the prompts it builds on, and nothing else from your context: it reads the brief instead of exploring the project again. Each sub-agent adds one line for anything new it learns that the others need. Each sub-agent ends with a short report: files changed, decisions taken, open questions. Pass that report, not the transcript, to the prompts that build on it. Never commit the brief."
        : "- **Shared context: OFF.** Give each sub-agent the context its prompt needs.",
    );
  }
  const branches = o.multiBranch || o.worktree;
  lines.push(
    branches
      ? "- **Git branches: ON.** Work in the git repository you were given. Create one branch per thread, named as in the Plan below. A root thread's branch starts from the current branch. A branching thread's branch starts from the commit that completed the prompt it branches from. Make one commit per prompt, with the message `<thread name>: <prompt name>`. Commit only: do not push, merge, rebase or open a pull request unless I ask."
      : "- **Git branches: OFF.** Stay on the current branch and do not create branches. Do not commit unless I ask.",
  );
  lines.push(
    o.worktree
      ? `- **Worktrees: ON** (this needs the git branches above). Do the work of each thread in its own independent git worktree, created with \`git worktree add\` on that thread's branch, in the directory given in the Plan (a sibling of the repository, never inside it). Never work on two threads in the same working directory. This plan needs ${worktrees} worktree${worktrees === 1 ? "" : "s"}. Before creating the first one, estimate the storage needed (the size of the repository's working tree without \`.git\`, times the number of worktrees that will exist at the same time) and compare it with the free space on the target disk. If the space is not enough, or you cannot tell, stop, report the figures and wait for my answer. Remove worktrees only when I ask.`
      : "- **Worktrees: OFF.** Work in the repository's own working directory.",
  );
  lines.push(
    o.pause
      ? "- **Pauses: ON.** After each prompt, summarise what you did and the state of the work, then wait for my approval before starting the next prompt."
      : "- **Pauses: OFF.** Move on to the next prompt without waiting. Stop only if you are blocked or a prompt tells you to.",
  );
  return lines;
}

function agentsMd(input: ArchiveInput, nodes: Node[]): string {
  const all = flatten(nodes);
  const total = all.reduce((n, t) => n + t.prompts.length, 0);
  const o = input.options;
  const branches = o.multiBranch || o.worktree;
  const plan = all.flatMap((n) => {
    const rows = [
      `### ${n.name} (\`${n.dir}\`)`,
      "",
      `- Starts from: ${n.anchorPath ? `\`${n.anchorPath}\` (the prompt this thread branches from)` : "nothing; this is a root thread"}`,
    ];
    if (branches) rows.push(`- Branch: \`${n.branch}\``);
    if (o.worktree) rows.push(`- Worktree: \`../<repository>-worktrees/${n.worktree}\``);
    rows.push("- Prompts, in order:");
    n.prompts.forEach((p, i) => {
      const st = input.prompts[p.id].status;
      rows.push(`  ${i + 1}. ${input.prompts[p.id].name.replace(/\s+/g, " ")}: \`${p.path}\`${st ? ` (${STATUS_WORD[st]})` : ""}`);
    });
    rows.push("");
    return rows;
  });

  return [
    "# AGENTS.md",
    "",
    `This archive is one project, "${input.project.replace(/\s+/g, " ")}", exported from Prompt Builder. It holds a plan of ${total} prompt${total === 1 ? "" : "s"} in ${all.length} thread${all.length === 1 ? "" : "s"}. Treat it as a single piece of work: carry out the prompts to implement the project, in the order the dependency rules below allow.`,
    "",
    "## Contents",
    "",
    "| File | Purpose |",
    "| --- | --- |",
    "| `AGENTS.md` | This file: how to read and carry out the archive. |",
    "| `Roadmap.mmd` | Mermaid flowchart of the whole plan. It is the source of truth for structure and order. |",
    "| `<thread>/<NN>-<name>/Prompt.md` | One prompt, ready to follow. |",
    "",
    "## Reading the structure",
    "",
    "- Read `Roadmap.mmd` first. Each node is a prompt, labelled with its name. Each subgraph is a thread, titled with its name. An arrow inside a thread goes from a prompt to the next one. An arrow between two threads goes from the prompt a thread branches from to the first prompt of that thread.",
    "- The `%%` comment lines at the top of `Roadmap.mmd` map every node id to its file.",
    "- A thread is a folder. It holds its prompts, one folder each, named `<NN>-<name>` where NN is the position in the thread (01 is first). The folders of the threads that branch from it are nested inside it.",
    "- Every `Prompt.md` starts with a front-matter block between two `---` lines, with the fields `project`, `thread`, `thread-path`, `step`, `builds-on` (the path of the prompt it follows, or `none`) and `status` (`not-started`, `in-progress`, `completed`, `cancelled` or `downloaded`). The prompt follows the block.",
    "",
    "## Dependency rules",
    "",
    "1. The prompts of a thread run in order. A prompt may rely on the work done by the earlier prompts of its thread.",
    "2. The first prompt of a branching thread builds on the prompt it branches from (see `builds-on`). Start it only once that prompt is done, and start from its result.",
    "3. Threads that do not follow from one another are independent.",
    "4. Each prompt is standalone: it holds all the instructions for its step. Do not look for requirements in other prompts, only for the work they already produced.",
    "",
    "## How to proceed",
    "",
    "1. Read this file and `Roadmap.mmd`, then list the prompts in the order you will run them.",
    "2. For each prompt, read its whole `Prompt.md` and do what it asks. Do not add work it does not ask for.",
    "3. If a prompt is ambiguous, contradicts the code, or cannot be done, say so and state the assumption you make. Continue only if that is safe.",
    "4. When a prompt is done, note it: its name, its thread and what changed.",
    "5. At the end, report every prompt as done, partly done or not done, with the reason.",
    "6. Do not edit the files of this archive.",
    "",
    "## Options for this run",
    "",
    ...optionLines(o, all.length),
    "",
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
  );
  files.push({ path: "AGENTS.md", content: agentsMd(input, nodes) + "\n" });
  files.push({ path: "Roadmap.mmd", content: mermaid });
  for (const n of flatten(nodes)) {
    n.prompts.forEach((p, i) => {
      const previous = i > 0 ? n.prompts[i - 1].path : n.anchorPath;
      const prompt = input.prompts[p.id];
      files.push({
        path: p.path,
        content: frontMatter(input, n, i, previous, prompt.status) + "\n" + prompt.text.replace(/\n*$/, "\n"),
      });
    });
  }
  return files;
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
