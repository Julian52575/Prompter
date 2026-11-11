import { describe, expect, it } from "vitest";
import {
  archiveName,
  buildArchive,
  crc32,
  DEFAULT_ARCHIVE_OPTIONS,
  treeLines,
  zipStore,
  type ArchiveInput,
} from "./archive";
import { emptyRoadmap, place, renameThread } from "./roadmap";
import { BUILTIN_WRAPPER } from "./builtins";
import { agentWrapper, wrapPrompt } from "./wrap";

function sample(): ArchiveInput {
  let rm = place(emptyRoadmap(), "a", null, "after", "t1");
  rm = place(rm, "b", "a", "after", "t2");
  rm = place(rm, "c", "a", "right", "t3");
  rm = place(rm, "d", "c", "right", "t4");
  rm = renameThread(rm, "t1", "Thread 1");
  return {
    project: "Dolphin",
    roadmap: rm,
    prompts: {
      a: { name: "First step", text: "Do A" },
      b: { name: "Second: step?", text: "Do B", status: "copied" },
      c: { name: "Branch", text: "Do C" },
      d: { name: "Deeper", text: "Do D" },
    },
    options: DEFAULT_ARCHIVE_OPTIONS,
  };
}

const ROOT = "Project-Dolphin/";
/** Files by path, without the project folder every path starts with. */
const byPath = (files: { path: string; content: string }[]) =>
  Object.fromEntries(files.map((f) => [f.path.startsWith(ROOT) ? f.path.slice(ROOT.length) : `!${f.path}`, f.content]));

