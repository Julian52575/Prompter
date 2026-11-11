import { describe, expect, it } from "vitest";
import { append, emptyRoadmap, layout, place, placedIds, prune, removePrompt, renameThread, toMermaid, unplace } from "./roadmap";

const build = () => {
  let rm = place(emptyRoadmap(), "a", null, "after", "t1");
  rm = place(rm, "b", "a", "after", "t2");
  rm = place(rm, "c", "a", "right", "t3");
  rm = place(rm, "d", "b", "left", "t4");
  return rm;
};

describe("roadmap", () => {
  it("continues, branches and orders columns", () => {
    const rm = build();
    expect(rm.threads.find((t) => t.id === "t1")!.items).toEqual(["a", "b"]);
    const l = layout(rm);
    const at = (id: string) => l.cells.find((c) => c.id === id)!;
    expect(at("d").col).toBeLessThan(at("a").col);
    expect(at("c").col).toBeGreaterThan(at("a").col);
    expect(at("c").row).toBe(0);
    expect(at("d").row).toBe(1);
    expect(l.edges).toEqual(expect.arrayContaining([{ from: "a", to: "c" }, { from: "b", to: "d" }]));
  });

  it("inserts before", () => {
    const rm = place(build(), "e", "a", "before", "t5");
    expect(rm.threads.find((t) => t.id === "t1")!.items).toEqual(["e", "a", "b"]);
  });

  it("removing re-anchors branches and leaves other prompts alone", () => {
    const rm = removePrompt(build(), "b");
    expect(rm.threads.find((t) => t.id === "t4")!.from).toBe("a");
    expect(rm.threads.find((t) => t.id === "t1")!.items).toEqual(["a"]);
    const first = removePrompt(rm, "a");
    expect(first.threads.map((t) => t.id)).not.toContain("t1");
    expect(first.threads.find((t) => t.id === "t3")!.from).toBeNull();
  });

  it("unplace records the return and place clears it", () => {
    const rm = unplace(build(), "c", 5);
    expect(rm.returned.c).toBe(5);
    expect(placedIds(rm).has("c")).toBe(false);
    expect(place(rm, "c", "a", "after", "t9").returned.c).toBeUndefined();
  });

  it("moves a placed prompt and ignores dropping on itself", () => {
    const rm = build();
    expect(place(rm, "a", "a", "after", "x")).toBe(rm);
    const moved = place(rm, "d", "c", "after", "x");
    expect(moved.threads.find((t) => t.id === "t3")!.items).toEqual(["c", "d"]);
  });

  it("names threads automatically", () => {
    const rm = build();
    const name = (id: string) => rm.threads.find((t) => t.id === id)!.name;
    expect(name("t1")).toBe("Thread 1");
    expect(name("t3")).toBe("Thread 1 - 1");
    expect(name("t4")).toBe("Thread 1 - 2");
    expect(place(rm, "e", null, "after", "t5").threads.at(-1)!.name).toBe("Thread 2");
  });

  it("appends and renames", () => {
    let rm = append(emptyRoadmap(), "a", null, "t1");
    rm = append(rm, "b", "t1", "t2");
    rm = renameThread(rm, "t1", "Goal");
    expect(rm.threads).toHaveLength(1);
    expect(rm.threads[0]).toMatchObject({ name: "Goal", items: ["a", "b"] });
  });

  it("prunes unknown prompts", () => {
    expect([...placedIds(prune(build(), new Set(["a", "c"])))].sort()).toEqual(["a", "c"]);
  });

  it("exports Mermaid with prompt names only", () => {
    let rm = renameThread(build(), "t1", "Ship it");
    rm = renameThread(rm, "t3", "  ");
    const names: Record<string, string> = { a: 'A "one"', b: "B", c: "C", d: "D" };
    const out = toMermaid(rm, (id) => names[id]);
    expect(out).toContain("flowchart TD");
    expect(out).toContain('subgraph t1["Ship it"]');
    expect(out).toContain('p1["A #quot;one#quot;"]');
    expect(out).toContain("p1 --> p2");
    expect(out).toContain("p1 --> p3");
    expect(out).not.toContain("subgraph t2[");
  });
});
