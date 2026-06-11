// ── Score helpers
export const scoreClass = s => s >= 8 ? "high" : s >= 5 ? "mid" : s ? "low" : "none";
export const cardClass  = s => s >= 8 ? "score-high" : s <= 3 ? "score-low" : "";

// ── Timestamp formatter
export const fmt = ts => {
  if (!ts) return "";
  const ms  = ts > 1e12 ? ts : ts * 1000;
  const d   = new Date(ms);
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60_000)   return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000)return `${Math.floor(diff / 3600_000)}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// ── Short name (legacy)
export const shortName = ch => {
  if (!ch) return "?";
  const parts = ch.split("/");
  return parts[parts.length - 1]?.replace(/^\+/, "").slice(0, 16) || ch.slice(-8);
};

// ── Manual name map (from localStorage)
const _loadNameMap = () => {
  try { return JSON.parse(localStorage.getItem('dealbot_channel_names') || '{}'); }
  catch { return {}; }
};
export const getChannelNameMap = () => _loadNameMap();
export const setChannelName = (id, name) => {
  const map = _loadNameMap();
  if (name?.trim()) map[String(id)] = name.trim();
  else delete map[String(id)];
  localStorage.setItem('dealbot_channel_names', JSON.stringify(map));
};

import { CHANNEL_NAME_MAP } from '../store/useDealStore';
export const resolveChannelName = (id) => {
  if (!id) return 'Unknown';
  const s = String(id).trim();
  if (s.startsWith('@')) {
    const map = _loadNameMap();
    return map[s] || CHANNEL_NAME_MAP[s] || s.slice(1);
  }
  const map = _loadNameMap();
  if (map[s]) return map[s];
  if (CHANNEL_NAME_MAP[s]) return CHANNEL_NAME_MAP[s];
  const digits = s.replace(/[^0-9]/g, '');
  if (digits.length >= 4) return '#' + digits.slice(-7);
  return s;
};

// ── Category → emoji
export const CATEGORY_EMOJI = {
  electronics: '🔌', audio: '🔌', wearables: '⌚', gadgets: '🔌',
  fashion: '👗', clothing: '👗', apparel: '👗',
  grocery: '🛒', food: '🍔', restaurant: '🍔',
  beauty: '💄', skincare: '💄',
  home: '🏠', furniture: '🏠', kitchen: '🏠',
  travel: '✈️',
  books: '📚',
  sports: '🏋️', fitness: '🏋️',
  pet: '🐾',
  kids: '🧸', baby: '🧸',
  health: '💊',
  mobile: '📱', phone: '📱', smartphone: '📱',
  laptop: '💻', computer: '💻',
  gaming: '🎮',
};

export const categoryEmoji = (cat) => {
  if (!cat) return '🏷️';
  const key = cat.toLowerCase().replace(/[^a-z]/g, '');
  for (const [k, v] of Object.entries(CATEGORY_EMOJI)) {
    if (key.includes(k)) return v;
  }
  return '🏷️';
};

// ── URL detection
const URL_RE      = /https?:\/\/|www\.|bit\.ly|bilty\.co|amzn\.|t\.me\//i;
const EMOJI_ONLY  = /^[\p{Emoji}\s\u200d\ufe0f]+$/u;
const SKIP_PREFIX = /^(https?:|www\.|bilty\.co|amzn|t\.me\/|\[\])/i;

const isMeaningful = (line) => {
  const t = line.trim();
  if (!t || t.length < 8) return false;
  if (URL_RE.test(t)) return false;
  if (EMOJI_ONLY.test(t)) return false;
  if (SKIP_PREFIX.test(t)) return false;
  return true;
};

/**
 * cleanTitle(deal)
 * Extracts a human-readable title from a deal object.
 */
export const cleanTitle = (dealOrString) => {
  if (typeof dealOrString === 'string') return _cleanRaw(dealOrString);

  const deal     = dealOrString || {};
  const affText  = deal.aff_text  || deal.message || '';
  const prodName = deal.prod_name || deal.title   || '';

  // 1. Parse aff_text lines
  if (affText) {
    const lines = affText.split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (!isMeaningful(t)) continue;
      // Strip leading emojis/markdown
      const cleaned = t
        .replace(/^[\p{Emoji}\s\u200d\ufe0f#*_•→]+/u, '')
        .replace(/\*\*/g, '')
        .replace(/[_*]/g, '')
        .trim();
      if (cleaned.length >= 8 && !URL_RE.test(cleaned)) return cleaned;
      if (isMeaningful(t) && t.length >= 8) {
        return t.replace(/\*\*/g, '').replace(/[_*]/g, '').trim();
      }
    }
  }

  // 2. prod_name fallback
  if (prodName && !URL_RE.test(prodName) && prodName.length >= 4) {
    return _cleanRaw(prodName);
  }

  // 3. Category + price fallback
  const cat   = (deal.category || 'General').replace(/[^\w\s]/g, '').trim();
  const price = deal.prices?.sale ?? deal.price ?? null;
  if (price && Number(price) > 0) return `${cat} — ₹${Number(price).toLocaleString('en-IN')}`;
  return `${cat} Deal`;
};

function _cleanRaw(title) {
  if (!title) return "Unnamed Deal";
  const md = title.match(/\[(.*?)\]\((.*?)\)/);
  if (md) {
    const text = md[1].trim();
    if (text && text !== ' ') return text;
    try { return new URL(md[2]).hostname + " Deal"; } catch { return "Deal Link"; }
  }
  if (title.startsWith("[]http")) {
    try { return new URL(title.replace(/^\[\]/, '').trim()).hostname + " Deal"; } catch { return "Deal Link"; }
  }
  if (URL_RE.test(title)) {
    try { return new URL(title.trim()).hostname + " Deal"; } catch { return "Deal Link"; }
  }
  return title.replace(/\*\*/g, '').replace(/[_*]/g, '').trim() || "Unnamed Deal";
}

import { API_URL } from '../config';

// ── DesiDime / source helpers
export const isDesidimeDeal = (deal) =>
  deal?.source === 'desidime' || deal?.source_channel === 'desidime';

export const parseDesidimeStore = (deal) => {
  if (deal?.store) return deal.store;
  if (Array.isArray(deal?.platforms) && deal.platforms[0]) return deal.platforms[0];
  const text = deal?.aff_text || deal?.prod_name || '';
  const m = text.match(/Available on:\s*(.+?)(?:\n|$)/i);
  return m ? m[1].trim() : 'DesiDime';
};

export const dealQueueKey = (deal, idx = 0) =>
  `${deal?.fp_hash || deal?.legacy_id || 'deal'}-${deal?.ts || idx}-${idx}`;

/** Normalize deal image paths from backend → full URL */
export const normalizeImageUrl = (deal) => {
  let imgUrl = deal?.img_url || deal?.img_path || deal?.image_url || deal?.image
    || deal?.photo || deal?.photo_url || deal?.img || deal?.thumbnail;
  if (!imgUrl || typeof imgUrl !== 'string') return null;

  if (imgUrl.includes('/dealbot/images/')) {
    imgUrl = '/images/' + imgUrl.split('/dealbot/images/')[1];
  }
  if (imgUrl.startsWith('http://74.225.250.0/images/')) {
    imgUrl = imgUrl.replace('http://74.225.250.0/images/', '/images/');
  }
  if (imgUrl.startsWith('images/')) {
    imgUrl = '/images/' + imgUrl.slice(7);
  } else if (imgUrl.includes('/images/')) {
    imgUrl = '/images/' + imgUrl.split('/images/')[1];
  } else if (imgUrl.includes('\\images\\')) {
    imgUrl = '/images/' + imgUrl.split('\\images\\')[1];
  }
  if (imgUrl.startsWith('/')) return API_URL + imgUrl;
  return imgUrl;
};

// ── Price formatter
export const fmtPrice = (p) => {
  if (!p) return null;
  const n = Number(String(p).replace(/,/g, ''));
  if (!n || n <= 0) return null;
  return '₹' + n.toLocaleString('en-IN');
};

// ── Discount calculator
export const calcDiscount = (price, mrp) => {
  const p = Number(price), m = Number(mrp);
  if (!p || !m || m <= p) return null;
  return Math.round((1 - p / m) * 100);
};

// ── Deal type detector
export const detectDealType = (deal) => {
  if (deal.dealType) return deal.dealType;
  const text = (deal.aff_text || deal.message || deal.prod_name || '').toLowerCase();
  const trickWords = ['trick', 'loot', 'free entry', 'quiz', 'contest', 'cashback trick',
                      'refer', 'earn', 'free recharge', 'method', 'steps:', '1.', '1)'];
  const hasTrick = trickWords.some(w => text.includes(w));
  const hasLink  = /https?:\/\//i.test(text);
  const hasPrice = /[₹@]\s*\d+/i.test(text);
  if (hasTrick && !hasPrice) return 'trick';
  if (!hasLink && hasTrick)  return 'trick';
  return 'product';
};
