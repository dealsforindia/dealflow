import { create } from 'zustand';
import { API_URL as API, WS_URL } from '../config';

let wsInstance: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectCount = 0;

// ── Seed stats (shown immediately before WS connects)
const SEED_STATS = {
  pending: '…', posted: '…', rejected: 0,
  mongodb: { pending: 0, posted: 0, rejected: 0, total: 0, dupes: 0 },
  redis: { queue_depth: 0, memory_used: '…', total_keys: 0 },
};

// ── Fallback channel list
const FALLBACK_CHANNELS = [
  { channel: '-1001458177744', name: 'Technical Sheikh', active: true },
  { channel: '-1001389782464', name: 'ExtraPe Deals', active: true },
  { channel: '-1001450755585', name: 'Trending Loot Deals', active: true },
  { channel: '-1001480964161', name: 'EarnKaro Loot Deals', active: true },
  { channel: '-1001218727546', name: 'DesiDime', active: true },
  { channel: '-1001589506039', name: 'Deals Channel', active: true },
  { channel: '-1001423395942', name: 'Deals Channel 2', active: true },
  { channel: '-1002365543574', name: 'Deals Channel 3', active: true },
  { channel: '@FreeEarningTechOG', name: 'Free Earning Tech', active: true },
  { channel: '@extrape', name: 'ExtraPe Deals', active: true },
  { channel: '@glamhauldiaries', name: 'Glam Haul Diaries', active: true },
  { channel: '@lootdealsapp', name: 'Loot Deals App', active: true },
  { channel: '@realearnkaro', name: 'EarnKaro Official', active: true },
  { channel: '@ShoppersQuest', name: 'Shoppers Quest', active: true },
  { channel: '@DesidimeHot', name: 'DesiDime Hot', active: true },
  { channel: '@Loot_DealsX', name: 'Loot DealsX', active: true },
  { channel: '@Technicalsheikh', name: 'Technical Sheikh', active: true },
];

export const CHANNEL_NAME_MAP: Record<string, string> = {};
FALLBACK_CHANNELS.forEach(c => { CHANNEL_NAME_MAP[c.channel] = c.name; });

// ── Map a raw backend deal → normalized frontend deal
function mapDeal(x: any) {
  const d = { ...x };

  if (d.status === 'pending_approval') d.status = 'pending';

  if (!d.channel) d.channel = d.source_channel || d.channel_title || '';
  d.channelName = CHANNEL_NAME_MAP[d.channel]
    || CHANNEL_NAME_MAP[d.source_channel]
    || null;

  if (d.prices?.sale != null && Number(d.prices.sale) > 0) {
    d.price = String(d.prices.sale);
  }
  if (!d.price || d.price === '0') {
    const text = d.aff_text || d.prod_name || '';
    const m = text.match(/[₹@]\s*(\d[\d,]+)|under\s+(\d[\d,]+)|at\s+(\d[\d,]+)/i);
    if (m) {
      const raw = (m[1] || m[2] || m[3] || '').replace(/,/g, '');
      if (raw && Number(raw) > 0) d.price = raw;
    }
  }
  if (!d.original_price && d.prices?.mrp != null && Number(d.prices.mrp) > 0) {
    d.original_price = String(d.prices.mrp);
  }
  if (!d.discount_pct && d.prices?.discount_pct) {
    d.discount_pct = d.prices.discount_pct;
  }

  if (!d.dealType) {
    const text = (d.aff_text || d.message || d.prod_name || '').toLowerCase();
    const trickWords = ['trick', 'loot', 'free entry', 'quiz', 'contest', 'method', 'steps:', 'cashback trick'];
    const hasPrice = /[₹@]\s*\d+/i.test(text);
    const hasTrick = trickWords.some(w => text.includes(w));
    d.dealType = (hasTrick && !hasPrice) ? 'trick' : 'product';
  }

  // DesiDime-specific normalization
  if (d.source === 'desidime') {
    const storeMatch = (d.aff_text || '').match(/Available on:\s*(.+?)(?:\n|$)/i);
    const store = storeMatch ? storeMatch[1].trim() : (d.store || 'DesiDime');
    d.store = store;
    d.platforms = d.platforms?.length ? d.platforms : [store];
    d.channelName = store;
    if (!d.channel) d.channel = 'desidime';
  }

  return d;
}

