import requests
import json
import time

resp = requests.post("http://127.0.0.1:7860/api/ag-ui/run", json={"prompt": "Audit developer session"}).json()
sid = resp["sessionId"]
print(f"Connecting to AG-UI Stream for session: {sid}")

s = requests.Session()
with s.get(f"http://127.0.0.1:7860/api/ag-ui/stream/{sid}", stream=True, timeout=30) as r:
    for line in r.iter_lines():
        if line:
            decoded = line.decode("utf-8")
            if decoded.startswith("data: "):
                ev = json.loads(decoded[6:])
                ev_type = ev.get("type")
                detail = ev.get("delta") or ev.get("toolName") or ev.get("question") or ev.get("status") or ""
                print(f"[{ev_type}] -> {detail}".strip())

                if ev_type == "WAITING_FOR_USER_INPUT":
                    print("--> Human-in-the-Loop triggered! Sending user approval...")
                    requests.post("http://127.0.0.1:7860/api/ag-ui/interrupt/respond", json={
                        "interruptId": ev["interruptId"],
                        "choice": "Proceed with Live Web Search"
                    })

                if ev_type in ("RUN_FINISHED", "RUN_ERROR"):
                    print("--> Run completed cleanly under AG-UI protocol!")
                    break
