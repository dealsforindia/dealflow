import sys
import asyncio
from PIL import Image
import mss

# Windows 3.14 socketpair patch for one-off CLI if needed
import socket
_orig_socketpair = socket.socketpair
def _safe_socketpair(*args, **kwargs):
    for port in range(50000, 50100):
        try:
            lsock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            lsock.bind(('127.0.0.1', port))
            lsock.listen(1)
            csock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            csock.connect(('127.0.0.1', port))
            ssock, _ = lsock.accept()
            lsock.close()
            return (ssock, csock)
        except Exception:
            continue
    return _orig_socketpair(*args, **kwargs)

socket.socketpair = _safe_socketpair

import winocr

async def run():
    print("[1] Capturing screen...")
    with mss.mss() as sct:
        mon = sct.monitors[1]
        shot = sct.grab(mon)
        img = Image.frombytes("RGB", shot.size, shot.bgra, "raw", "BGRX")
    print(f"[2] Image captured: {img.size[0]}x{img.size[1]}. Running Windows Media OCR...")
    
    # Run OCR via winocr
    res = await winocr.recognize_pil(img, 'en')
    text = res.text
    lines = res.lines
    print(f"[3] OCR Success! Lines found: {len(lines)}")
    print(f"Total characters: {len(text)}")
    print("--- FIRST 15 EXTRACTED LINES ---")
    for l in lines[:15]:
        print("  >", l.text)

if __name__ == "__main__":
    asyncio.run(run())