interface DealStoreState {
  deals: any[];
  stats: any;
  channels: any[];
  channelConfig: any[];
  feed: any[];
  dealsLoading: boolean;
  authToken: string | null;
  settings: any;
  wsStatus: string;
  wsReconnectIn: number;
  pipeActive: Record<string, boolean>;
  toasts: { id: number; msg: string; type: string }[];
  activeFilter: string | null;
  desidimeDeals: any[];

  setAuthToken: (t: string) => void;
  addToast: (msg: string, type?: string) => void;
  setPipeActive: (key: string, active: boolean) => void;
  setSettings: (v: any) => void;
  setFilter: (chId: string) => void;
  clearFilter: () => void;
  updateChannelName: (id: string, name: string) => void;
  editDeal: (fp_hash: string, changes: any) => Promise<void>;
  fetchSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  fetchDeals: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchChannels: () => Promise<void>;
  fetchChannelConfig: () => Promise<void>;
  approveDeal: (fp_hash: string) => Promise<void>;
  rejectDeal: (fp_hash: string) => Promise<void>;
  aiRewrite: (fp_hash: string, instruction: string, currentText: string, dealType?: string) => Promise<string | null>;
  scrapeImage: (fp_hash: string) => Promise<any>;
  retryAffiliate: (fp_hash: string) => Promise<any>;
  markSpam: (fp_hash: string) => Promise<void>;
  composeDeal: (dealData: any) => Promise<any>;
  uploadImage: (fp_hash: string, file: File) => Promise<any>;
  fetchDesidimeDeals: () => Promise<void>;
  toggleChannel: (channelId: string) => Promise<void>;
  addChannel: (newChannel: string) => Promise<void>;
  deleteChannel: (channelId: string) => Promise<void>;
  connectWS: () => void;
  disconnectWS: () => void;
}

