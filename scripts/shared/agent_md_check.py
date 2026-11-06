#!/usr/bin/env python3
# github/com/Julian52575/Prompter
# © 2026 Julian Bottiglione
# WARNING ! AI AGENT SHOULD UPDATE THE NEXT LINE
# The script was imported from ref $GITREF
"""Check an agent instruction file (default AGENTS.md): stale references, duplicated rules, size.
One line per finding (STALE / DUP) then a SIZE line. Exit 1 when a reference is stale."""
import re
import subprocess
import sys
from pathlib import Path

from read_md_section import headings

FENCE = re.compile(r"^(`{3,}|~{3,}).*?^\1", re.S | re.M)
LINK = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")
CODE = re.compile(r"`([^`\n]+)`")
EXT = re.compile(r"\.(md|py|ts|tsx|js|json|ya?ml|toml|nix|sh|css|html|lock|txt|example|env)$")
MIN_DUP = 40

def repo_files():
    r = subprocess.run(["git", "ls-files"], capture_output=True, text=True)
    return r.stdout.split() if r.returncode == 0 else [str(p) for p in Path(".").rglob("*") if p.is_file()]

def is_path(tok):
    return bool(re.fullmatch(r"[\w./-]+", tok)) and (tok.endswith("/") or bool(EXT.search(tok)))

def norm(s):
    return re.sub(r"\s+", " ", s.strip(" -*>")).lower()

def check(target, files, root="."):
    """Findings for `target`; `files` are the repo's files, relative to `root`."""
    target, out = Path(target), []
    text = target.read_text(encoding="utf-8")
    prose = FENCE.sub("", text)
    refs = LINK.findall(prose) + [t for t in CODE.findall(prose) if is_path(t)]
    for ref in dict.fromkeys(refs):
        path, _, anchor = ref.partition("#")
        if re.match(r"^[a-z]+:", path):
            continue
        base = target.parent / path if path else target
        want = path.rstrip("/")
        # A bare name (ci.yml) may live in a subdirectory.
        if path and not (base.exists() or any(f == want or f.endswith("/" + want) or f.startswith(want) for f in files)):
            out.append(f"STALE   {ref}: path not found")
        elif anchor and base.is_file() and anchor not in [h[3] for h in headings(base.read_text(encoding="utf-8").splitlines())]:
            out.append(f"STALE   {ref}: no such section")
    rules = {norm(s) for s in prose.splitlines() if len(s.strip()) >= MIN_DUP}
    for f in files:
        if f.endswith(".md") and (Path(root) / f).resolve() != target.resolve():
            other = norm((Path(root) / f).read_text(encoding="utf-8", errors="ignore"))
            out += [f"DUP     in {f}: {r[:70]}" for r in sorted(rules) if r in other]
    size = len(text.encode())
    return out + [f"SIZE    {target}: {len(text.splitlines())} lines, {size} bytes, ~{size // 4} tokens"]

def main(argv):
    out = check(argv[0] if argv else "AGENTS.md", repo_files())
    print("\n".join(out))
    return int(any(line.startswith("STALE") for line in out))

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
