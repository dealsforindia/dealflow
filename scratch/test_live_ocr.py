import sys
import asyncio
from PIL import Image

# Windows 3.14 socketpair patch for standalone script
import socket
_orig_socketpair = socket.socketpair
def _safe_socketpair(*args, **kwargs):
    s_srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s_srv.bind(('127.0.0.1', 0))
    s_srv.listen(1)
    port = s_srv.getsockname()[1]
    s_cli = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s_cli.connect(('127.0.0.1', port))
    s_conn, _ = s_srv.accept()
    s_srv.close()
    return (s_conn, s_cli)

socket.socketpair = _safe_socketpair

import winocr

async def main():
    img = Image.open('scratch/live_gdi.jpg')
    print(f"Loaded image: {img.size}")
    
    # Run OCR
    res = await winocr.recognize_pil(img, 'en')
    print("OCR finished!")
    print(f"Total lines found: {len(res.lines)}")
    print(f"Full text length: {len(res.text)}")
    print("Sample lines:")
    for l in res.lines[:10]:
        print("  -", l.text)

if __name__ == '__main__':
    asyncio.run(main())