export const useDealStore = create<DealStoreState>((set, get) => ({
  // ── State
  deals: [],
  stats: SEED_STATS,
  channels: FALLBACK_CHANNELS,
  channelConfig: FALLBACK_CHANNELS,
  feed: [],
  dealsLoading: true,
  authToken: null,
  settings: JSON.parse(sessionStorage.getItem('dealbot_settings') || 'null') || {
    MAX_POSTS_CYCLE: 40,
    FP_TTL_HOURS: 24,
    CURATED_CHANNEL: '',
    AI_STYLE_PROMPT: '',
    DESIDIME_ENABLED: true,
  },
  wsStatus: "disconnected",
  wsReconnectIn: 0,
  pipeActive: {},
  toasts: [],
  activeFilter: null,
  desidimeDeals: [],

  setAuthToken: (t) => set({ authToken: t }),

  addToast: (msg, type = "success") => {
    const id = Date.now();
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
  },

  setPipeActive: (key, active) => {
    set(s => ({ pipeActive: { ...s.pipeActive, [key]: active } }));
  },

  setSettings: (v) => {
    set(s => ({ settings: typeof v === 'function' ? v(s.settings) : { ...s.settings, ...v } }));
  },

  setFilter: (chId) => set({ activeFilter: chId }),
  clearFilter: () => set({ activeFilter: null }),

  updateChannelName: (id, name) => {
    CHANNEL_NAME_MAP[id] = name;
    set(s => ({
      channels: s.channels.map(c => c.channel === id ? { ...c, name } : c),
      deals: s.deals.map(d => (d.channel === id || d.source_channel === id) ? { ...d, channelName: name } : d)
    }));
  },

  editDeal: async (fp_hash, changes) => {
    set(s => ({ deals: s.deals.map(d => d.fp_hash === fp_hash ? { ...d, ...changes } : d) }));
    try {
      await fetch(`${API}/api/v1/deals/${fp_hash}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes)
      });
    } catch (e) {
      console.error("Failed to save edit to backend:", e);
    }
  },

  // ── API Fetches
  fetchSettings: async () => {
    try {
      const r = await fetch(`${API}/api/v1/settings`);
      if (!r.ok) return;
      const d = await r.json();
      if (d.settings && Object.keys(d.settings).length > 0) {
        set(s => ({ settings: { ...s.settings, ...d.settings } }));
      }
    } catch { /* ignore */ }
  },

  saveSettings: async () => {
    sessionStorage.setItem('dealbot_settings', JSON.stringify(get().settings));
    try {
      await fetch(`${API}/api/v1/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(get().settings),
      });
    } catch { /* ignore */ }
    get().addToast("Settings saved");
  },

  fetchDeals: async () => {
    set({ dealsLoading: true });
    try {
      const PAGE = 150;
      const r = await fetch(`${API}/api/v1/deals/pending?limit=${PAGE}&skip=0`);
      if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
      const d = await r.json();
      const firstBatch = (Array.isArray(d) ? d : (d.deals || [])).map(mapDeal);
      const total = d.total || firstBatch.length;
      set({ deals: firstBatch, dealsLoading: firstBatch.length < total });

      if (firstBatch.length >= PAGE && total > PAGE) {
        let skip = PAGE;
        while (skip < total) {
          try {
            const r2 = await fetch(`${API}/api/v1/deals/pending?limit=${PAGE}&skip=${skip}`);
            if (!r2.ok) break;
            const d2 = await r2.json();
            const batch = (Array.isArray(d2) ? d2 : (d2.deals || [])).map(mapDeal);
            if (batch.length === 0) break;
            set(s => ({ deals: [...s.deals, ...batch] }));
            skip += PAGE;
          } catch { break; }
        }
      }
      set({ dealsLoading: false });
    } catch (e) {
      console.error("fetchDeals:", e);
      set({ dealsLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const r = await fetch(`${API}/api/v1/stats`);
      if (!r.ok) return;
      set({ stats: await r.json() });
    } catch { /* ignore */ }
  },

  fetchChannels: async () => {
    try {
      const r = await fetch(`${API}/api/v1/channels`);
      if (!r.ok) return;
      const d = await r.json();
      const list = Array.isArray(d) ? d : (d.channels || []);
      if (list.length > 0) {
        const countMap: Record<string, number> = {};
        list.forEach((ch: any) => {
          const id = ch.channel || ch.id;
          countMap[id] = ch.deals_24h || 0;
          if (id && ch.name && !CHANNEL_NAME_MAP[id]) {
            CHANNEL_NAME_MAP[id] = ch.name;
          }
        });

        set(s => {
          const knownIds = new Set(s.channels.map(c => c.channel));
          const newChannels = list
            .filter((ch: any) => !knownIds.has(ch.channel || ch.id))
            .map((ch: any) => ({
              channel: ch.channel || ch.id,
              name: ch.name || ch.channel || ch.id,
              active: ch.active !== false,
              deals_24h: ch.deals_24h || 0,
            }));

          return {
            channels: [...s.channels.map(c => ({
              ...c,
              deals_24h: countMap[c.channel] ?? c.deals_24h ?? 0,
            })), ...newChannels]
          };
        });
      }
    } catch { /* ignore */ }
  },

  fetchChannelConfig: async () => {
    try {
      const r = await fetch(`${API}/api/v1/channels/config`);
      if (!r.ok) return;
      const d = await r.json();
      const list = Array.isArray(d) ? d : (d.channels || []);
      if (list.length > 0) {
        const activeMap: Record<string, boolean> = {};
        list.forEach((c: any) => {
          const id = c.channel || c.id;
          activeMap[id] = c.active !== false;
          if (id && c.name && !CHANNEL_NAME_MAP[id]) {
            CHANNEL_NAME_MAP[id] = c.name;
          }
        });

        set(s => {
          const knownIds = new Set(s.channelConfig.map(c => c.channel));
          const newConfigs = list
            .filter((c: any) => !knownIds.has(c.channel || c.id))
            .map((c: any) => ({
              channel: c.channel || c.id,
              name: c.name || c.channel || c.id,
              active: c.active !== false,
            }));

          return {
            channelConfig: [
              ...s.channelConfig.map(c => ({
                ...c,
                active: activeMap[c.channel] !== undefined ? activeMap[c.channel] : c.active,
              })),
              ...newConfigs
            ]
          };
        });
      }
    } catch { /* ignore */ }
  },

  // ── Deal actions
  approveDeal: async (fp_hash) => {
    set(s => ({
      deals: s.deals.map(d => d.fp_hash === fp_hash ? { ...d, status: 'posted' } : d),
      stats: {
        ...s.stats,
        mongodb: {
          ...s.stats?.mongodb,
          pending: Math.max(0, (s.stats?.mongodb?.pending ?? 1) - 1),
          posted: (s.stats?.mongodb?.posted ?? 0) + 1,
        }
      }
    }));
    get().setPipeActive("post_telegram", true);
    setTimeout(() => get().setPipeActive("post_telegram", false), 4000);

    try {
      const dealToApprove = get().deals.find(d => d.fp_hash === fp_hash);
      const r = await fetch(`${API}/api/v1/deals/${fp_hash}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: dealToApprove ? JSON.stringify(dealToApprove) : undefined
      });
      const data = await r.json();
      if (data.tg_posted === false) {
        get().addToast("⚠️ Approved but Telegram post failed", "error");
      } else {
        get().addToast("✓ Posted to channel");
      }
    } catch {
      get().addToast("✓ Approved (offline mode)");
    }
  },

  rejectDeal: async (fp_hash) => {
    set(s => ({
      deals: s.deals.map(d => d.fp_hash === fp_hash ? { ...d, status: 'rejected' } : d),
      stats: {
        ...s.stats,
        mongodb: {
          ...s.stats?.mongodb,
          pending: Math.max(0, (s.stats?.mongodb?.pending ?? 1) - 1),
          rejected: (s.stats?.mongodb?.rejected ?? 0) + 1,
        }
      }
    }));
    try {
      await fetch(`${API}/api/v1/deals/${fp_hash}/reject`, { method: "PUT" });
    } catch { /* ignore */ }
  },

  aiRewrite: async (fp_hash, instruction, currentText, dealType) => {
    try {
      const r = await fetch(`${API}/api/v1/deals/${fp_hash}/ai-rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, current_text: currentText, deal_type: dealType || 'product' })
      });
      if (!r.ok) throw new Error(`AI rewrite failed: ${r.status}`);
      const data = await r.json();
      return data.rewritten_text;
    } catch (e) {
      console.error("AI rewrite error:", e);
      get().addToast("AI rewrite failed", "error");
      return null;
    }
  },

  scrapeImage: async (fp_hash) => {
    try {
      const r = await fetch(`${API}/api/v1/deals/${fp_hash}/scrape-image`, { method: "POST" });
      if (!r.ok) throw new Error(`Scrape failed: ${r.status}`);
      const data = await r.json();
      set(s => ({
        deals: s.deals.map(d => d.fp_hash === fp_hash
          ? { ...d, img_url: data.img_url, img_path: data.img_url }
          : d
        )
      }));
      get().addToast("Image scraped successfully");
      return data;
    } catch (e) {
      console.error("Scrape image error:", e);
      get().addToast("Could not scrape image", "error");
      return null;
    }
  },

  retryAffiliate: async (fp_hash) => {
    try {
      const r = await fetch(`${API}/api/v1/deals/${fp_hash}/retry-affiliate`, { method: "POST" });
      if (!r.ok) throw new Error(`Retry failed: ${r.status}`);
      const data = await r.json();
      if (data.success) {
        set(s => ({
          deals: s.deals.map(d => d.fp_hash === fp_hash
            ? { ...d, affiliate_applied: true, aff_text: data.aff_text || d.aff_text }
            : d
          )
        }));
        get().addToast("Affiliate link converted successfully");
      } else {
        get().addToast("EarnKaro conversion failed again", "error");
      }
      return data;
    } catch (e) {
      console.error("Retry affiliate error:", e);
      get().addToast("Retry failed", "error");
      return null;
    }
  },

  markSpam: async (fp_hash) => {
    set(s => ({
      deals: s.deals.map(d => d.fp_hash === fp_hash ? { ...d, status: 'spam' } : d),
      stats: {
        ...s.stats,
        mongodb: {
          ...s.stats?.mongodb,
          pending: Math.max(0, (s.stats?.mongodb?.pending ?? 1) - 1),
        }
      }
    }));
    try {
      await fetch(`${API}/api/v1/deals/${fp_hash}/spam`, { method: "PUT" });
      get().addToast("Marked as spam");
    } catch { /* ignore */ }
  },

  composeDeal: async (dealData) => {
    try {
      const r = await fetch(`${API}/api/v1/deals/compose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dealData)
      });
      if (!r.ok) throw new Error(`Compose failed: ${r.status}`);
      const data = await r.json();
      get().addToast("Deal created");
      get().fetchDeals();
      return data;
    } catch (e) {
      console.error("Compose deal error:", e);
      get().addToast("Failed to create deal", "error");
      return null;
    }
  },

  uploadImage: async (fp_hash, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const r = await fetch(`${API}/api/v1/deals/${fp_hash}/image`, {
        method: "POST",
        body: formData
      });
      if (!r.ok) throw new Error(`Upload failed: ${r.status}`);
      const data = await r.json();
      set(s => ({
        deals: s.deals.map(d => d.fp_hash === fp_hash
          ? { ...d, img_url: data.img_url, img_path: data.img_url }
          : d
        )
      }));
      get().addToast("Image uploaded");
      return data;
    } catch (e) {
      console.error("Upload image error:", e);
      get().addToast("Image upload failed", "error");
      return null;
    }
  },

  fetchDesidimeDeals: async () => {
    try {
      const r = await fetch(`${API}/api/v1/deals/desidime?limit=200`);
      if (r.ok) {
        const data = await r.json();
        set({ desidimeDeals: (data.deals || []).map(mapDeal) });
      }
    } catch (e) {
      console.error("Fetch DesiDime deals error:", e);
    }
  },

  // ── Channel management
  toggleChannel: async (channelId) => {
    set(s => ({
      channelConfig: s.channelConfig.map(c =>
        c.channel === channelId ? { ...c, active: !c.active } : c
      )
    }));
    try {
      await fetch(`${API}/api/v1/channels/config/${encodeURIComponent(channelId)}/toggle`, { method: "PUT" });
    } catch { /* ignore */ }
  },

  addChannel: async (newChannel) => {
    const ch = newChannel?.trim();
    if (!ch) return;
    if (!ch.startsWith('@') && !ch.startsWith('-') && !ch.startsWith('https://t.me/')) {
      get().addToast("Invalid format. Use @username or -100... ID", "error");
      return;
    }
    const entry = { channel: ch, name: ch, active: true, deals_24h: 0, source: 'ui' };
    set(s => ({
      channelConfig: [...s.channelConfig.filter(c => c.channel !== ch), entry],
      channels: [...s.channels.filter(c => c.channel !== ch), entry],
    }));
    try {
      await fetch(`${API}/api/v1/channels/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: ch }),
      });
      get().addToast(`✓ Channel added — listener refreshes in 60s`);
    } catch {
      get().addToast("Added locally (backend offline)");
    }
  },

  deleteChannel: async (channelId) => {
    set(s => ({
      channelConfig: s.channelConfig.filter(c => c.channel !== channelId),
      channels: s.channels.filter(c => c.channel !== channelId),
    }));
    try {
      await fetch(`${API}/api/v1/channels/config/${encodeURIComponent(channelId)}`, { method: "DELETE" });
      get().addToast("Channel removed");
    } catch { /* ignore */ }
  },

  // ── WebSocket
  connectWS: () => {
    if (wsInstance) return;
    try {
      wsInstance = new WebSocket(WS_URL);

      wsInstance.onopen = () => {
        set({ wsStatus: "connected", wsReconnectIn: 0 });
        reconnectCount = 0;
        get().fetchStats();
        get().fetchDeals();
        get().fetchChannels();
        get().fetchChannelConfig();
        get().fetchSettings();
      };

      wsInstance.onclose = () => {
        set({ wsStatus: "disconnected" });
        wsInstance = null;
        reconnectCount++;
        const delay = Math.min(3000 * reconnectCount, 10000);
        let remaining = Math.round(delay / 1000);
        set({ wsReconnectIn: remaining });
        const tick = setInterval(() => {
          remaining--;
          set({ wsReconnectIn: Math.max(0, remaining) });
          if (remaining <= 0) clearInterval(tick);
        }, 1000);
        reconnectTimer = setTimeout(() => {
          clearInterval(tick);
          get().connectWS();
        }, delay);
      };

      wsInstance.onerror = () => wsInstance?.close();

      wsInstance.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          const store = get();

          if (msg.event === "snapshot") {
            set(s => ({ stats: { ...s.stats, ...msg } }));
          } else if (msg.event === "ping") {
            // keep-alive
          } else if (msg.event === "new_deal") {
            store.setPipeActive("worker", true);
            setTimeout(() => store.setPipeActive("worker", false), 800);
            const mapped = mapDeal(msg);
            set(s => ({ feed: [{ ...mapped, id: Date.now() }, ...s.feed].slice(0, 80) }));
            store.fetchDeals();
          } else if (msg.event === "deal_approved") {
            set(s => ({
              deals: s.deals.map(x => x.fp_hash === msg.fp_hash ? { ...x, status: 'posted' } : x)
            }));
          } else if (msg.event === "deal_rejected") {
            set(s => ({
              deals: s.deals.map(x => x.fp_hash === msg.fp_hash ? { ...x, status: 'rejected' } : x)
            }));
          }
        } catch (err) {
          console.error("WS parse error:", err);
        }
      };
    } catch {
      set({ wsStatus: "disconnected" });
      wsInstance = null;
    }
  },

  disconnectWS: () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    wsInstance?.close();
    wsInstance = null;
  },
}));

export default useDealStore;