describe("archive", () => {
  it("nests branches in their parent thread, one folder per prompt", () => {
    const files = byPath(buildArchive(sample()));
    expect(Object.keys(files)).toEqual([
      "AGENTS.md",
      "Roadmap.mmd",
      "thread-1/01-First-step/Prompt.md",
      "thread-1/02-Second-step/Prompt.md",
      "thread-1/thread-1-1/01-Branch/Prompt.md",
      "thread-1/thread-1-1/thread-1-1-1/01-Deeper/Prompt.md",
    ]);
  });

  it("writes front matter linking each prompt to the one it builds on", () => {
    const files = byPath(buildArchive(sample()));
    const second = files["thread-1/02-Second-step/Prompt.md"];
    expect(second).toContain('builds-on: "thread-1/01-First-step/Prompt.md"');
    expect(second).toContain("status: in-progress");
    expect(second).not.toContain("project:");
    expect(second.trimEnd().endsWith("Do B")).toBe(true);
    expect(files["thread-1/01-First-step/Prompt.md"]).toContain("builds-on: none");
    expect(files["thread-1/01-First-step/Prompt.md"]).not.toContain("status:");
    expect(files["thread-1/thread-1-1/01-Branch/Prompt.md"]).toContain('builds-on: "thread-1/01-First-step/Prompt.md"');
  });

  it("maps Mermaid nodes to files with comments only", () => {
    const mmd = byPath(buildArchive(sample()))["Roadmap.mmd"];
    expect(mmd.startsWith("flowchart TD\n  %% p1 = thread-1/01-First-step/Prompt.md")).toBe(true);
    expect(mmd).toContain('p1["First step"]');
    expect(mmd).toContain("p1 --> p3");
  });

  it("states the chosen options in AGENTS.md", () => {
    const off = byPath(buildArchive(sample()))["AGENTS.md"];
    expect(off).toContain("Git branches: OFF");
    expect(off).toContain("Worktrees: OFF");
    expect(off).toContain("Pauses: OFF");
    const on = byPath(
      buildArchive({
        ...sample(),
        options: {
          rePrompt: true,
          subAgents: true,
          sharedContext: true,
          multiBranch: false,
          worktree: true,
          pause: true,
        },
      }),
    )["AGENTS.md"];
    expect(on).toContain("Re-prompt first: ON");
    expect(on).toContain("Sub-agent delegation: ON");
    expect(on).toContain("my only contact");
    expect(on).toContain("Bring sub-agents' questions and decisions to me yourself");
    expect(on).toContain("If you cannot delegate, work alone");
    expect(on).toContain("The re-prompt step runs inside the sub-agent");
    expect(on).toContain("made with your tool's worktree isolation if it supports that path and branch");
    expect(on).toContain("else `git worktree add`");
    expect(on).toContain("Shared context: ON");
    expect(on).toContain("git rev-parse --git-common-dir");
    expect(on).toContain("never committed");
    expect(on).toContain("Git branches: ON");
    expect(on).toContain("This plan needs 3 worktrees");
    expect(on).toContain("wait for me");
    expect(on).toContain("Branch: `dolphin/thread-1-thread-1-1`");
    expect(on).toContain("Pauses: ON");
  });

  it("records a finished prompt outside the archive as the prerequisite of a branch", () => {
    const base = sample();
    // Only the branch thread (t3 and the thread under it) is downloaded; its parent prompt "a" is finished elsewhere.
    const roadmap = { threads: base.roadmap.threads.filter((t) => t.id === "t3" || t.id === "t4"), returned: {} };
    const files = buildArchive({
      ...base,
      roadmap,
      prompts: { c: base.prompts.c, d: base.prompts.d },
      external: { a: { name: "First step", thread: "Thread 1" } },
    });
    const byName = byPath(files);
    expect(Object.keys(byName)).toContain("thread-1-1/01-Branch/Prompt.md");
    const first = byName["thread-1-1/01-Branch/Prompt.md"];
    expect(first).toContain("builds-on: none");
    expect(first).toContain('prerequisite: "First step (thread Thread 1); done, not in this archive"');
    const agents = byName["AGENTS.md"];
    expect(agents).toContain("## Prompts finished before this archive");
    expect(agents).toContain("find out what that work did");
    expect(agents).toContain("already done and not in this archive");
    expect(byName["Roadmap.mmd"]).toContain('starts from "First step", finished and not in this archive');
  });

  it("tells the agent a branch and its parent thread are independent once the parent prompt is done", () => {
    const agents = byPath(buildArchive(sample()))["AGENTS.md"];
    expect(agents).toContain("the branch and its parent thread are independent");
    expect(agents).not.toContain("Prompts finished before this archive");
  });

  it("mentions the shared brief only when sub-agents are on", () => {
    const base = sample();
    const text = (o: Partial<typeof base.options>) =>
      byPath(buildArchive({ ...base, options: { ...base.options, ...o } }))["AGENTS.md"];
    expect(text({})).not.toContain("Shared context");
    expect(text({ sharedContext: true })).not.toContain("Shared context");
    expect(text({ subAgents: true })).toContain("Shared context: OFF");
    expect(text({ subAgents: true, sharedContext: true })).toContain("Shared context: ON");
  });

  it("keeps sibling folder names unique and safe", () => {
    let rm = place(emptyRoadmap(), "a", null, "after", "t1");
    rm = place(rm, "b", null, "after", "t2");
    rm = renameThread(rm, "t1", "CON");
    rm = renameThread(rm, "t2", "con");
    const files = buildArchive({
      project: "Dolphin",
      roadmap: rm,
      prompts: { a: { name: "???", text: "A" }, b: { name: "B", text: "B" } },
      options: DEFAULT_ARCHIVE_OPTIONS,
    }).map((f) => f.path.slice(ROOT.length));
    expect(files).toContain("con-thread/01-prompt/Prompt.md");
    expect(files).toContain("con-thread-2/01-B/Prompt.md");
  });

  it("puts everything in a Project-<name> folder so an existing AGENTS.md is never overwritten", () => {
    const paths = buildArchive(sample()).map((f) => f.path);
    expect(paths.every((p) => p.startsWith("Project-Dolphin/"))).toBe(true);
    expect(paths).toContain("Project-Dolphin/AGENTS.md");
    const agents = byPath(buildArchive(sample()))["AGENTS.md"];
    expect(agents).toContain("never merge it into or overwrite the repository's AGENTS.md");
  });

  it("tells the agent to settle uncertainties before starting, reading every prompt when it works alone", () => {
    const agents = byPath(buildArchive(sample()))["AGENTS.md"];
    expect(agents).toContain("## First: settle uncertainties");
    expect(agents).toContain("Before starting, read this file, `Roadmap.mmd` and every `Prompt.md`");
    expect(agents).toContain("wait for my answers");
    expect(agents).not.toContain("pre-flight");
  });

  it("with sub-agents, runs a read-only pre-flight instead of the manager reading every prompt", () => {
    const subs = byPath(buildArchive({ ...sample(), options: { ...DEFAULT_ARCHIVE_OPTIONS, subAgents: true } }))[
      "AGENTS.md"
    ];
    expect(subs).toContain("Before any real work, settle every uncertainty with me");
    expect(subs).toContain("not the prompts");
    expect(subs).toContain(
      "read-only pre-flight: give each sub-agent only the paths of its own prompts to read in full and report on, never to act",
    );
    expect(subs).toContain("no edits, branches, commits, worktrees or scripts");
    expect(subs).toContain("Each returns only questions and assumptions");
    expect(subs).toContain("ask me once, in one message");
    // The orchestration guidance: paths not pasted text, resumed agents, parallel batches, light models, return format.
    expect(subs).toContain("the path of its `Prompt.md` (it reads it; never paste prompt text");
    expect(subs).toContain("continue those sub-agents with my answers");
    expect(subs).toContain("continue the same sub-agents with the answers");
    expect(subs).toContain("Start independent threads together in one batch");
    expect(subs).toContain("Use the lightest model that can do the job");
    expect(subs).toContain("a general-purpose agent told not to edit, not a search-only one");
    expect(subs).toContain("**Return format:** completion entries");
    expect(subs).toContain("at most five lines of open questions");
    expect(subs).toContain("Claude Code: SendMessage");
    expect(subs).toContain("Keep each sub-agent's identifier so you can resume it");
    expect(subs).toContain(
      "if one cannot be resumed, start a new one with its briefing, my answers and the brief if any",
    );
    expect(subs).toContain("Run the pre-flight first (see First)");
    expect(subs).not.toContain("and every `Prompt.md`, and settle");
    const rp = byPath(
      buildArchive({ ...sample(), options: { ...DEFAULT_ARCHIVE_OPTIONS, subAgents: true, rePrompt: true } }),
    )["AGENTS.md"];
    expect(rp).toContain("no revised prompts");
  });

  it("gives every prompt an id and defines the completion record", () => {
    const files = byPath(buildArchive(sample()));
    expect(files["thread-1/01-First-step/Prompt.md"]).toContain('id: "a"');
    const agents = files["AGENTS.md"];
    expect(agents).toContain("## Completion record");
    expect(agents).toContain('"format": "prompter-completion"');
    expect(agents).toContain("docs/prompter-project/dolphin-<date>/");
    expect(agents).toContain("`completion.json`");
    expect(agents).toContain("`roadmap.mmd`");
    expect(agents).toContain("Recording outcomes is the last task of every sub-agent");
    expect(agents).toContain("Write a Markdown version only if I ask");
    expect(agents).toContain("Leave both uncommitted");
    const withBranches = byPath(
      buildArchive({ ...sample(), options: { ...DEFAULT_ARCHIVE_OPTIONS, multiBranch: true } }),
    )["AGENTS.md"];
    expect(withBranches).toContain("Commit both files in their own commit");
    // The JSON example inside AGENTS.md is itself valid, and parses back as a completion record.
    const json = /```json\n([\s\S]*?)\n```/.exec(agents)![1];
    expect(JSON.parse(json).format).toBe("prompter-completion");
  });

  it("bundles scripts with a permission rule only when scripts are given", () => {
    const scripts = [
      { path: "scripts/shared/README.tsv", content: "name\tpurpose\n" },
      { path: "scripts/shared/LIABILITY.md", content: "# Liability\n" },
    ];
    const base = byPath(buildArchive(sample()));
    expect(base["AGENTS.md"]).not.toContain("## Scripts");
    const withScripts = byPath(buildArchive({ ...sample(), scripts }));
    expect(Object.keys(withScripts)).toContain("scripts/shared/LIABILITY.md");
    const agents = withScripts["AGENTS.md"];
    expect(agents).toContain("## Scripts");
    expect(agents).toContain("Read `scripts/shared/LIABILITY.md` in full");
    expect(agents).toContain("Run none, and let no sub-agent run any, until I say yes");
    expect(agents).toContain("delete the `.py` files");
    expect(agents).toContain("permission to run the scripts (see Scripts)");
  });

  it("names the download after the project", () => {
    expect(archiveName("My Project / 1")).toBe("My-Project-1.zip");
    expect(archiveName("///")).toBe("project.zip");
  });
});

