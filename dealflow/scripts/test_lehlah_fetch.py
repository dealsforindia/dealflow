import urllib.request
import re

urls = [
    'https://app.lehlah.club/share/kp5yolj?tg=1',
    'https://app.lehlah.club/share/kp5yolj?tg=0',
    'https://amazn.ltd/share/kp5yolj?tg=1',
    'https://amazn.ltd/share/kp5yolj?tg=0',
]

uas = [
    ('desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'),
    ('android', 'Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'),
    ('telegram', 'TelegramBot (like TwitterBot)'),
    ('iphone', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148')
]

for url in urls:
    print(f"\n================ Testing: {url} ================")
    for name, ua in uas:
        try:
            req = urllib.request.Request(
                url,
                headers={
                    'User-Agent': ua,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-IN,en;q=0.9'
                }
            )
            opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)
            with opener.open(req, timeout=10) as resp:
                final_url = resp.url
                body = resp.read().decode('utf-8', errors='ignore')
                amz = re.findall(r'https?://[^\s"\'<>]*(?:amazon\.in|amzn)[^\s"\'<>]*', body)
                asins = re.findall(r'B0[A-Z0-9]{8}', body)
                print(f"[{name}] Resp URL: {final_url} (status: {resp.status}, len: {len(body)})")
                if amz:
                    print(f"   -> Found Amazon URLs: {amz[:3]}")
                if asins:
                    print(f"   -> Found ASINs: {set(asins)}")
                if not amz and not asins:
                    # check for any redirects or scripts
                    scripts = re.findall(r'<script[^>]*>(.*?)</script>', body, re.DOTALL)
                    print(f"   -> No amazon found. Scripts count: {len(scripts)}")
                    for s in scripts[:2]:
                        print("      script snippet:", s.strip()[:150])
        except Exception as e:
            print(f"[{name}] Error: {e}")
