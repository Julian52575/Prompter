#!/usr/bin/env python3
"""Copy the built index.html to INSTALL_TARGET: a local directory or [user@]host:/dir over ssh."""
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parent.parent / "frontend" / "dist" / "index.html"

target = os.environ.get("INSTALL_TARGET", "").strip()
if not target:
    sys.exit("INSTALL_TARGET is not set (see .env.example)")
if not SRC.is_file():
    sys.exit(f"missing {SRC}: run `just build` first")

# "host:/path" is remote; a single letter before ":" is a Windows drive
if re.match(r"^[^/\\:]{2,}:", target):
    subprocess.run(["scp", str(SRC), target.rstrip("/") + "/index.html"], check=True)
else:
    dest = Path(target).expanduser()
    dest.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(SRC, dest / "index.html")
print(f"installed to {target}")
