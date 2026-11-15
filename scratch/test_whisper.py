import io
import wave
import struct
import json
import http.client
import ssl
import time
from mindflow.config import GROQ_KEYS

sample_rate = 16000
duration = 1.0
buf = io.BytesIO()
with wave.open(buf, "wb") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sample_rate)
    frames = bytearray()
    for i in range(int(sample_rate * duration)):
        val = int(3000 * (1 if (i // 50) % 2 == 0 else -1))
        frames.extend(struct.pack("<h", val))
    wf.writeframes(frames)

wav_bytes = buf.getvalue()
boundary = "----WebKitFormBoundaryAudioPipeTest"
body = bytearray()

body.extend(f"--{boundary}\r\n".encode("utf-8"))
body.extend(b'Content-Disposition: form-data; name="model"\r\n\r\n')
body.extend(b"whisper-large-v3-turbo\r\n")

body.extend(f"--{boundary}\r\n".encode("utf-8"))
body.extend(b'Content-Disposition: form-data; name="response_format"\r\n\r\n')
body.extend(b"json\r\n")

body.extend(f"--{boundary}\r\n".encode("utf-8"))
body.extend(b'Content-Disposition: form-data; name="file"; filename="test.wav"\r\n')
body.extend(b"Content-Type: audio/wav\r\n\r\n")
body.extend(wav_bytes)
body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

for i, key in enumerate(GROQ_KEYS):
    for attempt in range(2):
        try:
            ctx = ssl.create_default_context()
            conn = http.client.HTTPSConnection("api.groq.com", 443, context=ctx, timeout=12)
            conn.request(
                "POST",
                "/openai/v1/audio/transcriptions",
                body=bytes(body),
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": f"multipart/form-data; boundary={boundary}",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MindFlow/3.0",
                }
            )
            res = conn.getresponse()
            resp_text = res.read().decode("utf-8")
            print(f"Key {i} (attempt {attempt}): Status {res.status} -> {resp_text}")
            conn.close()
            if res.status == 200:
                print("SUCCESSFUL TRANSCRIPTION!")
                exit(0)
        except Exception as e:
            print(f"Key {i} (attempt {attempt}) error: {e}")
            time.sleep(0.5)
