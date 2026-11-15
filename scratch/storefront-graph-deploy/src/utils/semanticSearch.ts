import { PublicDeal } from '../types';

export interface ParsedSearchQuery {
  rawQuery: string;
  cleanQuery: string;
  maxPrice?: number;
  minPrice?: number;
  minDiscount?: number;
  targetStore?: string;
  isLootOrGlitch?: boolean;
  activeBadges: string[];
}

export interface SemanticSearchResult {
  deals: PublicDeal[];
  parsedQuery: ParsedSearchQuery;
  totalMatches: number;
}

// Comprehensive Indian E-Commerce Semantic Synonyms Dictionary
const SEMANTIC_SYNONYMS: Record<string, string[]> = {
  mobile: [
    'smartphone', 'phone', 'iphone', 'android', 'galaxy', 'samsung', 'oneplus',
    'redmi', 'realme', 'iqoo', 'poco', 'motorola', 'moto', 'vivo', 'oppo',
    'xiaomi', 'pixel', 'infinix', 'tecno', 'nord', 'narzo'
  ],
  phone: [
    'smartphone', 'mobile', 'iphone', 'android', 'galaxy', 'samsung', 'oneplus',
    'redmi', 'realme', 'iqoo', 'poco', 'motorola', 'moto', 'vivo', 'oppo',
    'xiaomi', 'pixel', 'infinix', 'tecno', 'nord', 'narzo'
  ],
  smartphone: [
    'mobile', 'phone', 'iphone', 'android', 'galaxy', 'samsung', 'oneplus',
    'redmi', 'realme', 'iqoo', 'poco', 'motorola', 'moto', 'vivo', 'oppo',
    'xiaomi', 'pixel', 'infinix', 'tecno', 'nord', 'narzo'
  ],
  earbuds: ['tws', 'airpods', 'earphones', 'headphones', 'neckband', 'headset', 'airdopes', 'buds', 'anc'],
  tws: ['earbuds', 'airpods', 'earphones', 'headphones', 'neckband', 'headset', 'airdopes', 'buds'],
  headphones: ['headset', 'earphones', 'earbuds', 'neckband', 'tws', 'wireless'],
  sneakers: ['shoes', 'running', 'footwear', 'crocs', 'slippers', 'sandals', 'loafers', 'slides', 'boots'],
  shoes: ['sneakers', 'running', 'footwear', 'crocs', 'slippers', 'sandals', 'loafers', 'slides', 'boots', 'clogs'],
  bag: ['backpack', 'trolley', 'luggage', 'duffle', 'suitcase', 'handbag', 'rucksack', 'pouch'],
  backpack: ['bag', 'rucksack', 'laptop bag', 'school bag', 'gym bag', 'trolley'],
  watch: ['smartwatch', 'analog', 'chronograph', 'fitness band', 'tracker'],
  smartwatch: ['watch', 'fitness band', 'tracker', 'smart watch'],
  laptop: [
    'notebook', 'macbook', 'ultrabook', 'thinkpad', 'chromebook', 'asus', 'acer',
    'hp', 'dell', 'lenovo', 'ideapad', 'vivobook', 'zenbook', 'tuf', 'rog', 'victus'
  ],
  shirt: ['t-shirt', 'tee', 'polo', 'kurta', 'kurti', 'hoodie', 'sweatshirt', 'top'],
  tee: ['t-shirt', 'shirt', 'polo', 'top', 'oversized'],
  tv: [
    'television', 'smart tv', 'oled', 'qled', '4k', 'led', 'android tv', 'google tv',
    'bravia', 'toshiba', 'xiaomi tv', 'mi tv', 'vu', 'oneplus tv'
  ],
  skincare: ['face wash', 'moisturizer', 'sunscreen', 'serum', 'body wash', 'lotion', 'cream', 'cleanser'],
  bottle: ['flask', 'thermos', 'sipper', 'water bottle', 'milton'],
  speaker: ['soundbar', 'home theatre', 'bluetooth speaker', 'party speaker', 'boat stone'],
};

const KNOWN_STORES = ['amazon', 'flipkart', 'myntra', 'ajio', 'swiggy', 'blinkit', 'zepto', 'croma', 'shopsy', 'nykaa', 'tatacliq'];

/**
 * Parses Indian price numbers with support for k, lakh, lac, thousand
 * e.g. "320k" -> 320000, "20k" -> 20000, "1.5k" -> 1500, "1 lakh" -> 100000
 */
export function parsePriceNumber(str?: string): number | undefined {
  if (!str) return undefined;
  const s = str.toLowerCase().replace(/,/g, '').trim();
  const m = s.match(/([0-9.]+)\s*(k|thousand|lakh|lac|l|m|cr)?/i);
  if (!m) return undefined;
  let val = parseFloat(m[1]);
  if (isNaN(val)) return undefined;
  const unit = (m[2] || '').toLowerCase();
  if (unit === 'k' || unit === 'thousand') {
    val *= 1000;
  } else if (unit === 'lakh' || unit === 'lac' || unit === 'l') {
    val *= 100000;
  } else if (unit === 'm') {
    val *= 1000000;
  } else if (unit === 'cr') {
    val *= 10000000;
  }
  return Math.round(val);
}

