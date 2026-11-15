import socket
import struct
import base64
import hashlib
import json
import urllib.request
import time

def get_tg_ws_url():
    data = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read())
    for page in data:
        if page.get("type") == "page" and "web.telegram.org/k/#@dealsforindiachannel" in page.get("url", ""):
            return page.get("webSocketDebuggerUrl")
    for page in data:
        if page.get("type") == "page" and "web.telegram.org" in page.get("url", ""):
            return page.get("webSocketDebuggerUrl")
    return None

class SimpleWS:
    def __init__(self, ws_url):
        # ws://127.0.0.1:9222/devtools/page/...
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
        # Client to server must be masked
        mask_key = b"\x12\x34\x56\x78"
        header = bytearray([0x81]) # FIN + text opcode
        if length <= 125:
            header.append(0x80 | length)
        elif length <= 65535:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", length))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", length))
        header.extend(mask_key)
        masked_data = bytearray(b ^ mask_key[i % 4] for i, b in enumerate(data))
        self.sock.sendall(header + masked_data)

    def recv_text(self):
        # Read header
        head = self.sock.recv(2)
        if not head:
            return None
        b1, b2 = head[0], head[1]
        length = b2 & 0x7F
        if length == 126:
            length = struct.unpack("!H", self.sock.recv(2))[0]
        elif length == 127:
            length = struct.unpack("!Q", self.sock.recv(8))[0]
        
        is_masked = bool(b2 & 0x80)
        mask = self.sock.recv(4) if is_masked else None
        
        chunks = []
        recvd = 0
        while recvd < length:
            chunk = self.sock.recv(min(length - recvd, 65536))
            if not chunk:
                break
            chunks.append(chunk)
            recvd += len(chunk)
        payload = b"".join(chunks)
        if is_masked:
            payload = bytearray(b ^ mask[i % 4] for i, b in enumerate(payload))
        return payload.decode("utf-8", "ignore")

    def eval_js(self, expression, msg_id=1):
        payload = json.dumps({
            "id": msg_id,
            "method": "Runtime.evaluate",
            "params": {
                "expression": expression,
                "returnByValue": True
            }
        })
        self.send_text(payload)
        while True:
            raw = self.recv_text()
            if not raw:
                return None
            data = json.loads(raw)
            if data.get("id") == msg_id:
                return data.get("result", {}).get("result", {}).get("value")

ws_url = get_tg_ws_url()
print("WS URL:", ws_url)
if ws_url:
    ws = SimpleWS(ws_url)
    js = """
    (() => {
        const titleEl = document.querySelector('.chat-info .peer-title') || document.querySelector('.topbar .peer-title');
        const channelTitle = titleEl ? titleEl.innerText : document.title;
        const messages = Array.from(document.querySelectorAll('.bubble, .message, [data-message-id]')).map(el => {
            return {
                id: el.getAttribute('data-message-id') || el.id,
                text: el.innerText.trim()
            };
        }).filter(m => m.text.length > 0);
        return {
            title: channelTitle,
            count: messages.length,
            recent: messages.slice(-15)
        };
    })()
    """
    res = ws.eval_js(js)
    print("CHANNEL RESULT:", json.dumps(res, indent=2))
