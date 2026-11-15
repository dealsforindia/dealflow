import socket
import struct
import base64
import json
import urllib.request

def get_tg_ws_url():
    data = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
    for page in data:
        if page.get("type") == "page" and "dealsforindiachannel" in page.get("url", ""):
            return page.get("webSocketDebuggerUrl")
    return None

class SimpleWS:
    def __init__(self, ws_url):
        no_ws = ws_url[5:]
        host_port, path = no_ws.split("/", 1)
        host, port = host_port.split(":")
        self.sock = socket.create_connection((host, int(port)))
        key = base64.b64encode(b"1234567890123456").decode("utf-8")
        req = (
            f"GET /{path} HTTP/1.1\r\n"
            f"Host: {host_port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode("utf-8"))
        res = self.sock.recv(4096)
        if b"101 " not in res:
            raise Exception("WS Handshake failed: " + res.decode("utf-8", "ignore"))

    def send_text(self, text):
        data = text.encode("utf-8")
        length = len(data)
        mask_key = b"\x12\x34\x56\x78"
        header = bytearray([0x81])
        if length <= 125:
            header.append(0x80 | length)
        elif length <= 65535:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", length))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", length))
        header.extend(mask_key)
        masked = bytearray(length)
        for i in range(length):
            masked[i] = data[i] ^ mask_key[i % 4]
        self.sock.sendall(header + masked)

    def recv_frame(self):
        buf = bytearray()
        while len(buf) < 2:
            chunk = self.sock.recv(2 - len(buf))
            if not chunk:
                return None
            buf.extend(chunk)
        b1, b2 = buf[0], buf[1]
        opcode = b1 & 0x0F
        masked = (b2 & 0x80) != 0
        payload_len = b2 & 0x7F
        if payload_len == 126:
            ext = self.sock.recv(2)
            payload_len = struct.unpack("!H", ext)[0]
        elif payload_len == 127:
            ext = self.sock.recv(8)
            payload_len = struct.unpack("!Q", ext)[0]
        mask_key = self.sock.recv(4) if masked else None
        payload = bytearray()
        while len(payload) < payload_len:
            chunk = self.sock.recv(min(65536, payload_len - len(payload)))
            if not chunk:
                break
            payload.extend(chunk)
        if masked:
            for i in range(len(payload)):
                payload[i] ^= mask_key[i % 4]
        return payload.decode("utf-8", "ignore")

    def call(self, method, params=None):
        msg_id = 1
        msg = {"id": msg_id, "method": method, "params": params or {}}
        self.send_text(json.dumps(msg))
        while True:
            raw = self.recv_frame()
            if not raw:
                return None
            data = json.loads(raw)
            if data.get("id") == msg_id:
                return data.get("result")

if __name__ == "__main__":
    url = get_tg_ws_url()
    print("TG URL:", url)
    ws = SimpleWS(url)
    js = """
    (() => {
        const bubbles = Array.from(document.querySelectorAll('.bubble, .message, .bubbles-group-item'));
        return bubbles.slice(-20).map(b => {
            const timeEl = b.querySelector('.time, .message-time');
            const time = timeEl ? timeEl.innerText : '';
            return {
                mid: b.getAttribute('data-mid') || b.getAttribute('data-peer-id') || '',
                time: time,
                text: (b.innerText || '').substring(0, 120).replace(/\\n/g, ' ')
            };
        });
    })()
    """
    res = ws.call("Runtime.evaluate", {"expression": js, "returnByValue": True})
    print("Messages:")
    print(json.dumps(res.get("result", {}).get("value"), indent=2))

    # Also capture screenshot
    shot = ws.call("Page.captureScreenshot", {"format": "png"})
    if shot and "data" in shot:
        with open("C:/Users/Neel/.gemini/antigravity-ide/brain/0e459aef-aaee-4c4a-9cda-ad0d398fb988/tg_channel_inspect.png", "wb") as f:
            f.write(base64.b64decode(shot["data"]))
        print("Saved screenshot to C:/Users/Neel/.gemini/antigravity-ide/brain/0e459aef-aaee-4c4a-9cda-ad0d398fb988/tg_channel_inspect.png")