/**
 * Parses freeform natural language search input and extracts:
 * - Price constraints ("under 320k", "under 20k", "below 1500", "between 10k and 30k", "< 2000")
 * - Discount constraints ("50% off", "70% discount")
 * - Store mentions ("on amazon", "flipkart deals")
 * - Urgency / Loot keywords ("loot", "glitch", "freebie")
 */
export function parseNaturalQuery(raw: string): ParsedSearchQuery {
  let text = raw.trim();
  const activeBadges: string[] = [];
  let maxPrice: number | undefined;
  let minPrice: number | undefined;
  let minDiscount: number | undefined;
  let targetStore: string | undefined;
  let isLootOrGlitch = false;

  // 1. Range Price: "between 10k and 30k" or "10000 to 25000" or "500 - 1500"
  const rangeMatch = text.match(/(?:between\s+)?(?:₹|rs\.?\s*)?([0-9.]+\s*(?:k|thousand|lakh|lac|l|cr)?)\s*(?:and|to|-)\s*(?:₹|rs\.?\s*)?([0-9.]+\s*(?:k|thousand|lakh|lac|l|cr)?)/i);
  if (rangeMatch) {
    const p1 = parsePriceNumber(rangeMatch[1]);
    const p2 = parsePriceNumber(rangeMatch[2]);
    if (p1 !== undefined && p2 !== undefined) {
      minPrice = Math.min(p1, p2);
      maxPrice = Math.max(p1, p2);
      activeBadges.push(`₹${minPrice.toLocaleString('en-IN')} – ₹${maxPrice.toLocaleString('en-IN')}`);
      text = text.replace(rangeMatch[0], ' ');
    }
  }

  // 2. Max Price: "under 320k", "under 20k", "below 30k", "less than 1.5k", "< 50000", "upto 25k", "within 15k"
  if (!maxPrice) {
    const maxMatch = text.match(/(?:under|below|<|less\s+than|upto|up\s+to|within)\s*(?:₹|rs\.?\s*)?([0-9.]+\s*(?:k|thousand|lakh|lac|l|cr)?)/i);
    if (maxMatch) {
      maxPrice = parsePriceNumber(maxMatch[1]);
      if (maxPrice !== undefined) {
        activeBadges.push(`Under ₹${maxPrice.toLocaleString('en-IN')}`);
        text = text.replace(maxMatch[0], ' ');
      }
    }
  }

  // 3. Min Price: "above 15k", "greater than 1000", "> 500"
  if (!minPrice) {
    const minMatch = text.match(/(?:above|>|greater\s+than|more\s+than)\s*(?:₹|rs\.?\s*)?([0-9.]+\s*(?:k|thousand|lakh|lac|l|cr)?)/i);
    if (minMatch) {
      minPrice = parsePriceNumber(minMatch[1]);
      if (minPrice !== undefined) {
        activeBadges.push(`Above ₹${minPrice.toLocaleString('en-IN')}`);
        text = text.replace(minMatch[0], ' ');
      }
    }
  }

  // 3b. Implicit Budget Pattern: e.g. "mobile 320k", "phones 20k", "tv 40k", "laptop 50k"
  if (!maxPrice) {
    const implicitMatch = text.match(/\b([0-9.]+\s*(?:k|thousand|lakh|lac))\b/i);
    if (implicitMatch) {
      maxPrice = parsePriceNumber(implicitMatch[1]);
      if (maxPrice !== undefined) {
        activeBadges.push(`Budget: ₹${maxPrice.toLocaleString('en-IN')}`);
        text = text.replace(implicitMatch[0], ' ');
      }
    }
  }

  // 4. Discount: "50% off", "70% discount", "flat 80%"
  const discMatch = text.match(/(\d{1,2})\s*%\s*(?:off|discount)?/i);
  if (discMatch) {
    minDiscount = parseInt(discMatch[1], 10);
    activeBadges.push(`≥ ${minDiscount}% OFF`);
    text = text.replace(discMatch[0], ' ');
  }

  // 5. Store Detection
  const lower = text.toLowerCase();
  for (const s of KNOWN_STORES) {
    const storeRegex = new RegExp(`\\b(?:on\\s+)?${s}\\b`, 'i');
    if (storeRegex.test(lower)) {
      targetStore = s.charAt(0).toUpperCase() + s.slice(1);
      activeBadges.push(`Store: ${targetStore}`);
      text = text.replace(storeRegex, ' ');
      break;
    }
  }

  // 6. Loot / Glitch Detection
  if (/\b(?:loot|glitch|error|fat-finger|steal)\b/i.test(text)) {
    isLootOrGlitch = true;
    activeBadges.push('🔥 Loot Drops Only');
    text = text.replace(/\b(?:loot|glitch|error|fat-finger|steal)\b/gi, ' ');
  }

  const cleanQuery = text.replace(/[\s\-_]+/g, ' ').trim();

  return {
    rawQuery: raw,
    cleanQuery,
    maxPrice,
    minPrice,
    minDiscount,
    targetStore,
    isLootOrGlitch,
    activeBadges,
  };
}

