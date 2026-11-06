#!/usr/bin/env python3
# github.com/Julian52575/Prompter
# © 2026 Julian Bottiglione
# WARNING ! AI AGENT SHOULD UPDATE THE NEXT LINE                       # The script was imported from ref $GITREF 
"""Print one Markdown section: read_md_section.py FILE#anchor (GitHub slug) or FILE "Heading text".
Subsections included, code fences ignored. Exit 1 and list the anchors if not found."""
import re
import sys
from pathlib import Path

def slug(heading):
    return re.sub(r"[^\w\- ]", "", heading.strip().lower()).replace(" ", "-")

def headings(lines):
    """(line index, level, text, unique anchor) for each heading outside code fences."""
    out, seen, fence = [], {}, None
    for i, line in enumerate(lines):
        if m := re.match(r"^(`{3,}|~{3,})", line):
            fence = None if fence and line.startswith(fence) else (fence or m[1])
        elif not fence and (h := re.match(r"^(#{1,6})\s+(.*?)\s*#*\s*$", line)):
            base = slug(h[2])
            n = seen[base] = seen.get(base, -1) + 1
            out.append((i, len(h[1]), h[2], base if n == 0 else f"{base}-{n}"))
    return out

def section(lines, ref):
    hs = headings(lines)
    for k, (i, level, text, anchor) in enumerate(hs):
        if ref in (anchor, text) or slug(ref) == anchor:
            end = next((h[0] for h in hs[k + 1 :] if h[1] <= level), len(lines))
            return "\n".join(lines[i:end]).rstrip() + "\n"

def main(argv):
    if len(argv) == 1 and "#" in argv[0]:
        path, ref = argv[0].split("#", 1)
    elif len(argv) == 2:
        path, ref = argv
    else:
        print(__doc__, file=sys.stderr)
        return 2
    lines = Path(path).read_text(encoding="utf-8").splitlines()
    if (body := section(lines, ref)) is None:
        print(f"no section '{ref}' in {path}. Anchors: " + ", ".join(h[3] for h in headings(lines)), file=sys.stderr)
        return 1
    sys.stdout.write(body)
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