describe("agentWrapper", () => {
  it("rewords the built-in request for an agent that carries the prompt out", () => {
    const text = wrapPrompt(agentWrapper(BUILTIN_WRAPPER.text), "Do X");
    expect(text).toContain("You are the AI agent this prompt is for.");
    expect(text).toContain("Then carry out the revised prompt");
    expect(text).not.toContain("Do not carry out the task it describes");
    expect(text).not.toContain("are for the agent, not for you");
    expect(text).toContain("Do X");
  });

  it("puts a note on top of a wrapper the user has edited", () => {
    const out = agentWrapper("My own review text.\n\n{{prompt}}");
    expect(out.startsWith("Note for the agent reading this file:")).toBe(true);
    expect(out.endsWith("My own review text.\n\n{{prompt}}")).toBe(true);
  });

  it("is much shorter than the stored request", () => {
    expect(agentWrapper(BUILTIN_WRAPPER.text).length).toBeLessThan(BUILTIN_WRAPPER.text.length * 0.65);
  });

  it("leaves the stored wrapper alone", () => {
    const before = BUILTIN_WRAPPER.text;
    agentWrapper(before);
    expect(BUILTIN_WRAPPER.text).toBe(before);
  });
});

describe("treeLines", () => {
  it("draws folders and files as a tree", () => {
    expect(treeLines("x.zip", ["AGENTS.md", "t/01-a/Prompt.md", "t/02-b/Prompt.md"])).toEqual([
      "x.zip",
      "├── AGENTS.md",
      "└── t/",
      "    ├── 01-a/",
      "    │   └── Prompt.md",
      "    └── 02-b/",
      "        └── Prompt.md",
    ]);
  });
});

