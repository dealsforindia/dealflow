import { useState, useEffect, useRef } from 'react';
import type { Deal } from '../../../types';
import { TgBubble } from '../editors/TgBubble';
import { AiPane } from '../editors/AiPane';
import {
  PenLine, X, CheckCircle2, RefreshCw, Upload, Search, ImageOff, Inbox as InboxIcon,
} from 'lucide-react';

interface DealPanelProps {
  deal: Deal | null;
  onEdit: (d: Deal) => void;
}

export function DealPanel({ deal, onEdit }: DealPanelProps) {
  const [showAff, setShowAff] = useState(false);
  const [rightTab, setRightTab] = useState<'post' | 'ai'>('post');
  const fileRef = useRef<HTMLInputElement>(null);
  const [localImg, setLocalImg] = useState<string | null>(null);

  useEffect(() => {
    setShowAff(false);
    setLocalImg(null);
    setRightTab('post');
  }, [deal?.fp_hash]);

  if (!deal) {
    return (
      <div className="h-full flex items-center justify-center flex-col gap-3 opacity-30">
        <InboxIcon size={32} className="text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Select a deal</p>
      </div>
    );
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLocalImg(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-border" style={{ background: 'rgba(4,4,20,0.5)' }}>
        <div className="flex gap-0.5 p-0.5 rounded-xl flex-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {([['post', 'Post'], ['ai', 'AI Insights']] as const).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setRightTab(v)}
              className={`flex-1 py-2 rounded-[10px] text-xs font-bold transition-all ${
                rightTab === v
                  ? 'bg-violet-600/80 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={rightTab === v ? { boxShadow: '0 0 12px rgba(123,92,232,0.3)' } : {}}
            >
              {l}
            </button>
          ))}
        </div>
        <button
          onClick={() => onEdit(deal)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          style={{
            background: 'rgba(123,92,232,0.1)',
            color: '#9B82F5',
            border: '1px solid rgba(123,92,232,0.2)',
          }}
        >
          <PenLine size={12} />
          Edit
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {rightTab === 'post' && (
          <div className="px-4 py-4 flex flex-col gap-3.5">
            {/* Raw/Affiliated toggle — secondary, smaller */}
            <div
              className="flex gap-0.5 p-0.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest self-center px-1.5 opacity-50">View:</span>
              {([['Raw', false], ['Affiliated', true]] as const).map(([l, v]) => (
                <button
                  key={String(v)}
                  onClick={() => setShowAff(v as boolean)}
                  className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${
                    showAff === v
                      ? 'bg-card text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l as string}
                </button>
              ))}
            </div>

            <TgBubble deal={deal} showAff={showAff} localImg={localImg} />

            {/* Affiliate status */}
            <div
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl border"
              style={{
                background: deal.affiliate_applied
                  ? 'rgba(16,185,129,0.05)'
                  : 'rgba(245,158,11,0.05)',
                borderColor: deal.affiliate_applied
                  ? 'rgba(16,185,129,0.15)'
                  : 'rgba(245,158,11,0.15)',
              }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: deal.affiliate_applied
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(245,158,11,0.12)',
                }}
              >
                <CheckCircle2
                  size={13}
                  style={{ color: deal.affiliate_applied ? '#10b981' : '#f59e0b' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold"
                  style={{ color: deal.affiliate_applied ? '#10b981' : '#f59e0b' }}
                >
                  {deal.affiliate_applied ? 'Affiliated via EarnKaro' : 'Not Affiliated'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {deal.affiliate_applied ? 'Links converted' : 'EarnKaro conversion failed'}
                </p>
              </div>
              {!deal.affiliate_applied && (
                <button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw size={9} />
                  Retry
                </button>
              )}
            </div>

            {/* Image section */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-border flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Image
                </span>
                {(localImg || deal.img_url) && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    Attached
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col gap-2">
                {localImg || deal.img_url ? (
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img
                      src={localImg ?? deal.img_url}
                      alt=""
                      className="w-full object-cover"
                      style={{ maxHeight: 120, background: 'rgba(255,255,255,0.02)' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      onClick={() => setLocalImg(null)}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.75)' }}
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-3 px-3 py-3 rounded-xl border border-dashed border-border"
                    style={{ background: 'rgba(255,255,255,0.01)' }}
                  >
                    <ImageOff size={14} className="text-muted-foreground flex-shrink-0 opacity-40" />
                    <p className="text-xs text-muted-foreground opacity-60">
                      No image — post will send text only
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  >
                    <Upload size={11} />
                    {localImg || deal.img_url ? 'Replace' : 'Upload'}
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                    <Search size={11} />
                    Scrape URL
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {rightTab === 'ai' && <AiPane deal={deal} />}
      </div>
    </div>
  );
}
