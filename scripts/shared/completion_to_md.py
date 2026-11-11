#!/usr/bin/env python3
"""Turn a Prompter completion record (JSON, optionally with its Mermaid chart) into Markdown."""
import json
import sys
from pathlib import Path

FORMAT = "prompter-completion"
STATUS = {
    "completed": "Completed",
    "partial": "Partly done",
    "not-done": "Not done",
    "cancelled": "Cancelled",
}


def lines(label, value):
    """A labelled bullet, or nothing when the value is empty."""
    if not value:
        return []
    if isinstance(value, list):
        return [f"- {label}:"] + [f"  - {item}" for item in value]
    return [f"- {label}: {value}"]


def render(data, mermaid=None):
    """Markdown for a parsed completion record. Raises ValueError when it is not one."""
    if not isinstance(data, dict) or data.get("format") != FORMAT:
        raise ValueError(f'not a Prompter completion record (expected "format": "{FORMAT}")')
    out = [f"# {data.get('project', 'Project')}: implementation record", ""]
    out += lines("Date", data.get("date"))
    out += lines("Agent", data.get("agent"))
    out.append("")
    if mermaid:
        out += ["## Roadmap", "", "```mermaid", mermaid.rstrip("\n"), "```", ""]
    for thread in data.get("threads") or []:
        out += [f"## {thread.get('name', thread.get('path', 'Thread'))}", ""]
        out += lines("Folder", thread.get("path"))
        out += lines("Branch", thread.get("branch"))
        out += lines("Worktree", thread.get("worktree"))
        out += lines("Starts from", thread.get("startsFrom"))
        out.append("")
        for prompt in thread.get("prompts") or []:
            status = STATUS.get(prompt.get("status"), prompt.get("status") or "Unknown")
            out += [f"### {prompt.get('name', prompt.get('id', 'Prompt'))}", "", f"- Status: {status}"]
            out += lines("Summary", prompt.get("summary"))
            out += lines("Proof", prompt.get("proof"))
            out += lines("Pitfalls", prompt.get("pitfalls"))
            out += lines("Commits", prompt.get("commits"))
            out += lines("Files", prompt.get("files"))
            out += lines("Notes", prompt.get("notes"))
            out.append("")
    return "\n".join(out).rstrip("\n") + "\n"


def main(argv):
    args = list(argv)
    out_file = None
    if "--out" in args:
        i = args.index("--out")
        if i + 1 >= len(args):
            print("usage: completion_to_md.py COMPLETION.json [ROADMAP.mmd] [--out FILE]", file=sys.stderr)
            return 2
        out_file = args[i + 1]
        del args[i : i + 2]
    if not 1 <= len(args) <= 2:
        print("usage: completion_to_md.py COMPLETION.json [ROADMAP.mmd] [--out FILE]", file=sys.stderr)
        return 2
    try:
        data = json.loads(Path(args[0]).read_text(encoding="utf-8"))
        mermaid = Path(args[1]).read_text(encoding="utf-8") if len(args) == 2 else None
        text = render(data, mermaid)
    except (OSError, ValueError) as err:
        print(f"error: {err}", file=sys.stderr)
        return 1
    if out_file:
        Path(out_file).write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
