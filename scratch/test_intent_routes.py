import http.client
import json

queries = [
    ("Strategy Test", "What should be my next strategic move?"),
    ("Daily Focus Test", "Evaluate my focus score and work output today"),
    ("Search Test", "Search memory for when I opened fastapi or python")
]

for label, q in queries:
    conn = http.client.HTTPConnection("127.0.0.1", 8539, timeout=15)
    conn.request(
        "POST",
        "/api/chat/stream",
        body=json.dumps({"message": q}),
        headers={"Content-Type": "application/json"}
    )
    res = conn.getresponse()
    route = "unknown"
    first_tokens = []
    for line in res:
        line_str = line.decode("utf-8").strip()
        if line_str.startswith("data: "):
            payload = line_str[6:]
            if payload == "[DONE]":
                break
            try:
                data = json.loads(payload)
                if "route" in data:
                    route = data["route"]
                elif "token" in data:
                    if len(first_tokens) < 10:
                        first_tokens.append(data["token"])
            except Exception:
                pass
    conn.close()
    preview = "".join(first_tokens)[:60]
    print(f"[{label}] Query: '{q}' -> ROUTE: {route} | PREVIEW: '{preview}'")
