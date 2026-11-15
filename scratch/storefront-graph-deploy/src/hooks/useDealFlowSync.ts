import { useEffect, useRef, useState, useCallback } from 'react';
import { PublicDeal } from '../types';
import { calculateWorthScore } from '../utils/worthScore';
import { playSuccessChime } from '../utils/audio';

export interface DealFlowEngineSnapshot {
  queue_depth: number;
  redis_memory: string;
  pending_count: number;
  posted_today: number;
  ts: number;
}

export interface UseDealFlowSyncOptions {
  onDealReceived?: (deal: PublicDeal) => void;
  onDealStatusChange?: (change: { id: string; status: string }) => void;
  onDealDeleted?: (id: string) => void;
  onDealUnpublished?: (id: string) => void;
  onDealEdited?: (deal: PublicDeal) => void;
  enableAlerts?: boolean;
}

export function useDealFlowSync({
  onDealReceived,
  onDealStatusChange,
  onDealDeleted,
  onDealUnpublished,
  onDealEdited,
  enableAlerts = false,
}: UseDealFlowSyncOptions = {}) {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [snapshot, setSnapshot] = useState<DealFlowEngineSnapshot | null>(null);
  const [latestDrop, setLatestDrop] = useState<PublicDeal | null>(null);
  const [newDropsCount, setNewDropsCount] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef<number>(0);

  const formatIncomingDeal = useCallback((raw: Record<string, any>): PublicDeal => {
    const id = String(raw.id || raw.fp_hash || raw._id || (raw.ts ? String(raw.ts) : Date.now()));
    const fp_hash = raw.fp_hash || raw.id || id;
    const title = raw.title || raw.prod_name || 'Verified Deal Drop';
    const price = raw.price !== undefined && raw.price !== null ? Number(raw.price) : (raw.prices?.sale !== undefined && raw.prices?.sale !== null ? Number(raw.prices.sale) : null);
    const mrp = raw.mrp !== undefined && raw.mrp !== null ? Number(raw.mrp) : (raw.prices?.mrp !== undefined && raw.prices?.mrp !== null ? Number(raw.prices.mrp) : null);
    const discount_pct = raw.discount_pct !== undefined && raw.discount_pct !== null ? Number(raw.discount_pct) : (raw.prices?.discount_pct !== undefined && raw.prices?.discount_pct !== null ? Number(raw.prices.discount_pct) : (mrp && price ? Math.round(((mrp - price) / mrp) * 100) : null));
    
    // Resolve store / uploaded image (Uploaded images have 1st priority)
    let image: string | null = raw.uploaded_img_url || raw.uploadedImgUrl || raw.image || raw.img_url || null;
    if (!image && raw.img_path) {
      const cleanPath = raw.img_path.includes('/images/')
        ? 'images/' + raw.img_path.split('/images/').pop()
        : raw.img_path;
      image = `https://api.rudranil.me/${cleanPath}`;
    }

    const store = raw.store || raw.platforms?.[0] || 'Store';
    const category = raw.category || 'General';
    let url = raw.url || raw.buy_url || raw.canonical_url || raw.aff_url || '';
    if (!url && (raw.aff_text || raw.original_text || raw.message)) {
      const match = (raw.aff_text || raw.original_text || raw.message).match(/https?:\/\/[^\s<>"]+/i);
      if (match) url = match[0];
    }
    if (!url) url = '#';
    const posted_at = raw.posted_at || raw.processed_ts || raw.ts || Math.floor(Date.now() / 1000);

    const baseDeal: PublicDeal = {
      id,
      fp_hash,
      title,
      price,
      mrp,
      discount_pct,
      store,
      image,
      url,
      category,
      posted_at,
      display_ts: posted_at * 1000,
      coupon: raw.coupon || null,
      coupon_discount: raw.coupon_discount || null,
      effective_price: raw.effective_price || null,
      usually_price: raw.usually_price || mrp,
      savings: mrp && price ? mrp - price : null,
      is_lowest_price: Boolean(raw.is_lowest_price),
      deal_score: raw.deal_score || (typeof raw.score === 'number' ? Math.round(raw.score * 10) : 80),
      deal_badges: Array.isArray(raw.deal_badges) ? raw.deal_badges : [],
      status: raw.status || 'approved',
    };

    const calculated = calculateWorthScore(baseDeal);
    baseDeal.worth_score = calculated.score;
    baseDeal.worth_label = calculated.label;

    return baseDeal;
  }, []);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
    }

    setStatus('connecting');

    // Determine WS target URL
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl =
      import.meta.env.VITE_WS_URL ||
      (import.meta.env.PROD
        ? 'wss://api.rudranil.me/ws'
        : `${proto}//${window.location.host}/ws`);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
        reconnectAttempts.current = 0;
        console.log('⚡ DealFlow Engine WebSocket connected:', wsUrl);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // 1. Snapshot Telemetry
          if (data.event === 'snapshot') {
            setSnapshot({
              queue_depth: data.queue_depth ?? 0,
              redis_memory: data.redis_memory ?? '1.2M',
              pending_count: data.pending_count ?? 0,
              posted_today: data.posted_today ?? 0,
              ts: data.ts ?? Date.now() / 1000,
            });
            return;
          }

          // 2. Deal Approved / New Drop
          if (
            data.event === 'deal_approved' ||
            data.event === 'deal_posted' ||
            data.event === 'new_deal' ||
            data.channel === 'deals:approved'
          ) {
            const rawDeal = data.deal || data;
            const formatted = formatIncomingDeal(rawDeal);

            setLatestDrop(formatted);
            setNewDropsCount((prev) => prev + 1);

            if (enableAlerts) {
              try {
                playSuccessChime();
              } catch {}
            }

            if (onDealReceived) {
              onDealReceived(formatted);
            }
            return;
          }

          // 3. Deal Deleted (Real-time removal without reload)
          if (data.event === 'deal_deleted' || (data.event === 'deal_status_change' && data.status === 'deleted')) {
            const id = data.fp_hash || data.id;
            if (id && onDealDeleted) {
              onDealDeleted(id);
            }
            return;
          }

          // 4. Deal Unpublished (Real-time pull from storefront)
          if (data.event === 'deal_unpublished' || (data.event === 'deal_status_change' && data.status === 'unpublished')) {
            const id = data.fp_hash || data.id;
            if (id) {
              if (onDealUnpublished) onDealUnpublished(id);
              if (onDealDeleted) onDealDeleted(id);
            }
            return;
          }

          // 5. Deal Edited (Real-time price / title / details update)
          if (data.event === 'deal_edited') {
            const rawDeal = data.deal || data;
            const formatted = formatIncomingDeal(rawDeal);
            if (onDealEdited) {
              onDealEdited(formatted);
            }
            return;
          }

          // 6. Status changes (out of stock, expired, rejected)
          if ((data.event === 'deal_status_change' || data.event === 'deal_rejected') && onDealStatusChange) {
            onDealStatusChange({
              id: data.fp_hash || data.id,
              status: data.status || (data.event === 'deal_rejected' ? 'rejected' : 'updated'),
            });
            return;
          }
        } catch (parseErr) {
          console.debug('DealFlow WS message parsing skipped:', parseErr);
        }
      };

      ws.onerror = () => {
        // Will trigger onclose
      };

      ws.onclose = () => {
        setStatus('disconnected');
        wsRef.current = null;

        // Exponential backoff reconnect: 2s -> 4s -> max 10s
        const delay = Math.min(10000, 2000 * Math.pow(1.5, reconnectAttempts.current));
        reconnectAttempts.current += 1;

        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    } catch {
      setStatus('disconnected');
    }
  }, [formatIncomingDeal, onDealReceived, onDealStatusChange, onDealDeleted, onDealUnpublished, onDealEdited, enableAlerts]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
      }
    };
  }, [connect]);

  const clearNewDropsCount = useCallback(() => {
    setNewDropsCount(0);
  }, []);

  return {
    status,
    snapshot,
    latestDrop,
    newDropsCount,
    clearNewDropsCount,
    reconnect: connect,
  };
}
