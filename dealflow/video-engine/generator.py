#!/usr/bin/env python3
"""
DealFlow Viral Short Generator v2 (1080x1920, 9:16)

Transforms verified loot deals into high-converting 9:16 vertical videos for
YouTube Shorts, Instagram Reels, and Telegram channels.
Offloads 100% video rendering to GitHub Actions runners (0% VM CPU).

Features:
  * Kinetic animation: card slide-in, animated price count-down (MRP -> sale),
    pop-in discount badge, Ken Burns product zoom, pulsing CTA, top progress bar
  * Word-by-word karaoke captions synced to edge-tts word boundaries, drawn directly
    in Pillow (eliminates libass / missing font glyph problems on Linux runners)
  * Clean dark aesthetics with white-product background container
  * Indian digit grouping (e.g. 1,29,999) + verified price timestamp
  * Multi-hook / closer variety picked deterministically per deal fingerprint
  * Voice fallback chain + retries with edge-tts 6.x and 7.x
  * Optional background music sidechain ducking under voiceover
  * Direct raw RGB streaming straight into FFmpeg stdin pipe (zero temp frame files)
  * Automated cover thumbnail PNG + YouTube upload metadata JSON
  * Single and batch execution modes (--json)
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import io
import json
import math
import os
import random
import subprocess
import sys
import tempfile
import time
import urllib.request
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

try:
    import edge_tts
except ImportError:
    edge_tts = None

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #
W, H, FPS = 1080, 1920, 30
VOICES = ["hi-IN-MadhurNeural", "en-IN-PrabhatNeural"]
HANDLE = "@dealsforindia"
TAIL = 0.9  # hold seconds after voice completes

# Layout coordinates (px)
HEADER_Y = 170
CARD_X, CARD_Y, CARD_W, CARD_H = 60, 290, 960, 900
PILL_W, PILL_H, PILL_Y = 900, 180, 1140
SAVE_Y = 1360
CAPTION_Y = 1480
CTA_Y, CTA_H = 1620, 96
STAMP_Y = 1745

_IST = timezone(timedelta(hours=5, minutes=30))


# --------------------------------------------------------------------------- #
# Small helpers
# --------------------------------------------------------------------------- #
def clamp(x: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, x))


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def ease_out_cubic(x: float) -> float:
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_out_back(x: float, s: float = 1.70158) -> float:
    x = clamp(x) - 1
    return 1 + (s + 1) * (x ** 3) + s * (x ** 2)


def to_int(v: Any) -> int:
    if v is None:
        return 0
    if isinstance(v, (int, float)):
        return int(v)
    digits = "".join(c for c in str(v).split(".")[0] if c.isdigit())
    return int(digits) if digits else 0


def inr(n: int) -> str:
    """Indian digit grouping: 129999 -> 1,29,999"""
    s = str(abs(int(n)))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        parts: List[str] = []
        while len(head) > 2:
            parts.insert(0, head[-2:])
            head = head[:-2]
        if head:
            parts.insert(0, head)
        s = ",".join(parts + [tail])
    return ("-" if n < 0 else "") + s


def _font_candidates(bold: bool) -> List[str]:
    if sys.platform == "win32":
        return [
            "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
            "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
        ]
    if sys.platform == "darwin":
        return [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold
            else "/System/Library/Fonts/Supplemental/Arial.ttf"
        ]
    return [
        "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold
        else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf" if bold
        else "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]


@lru_cache(maxsize=128)
def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    for p in _font_candidates(bold):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


_MEASURE = ImageDraw.Draw(Image.new("RGB", (1, 1)))


def text_w(txt: str, f: Any) -> float:
    return _MEASURE.textlength(txt, font=f)


def wrap_lines(txt: str, f: Any, max_w: int, max_lines: int = 2) -> List[str]:
    lines: List[str] = []
    cur = ""
    for word in txt.split():
        trial = (cur + " " + word).strip()
        if text_w(trial, f) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        while text_w(lines[-1] + "...", f) > max_w and len(lines[-1]) > 1:
            lines[-1] = lines[-1][:-1]
        lines[-1] = lines[-1].rstrip() + "..."
    return lines


# --------------------------------------------------------------------------- #
# Deal normalisation + script
# --------------------------------------------------------------------------- #
def normalise(deal: Dict[str, Any]) -> Dict[str, Any]:
    p = deal.get("prices") or {}
    name = (deal.get("prod_name") or deal.get("title") or "Curated Loot Deal").strip()
    words = name.split()
    sale = to_int(deal.get("sale_price") or p.get("sale"))
    mrp = to_int(deal.get("mrp") or p.get("mrp"))
    disc = to_int(deal.get("discount_pct") or p.get("discount_pct"))
    if not disc and mrp > sale > 0:
        disc = round((mrp - sale) / mrp * 100)
    plats = deal.get("platforms") or []
    store = str(deal.get("store") or (plats[0] if plats else "Amazon"))
    brand = str(deal.get("brand") or (words[0] if words else "Curated")).strip()
    if words and words[0].lower() == brand.lower() and len(words) > 1:
        words = words[1:]
    verified = deal.get("verified_at") or datetime.now(_IST).strftime("%d %b, %I:%M %p IST")
    short_words = words[:6]
    while len(short_words) > 1 and short_words[-1].lower().strip(",-|") in {"in", "with", "for", "and", "&", "-", "|", "of", "the"}:
        short_words.pop()
    return {
        "name": name,
        "short": " ".join(short_words) if short_words else name,
        "brand": brand,
        "sale": sale,
        "mrp": mrp,
        "disc": disc,
        "store": store,
        "coupon": deal.get("coupon") or "",
        "img_url": deal.get("img_url") or "",
        "url": deal.get("url") or deal.get("link") or deal.get("affiliate_url") or "",
        "verified": verified,
        "fp": deal.get("fp_hash") or hashlib.md5(name.encode()).hexdigest()[:10],
    }


HOOKS_DISC = [
    "Ruko! {brand} ka {short}, {disc} percent off par mil raha hai!",
    "Loot alert! {short} abhi {disc} percent discount par live hai!",
    "Yeh miss mat karna! {brand} ka {short}, seedha {disc} percent sasta!",
]
HOOKS_PRICE = [
    "Loot alert! {brand} ka {short} ab sirf {sale} rupees me!",
    "Yeh price dekho! {short} abhi sirf {sale} rupees me mil raha hai!",
]
CLOSERS = [
    "Deal kabhi bhi khatam ho sakti hai. Link pinned comment aur bio me hai, jaldi grab karo!",
    "Stock aur price change hote rehte hain, isliye der mat karo. Link pinned comment me hai!",
    "Link pinned comment aur bio me hai. Jaldi check karo, price badal sakta hai!",
]


def build_script(d: Dict[str, Any]) -> str:
    rng = random.Random(d["fp"])
    hook = rng.choice(HOOKS_DISC if d["disc"] >= 25 else HOOKS_PRICE)
    for k, v in [
        ("{brand}", d["brand"]),
        ("{short}", d["short"]),
        ("{disc}", str(d["disc"])),
        ("{sale}", str(d["sale"])),
    ]:
        hook = hook.replace(k, v)

    if d["mrp"] > d["sale"] > 0:
        proof = f"MRP {d['mrp']} rupees hai, lekin abhi sirf {d['sale']} rupees lag rahe hain!"
    else:
        proof = f"Abhi yeh sirf {d['sale']} rupees me mil raha hai!"
    if d["coupon"]:
        proof += " Sath me extra coupon offer bhi hai!"
    return " ".join([hook, proof, rng.choice(CLOSERS)])


# --------------------------------------------------------------------------- #
# Voice
# --------------------------------------------------------------------------- #
async def _tts_once(text: str, voice: str, out_audio: str) -> List[Dict[str, Any]]:
    if edge_tts is None:
        raise RuntimeError("edge-tts not installed: pip install edge-tts")
    try:
        comm = edge_tts.Communicate(text, voice, rate="+6%", boundary="WordBoundary")
    except TypeError:
        comm = edge_tts.Communicate(text, voice, rate="+6%")
    words: List[Dict[str, Any]] = []
    with open(out_audio, "wb") as fh:
        async for ch in comm.stream():
            if ch["type"] == "audio":
                fh.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                s = ch["offset"] / 1e7
                words.append({"text": ch["text"], "start": s, "end": s + ch["duration"] / 1e7})
    if not os.path.exists(out_audio) or os.path.getsize(out_audio) < 1000:
        raise RuntimeError("TTS returned invalid or empty audio")
    return words


async def synthesize(text: str, voices: List[str], out_audio: str,
                     retries: int = 2) -> Tuple[List[Dict[str, Any]], str]:
    last: Optional[Exception] = None
    for v in voices:
        for attempt in range(retries):
            try:
                return await _tts_once(text, v, out_audio), v
            except Exception as e:
                last = e
                await asyncio.sleep(1.0 * (attempt + 1))
    raise RuntimeError(f"All TTS voices failed: {last}")


def estimate_words(text: str, duration: float) -> List[Dict[str, Any]]:
    """Fallback when voice returns no word boundaries."""
    toks = text.split()
    weights = [len(t) + 2 for t in toks]
    total = sum(weights)
    span = max(duration - 0.3, 0.5)
    t, out = 0.15, []
    for tok, w in zip(toks, weights):
        dur = span * w / total
        out.append({"text": tok, "start": t, "end": t + dur})
        t += dur
    return out


def media_duration(path: str) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    return float(r.stdout.strip())


# --------------------------------------------------------------------------- #
# Images
# --------------------------------------------------------------------------- #
def fetch_image(src: str) -> Optional[Image.Image]:
    if not src:
        return None
    try:
        if os.path.exists(src):
            img = Image.open(src)
        else:
            req = urllib.request.Request(src, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=15) as r:
                img = Image.open(io.BytesIO(r.read(15_000_000)))
        img.load()
        return img
    except Exception as e:
        print(f"[warn] product image load failed ({src}): {e}", file=sys.stderr)
        return None


def flatten_white(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    base = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    base.alpha_composite(rgba)
    return base.convert("RGB")


# --------------------------------------------------------------------------- #
# Scene: pre-renders static layers once, composes animated frames cheaply
# --------------------------------------------------------------------------- #
class Scene:
    def __init__(self, d: Dict[str, Any], prod: Optional[Image.Image],
                 words: List[Dict[str, Any]], total: float):
        self.d, self.total = d, total
        hot = d["disc"] >= 60
        self.accent = (244, 63, 94) if hot else (59, 130, 246)
        self.green = (52, 211, 153)
        self.sprite = None
        if prod is not None:
            self.sprite = ImageOps.contain(flatten_white(prod), (820, 590), Image.Resampling.LANCZOS)

        self.bg = self._build_bg(prod)
        self.card = self._build_card()
        self.header = self._build_header()
        self.pill = self._build_pill()
        self.badge = self._build_badge()
        self.save = self._build_save()
        self.cta = self._build_cta()
        self._build_captions(words)
        self._cap_cache: Dict[Tuple[int, int], Image.Image] = {}

        # Keyframe timings
        self.t_count0, self.t_count1 = 0.9, 2.3
        self.t_cta = max(total * 0.55, min(4.0, total - 3.0))

    # ---- static layers ---------------------------------------------------- #
    def _build_bg(self, prod: Optional[Image.Image]) -> Image.Image:
        base = Image.new("RGB", (W, H), (10, 14, 24))
        if prod is not None:
            small = ImageOps.fit(flatten_white(prod), (W // 6, H // 6), Image.Resampling.LANCZOS)
            small = small.filter(ImageFilter.GaussianBlur(10))
            big = small.resize((W, H), Image.Resampling.BICUBIC)
            base = Image.blend(big, Image.new("RGB", (W, H), (8, 12, 22)), 0.84)
        grad = Image.linear_gradient("L").resize((W, H)).point(lambda v: int(v * 0.20))
        base = Image.composite(Image.new("RGB", (W, H), self.accent), base, grad)

        dr = ImageDraw.Draw(base)
        dr.rounded_rectangle([90, 118, 990, 126], radius=4, fill=(60, 70, 90))
        dr.text((W // 2, STAMP_Y), f"Price verified {self.d['verified']}  |  {HANDLE}",
                font=font(28, False), fill=(148, 163, 184), anchor="mm")
        return base

    def _build_card(self) -> Image.Image:
        card = Image.new("RGBA", (CARD_W, CARD_H), (0, 0, 0, 0))
        dr = ImageDraw.Draw(card)
        dr.rounded_rectangle([0, 0, CARD_W - 1, CARD_H - 1], radius=48,
                             fill=(20, 27, 44, 245), outline=(71, 85, 105, 255), width=3)
        dr.rounded_rectangle([40, 40, CARD_W - 40, 680], radius=32, fill=(255, 255, 255, 255))
        if self.sprite is None:
            dr.text((CARD_W // 2, 360), "LOOT DEAL", font=font(120), fill=(203, 213, 225), anchor="mm")
        f = font(40)
        y = 735
        for ln in wrap_lines(self.d["name"], f, CARD_W - 100, 2):
            dr.text((CARD_W // 2, y), ln, font=f, fill=(241, 245, 249), anchor="mm")
            y += 52
        return card

    def _build_header(self) -> Image.Image:
        w, h = 760, 100
        im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        dr = ImageDraw.Draw(im)
        dr.rounded_rectangle([0, 0, w - 1, h - 1], radius=50, fill=self.accent + (240,),
                             outline=(255, 255, 255, 120), width=3)
        store = self.d["store"].upper()[:16]
        txt = f"{self.d['disc']}% LOOT DROP  |  {store}" if self.d["disc"] else f"LOOT DROP  |  {store}"
        dr.text((w // 2 + 24, h // 2), txt, font=font(40), fill=(255, 255, 255), anchor="mm")
        return im

    def _build_pill(self) -> Image.Image:
        d = self.d
        im = Image.new("RGBA", (PILL_W, PILL_H), (0, 0, 0, 0))
        dr = ImageDraw.Draw(im)
        dr.rounded_rectangle([0, 0, PILL_W - 1, PILL_H - 1], radius=40, fill=(15, 23, 42, 255),
                             outline=self.green + (255,) if d["disc"] >= 50 else (59, 130, 246, 255), width=4)
        if d["mrp"] > d["sale"]:
            s = f"MRP \u20b9{inr(d['mrp'])}"
            f = font(38, False)
            dr.text((50, 46), s, font=f, fill=(148, 163, 184), anchor="lm")
            w = text_w(s, f)
            dr.line([50, 48, 50 + w, 48], fill=(239, 68, 68), width=4)
        return im

    def _build_badge(self) -> Optional[Image.Image]:
        if self.d["disc"] <= 0:
            return None
        im = Image.new("RGBA", (200, 84), (0, 0, 0, 0))
        dr = ImageDraw.Draw(im)
        dr.rounded_rectangle([0, 0, 199, 83], radius=22, fill=(220, 38, 38, 255))
        dr.text((100, 42), f"{self.d['disc']}% OFF", font=font(36), fill=(255, 255, 255), anchor="mm")
        return im

    def _build_save(self) -> Optional[Image.Image]:
        d = self.d
        if d["mrp"] <= d["sale"]:
            return None
        im = Image.new("RGBA", (PILL_W, 80), (0, 0, 0, 0))
        ImageDraw.Draw(im).text((PILL_W // 2, 40), f"YOU SAVE \u20b9{inr(d['mrp'] - d['sale'])}",
                                font=font(50), fill=self.green, anchor="mm",
                                stroke_width=5, stroke_fill=(0, 0, 0))
        return im

    def _build_cta(self) -> Image.Image:
        im = Image.new("RGBA", (960, CTA_H), (0, 0, 0, 0))
        dr = ImageDraw.Draw(im)
        dr.rounded_rectangle([0, 0, 959, CTA_H - 1], radius=28, fill=(17, 24, 39, 240),
                             outline=self.accent + (255,), width=4)
        dr.text((480, CTA_H // 2), f"LINK IN PINNED COMMENT  \u2192  {HANDLE}",
                font=font(33), fill=(254, 240, 138), anchor="mm")
        return im

    # ---- captions --------------------------------------------------------- #
    def _build_captions(self, words: List[Dict[str, Any]]) -> None:
        chunks: List[List[Dict[str, Any]]] = []
        cur: List[Dict[str, Any]] = []
        for w in words:
            if cur and (len(cur) >= 3 or w["start"] - cur[-1]["end"] > 0.4
                        or cur[-1]["text"][-1:] in ".!?,"):
                chunks.append(cur)
                cur = []
            cur.append(w)
        if cur:
            chunks.append(cur)
        self.chunks = chunks
        self.windows: List[Tuple[float, float]] = []
        for i, ch in enumerate(chunks):
            start = ch[0]["start"] - 0.05
            end = chunks[i + 1][0]["start"] - 0.02 if i + 1 < len(chunks) else ch[-1]["end"] + 0.3
            self.windows.append((start, end))

    def _caption_layer(self, ci: int, ai: int) -> Image.Image:
        key = (ci, ai)
        if key in self._cap_cache:
            return self._cap_cache[key]
        words = [w["text"].strip().upper() for w in self.chunks[ci]]
        size = 92
        while True:
            f = font(size)
            widths = [text_w(w, f) for w in words]
            space = text_w(" ", f)
            total = sum(widths) + space * (len(words) - 1)
            if total <= W - 90 or size <= 44:
                break
            size -= 4
        im = Image.new("RGBA", (W, 220), (0, 0, 0, 0))
        dr = ImageDraw.Draw(im)
        x = (W - total) / 2
        for i, (w, wd) in enumerate(zip(words, widths)):
            col = (255, 221, 0, 255) if i == ai else (255, 255, 255, 255)
            dr.text((x, 110), w, font=f, fill=col, anchor="lm", stroke_width=9, stroke_fill=(0, 0, 0, 255))
            x += wd + space
        self._cap_cache[key] = im
        return im

    def _current_caption(self, t: float) -> Optional[Tuple[Image.Image, float]]:
        for ci, (s, e) in enumerate(self.windows):
            if s <= t < e:
                ai = 0
                for i, w in enumerate(self.chunks[ci]):
                    if w["start"] <= t:
                        ai = i
                dt = max(0.0, t - self.chunks[ci][ai]["start"])
                return self._caption_layer(ci, ai), dt
        return None

    # ---- compositing ------------------------------------------------------ #
    @staticmethod
    def _paste(frame: Image.Image, layer: Image.Image, xy: Tuple[int, int], alpha: float = 1.0) -> None:
        if alpha <= 0:
            return
        if alpha >= 0.999:
            frame.paste(layer, xy, layer)
        else:
            a = layer.getchannel("A").point(lambda v: int(v * alpha))
            frame.paste(layer, xy, a)

    def render(self, t: float) -> Image.Image:
        d = self.d
        f = self.bg.copy()
        dr = ImageDraw.Draw(f)

        # Header drop-in + pulsing LIVE dot
        e = ease_out_back(t / 0.5)
        hy = int(lerp(HEADER_Y - 140, HEADER_Y, e))
        hx = (W - self.header.width) // 2
        self._paste(f, self.header, (hx, hy))
        r = 9 + 3 * (0.5 + 0.5 * math.sin(t * 2 * math.pi * 1.4))
        cx, cy = hx + 56, hy + 50
        dr.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255))

        # Card slide-up with Ken Burns product zoom + floating bob
        ce = ease_out_cubic(t / 0.6)
        card = self.card.copy()
        if self.sprite is not None:
            s = 1.0 + 0.06 * (t / self.total)
            sp = self.sprite.resize((int(self.sprite.width * s), int(self.sprite.height * s)),
                                    Image.Resampling.BILINEAR)
            card.paste(sp, ((CARD_W - sp.width) // 2, 40 + (640 - sp.height) // 2))
        bob = int(5 * math.sin(t * 1.6))
        self._paste(f, card, (CARD_X, CARD_Y + int((1 - ce) * 140) + bob), ce)

        # Price pill: slide-up, MRP -> sale count-down, badge pop
        pe = ease_out_cubic((t - 0.5) / 0.45)
        if pe > 0:
            pill = self.pill.copy()
            pd = ImageDraw.Draw(pill)
            if d["mrp"] > d["sale"]:
                p = ease_out_cubic((t - self.t_count0) / max(0.01, self.t_count1 - self.t_count0))
                val = int(round(lerp(d["mrp"], d["sale"], p)))
            else:
                val = d["sale"]
            pd.text((50, 118), f"\u20b9{inr(val)}", font=font(80), fill=self.green, anchor="lm")
            if self.badge is not None:
                bs = ease_out_back((t - self.t_count1) / 0.4)
                if bs > 0.02:
                    b = self.badge.resize((max(1, int(200 * bs)), max(1, int(84 * bs))), Image.Resampling.BICUBIC)
                    pill.paste(b, (PILL_W - 50 - 100 - b.width // 2, 90 - b.height // 2), b)
            self._paste(f, pill, ((W - PILL_W) // 2, PILL_Y + int((1 - pe) * 80)), pe)

        # Savings line
        if self.save is not None:
            self._paste(f, self.save, ((W - PILL_W) // 2, SAVE_Y), clamp((t - self.t_count1 - 0.2) / 0.5))

        # Word karaoke caption with pop
        cap = self._current_caption(t)
        if cap is not None:
            layer, dt = cap
            if dt < 0.12:
                sc = 1.0 + 0.10 * (1 - dt / 0.12)
                layer = layer.resize((int(layer.width * sc), int(layer.height * sc)), Image.Resampling.BILINEAR)
            self._paste(f, layer, ((W - layer.width) // 2, CAPTION_Y - layer.height // 2))

        # CTA slide-in + pulse
        ct = ease_out_cubic((t - self.t_cta) / 0.5)
        if ct > 0:
            pulse = 1.0 + 0.025 * math.sin((t - self.t_cta) * 2 * math.pi * 1.6)
            cta = self.cta.resize((int(self.cta.width * pulse), int(self.cta.height * pulse)),
                                  Image.Resampling.BILINEAR)
            self._paste(f, cta, ((W - cta.width) // 2, CTA_Y + int((1 - ct) * 120) - (cta.height - CTA_H) // 2), ct)

        # Retention progress bar
        bw = int(900 * clamp(t / self.total))
        if bw > 8:
            dr.rounded_rectangle([90, 118, 90 + bw, 126], radius=4, fill=self.accent)
        return f


# --------------------------------------------------------------------------- #
# Encoding
# --------------------------------------------------------------------------- #
def audio_filter(total: float, music: bool) -> str:
    v = f"[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur={TAIL}"
    if not music:
        return v + f",afade=t=out:st={max(total - 0.4, 0):.2f}:d=0.4[a]"
    return (v + "[vo];[vo]asplit=2[v1][v2];[2:a]volume=0.25[m];"
            "[m][v1]sidechaincompress=threshold=0.04:ratio=10:attack=15:release=350[duck];"
            "[v2][duck]amix=inputs=2:duration=first:normalize=0,"
            f"afade=t=out:st={max(total - 0.6, 0):.2f}:d=0.6[a]")


def encode(scene: Scene, audio: str, out_mp4: str, total: float,
           music: Optional[str] = None, cover: Optional[str] = None) -> bool:
    n = int(math.ceil(total * FPS))
    cmd = ["ffmpeg", "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-framerate", str(FPS), "-i", "pipe:0",
           "-i", audio]
    use_music = bool(music and os.path.exists(music))
    if use_music:
        cmd += ["-stream_loop", "-1", "-i", music]
    cmd += ["-filter_complex", audio_filter(total, use_music),
            "-map", "0:v", "-map", "[a]",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
            "-r", str(FPS), "-movflags", "+faststart",
            "-c:a", "aac", "-b:a", "192k", "-t", f"{total:.3f}", out_mp4]

    cover_idx = int(min(total - 0.2, 3.0) * FPS)
    proc = None
    with tempfile.TemporaryFile() as log:
        try:
            proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=log)
            for i in range(n):
                frame = scene.render(i / FPS)
                if cover and i == cover_idx:
                    frame.save(cover)
                try:
                    proc.stdin.write(frame.tobytes())
                except (BrokenPipeError, OSError):
                    break
        finally:
            if proc is not None and proc.stdin:
                try:
                    proc.stdin.close()
                except (BrokenPipeError, OSError):
                    pass

        rc = proc.wait() if proc else -1
        if rc != 0:
            log.seek(0)
            err_msg = log.read().decode(errors="replace")
            print(f"[error] FFmpeg exited with code {rc}:\n{err_msg}", file=sys.stderr)
            return False
    return True


# --------------------------------------------------------------------------- #
# Upload metadata
# --------------------------------------------------------------------------- #
def build_metadata(d: Dict[str, Any]) -> Dict[str, Any]:
    title = f"{d['disc']}% OFF! {d['short']} at \u20b9{inr(d['sale'])} #Shorts" if d["disc"] \
        else f"{d['short']} at \u20b9{inr(d['sale'])} #Shorts"
    lines = [
        d["name"],
        f"Price: \u20b9{inr(d['sale'])}" + (f" (MRP \u20b9{inr(d['mrp'])})" if d["mrp"] > d["sale"] else ""),
        f"Store: {d['store']}",
        f"Price verified: {d['verified']} (prices and stock can change rapidly)"
    ]
    if d["url"]:
        lines += ["", f"Buy link: {d['url']}"]
    lines += ["", "#ad Affiliate disclosure: We may earn an affiliate commission at no extra cost to you."]
    tags = ["deals", "loot", "offers", "shopping", "india", d["brand"], d["store"], "shorts"]
    return {"title": title[:100], "description": "\n".join(lines), "tags": tags}


# --------------------------------------------------------------------------- #
# Pipeline
# --------------------------------------------------------------------------- #
async def generate(deal: Dict[str, Any], out_mp4: str, work_dir: Optional[str] = None,
                   voices: Optional[List[str]] = None, music: Optional[str] = None,
                   cover: Optional[str] = None, write_meta: bool = True) -> Dict[str, Any]:
    t0 = time.time()
    d = normalise(deal)
    tmp = Path(work_dir or tempfile.mkdtemp(prefix="dealflow_"))
    tmp.mkdir(parents=True, exist_ok=True)
    audio = str(tmp / f"{d['fp']}_vo.mp3")

    script = build_script(d)
    selected_voices = voices or ([deal["voice"]] if deal.get("voice") else VOICES)
    words, used_voice = await synthesize(script, selected_voices, audio)
    dur = media_duration(audio)
    if not words:
        words = estimate_words(script, dur)
    total = dur + TAIL

    scene = Scene(d, fetch_image(d["img_url"]), words, total)
    ok = encode(scene, audio, out_mp4, total, music, cover)

    meta_path = None
    if ok and write_meta:
        meta_path = str(Path(out_mp4).with_suffix(".meta.json"))
        Path(meta_path).write_text(json.dumps(build_metadata(d), ensure_ascii=False, indent=2), encoding="utf-8")
    try:
        if os.path.exists(audio):
            os.remove(audio)
    except OSError:
        pass

    return {
        "success": ok,
        "output_path": out_mp4,
        "cover": cover,
        "meta": meta_path,
        "voice": used_voice,
        "duration": round(total, 2),
        "render_time_sec": round(time.time() - t0, 2),
        "script": script,
        "file_size_bytes": os.path.getsize(out_mp4) if os.path.exists(out_mp4) else 0
    }


# Backwards compatibility alias for existing test runners
generate_viral_short = generate


def main() -> None:
    ap = argparse.ArgumentParser(description="DealFlow Viral Short Generator v2")
    ap.add_argument("--json", help="Deal JSON string / file. A JSON list triggers batch mode")
    ap.add_argument("--title")
    ap.add_argument("--brand")
    ap.add_argument("--sale-price", type=int)
    ap.add_argument("--mrp", type=int)
    ap.add_argument("--discount", type=int)
    ap.add_argument("--store", default="Amazon")
    ap.add_argument("--coupon", default="")
    ap.add_argument("--img-url", default="")
    ap.add_argument("--url", default="", help="Affiliate/buy link (goes into metadata only)")
    ap.add_argument("--voice", help="Comma separated edge-tts voices, tried in order")
    ap.add_argument("--music", help="Background music file (ducked under voice)")
    ap.add_argument("--cover", help="Write cover PNG here (single mode)")
    ap.add_argument("--output", default="deal_viral_short.mp4", help="MP4 path (batch mode: output directory)")
    a = ap.parse_args()

    voices = [v.strip() for v in a.voice.split(",")] if a.voice else None
    payload: Any
    if a.json:
        payload = json.load(open(a.json, encoding="utf-8")) if os.path.exists(a.json) else json.loads(a.json)
    else:
        payload = {
            "prod_name": a.title or "boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds",
            "brand": a.brand or "boAt",
            "sale_price": a.sale_price or 899,
            "mrp": a.mrp or 4490,
            "discount_pct": a.discount or 80,
            "store": a.store,
            "coupon": a.coupon,
            "img_url": a.img_url,
            "url": a.url
        }

    if isinstance(payload, list):
        outdir = Path(a.output)
        outdir.mkdir(parents=True, exist_ok=True)
        results = []
        for i, deal in enumerate(payload):
            fp = normalise(deal)["fp"]
            results.append(asyncio.run(generate(
                deal,
                str(outdir / f"{i:03d}_{fp}.mp4"),
                voices=voices,
                music=a.music,
                cover=str(outdir / f"{i:03d}_{fp}.png")
            )))
        print(json.dumps(results, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(asyncio.run(generate(
            payload,
            a.output,
            voices=voices,
            music=a.music,
            cover=a.cover
        )), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
