#!/usr/bin/env python3
"""
DealFlow / IndiaDealHunts - Launch Brag Video Generator
Inspired by latent-spaces/brag & powered by HeyGen audio assets + FFmpeg.
Renders a 1080x1920 (9:16) high-retention launch video in seconds.
"""
import math
import os
import subprocess
import sys
import time
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
TOTAL_DURATION = 16.0
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)

AUDIO_FILE = "scripts/final_audio.aac"
OUTPUT_VIDEO = "indiadealhunts_launch_brag.mp4"
PROD_IMG_PATH = "scripts/boat_sample.jpg"

def get_font(size: int, bold: bool = False):
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf" if bold else "C:/Windows/Fonts/calibri.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                continue
    return ImageFont.load_default()

FONT_TITLE = get_font(72, bold=True)
FONT_SUB = get_font(42, bold=True)
FONT_BODY = get_font(34, bold=False)
FONT_PRICE = get_font(84, bold=True)
FONT_MRP = get_font(44, bold=False)
FONT_BADGE = get_font(38, bold=True)
FONT_TINY = get_font(28, bold=True)

# Load and prepare product image
prod_img = None
if os.path.exists(PROD_IMG_PATH):
    try:
        raw_img = Image.open(PROD_IMG_PATH).convert("RGBA")
        raw_img.thumbnail((720, 720), Image.Resampling.LANCZOS)
        # Create rounded card with white background
        p_canvas = Image.new("RGBA", (760, 760), (255, 255, 255, 255))
        ox = (760 - raw_img.width) // 2
        oy = (760 - raw_img.height) // 2
        p_canvas.paste(raw_img, (ox, oy), raw_img)
        prod_img = p_canvas
    except Exception as e:
        print("Image load error:", e)

