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

const byPath = (files: { path: string; content: string }[]) => Object.fromEntries(files.map((f) => [f.path, f.content]));

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
    expect(second.trimEnd().endsWith("Do B")).toBe(true);
    expect(files["thread-1/01-First-step/Prompt.md"]).toContain("builds-on: none");
    expect(files["thread-1/thread-1-1/01-Branch/Prompt.md"]).toContain('builds-on: "thread-1/01-First-step/Prompt.md"');
  });

  it("maps Mermaid nodes to files with comments only", () => {
    const mmd = buildArchive(sample()).find((f) => f.path === "Roadmap.mmd")!.content;
    expect(mmd.startsWith("flowchart TD\n  %% p1 = thread-1/01-First-step/Prompt.md")).toBe(true);
    expect(mmd).toContain('p1["First step"]');
    expect(mmd).toContain("p1 --> p3");
  });

  it("states the chosen options in AGENTS.md", () => {
    const off = buildArchive(sample())[0].content;
    expect(off).toContain("Git branches: OFF");
    expect(off).toContain("Worktrees: OFF");
    expect(off).toContain("Pauses: OFF");
    const on = buildArchive({
      ...sample(),
      options: { rePrompt: true, subAgents: true, sharedContext: true, multiBranch: false, worktree: true, pause: true },
    })[0].content;
    expect(on).toContain("Re-prompt first: ON");
    expect(on).toContain("Sub-agent delegation: ON");
    expect(on).toContain("my only point of contact");
    expect(on).toContain("bring it to me yourself");
    expect(on).toContain("If you cannot delegate, do the work yourself");
    expect(on).toContain("Shared context: ON");
    expect(on).toContain("git rev-parse --git-common-dir");
    expect(on).toContain("Never commit the brief");
    expect(on).toContain("Git branches: ON");
    expect(on).toContain("This plan needs 3 worktrees");
    expect(on).toContain("wait for my answer");
    expect(on).toContain("Branch: `dolphin/thread-1-thread-1-1`");
    expect(on).toContain("Pauses: ON");
  });

  it("mentions the shared brief only when sub-agents are on", () => {
    const base = sample();
    const text = (o: Partial<typeof base.options>) => buildArchive({ ...base, options: { ...base.options, ...o } })[0].content;
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
      project: "x",
      roadmap: rm,
      prompts: { a: { name: "???", text: "A" }, b: { name: "B", text: "B" } },
      options: DEFAULT_ARCHIVE_OPTIONS,
    }).map((f) => f.path);
    expect(files).toContain("con-thread/01-prompt/Prompt.md");
    expect(files).toContain("con-thread-2/01-B/Prompt.md");
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
