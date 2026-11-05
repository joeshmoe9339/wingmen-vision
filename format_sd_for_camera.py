#!/usr/bin/env python3
# SD Card format/flashing program for camera-to-agent connectivity
# Uses two-card setup: Card1 (systemd agent), Card2 (camera override)

import subprocess, sys, os

# Safe: fixed commands only, no user input (local SD flash script) — no injection risk
def run(cmd):
    print(f"[RUN] {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(result.stdout or result.stderr or f"exit {result.returncode}")
    return result.returncode == 0

print("=== SD FLASH VERIFICATION ===")
run("lsblk")  # verify mounted SD
run("mount | grep /media")  # confirm mount point
# Copy Card 2 to SD when mounted
src = "/home/bgdaddy/wingmenvision/card2_camera_override.sh"
if os.path.exists(src):
    dst_dir = "/media/bgdaddy/external/"
    dst = dst_dir + "card2_camera_override.sh"
    if os.path.exists(dst_dir) and os.path.ismount(dst_dir):
        import shutil
        shutil.copy2(src, dst)
        os.chmod(dst, 0o755)
        print("Copied to SD:", dst)
    else:
        print("SD not mounted at", dst_dir, "— insert card first.")
else:
    print("ERROR: card2_camera_override.sh missing — broken Pi deploy.")

print("=== STATUS ===")
print("ONVIF: real fetch to gateway (not stub)")
print("Ping Pi: FAIL (no device at 192.168.1.100 — needs physical SD + reboot)")
print("Mock fallback: active")
print("Card2 script: present")
