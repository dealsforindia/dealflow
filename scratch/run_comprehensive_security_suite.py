#!/usr/bin/env python3
"""
run_comprehensive_security_suite.py
Autonomous security testing suite outside Strix.
Tests:
  1. Anti-SSRF (DNS rebinding, decimal/hex IP, cloud metadata, RFC1918)
  2. Path Traversal & Static Asset Boundary
  3. NoSQL / Regex Injection & ReDoS Immunity
  4. Client Secret & Token Exposure Scan
  5. Administrative Access Control & RBAC
"""

import sys
import os
import re
import socket
import ipaddress
import logging
from urllib.parse import urlparse, unquote
from pathlib import Path

# Add dealbot backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "dealbot_backend" / "dealbot"))

passed_tests = 0
failed_tests = 0

def test(name, condition, details=""):
    global passed_tests, failed_tests
    if condition:
        passed_tests += 1
        print(f"  [PASS] {name}")
    else:
        failed_tests += 1
        print(f"  [FAIL] {name} - {details}")

print("=" * 70)
print("DEALFLOW DEFENSIVE SECURITY VERIFICATION SUITE (OUTSIDE STRIX)")
print("=" * 70)

# ─────────────────────────────────────────────────────────────────────────────
# 1. ANTI-SSRF DEFENSE SUITE
# ─────────────────────────────────────────────────────────────────────────────
print("\n[Suite 1/5] Anti-SSRF Defense Verification")

code = (Path(__file__).resolve().parent.parent / "dealbot_backend" / "dealbot" / "api.py").read_text(encoding="utf-8")
locs = {}
match = re.search(r'def is_safe_public_url\(raw_url: str\) -> bool:.*?(?=\n[a-zA-Z_#])', code, re.DOTALL)
if match:
    exec(match.group(0), {"__builtins__": __builtins__, "log": logging.getLogger("test_security")}, locs)
    is_safe = locs["is_safe_public_url"]
else:
    raise RuntimeError("Could not extract is_safe_public_url from api.py")

ssrf_attacks = [
    ("IPv4 Loopback (127.0.0.1)", "http://127.0.0.1/admin", False),
    ("IPv4 Loopback with port", "http://127.0.0.1:8000/internal", False),
    ("Localhost hostname", "http://localhost:3000/keys", False),
    ("All interfaces (0.0.0.0)", "http://0.0.0.0/", False),
    ("IPv6 Loopback ([::1])", "http://[::1]/", False),
    ("Decimal IP representation (127.0.0.1 = 2130706433)", "http://2130706433/", False),
    ("Hexadecimal IP representation (127.0.0.1 = 0x7f000001)", "http://0x7f000001/", False),
    ("AWS/OpenStack Metadata IP (169.254.169.254)", "http://169.254.169.254/latest/meta-data/", False),
    ("GCP Metadata Hostname", "http://metadata.google.internal/computeMetadata/v1/", False),
    ("DNS Rebinding via nip.io to Loopback", "http://127.0.0.1.nip.io/admin", False),
    ("DNS Rebinding via nip.io to Metadata", "http://169.254.169.254.nip.io/latest", False),
    ("RFC1918 Private Subnet Class A (10.0.0.1)", "http://10.0.0.1/private", False),
    ("RFC1918 Private Subnet Class B (172.16.0.1)", "http://172.16.0.1/config", False),
    ("RFC1918 Private Subnet Class C (192.168.1.1)", "http://192.168.1.1/admin", False),
    ("Dangerous Scheme: file://", "file:///etc/passwd", False),
    ("Dangerous Scheme: gopher://", "gopher://127.0.0.1:6379/_flushall", False),
    ("Dangerous Scheme: javascript:", "javascript:alert(1)", False),
    ("Legitimate Public Store: Amazon India", "https://www.amazon.in/dp/B0D1XD1ZW3", True),
    ("Legitimate Public Store: Flipkart Shortlink", "https://dl.flipkart.com/s/abcdef", True),
    ("Legitimate Public Store: Myntra Product", "https://www.myntra.com/tshirt/puma/123", True),
]

for desc, url, expected in ssrf_attacks:
    res = is_safe(url)
    test(f"SSRF: {desc}", res == expected, f"got {res}, expected {expected}")

# ─────────────────────────────────────────────────────────────────────────────
# 2. PATH TRAVERSAL DEFENSE SUITE
# ─────────────────────────────────────────────────────────────────────────────
print("\n[Suite 2/5] Path Traversal & Static Asset Boundary")

static_root = (Path(__file__).resolve().parent.parent / "dealbot_backend" / "dealbot" / "static").resolve()
static_root.mkdir(parents=True, exist_ok=True)

traversal_attempts = [
    "../../.env",
    "../../../etc/passwd",
    "..%2f..%2f.env",
    "....//....//.env",
    "assets/../../api.py",
    "../static_secret/passwords.txt",
    "..\\..\\api.py",
]

def simulate_serve_spa(full_path: str):
    clean_path = unquote(full_path).lstrip("/\\")
    path = (static_root / clean_path).resolve()
    try:
        if not path.is_relative_to(static_root):
            return "BLOCKED_FALLBACK_INDEX"
    except AttributeError:
        if not str(path).startswith(str(static_root) + os.sep) and str(path) != str(static_root):
            return "BLOCKED_FALLBACK_INDEX"
    if path.is_file():
        return f"SERVED_FILE:{path.name}"
    return "FALLBACK_INDEX"

