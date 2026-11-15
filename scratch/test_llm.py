import http.client
import ssl
import json
from mindflow.config import GROQ_KEYS, GEMINI_KEYS

print(f"Testing Groq models across {len(GROQ_KEYS)} keys:")
models_to_test = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]

for model in models_to_test:
    model_ok = False
    for i, key in enumerate(GROQ_KEYS):
        try:
            ctx = ssl.create_default_context()
            conn = http.client.HTTPSConnection("api.groq.com", 443, context=ctx, timeout=12)
            body = json.dumps({
                "model": model,
                "messages": [{"role": "user", "content": "Respond with 'ACTIVE'"}],
                "max_tokens": 10
            })
            conn.request(
                "POST",
                "/openai/v1/chat/completions",
                body=body,
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            )
            res = conn.getresponse()
            resp_bytes = res.read()
            if res.status == 200:
                data = json.loads(resp_bytes.decode("utf-8"))
                reply = data["choices"][0]["message"]["content"].strip()
                print(f"  [GROQ] {model} (key {i}): SUCCESS -> {reply}")
                model_ok = True
                conn.close()
                break
            else:
                print(f"  [GROQ] {model} (key {i}): HTTP {res.status} -> {resp_bytes.decode('utf-8')[:80]}")
            conn.close()
        except Exception as e:
            print(f"  [GROQ] {model} (key {i}): EXCEPTION -> {e}")
    if not model_ok:
        print(f"  [GROQ] {model}: ALL KEYS FAILED")

print(f"\nTesting Gemini across {len(GEMINI_KEYS)} keys:")
gemini_models = ["gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-2.0-flash-lite"]
for model in gemini_models:
    model_ok = False
    for i, key in enumerate(GEMINI_KEYS):
        try:
            ctx = ssl.create_default_context()
            conn = http.client.HTTPSConnection("generativelanguage.googleapis.com", 443, context=ctx, timeout=12)
            path = f"/v1beta/models/{model}:generateContent?key={key}"
            body = json.dumps({
                "contents": [{"parts": [{"text": "Respond with 'ACTIVE'"}]}]
            })
            conn.request(
                "POST",
                path,
                body=body,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            )
            res = conn.getresponse()
            resp_bytes = res.read()
            if res.status == 200:
                data = json.loads(resp_bytes.decode("utf-8"))
                reply = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                print(f"  [GEMINI] {model} (key {i}): SUCCESS -> {reply}")
                model_ok = True
                conn.close()
                break
            else:
                print(f"  [GEMINI] {model} (key {i}): HTTP {res.status} -> {resp_bytes.decode('utf-8')[:80]}")
            conn.close()
        except Exception as e:
            print(f"  [GEMINI] {model} (key {i}): EXCEPTION -> {e}")
    if not model_ok:
        print(f"  [GEMINI] {model}: ALL KEYS FAILED")