/**
 * On-Device Semantic & Constraint Deal Search
 * Evaluates deals against natural language budget constraints and semantic device tokens.
 */
export function searchDealsClient(deals: PublicDeal[], rawQuery: string): SemanticSearchResult {
  if (!rawQuery || !rawQuery.trim()) {
    return {
      deals,
      parsedQuery: { rawQuery: '', cleanQuery: '', activeBadges: [] },
      totalMatches: deals.length,
    };
  }

  const parsed = parseNaturalQuery(rawQuery);
  const cleanLower = parsed.cleanQuery.toLowerCase();
  const queryTokens = cleanLower.split(/\s+/).filter((t) => t.length > 1);

  // Collect semantic synonym tokens
  const expandedTokens = new Set<string>(queryTokens);
  for (const tok of queryTokens) {
    if (SEMANTIC_SYNONYMS[tok]) {
      SEMANTIC_SYNONYMS[tok].forEach((syn) => expandedTokens.add(syn.toLowerCase()));
    }
  }

  // Check if query is looking for a mobile phone
  const isMobileSearch = queryTokens.some((t) => ['mobile', 'mobiles', 'phone', 'phones', 'smartphone', 'smartphones'].includes(t));
  const userExplicitlyWantedAccessory = queryTokens.some((t) =>
    ['cover', 'case', 'glass', 'cable', 'charger', 'mic', 'microphone', 'earphone', 'headphone'].includes(t)
  );

  const scored: Array<{ deal: PublicDeal; score: number }> = [];

  for (const deal of deals) {
    const price = deal.price || 0;
    const discount = deal.discount_pct || 0;
    const store = (deal.store || '').toLowerCase();
    const title = (deal.title || '').toLowerCase();
    const category = (deal.category || '').toLowerCase();

    // 1. Strict Price Filtering
    if (parsed.maxPrice !== undefined && price > parsed.maxPrice) continue;
    if (parsed.minPrice !== undefined && price < parsed.minPrice) continue;

    // 2. Strict Discount Filtering
    if (parsed.minDiscount !== undefined && discount < parsed.minDiscount) continue;

    // 3. Strict Store Filtering
    if (parsed.targetStore && !store.includes(parsed.targetStore.toLowerCase())) continue;

    // 4. Loot / Glitch Filtering
    if (parsed.isLootOrGlitch && discount < 65 && (deal.worth_score || 0) < 85) continue;

    // 5. If searching for mobile/phone, filter out pure accessories (soldering iron, covers, mic, cables)
    if (isMobileSearch && !userExplicitlyWantedAccessory) {
      const isPureAccessory = /\b(microphone|lavalier|earphone|headphone|neckband|back cover|tempered glass|screen protector|case cover|mobile holder|soldering|charging cable|usb cable)\b/i.test(title);
      if (isPureAccessory) continue;
    }

    // If only constraints were provided (e.g. "under 1000") and no keywords:
    if (queryTokens.length === 0) {
      scored.push({ deal, score: (deal.worth_score || 50) + discount });
      continue;
    }

    // 6. Semantic & Lexical Scoring
    let score = 0;

    // Exact full query match in title
    if (title.includes(cleanLower)) {
      score += 150;
    }

    // Exact full query match in category
    if (category.includes(cleanLower)) {
      score += 50;
    }

    // Token-by-token scoring with word boundaries
    let hitCount = 0;
    for (const tok of queryTokens) {
      const re = new RegExp(`\\b${tok}s?\\b`, 'i');
      if (re.test(title)) {
        score += 40;
        hitCount++;
      } else if (re.test(category)) {
        score += 25;
        hitCount++;
      } else if (re.test(store)) {
        score += 15;
        hitCount++;
      }
    }

    // Synonym token scoring (brands like samsung, oneplus, realme, redmi, etc.)
    for (const syn of expandedTokens) {
      if (!queryTokens.includes(syn)) {
        const re = new RegExp(`\\b${syn}s?\\b`, 'i');
        if (re.test(title)) {
          score += 30;
          hitCount++;
        } else if (re.test(category)) {
          score += 20;
          hitCount++;
        }
      }
    }

    // Category boosts
    if (isMobileSearch && (category.includes('mobile') || category.includes('smartphone') || category.includes('electronics'))) {
      score += 30;
    }

    // Smartphone feature indicators in title (5G, RAM, ROM, Snapdragon, AMOLED)
    if (isMobileSearch && /\b(5g|4g|ram|rom|snapdragon|dimensity|amoled|mah)\b/i.test(title)) {
      score += 45;
    }

    // Must match at least one token if text keywords were provided
    if (hitCount === 0 && score === 0) continue;

    // Quality boosters
    if (deal.is_lowest_price) score += 15;
    score += (deal.worth_score || 0) * 0.2;
    score += Math.min(discount, 80) * 0.15;

    scored.push({ deal, score });
  }

  // Sort by highest relevance score first
  scored.sort((a, b) => b.score - a.score);

  const matchedDeals = scored.map((s) => s.deal);

  return {
    deals: matchedDeals,
    parsedQuery: parsed,
    totalMatches: matchedDeals.length,
  };
}
