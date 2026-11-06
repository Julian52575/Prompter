import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SCRIPTS))
import agent_md_check  # noqa: E402
import read_md_section as section  # noqa: E402

DOC = """# Title
intro
## One
a
### One sub
b
## Two
```
## not a heading
```
c
## One
dup
"""

def run(*cmd, cwd=None):
    return subprocess.run(cmd, capture_output=True, text=True, cwd=cwd)

class Section(unittest.TestCase):
    lines = DOC.splitlines()

    def test_slug(self):
        self.assertEqual(section.slug("2. Branches and commits"), "2-branches-and-commits")
        self.assertEqual(section.slug("Why `x`?"), "why-x")

    def test_subsections_included_and_sibling_excluded(self):
        body = section.section(self.lines, "one")
        self.assertIn("### One sub", body)
        self.assertNotIn("## Two", body)

    def test_duplicate_headings_get_suffix(self):
        self.assertEqual([h[3] for h in section.headings(self.lines)], ["title", "one", "one-sub", "two", "one-1"])
        self.assertIn("dup", section.section(self.lines, "one-1"))

    def test_code_fence_is_not_a_heading(self):
        self.assertIsNone(section.section(self.lines, "not-a-heading"))

    def test_heading_text_and_missing(self):
        self.assertIn("b", section.section(self.lines, "One sub"))
        self.assertIsNone(section.section(self.lines, "nope"))

    def test_cli(self):
        with tempfile.TemporaryDirectory() as d:
            f = Path(d, "d.md")
            f.write_text(DOC)
            ok = run(sys.executable, str(SCRIPTS / "read_md_section.py"), f"{f}#two")
            self.assertEqual((ok.returncode, ok.stdout.splitlines()[0]), (0, "## Two"))
            bad = run(sys.executable, str(SCRIPTS / "read_md_section.py"), f"{f}#nope")
            self.assertEqual(bad.returncode, 1)
            self.assertIn("Anchors: title, one", bad.stderr)
            self.assertEqual(run(sys.executable, str(SCRIPTS / "read_md_section.py")).returncode, 2)

class AgentsCheck(unittest.TestCase):
    def setUp(self):
        self.dir = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.dir)
        (self.dir / "docs").mkdir()
        (self.dir / "docs" / "guide.md").write_text("# Guide\n## Setup\nAlways run the full test suite before every commit please.\n")
        (self.dir / "ci.yml").write_text("")

    def check(self, text):
        f = self.dir / "AGENTS.md"
        f.write_text(text)
        return agent_md_check.check(f, ["docs/guide.md", "ci.yml", ".github/workflows/ci.yml"], self.dir)

    def test_valid_references_pass(self):
        out = self.check("See [x](docs/guide.md#setup), `docs/guide.md`, `ci.yml`, `.github/workflows/ci.yml`.\n")
        self.assertEqual([line for line in out if not line.startswith("SIZE")], [])

    def test_missing_path_and_anchor(self):
        out = self.check("See `gone/file.md` and [x](docs/guide.md#nope).\n")
        self.assertIn("STALE   gone/file.md: path not found", out)
        self.assertIn("STALE   docs/guide.md#nope: no such section", out)

    def test_not_files_and_fences_ignored(self):
        out = self.check("Use `ci-required.needs`, `cache.nixos.org`, `OWNER/REPO`, https://x.io/a.md\n```\n`gone.md`\n```\n")
        self.assertFalse([line for line in out if line.startswith("STALE")])

    def test_duplicate_rule_in_other_file(self):
        out = self.check("- Always run the full test suite before every commit please.\n")
        self.assertTrue(any(line.startswith("DUP     in docs/guide.md") for line in out))

    def test_size_line(self):
        out = self.check("12345678\n")
        self.assertRegex(out[-1], r"^SIZE    .*AGENTS\.md: 1 lines, 9 bytes, ~2 tokens$")

    def test_exit_code(self):
        f = self.dir / "AGENTS.md"
        f.write_text("`gone.md`\n")
        self.assertEqual(run(sys.executable, str(SCRIPTS / "agent_md_check.py"), str(f), cwd=self.dir).returncode, 1)
        f.write_text("fine\n")
        self.assertEqual(run(sys.executable, str(SCRIPTS / "agent_md_check.py"), str(f), cwd=self.dir).returncode, 0)

class Readme(unittest.TestCase):
    def test_every_script_is_listed_with_five_columns(self):
        rows = [r.split("\t") for r in (SCRIPTS / "README.tsv").read_text().splitlines()]
        self.assertTrue(all(len(r) == 5 for r in rows))
        self.assertEqual(sorted(r[0] for r in rows[1:]), sorted(p.name for p in SCRIPTS.glob("*.py")))

@unittest.skipUnless(shutil.which("rtk"), "rtk not installed")
class RtkCompat(unittest.TestCase):
    """A token optimizer must neither alter the output nor swallow the exit code."""

    def test_output_and_exit_code_unchanged(self):
        with tempfile.TemporaryDirectory() as d:
            f = Path(d, "d.md")
            f.write_text(DOC + "\n".join(f"line {i}" for i in range(300)) + "\n")
            for ref in (f"{f}#one", f"{f}#nope"):
                raw = run(sys.executable, str(SCRIPTS / "read_md_section.py"), ref)
                via = run("rtk", sys.executable, str(SCRIPTS / "read_md_section.py"), ref)
                self.assertEqual((via.returncode, via.stdout, via.stderr), (raw.returncode, raw.stdout, raw.stderr))

if __name__ == "__main__":
    unittest.main()