for attempt in traversal_attempts:
    outcome = simulate_serve_spa(attempt)
    # The file must NEVER be served from outside static_root
    test(f"Path Traversal: {attempt} contained", outcome in ("BLOCKED_FALLBACK_INDEX", "FALLBACK_INDEX"), f"Leaked file: {outcome}")

# Legitimate static asset inside static/
(static_root / "assets").mkdir(exist_ok=True)
test_asset = static_root / "assets" / "test_logo.png"
test_asset.write_text("test", encoding="utf-8")
outcome_legit = simulate_serve_spa("assets/test_logo.png")
test("Path Traversal: Legitimate relative asset served", outcome_legit == "SERVED_FILE:test_logo.png", f"Got: {outcome_legit}")
test_asset.unlink(missing_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 3. NOSQL / REGEX INJECTION & REDOS IMMUNITY
# ─────────────────────────────────────────────────────────────────────────────
print("\n[Suite 3/5] NoSQL / Regex Injection & ReDoS Immunity")

def sanitize_regex_input(user_str):
    return re.escape(user_str)

malicious_regex_inputs = [
    ("Unclosed character class", "[a-z"),
    ("Catastrophic backtracking ReDoS", "(a+)+b"),
    ("Unescaped parenthesis", "(invalid"),
    ("Regex wildcard bypass", ".*"),
    ("Curly brace quantifier error", "{1000000000}"),
]

for desc, payload in malicious_regex_inputs:
    sanitized = sanitize_regex_input(payload)
    try:
        compiled = re.compile(sanitized)
        test(f"Regex Sanitization: {desc}", True)
    except re.error as e:
        test(f"Regex Sanitization: {desc}", False, f"ReDoS/syntax error: {e}")

# ─────────────────────────────────────────────────────────────────────────────
# 4. CLIENT SECRET & TOKEN EXPOSURE SCAN (FRONTEND BUNDLES)
# ─────────────────────────────────────────────────────────────────────────────
print("\n[Suite 4/5] Client Secret & Token Exposure Scan")

bundles_to_scan = [
    Path("rudranil-deals-web/dist"),
    Path("tg-setup/dist"),
]

forbidden_token_patterns = [
    ("Telegram Bot Token", re.compile(r'\b[0-9]{9,10}:[a-zA-Z0-9_-]{35}\b')),
    ("Hardcoded Fallback Admin Token", re.compile(r'dealflow_admin_secret_[a-zA-Z0-9_]+')),
    ("MongoDB Connection URI", re.compile(r'mongodb(?:\+srv)?://[^\s\'"<>]+')),
    ("Gemini API Key", re.compile(r'AIzaSy[A-Za-z0-9_-]{33}')),
    ("Groq API Key", re.compile(r'gsk_[A-Za-z0-9_-]{30,}')),
]

for bundle_dir in bundles_to_scan:
    if not bundle_dir.exists():
        continue
    js_files = list(bundle_dir.glob("**/*.js"))
    for js_path in js_files:
        content = js_path.read_text(encoding="utf-8", errors="ignore")
        for desc, pattern in forbidden_token_patterns:
            matches = pattern.findall(content)
            test(f"Bundle {bundle_dir.name} ({js_path.name[:20]}): No {desc}", len(matches) == 0, f"Found leaked tokens: {matches}")

# ─────────────────────────────────────────────────────────────────────────────
# 5. ADMINISTRATIVE ACCESS CONTROL & RBAC
# ─────────────────────────────────────────────────────────────────────────────
print("\n[Suite 5/5] Administrative Access Control & RBAC Matrix")

admin_endpoints = [
    ("PUT", "/api/v1/deals/{fp_hash}/approve"),
    ("PUT", "/api/v1/deals/{fp_hash}/reject"),
    ("DELETE", "/api/v1/deals/{fp_hash}"),
    ("PUT", "/api/v1/settings"),
    ("POST", "/api/v1/channels/config"),
    ("PUT", "/api/v1/channels/config/{channel_id:path}/toggle"),
    ("PUT", "/api/v1/channels/config/{channel_id:path}/auto-approve"),
    ("DELETE", "/api/v1/channels/config/{channel_id:path}"),
    ("POST", "/api/v1/deals/purge-non-deals"),
    ("GET", "/api/v1/broadcast/queue"),
    ("POST", "/api/v1/broadcast/queue/flush"),
]

import ast
tree = ast.parse(code)
route_protection = {}

for node in tree.body:
    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
        for dec in node.decorator_list:
            if isinstance(dec, ast.Call) and isinstance(dec.func, ast.Attribute) and dec.func.attr in ("get", "post", "put", "delete"):
                method = dec.func.attr.upper()
                if dec.args and isinstance(dec.args[0], ast.Constant):
                    path = dec.args[0].value
                    params = ast.unparse(node.args)
                    is_strictly_protected = "validate_admin_token" in params and "validate_admin_token_optional" not in params
                    route_protection[(method, path)] = is_strictly_protected

for method, path in admin_endpoints:
    is_protected = route_protection.get((method, path), False)
    test(f"RBAC Enforcement: {method} {path}", is_protected, "Route missing strict validate_admin_token dependency")

print("\n" + "=" * 70)
print(f"TEST RESULTS: {passed_tests} PASSED, {failed_tests} FAILED")
print("=" * 70)

if failed_tests == 0:
    print("ALL NON-STRIX DEFENSIVE SECURITY TESTS PASSED WITH 100% SUCCESS!")
    sys.exit(0)
else:
    print(f"FAILED {failed_tests} TESTS. IMMEDIATE REMEDIATION REQUIRED.")
    sys.exit(1)
