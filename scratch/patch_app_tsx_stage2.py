import re

path = 'tg-setup/src/app/App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add clusterClientDeals before fetchPendingDeals
cluster_func = '''// ─── Client-Side Cross-Channel Duplicate Clustering Engine ───────────────────
function clusterClientDeals(dealList: Deal[]): Deal[] {
  if (!dealList || dealList.length <= 1) return dealList;

  const getProductFingerprint = (d: Deal): string => {
    // 1. Direct Amazon ASIN
    const combined = `${d.affText || ""} ${d.originalText || ""}`;
    const mAmz = combined.match(/\\/(?:dp|gp\\/product|gp\\/aw\\/d)\\/([A-Z0-9]{10})/i) || combined.match(/[?&]asin=([A-Z0-9]{10})/i);
    if (mAmz) return `amz:${mAmz[1].toUpperCase()}`;

    // 2. Flipkart itm/FSN
    const mFk = combined.match(/(?:flipkart\\.com|shopsy\\.in)[^\\s"'<>]*\\/p\\/(itm[a-zA-Z0-9]+)/i);
    if (mFk) return `fk:${mFk[1].toLowerCase()}`;

    // 3. Product Title Token Fingerprint
    const cleanT = (d.title || "").toLowerCase().replace(/[^\\w\\s]/g, " ");
    const stopWords = new Set(["deal", "deals", "loot", "flat", "off", "free", "price", "drop", "online", "india", "buy", "now", "offer", "discount", "lowest", "mrp", "rs", "inr", "best", "at", "on", "for", "with", "and", "the", "a", "an", "is", "of", "to", "in"]);
    const tokens = cleanT.split(/\\s+/).filter(t => t.length >= 3 && !stopWords.has(t));
    if (tokens.length >= 3) {
      // Group by top tokens and rounded price
      return `tok:${tokens.slice(0, 4).sort().join("-")}:${Math.round(d.price)}`;
    }

    return `id:${d.id}`;
  };

  const clusters = new Map<string, Deal[]>();
  for (const d of dealList) {
    const fp = getProductFingerprint(d);
    if (!clusters.has(fp)) clusters.set(fp, []);
    clusters.get(fp)!.push(d);
  }

  // Secondary merge: merge clusters that share identical product image URL and same price (within 10%)
  const mergedClusters: Deal[][] = [];
  const processed = new Set<string>();

  for (const [key, group] of clusters.entries()) {
    if (processed.has(key)) continue;
    processed.add(key);

    let currentGroup = [...group];
    const head = currentGroup[0];

    if (head.imgUrl && !head.imgUrl.includes("placeholder") && head.price > 0) {
      for (const [otherKey, otherGroup] of clusters.entries()) {
        if (processed.has(otherKey)) continue;
        const otherHead = otherGroup[0];
        if (otherHead.imgUrl === head.imgUrl && Math.abs(otherHead.price - head.price) <= Math.max(50, head.price * 0.1)) {
          currentGroup = currentGroup.concat(otherGroup);
          processed.add(otherKey);
        }
      }
    }
    mergedClusters.push(currentGroup);
  }

  const result: Deal[] = [];
  for (const group of mergedClusters) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }

    // Sort to pick best deal representation:
    // Prefer longer/more complete title, has coupon, lower price, newest
    group.sort((a, b) => {
      const aLen = (a.title || "").length;
      const bLen = (b.title || "").length;
      if (Math.abs(aLen - bLen) >= 6) return bLen - aLen;
      if (a.coupon && !b.coupon) return -1;
      if (!a.coupon && b.coupon) return 1;
      if (a.price !== b.price && a.price > 0 && b.price > 0) return a.price - b.price;
      return b.ts - a.ts;
    });

    const best = { ...group[0] };
    const duplicateIds = group.slice(1).map(d => d.id);
    (best as any).duplicateIds = duplicateIds;

    // Collect and unify all channel sources
    const channelsMap = new Map<string, { name: string; channel: string; price?: number; ts?: number }>();
    for (const d of group) {
      if (d.clusterChannels && d.clusterChannels.length > 0) {
        for (const cc of d.clusterChannels) {
          if (cc.name && !channelsMap.has(cc.name)) channelsMap.set(cc.name, cc);
        }
      }
      const chName = d.channel || d.channelRaw;
      if (chName && chName !== "Unknown" && !channelsMap.has(chName)) {
        channelsMap.set(chName, { name: chName, channel: chName, price: d.price, ts: d.ts });
      }
    }

    const uniqueChannels = Array.from(channelsMap.values());
    if (uniqueChannels.length >= 2 || group.length >= 2) {
      best.clusterChannels = uniqueChannels;
      best.clusterCount = Math.max(uniqueChannels.length, group.length);
      best.isClusterHead = true;
    }

    // Inherit coupon if missing on the selected best title
    if (!best.coupon) {
      const cDeal = group.find(d => d.coupon);
      if (cDeal) {
        best.coupon = cDeal.coupon;
        best.couponDiscount = cDeal.couponDiscount;
        best.effectivePrice = cDeal.effectivePrice;
      }
    }

    result.push(best);
  }

  return result;
}

async function fetchPendingDeals(): Promise<Deal[]> {'''

