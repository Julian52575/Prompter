import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SCRIPTS))
import completion_to_md as c  # noqa: E402

RECORD = {
    "format": "prompter-completion",
    "version": 1,
    "project": "Dolphin",
    "date": "2026-11-11",
    "threads": [
        {
            "path": "core",
            "name": "Core",
            "branch": "dolphin/core",
            "prompts": [
                {
                    "id": "a",
                    "name": "Cache layer",
                    "status": "completed",
                    "summary": "Added the cache.",
                    "pitfalls": ["Stale reads", "Locking"],
                    "commits": ["abc123 add cache"],
                }
            ],
        }
    ],
}


class Render(unittest.TestCase):
    def test_renders_threads_prompts_and_skips_empty_fields(self):
        md = c.render(RECORD, "flowchart TD\n  p1[\"Cache layer\"]\n")
        self.assertIn("# Dolphin: implementation record", md)
        self.assertIn("```mermaid\nflowchart TD", md)
        self.assertIn("## Core", md)
        self.assertIn("### Cache layer", md)
        self.assertIn("- Status: Completed", md)
        self.assertIn("  - Stale reads", md)
        self.assertNotIn("Worktree", md)
        self.assertNotIn("Proof", md)

    def test_rejects_other_json(self):
        with self.assertRaises(ValueError):
            c.render({"format": "something-else"})


class Cli(unittest.TestCase):
    def run_cli(self, *args):
        return subprocess.run([sys.executable, str(SCRIPTS / "completion_to_md.py"), *args], capture_output=True, text=True)

    def test_writes_to_out_and_reports_errors(self):
        with tempfile.TemporaryDirectory() as d:
            src = Path(d, "completion.json")
            src.write_text(json.dumps(RECORD), encoding="utf-8")
            out = Path(d, "record.md")
            self.assertEqual(self.run_cli(str(src), "--out", str(out)).returncode, 0)
            self.assertIn("## Core", out.read_text(encoding="utf-8"))
            bad = Path(d, "bad.json")
            bad.write_text("{", encoding="utf-8")
            self.assertEqual(self.run_cli(str(bad)).returncode, 1)
            self.assertEqual(self.run_cli().returncode, 2)


if __name__ == "__main__":
    unittest.main()
