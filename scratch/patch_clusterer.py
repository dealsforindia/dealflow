import re

path = 'dealbot_backend/dealbot/deal_clusterer.py'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# Replace extract_cluster_key with the comprehensive version
old_extract_key = '''def extract_cluster_key(deal: Dict[str, Any]) -> str:
    """
    Extract a unique deterministic cluster key based on ASIN, FSN, URL slug, or canonical_id.
    """
    # 1. Check existing canonical_id
    canon = deal.get("canonical_id") or deal.get("canonical_key")
    if canon and len(str(canon)) >= 6:
        return f"canon:{str(canon).upper().strip()}"

    # 2. Extract from URL, aff_url, or original text
    urls = [deal.get("url"), deal.get("aff_url"), deal.get("canonical_url")]
    for u in urls:
        if not u or not isinstance(u, str):
            continue
        # Amazon ASIN
        m_amz = re.search(r'/(?:dp|gp/product|gp/aw/d)/([A-Z0-9]{10})', u)
        if m_amz:
            return f"amz:{m_amz.group(1).upper()}"

        # Flipkart itm ID
        m_fk = re.search(r'/p/(itm[a-zA-Z0-9]+)', u)
        if m_fk:
            return f"fk:{m_fk.group(1).lower()}"

        # URL slug
        m_slug = re.search(r'/(?:flipkart\.com|shopsy\.in)/([^/]+)/p/', u)
        if m_slug:
            slug = re.sub(r'[^a-zA-Z0-9]', '', m_slug.group(1).lower())
            if len(slug) >= 8:
                return f"slug:{slug}"

    # 3. Check title
    title = (deal.get("prod_name") or deal.get("title") or "").strip().lower()
    
    # Do NOT cluster generic store homepages or generic promotional headers
    for gen in GENERIC_TITLES:
        if gen in title or title.startswith(gen):
            return f"fp:{deal.get('fp_hash') or id(deal)}"

    # 4. Fallback to normalized title token hash (only if specific enough)
    clean_title = re.sub(r'[^\\w\\s]', ' ', title)
    tokens = [t for t in clean_title.split() if len(t) >= 3 and t not in STOP_WORDS]
    if len(tokens) >= 3:
        # Take the first 4 significant tokens
        return f"tok:{'-'.join(sorted(tokens[:4]))}"

    # 5. Fallback to fp_hash (standalone deal)
    return f"fp:{deal.get('fp_hash') or id(deal)}"'''

new_extract_key = '''def extract_cluster_key(deal: Dict[str, Any]) -> str:
    """
    Extract a unique deterministic cluster key based on ASIN, FSN, URL slug, or canonical_id.
    """
    # 0. Check direct ASIN
    asin = deal.get("asin")
    if asin and len(str(asin)) == 10:
        return f"amz:{str(asin).upper()}"

    # 1. Check existing canonical_id or canonical_key
    canon = str(deal.get("canonical_id") or deal.get("canonical_key") or "").strip()
    if canon.lower().startswith("amz:"):
        return canon.lower()
    if canon.lower().startswith("fk:"):
        return canon.lower()
    if canon and len(canon) >= 6 and not canon.lower().startswith("name:"):
        return f"canon:{canon.upper()}"

    # 2. Extract from all available URLs and expanded redirections
    urls = [deal.get("url"), deal.get("aff_url"), deal.get("aff_link"), deal.get("canonical_url")]
    exp = deal.get("expanded_urls")
    if isinstance(exp, dict):
        urls.extend(exp.keys())
        urls.extend(exp.values())
    elif isinstance(exp, list):
        urls.extend(exp)

    for u in urls:
        if not u or not isinstance(u, str):
            continue
        # Amazon ASIN
        m_amz = re.search(r'/(?:dp|gp/product|gp/aw/d)/([A-Z0-9]{10})', u, re.I) or re.search(r'[?&]asin=([A-Z0-9]{10})', u, re.I)
        if m_amz:
            return f"amz:{m_amz.group(1).upper()}"

        # Flipkart itm ID
        m_fk = re.search(r'/(?:p/|/itm)(itm[a-zA-Z0-9]+)', u, re.I)
        if m_fk:
            return f"fk:{m_fk.group(1).lower()}"

        # URL slug
        m_slug = re.search(r'/(?:flipkart\\.com|shopsy\\.in)/([^/]+)/p/', u, re.I)
        if m_slug:
            slug = re.sub(r'[^a-zA-Z0-9]', '', m_slug.group(1).lower())
            if len(slug) >= 8:
                return f"slug:{slug}"

    # Scan raw texts for ASIN
    all_text = f"{deal.get('aff_text', '')} {deal.get('original_text', '')} {deal.get('message', '')}"
    m_amz_txt = re.search(r'amazon\\.in[^\\s"\'<>]*?(?:/dp/|/gp/product/|/gp/aw/d/)([A-Z0-9]{10})', all_text, re.I)
    if m_amz_txt:
        return f"amz:{m_amz_txt.group(1).upper()}"

    # 3. Check title
    title = (deal.get("prod_name") or deal.get("title") or "").strip().lower()
    
    # Do NOT cluster generic store homepages or generic promotional headers
    for gen in GENERIC_TITLES:
        if gen in title or title.startswith(gen):
            return f"fp:{deal.get('fp_hash') or id(deal)}"

    # 4. Fallback to normalized title token hash (strip trailing incomplete word fragments like "+ toas")
    clean_title = re.sub(r'\\s*[\\+\\-\\|\\:]\\s*[A-Za-z]{1,4}$', '', title)
    clean_title = re.sub(r'[^\\w\\s]', ' ', clean_title)
    tokens = [t for t in clean_title.split() if len(t) >= 3 and t not in STOP_WORDS]
    if len(tokens) >= 3:
        # Take the first 4 significant tokens
        return f"tok:{'-'.join(sorted(tokens[:4]))}"

    # 5. Fallback to fp_hash (standalone deal)
    return f"fp:{deal.get('fp_hash') or id(deal)}"'''