assert 'async function fetchPendingDeals(): Promise<Deal[]> {' in content, "fetchPendingDeals not found"
content = content.replace('async function fetchPendingDeals(): Promise<Deal[]> {', cluster_func, 1)

# In fetchPendingDeals return: apply clusterClientDeals
old_fetch_ret = '''  return rows.map((d, i) => {
    const deal = mapRawToDeal(d, String(i));
    if (d._forceStatus) deal.status = d._forceStatus;
    return deal;
  }).sort((a, b) => b.ts - a.ts);'''

new_fetch_ret = '''  const mappedDeals = rows.map((d, i) => {
    const deal = mapRawToDeal(d, String(i));
    if (d._forceStatus) deal.status = d._forceStatus;
    return deal;
  });
  return clusterClientDeals(mappedDeals).sort((a, b) => b.ts - a.ts);'''

assert old_fetch_ret in content, "old_fetch_ret not found"
content = content.replace(old_fetch_ret, new_fetch_ret, 1)

# 2. Fix Mobile Channel Attribution (line 1293)
old_mobile_ch = '<span className="text-[11px] font-semibold text-slate-300 truncate max-w-[110px]" title="Discovery Stream: Verified Radar">{store.label || "Verified Drop"}</span>'
new_mobile_ch = '<span className="text-[11px] font-semibold text-slate-300 truncate max-w-[110px]" title={`Source Channel: ${deal.channel || "Verified Drop"}`}>{deal.channel || "Verified Drop"}</span>'
assert old_mobile_ch in content, "old_mobile_ch not found"
content = content.replace(old_mobile_ch, new_mobile_ch, 1)

# Fix Mobile Coupon Row (around line 1360)
old_mobile_coupon = '''            {deal.coupon && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[8.5px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 truncate max-w-[140px]" title={deal.coupon}>
                  <span>🎟️</span> {deal.coupon}
                </span>
                {deal.effectivePrice && deal.effectivePrice < deal.price && (
                  <span className="text-[9px] font-mono font-black text-emerald-300 whitespace-nowrap">
                    Eff: ₹{deal.effectivePrice}
                  </span>
                )}
              </div>
            )}'''

new_mobile_coupon = '''            {deal.coupon && (
              <div className="flex items-center justify-between gap-1.5 mt-1 text-[10px]">
                <span className="text-[8.5px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 truncate max-w-[150px]" title={deal.coupon}>
                  <span>🎟️</span> <span className="truncate">{deal.coupon}</span>
                  {deal.couponDiscount ? (
                    <span className="text-[8px] text-amber-400 font-mono whitespace-nowrap">
                      (-₹{Math.round(deal.couponDiscount).toLocaleString("en-IN")})
                    </span>
                  ) : null}
                </span>
                {deal.effectivePrice && deal.effectivePrice < deal.price && (
                  <span className="text-[9px] font-mono font-black text-emerald-300 whitespace-nowrap bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Eff: ₹{Math.round(deal.effectivePrice).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            )}'''

assert old_mobile_coupon in content, "old_mobile_coupon not found"
content = content.replace(old_mobile_coupon, new_mobile_coupon, 1)