describe("zipStore", () => {
  it("writes a ZIP that reads back", () => {
    const files = [
      { path: "a.txt", content: "hello" },
      { path: "dir/é.md", content: "ünïcode\n" },
    ];
    const zip = zipStore(files, new Date(2026, 0, 2, 3, 4, 6));
    const v = new DataView(zip.buffer);
    const end = zip.length - 22;
    expect(v.getUint32(end, true)).toBe(0x06054b50);
    expect(v.getUint16(end + 10, true)).toBe(2);
    let at = v.getUint32(end + 16, true);
    const dec = new TextDecoder();
    files.forEach((f) => {
      expect(v.getUint32(at, true)).toBe(0x02014b50);
      const crc = v.getUint32(at + 16, true);
      const size = v.getUint32(at + 20, true);
      const nameLen = v.getUint16(at + 28, true);
      const local = v.getUint32(at + 42, true);
      expect(dec.decode(zip.subarray(at + 46, at + 46 + nameLen))).toBe(f.path);
      const dataAt = local + 30 + nameLen;
      const data = zip.subarray(dataAt, dataAt + size);
      expect(dec.decode(data)).toBe(f.content);
      expect(crc32(data)).toBe(crc);
      at += 46 + nameLen;
    });
  });

  it("matches the known CRC-32 check value", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
  });
});