assert old_extract_key in code, "old_extract_key not found"
code = code.replace(old_extract_key, new_extract_key, 1)

# Now update cluster_deals to include multi-pass clustering and title completeness
old_cluster_deals_start = '''    clusters: Dict[str, List[Dict[str, Any]]] = {}

    # Group by initial cluster key
    for deal in deals:
        key = extract_cluster_key(deal)
        if key not in clusters:
            clusters[key] = []
        clusters[key].append(deal)'''

new_cluster_deals_start = '''    clusters: Dict[str, List[Dict[str, Any]]] = {}

    # Pass 1: Group by initial cluster key (ASIN, FSN, slug, token hash)
    for deal in deals:
        key = extract_cluster_key(deal)
        if key not in clusters:
            clusters[key] = []
        clusters[key].append(deal)

    # Pass 2: Secondary merge across clusters that share identical product images and same price (±10%)
    merged_groups: List[List[Dict[str, Any]]] = []
    processed_keys = set()

    cluster_items = list(clusters.items())
    for i, (key, group) in enumerate(cluster_items):
        if key in processed_keys:
            continue
        processed_keys.add(key)
        current_group = list(group)
        head = current_group[0]
        head_img = head.get("img_url") or head.get("img_path")
        head_price = (head.get("prices") or {}).get("sale") or head.get("sale_price") or head.get("price") or 0

        if head_img and "placeholder" not in str(head_img) and head_price > 0:
            for j in range(i + 1, len(cluster_items)):
                other_key, other_group = cluster_items[j]
                if other_key in processed_keys:
                    continue
                other_head = other_group[0]
                other_img = other_head.get("img_url") or other_head.get("img_path")
                other_price = (other_head.get("prices") or {}).get("sale") or other_head.get("sale_price") or other_head.get("price") or 0

                if other_img == head_img and abs(other_price - head_price) <= max(50, head_price * 0.1):
                    current_group.extend(other_group)
                    processed_keys.add(other_key)

        merged_groups.append(current_group)'''

assert old_cluster_deals_start in code, "old_cluster_deals_start not found"
code = code.replace(old_cluster_deals_start, new_cluster_deals_start, 1)

# Update loop to iterate over merged_groups instead of clusters.items()
old_loop_header = '''    for cluster_key, group in clusters.items():'''
new_loop_header = '''    for group in merged_groups:
        cluster_key = group[0].get("cluster_id") or extract_cluster_key(group[0])'''

assert old_loop_header in code, "old_loop_header not found"
code = code.replace(old_loop_header, new_loop_header, 1)

# In deal_score and best_deal selection: pick longest/most complete title
old_deal_score = '''        def deal_score(d):
            eff_price = d.get("effective_price") or (d.get("prices") or {}).get("sale") or d.get("sale_price") or 999999
            has_coupon = 1 if d.get("coupon") else 0
            img = d.get("img_url") or d.get("img_path")
            has_img = 1 if img and "placeholder" not in str(img) and "deal-default" not in str(img) else 0
            ts = d.get("ts") or d.get("processed_ts") or d.get("created_at") or 0
            return (eff_price, -has_coupon, -has_img, -ts)'''

new_deal_score = '''        def deal_score(d):
            eff_price = d.get("effective_price") or (d.get("prices") or {}).get("sale") or d.get("sale_price") or 999999
            has_coupon = 1 if d.get("coupon") else 0
            img = d.get("img_url") or d.get("img_path")
            has_img = 1 if img and "placeholder" not in str(img) and "deal-default" not in str(img) else 0
            t_len = len(d.get("prod_name") or d.get("title") or "")
            ts = d.get("ts") or d.get("processed_ts") or d.get("created_at") or 0
            return (eff_price, -has_coupon, -has_img, -t_len, -ts)'''

assert old_deal_score in code, "old_deal_score not found"
code = code.replace(old_deal_score, new_deal_score, 1)

# Inherit best title and coupon if missing on head
old_enrich_head = '''        # Enrich best deal with cluster metadata
        best_deal["cluster_id"] = cluster_key'''

new_enrich_head = '''        # Find longest valid title in the group
        longest_title = max((d.get("prod_name") or d.get("title") or "" for d in group), key=len, default="")
        if longest_title and len(longest_title) > len(best_deal.get("prod_name") or best_deal.get("title") or ""):
            best_deal["prod_name"] = longest_title
            best_deal["title"] = longest_title

        # Inherit coupon if missing on best_deal
        if not best_deal.get("coupon"):
            for d in group:
                if d.get("coupon"):
                    best_deal["coupon"] = d["coupon"]
                    best_deal["coupon_discount"] = d.get("coupon_discount")
                    best_deal["effective_price"] = d.get("effective_price")
                    break

        # Enrich best deal with cluster metadata
        best_deal["cluster_id"] = cluster_key'''

assert old_enrich_head in code, "old_enrich_head not found"
code = code.replace(old_enrich_head, new_enrich_head, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print("deal_clusterer.py Patched successfully!")