# 3. Fix Desktop Channel Attribution (line 1478)
old_desktop_ch = '<span className="text-[11px] font-medium text-zinc-300 truncate max-w-[150px]" title="Discovery Stream: Verified Radar">{store.label || "Verified Drop"}</span>'
new_desktop_ch = '<span className="text-[11px] font-medium text-zinc-300 truncate max-w-[150px]" title={`Source Channel: ${deal.channel || "Verified Drop"}`}>{deal.channel || "Verified Drop"}</span>'
assert old_desktop_ch in content, "old_desktop_ch not found"
content = content.replace(old_desktop_ch, new_desktop_ch, 1)

# Fix Desktop Image Overlay Coupon Badge
old_desk_badge = '''            {deal.coupon && (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 via-orange-500/25 to-amber-500/30 border border-amber-400/50 text-amber-200 font-mono text-[9.5px] font-bold shadow-md flex items-center gap-1 backdrop-blur-md">
                <span>🎟️</span>
                <span className="truncate max-w-[120px]">{deal.coupon}</span>
              </span>
            )}'''

new_desk_badge = '''            {deal.coupon && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950/95 text-amber-300 font-mono text-[9.5px] font-black shadow-lg shadow-black/60 flex items-center gap-1 border border-amber-400/80 backdrop-blur-md">
                <span>🎟️</span>
                <span className="truncate max-w-[130px]">{deal.coupon}</span>
              </span>
            )}'''

assert old_desk_badge in content, "old_desk_badge not found"
content = content.replace(old_desk_badge, new_desk_badge, 1)

# Fix Desktop displayPrice and savings rounding in DealCard
old_calc = '''  const displayPrice = deal.bestPrice && deal.bestPrice < deal.price ? deal.bestPrice : deal.price;
  const savings = deal.mrp > displayPrice ? deal.mrp - displayPrice : 0;'''

new_calc = '''  const displayPrice = deal.bestPrice && deal.bestPrice < deal.price ? Math.round(deal.bestPrice) : Math.round(deal.price);
  const savings = deal.mrp > displayPrice ? Math.round(deal.mrp - displayPrice) : 0;'''

assert old_calc in content, "old_calc not found"
content = content.replace(old_calc, new_calc, 1)

# Fix Desktop Coupon Strip (lines 1700-1718)
old_desk_strip = '''            {/* Coupon & Effective Price Strip */}
            {deal.coupon && (
              <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 text-[11px] shadow-sm">
                <div className="flex items-center gap-1.5 font-medium text-amber-300">
                  <span className="text-xs">🎟️</span>
                  <span className="font-semibold text-zinc-300">Coupon:</span>
                  <span className="font-bold text-amber-200 font-mono">{deal.coupon}</span>
                  {deal.couponDiscount ? (
                    <span className="text-[10px] text-amber-400/80 font-mono">(-₹{deal.couponDiscount})</span>
                  ) : null}
                </div>
                {deal.effectivePrice && deal.effectivePrice < deal.price ? (
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[10px] text-zinc-400">Effective:</span>
                    <span className="font-black text-emerald-300 text-xs bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      ₹{deal.effectivePrice}
                    </span>
                  </div>
                ) : null}
              </div>
            )}'''

new_desk_strip = '''            {/* Coupon & Effective Price Strip */}
            {deal.coupon && (
              <div className="mt-2 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 text-[11px] shadow-sm">
                <div className="flex items-center gap-1.5 font-medium text-amber-300 min-w-0 flex-1">
                  <span className="text-xs flex-shrink-0">🎟️</span>
                  <span className="font-semibold text-zinc-300 flex-shrink-0">Coupon:</span>
                  <span className="font-bold text-amber-200 font-mono truncate max-w-[110px] sm:max-w-[140px]" title={deal.coupon}>{deal.coupon}</span>
                  {deal.couponDiscount ? (
                    <span className="text-[10px] text-amber-400/90 font-mono whitespace-nowrap flex-shrink-0">
                      (-₹{Math.round(deal.couponDiscount).toLocaleString("en-IN")})
                    </span>
                  ) : null}
                </div>
                {deal.effectivePrice && deal.effectivePrice < deal.price ? (
                  <div className="flex items-center gap-1.5 font-mono flex-shrink-0 whitespace-nowrap">
                    <span className="text-[10px] text-zinc-400">Effective:</span>
                    <span className="font-black text-emerald-300 text-xs bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      ₹{Math.round(deal.effectivePrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                ) : null}
              </div>
            )}'''

