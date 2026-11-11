import { describe, expect, it } from "vitest";
import { SHARED_SCRIPTS } from "./scripts";

describe("bundled scripts", () => {
  it("ships the shared scripts, their README and the liability notice", () => {
    const names = SHARED_SCRIPTS.map((f) => f.path);
    expect(names).toContain("scripts/shared/README.tsv");
    expect(names).toContain("scripts/shared/LIABILITY.md");
    expect(names).toContain("scripts/shared/completion_to_md.py");
    expect(names).toContain("scripts/shared/read_md_section.py");
    expect(names.every((n) => !n.includes("/tests/"))).toBe(true);
    expect(SHARED_SCRIPTS.find((f) => f.path.endsWith("LIABILITY.md"))!.content).toContain("hold no responsibility");
  });
});
