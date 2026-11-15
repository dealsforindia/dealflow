import re
import sys

path = 'tg-setup/src/app/App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update cleanDealTitle to heal truncated trailing words
old_clean_title = '''function cleanDealTitle(prodName?: string, originalText?: string, affText?: string): string {
  let raw = (prodName || "").trim();
  // Strip hidden markdown links e.g. [ ](https://...)
  raw = raw.replace(/\\[.*?\\]\\(.*?\\)/g, "").replace(/\\[.*?\\]/g, "").trim();'''

assert old_clean_title in content, "old_clean_title pattern not found"

new_clean_title = '''function cleanDealTitle(prodName?: string, originalText?: string, affText?: string): string {
  let raw = (prodName || "").trim();
  // Strip hidden markdown links e.g. [ ](https://...)
  raw = raw.replace(/\\[.*?\\]\\(.*?\\)/g, "").replace(/\\[.*?\\]/g, "").trim();
  // Strip broken dangling operators or word cutoffs like "+ Toas" or trailing "+", "-", "|"
  raw = raw.replace(/\\s*[\\+\\-\\|\\:]\\s*[A-Za-z]{1,4}$/, "").replace(/\\s*[\\+\\-\\|\\:]\\s*$/, "").trim();'''

content = content.replace(old_clean_title, new_clean_title, 1)

# Check for title rescue with longer complete version
old_clean_return = '''  if (clean && !isInvalidTitle(clean)) {
    return clean.slice(0, 120);
  }'''

assert old_clean_return in content, "old_clean_return pattern not found"

new_clean_return = '''  // Strip broken dangling operators or word cutoffs like "+ Toas" or trailing "+", "-", "|"
  clean = clean.replace(/\\s*[\\+\\-\\|\\:]\\s*[A-Za-z]{1,4}$/, "").replace(/\\s*[\\+\\-\\|\\:]\\s*$/, "").trim();

  // Check if originalText or affText contains a longer, more complete title with the same prefix
  if ((originalText || affText) && clean.length >= 10) {
    const combined = `${originalText || ""}\\n${affText || ""}`;
    const lines = combined.split("\\n").map(l => l.trim()).filter(Boolean);
    const searchPrefix = clean.slice(0, Math.min(clean.length, 30)).toLowerCase();
    for (const line of lines) {
      let lClean = line.replace(/\\[.*?\\]\\(.*?\\)/g, "").replace(/\\[.*?\\]/g, "").trim();
      lClean = lClean.replace(/^[👉🔥⚡🛍️🎁🛒📦💥📢🏷️✨🚨📌▶️➔➡*_\\-•—\\s"']+/g, "").replace(/\\s*@\\s*[\\d,₹Rs.]+\\s*.*$/, "").trim();
      lClean = lClean.replace(/\\s*[\\+\\-\\|\\:]\\s*[A-Za-z]{1,4}$/, "").replace(/\\s*[\\+\\-\\|\\:]\\s*$/, "").trim();
      if (lClean.toLowerCase().startsWith(searchPrefix) && lClean.length > clean.length && !isInvalidTitle(lClean)) {
        clean = lClean;
        break;
      }
    }
  }

  if (clean && !isInvalidTitle(clean)) {
    return clean.slice(0, 120);
  }'''

content = content.replace(old_clean_return, new_clean_return, 1)

# 2. Update fmt to round prices and eliminate ugly paise decimals
old_fmt = 'const fmt = (p: number) => p === 0 ? "Free" : `₹${p.toLocaleString("en-IN")}`;'
assert old_fmt in content, "old_fmt not found"
new_fmt = 'const fmt = (p: number) => p === 0 ? "Free" : `₹${Math.round(p).toLocaleString("en-IN")}`;'
content = content.replace(old_fmt, new_fmt, 1)

# 3. Update mapRawToDeal
old_map_ch = 'channel: toChName(d.source_channel), channelRaw: d.source_channel,'
assert old_map_ch in content, "old_map_ch not found"
new_map_ch = '''const rawCh = d.channel || d.source_channel || (d as any).channelRaw || (d as any).tg_channel || (d as any).channel_title || "";
  const chName = toChName(rawCh) !== "Unknown" ? toChName(rawCh) : (rawCh || "Direct Channel");
  return {
    id, title: cleanDealTitle(d.prod_name, d.original_text, d.aff_text),
    price: Math.round(salePrice), mrp: Math.round(mrpPrice),
    discount: disc,
    category: catName, catEmoji: catEmoji,
    channel: chName, channelRaw: rawCh || chName,'''

# Let's replace the whole header of mapRawToDeal return
target_map = '''  return {
    id, title: cleanDealTitle(d.prod_name, d.original_text, d.aff_text),
    price: salePrice, mrp: mrpPrice,
    discount: disc,
    category: catName, catEmoji: catEmoji,
    channel: toChName(d.source_channel), channelRaw: d.source_channel,'''

assert target_map in content, "target_map not found"
content = content.replace(target_map, new_map_ch, 1)

# Also update couponDiscount and effectivePrice rounding in mapRawToDeal
old_map_coupons = '''couponDiscount: d.coupon_discount ?? (d as any).coupon_discount ?? null,
    effectivePrice: d.effective_price ?? (d as any).effective_price ?? null,'''
assert old_map_coupons in content, "old_map_coupons not found"
new_map_coupons = '''couponDiscount: (d.coupon_discount !== null && d.coupon_discount !== undefined) ? Math.round(Number(d.coupon_discount)) : null,
    effectivePrice: (d.effective_price !== null && d.effective_price !== undefined) ? Math.round(Number(d.effective_price)) : null,'''
content = content.replace(old_map_coupons, new_map_coupons, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Stage 1 Patched successfully!")