def draw_frame(f_idx: int) -> Image.Image:
    t = f_idx / FPS
    prog = min(1.0, f_idx / TOTAL_FRAMES)
    
    # Base dark gradient background
    im = Image.new("RGB", (W, H), (11, 15, 25))
    d = ImageDraw.Draw(im)
    
    # Radial glowing orbs (animated breathing)
    glow_pulse = math.sin(t * 3.0) * 0.15 + 0.85
    glow_rad = int(380 * glow_pulse)
    d.ellipse([(W//2 - glow_rad, 400 - glow_rad), (W//2 + glow_rad, 400 + glow_rad)], fill=(28, 44, 84))
    d.ellipse([(W//2 - glow_rad//2, 1200 - glow_rad//2), (W//2 + glow_rad//2, 1200 + glow_rad//2)], fill=(40, 25, 65))
    
    # Top Progress Bar
    d.rectangle([(0, 0), (int(W * prog), 10)], fill=(99, 102, 241))
    
    # Top Live Telemetry Radar
    radar_y = 70
    d.rounded_rectangle([(70, radar_y), (W - 70, radar_y + 80)], radius=24, fill=(19, 27, 46), outline=(45, 60, 95), width=2)
    # Pulsing green dot
    dot_alpha = math.sin(t * 6.0) * 0.5 + 0.5
    dot_color = (34, 197, 94) if dot_alpha > 0.3 else (16, 110, 50)
    d.ellipse([(105, radar_y + 28), (129, radar_y + 52)], fill=dot_color)
    d.text((145, radar_y + 22), "LIVE 27-CHANNEL DEALS TELEMETRY", fill=(226, 232, 240), font=FONT_TINY)
    d.text((W - 250, radar_y + 22), "0% FAKE DEALS", fill=(34, 197, 94), font=FONT_TINY)
    
    # SCENE 1: (0.0s - 3.8s) The Hook
    if t < 3.8:
        # Entrance slide/fade
        s1_t = min(1.0, t / 0.6)
        s1_alpha = 1.0 - max(0.0, (t - 3.2) / 0.6)
        
        y_off = int((1.0 - s1_t) * 120)
        
        d.text((W//2, 320 + y_off), "STOP PAYING", fill=(255, 255, 255), font=FONT_TITLE, anchor="mm")
        d.text((W//2, 410 + y_off), "FULL PRICE!", fill=(245, 158, 11), font=FONT_TITLE, anchor="mm")
        
        # Big hero glass container
        card_y = 520 + y_off
        d.rounded_rectangle([(80, card_y), (W - 80, card_y + 800)], radius=36, fill=(17, 24, 39), outline=(99, 102, 241), width=3)
        
        d.text((W//2, card_y + 90), "⚡ Meet IndiaDealHunts", fill=(129, 140, 248), font=FONT_SUB, anchor="mm")
        d.text((W//2, card_y + 170), "Autonomous AI Deals Engine", fill=(203, 213, 225), font=FONT_BODY, anchor="mm")
        
        # 3 Key Metrics
        metrics = [
            ("📡 27 Streams", "Scraped every 15s from Telegram & DesiDime"),
            ("🛡️ 100% Verified", "Deep URL unshortening to canonical product"),
            ("💰 Max Savings", "Loot drops up to 90% discount tracked live"),
        ]
        for idx, (m_title, m_desc) in enumerate(metrics):
            my = card_y + 270 + idx * 160
            d.rounded_rectangle([(120, my), (W - 120, my + 130)], radius=20, fill=(30, 41, 59))
            d.text((150, my + 25), m_title, fill=(248, 250, 252), font=FONT_BADGE)
            d.text((150, my + 75), m_desc, fill=(148, 163, 184), font=FONT_TINY)
            
    # SCENE 2: (3.8s - 12.0s) The Verified Loot Drop Showcase
    elif t < 12.0:
        s2_t = min(1.0, (t - 3.8) / 0.5)
        scale_in = 0.8 + 0.2 * s2_t
        
        # Product Card
        card_box = [80, 260, W - 80, 1420]
        d.rounded_rectangle(card_box, radius=40, fill=(15, 23, 42), outline=(51, 65, 85), width=2)
        
        # Category & Platform Bar
        d.text((120, 310), "ELECTRONICS  •  AMAZON VERIFIED", fill=(129, 140, 248), font=FONT_TINY)
        
        # Worth Score Pill
        d.rounded_rectangle([(W - 320, 295), (W - 120, 350)], radius=16, fill=(30, 27, 75), outline=(129, 140, 248), width=2)
        d.text((W - 220, 322), "WORTH 94/100", fill=(199, 210, 254), font=FONT_TINY, anchor="mm")
        
        # Product Photo Frame
        if prod_img:
            im.paste(prod_img, ((W - 760) // 2, 380))
            
        # 80% OFF Fire Badge (Pop Bounce)
        badge_scale = min(1.0, max(0.0, (t - 4.2) / 0.4))
        if badge_scale > 0:
            bw, bh = int(320 * badge_scale), int(76 * badge_scale)
            bx = W - 140 - bw
            by = 410
            d.rounded_rectangle([(bx, by), (bx + bw, by + bh)], radius=18, fill=(225, 29, 72), outline=(255, 255, 255), width=2)
            d.text((bx + bw//2, by + bh//2), "80% OFF LOOT", fill=(255, 255, 255), font=FONT_BADGE, anchor="mm")
            
        # Product Title
        d.text((120, 1180), "boAt Airdopes 141 Bluetooth Wireless", fill=(255, 255, 255), font=FONT_SUB)
        
        # Price Countdown Animation (₹4,490 down to ₹899)
        price_prog = min(1.0, max(0.0, (t - 5.0) / 1.8))
        curr_price = int(4490 - (4490 - 899) * (1 - (1 - price_prog)**3))
        
        # Render Prices
        d.text((120, 1260), f"Rs. {curr_price:,}", fill=(34, 197, 94), font=FONT_PRICE)
        d.text((450, 1290), "M.R.P. Rs. 4,490", fill=(148, 163, 184), font=FONT_MRP)
        # Strikethrough line on MRP
        d.line([(445, 1315), (710, 1315)], fill=(239, 68, 68), width=4)
        
        # Savings Green Banner
        d.rounded_rectangle([(120, 1360), (W - 120, 1430)], radius=16, fill=(20, 83, 45))
        d.text((W//2, 1395), "YOU SAVE Rs. 3,591 (VERIFIED LOOT)", fill=(134, 239, 172), font=FONT_BADGE, anchor="mm")
        
    # SCENE 3: (12.0s - 16.0s) Outro / Call To Action
    else:
        # Final CTA Reveal
        s3_t = min(1.0, (t - 12.0) / 0.5)
        
        d.text((W//2, 380), "GRAB LOOTS BEFORE", fill=(255, 255, 255), font=FONT_TITLE, anchor="mm")
        d.text((W//2, 470), "THEY EXPIRE!", fill=(239, 68, 68), font=FONT_TITLE, anchor="mm")
        
        # Website Hero Card
        d.rounded_rectangle([(80, 580), (W - 80, 1320)], radius=36, fill=(15, 23, 42), outline=(99, 102, 241), width=3)
        
        d.text((W//2, 680), "⚡ IndiaDealHunts.in", fill=(129, 140, 248), font=FONT_TITLE, anchor="mm")
        d.text((W//2, 780), "Live Consumer Loot Storefront", fill=(203, 213, 225), font=FONT_SUB, anchor="mm")
        
        # Features list
        feats = [
            "✓ Instant 0-second Deal Lookup",
            "✓ Dynamic Worth Score & Price History",
            "✓ Direct Verified Affiliate Links",
            "✓ 9:16 Vertical Video Reels Carousel"
        ]
        for i, feat in enumerate(feats):
            d.text((140, 890 + i * 80), feat, fill=(241, 245, 249), font=FONT_BODY)
            
        # Pulsing CTA Button
        cta_pulse = math.sin(t * 8.0) * 8
        d.rounded_rectangle([(120 - int(cta_pulse), 1420), (W - 120 + int(cta_pulse), 1540)], radius=30, fill=(99, 102, 241), outline=(255, 255, 255), width=3)
        d.text((W//2, 1480), "🚀 VISIT INDIADEALHUNTS NOW", fill=(255, 255, 255), font=FONT_BADGE, anchor="mm")
        
        d.text((W//2, 1600), "Telegram: @dealsforindiachannel", fill=(148, 163, 184), font=FONT_BODY, anchor="mm")
        
    # Bottom brand footer
    d.text((W//2, H - 70), "IndiaDealHunts • 100% Curated Loot Deals", fill=(100, 116, 139), font=FONT_TINY, anchor="mm")
    
    return im

def main():
    print(f"Rendering {TOTAL_FRAMES} frames @ {FPS}fps (Duration: {TOTAL_DURATION}s)...")
    start_time = time.time()
    
    # Spawn FFmpeg process reading raw RGB from stdin and muxing with audio
    cmd = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{W}x{H}",
        "-pix_fmt", "rgb24",
        "-r", str(FPS),
        "-i", "-",
        "-i", AUDIO_FILE,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "copy",
        "-shortest",
        OUTPUT_VIDEO
    ]
    
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    
    for idx in range(TOTAL_FRAMES):
        frame = draw_frame(idx)
        proc.stdin.write(frame.tobytes())
        if idx % 60 == 0 or idx == TOTAL_FRAMES - 1:
            pct = (idx + 1) / TOTAL_FRAMES * 100
            print(f"Progress: {pct:.1f}% ({idx + 1}/{TOTAL_FRAMES} frames)")
            
    proc.stdin.close()
    proc.wait()
    
    elapsed = time.time() - start_time
    print(f"Render complete in {elapsed:.1f}s! Video saved to: {OUTPUT_VIDEO}")
    
    # Generate cover image
    cover = draw_frame(int(6.5 * FPS))
    cover.save("indiadealhunts_launch_brag_cover.png")
    print("Cover saved to: indiadealhunts_launch_brag_cover.png")

if __name__ == "__main__":
    main()