assert old_desk_strip in content, "old_desk_strip not found"
content = content.replace(old_desk_strip, new_desk_strip, 1)

# 4. Multi-Duplicate Sync in handleApprove & handleReject
old_approve_sync = '''    const previousDeal = deals.find(d => d.id === id);
    // Manual dashboard approval broadcasts to Telegram (@dealsforindiachannel) and posts to IndiaDealHunts Web
    const resolvedChanges: any = {
      ...(changes || {}),
      destinations: (changes as any)?.destinations || ["@dealsforindiachannel"],
    };
    setDeals(prev => prev.map(d => d.id === id ? {
      ...d,
      ...resolvedChanges,
      status: "approved",
      liveOnWeb: true,
      liveOnTelegram: true,
    } : d));'''

new_approve_sync = '''    const previousDeal = deals.find(d => d.id === id);
    const duplicateIds: string[] = (previousDeal as any)?.duplicateIds || (previousDeal as any)?.duplicate_hashes || [];
    const affectedIds = new Set([id, ...duplicateIds]);

    // Manual dashboard approval broadcasts to Telegram (@dealsforindiachannel) and posts to IndiaDealHunts Web
    const resolvedChanges: any = {
      ...(changes || {}),
      destinations: (changes as any)?.destinations || ["@dealsforindiachannel"],
    };
    setDeals(prev => prev.map(d => affectedIds.has(d.id) ? {
      ...d,
      ...resolvedChanges,
      status: "approved",
      liveOnWeb: true,
      liveOnTelegram: true,
    } : d));'''

assert old_approve_sync in content, "old_approve_sync not found"
content = content.replace(old_approve_sync, new_approve_sync, 1)

# In timeout for handleApprove:
old_app_timer = '''    undoTimers.current[id] = setTimeout(async () => {
      delete undoTimers.current[id];
      if (!isCancelled) {
        await apiApprove(id, resolvedChanges);
      }
    }, 5000);'''

new_app_timer = '''    undoTimers.current[id] = setTimeout(async () => {
      delete undoTimers.current[id];
      if (!isCancelled) {
        await apiApprove(id, resolvedChanges);
        for (const dupId of duplicateIds) {
          apiApprove(dupId, resolvedChanges).catch(() => {});
        }
      }
    }, 5000);'''

assert old_app_timer in content, "old_app_timer not found"
content = content.replace(old_app_timer, new_app_timer, 1)

# In handleReject:
old_rej_sync = '''    const previousDeal = deals.find(d => d.id === id);
    setDeals(prev => prev.map(d => d.id === id ? { ...d, status: "rejected" } : d));'''

new_rej_sync = '''    const previousDeal = deals.find(d => d.id === id);
    const duplicateIds: string[] = (previousDeal as any)?.duplicateIds || (previousDeal as any)?.duplicate_hashes || [];
    const affectedIds = new Set([id, ...duplicateIds]);

    setDeals(prev => prev.map(d => affectedIds.has(d.id) ? { ...d, status: "rejected" } : d));'''

assert old_rej_sync in content, "old_rej_sync not found"
content = content.replace(old_rej_sync, new_rej_sync, 1)

old_rej_timer = '''    undoTimers.current[id] = setTimeout(async () => {
      delete undoTimers.current[id];
      if (!isCancelled) {
        await apiReject(id);
      }
    }, 5000);'''

new_rej_timer = '''    undoTimers.current[id] = setTimeout(async () => {
      delete undoTimers.current[id];
      if (!isCancelled) {
        await apiReject(id);
        for (const dupId of duplicateIds) {
          apiReject(dupId).catch(() => {});
        }
      }
    }, 5000);'''

assert old_rej_timer in content, "old_rej_timer not found"
content = content.replace(old_rej_timer, new_rej_timer, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Stage 2 Patched successfully!")
