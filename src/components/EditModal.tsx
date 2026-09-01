import { useState, useRef } from "react";
import type { Deal } from "../types";
import {
  fmt, fmtAgo, catColor, discBg, extractUrls, stripAffTag,
  apiRetryAffiliate, apiScrapeImage, apiSpam, apiAiRewrite,
} from "../utils";
import ScoreRing from "./ScoreRing";
import ImageLightbox from "./ImageLightbox";
import { X, PenLine, Upload, Sparkles, Undo2, Copy, ExternalLink, FileText, Link, Check, Maximize2, AlertTriangle, Globe, Zap } from "./Icons";

const aiRewriteSim = (text: string, inst: string): string => {
  const i = inst.toLowerCase();
  if (i.includes("short") || i.includes("concise")) return text.split("\n").slice(0, 8).join("\n");
  if (i.includes("emoji")) return "🔥 " + text;
  if (i.includes("clean")) return text.replace(/#\S+/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return text + "\n\n⚡ Limited time offer!";
};

interface EditModalProps {
  deal: Deal;
  onClose: () => void;
  onSaveDraft: (changes: Partial<Deal>) => void;
  onSaveApprove: (changes: Partial<Deal>) => void;
  onRemove?: (id: string) => void;
  onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function EditModal({ deal, onClose, onSaveDraft, onSaveApprove, onRemove, onToast }: EditModalProps) {
  const [title, setTitle] = useState(deal.title);
  const [price, setPrice] = useState(String(deal.price || ""));
  const [mrp, setMrp] = useState(String(deal.mrp || ""));
  
  const getInitialText = () => {
    const raw = (deal.affText || "").trim();
    const t = (deal.title || "").trim();
    if (!raw) return t ? `${t} @ ₹${deal.price || ""}` : "";
    
    const isMissingTitle = t && t.length > 4 && !raw.toLowerCase().includes(t.toLowerCase().slice(0, 10));
    const isOnlyPriceLink = /^\s*[*_]*₹?\d+[*_]*\s*(?:\|\s*[*_]*Regular[^\n]*\n*)?https?:\/\/\S+/i.test(raw) || /^\s*\d{2,6}\s+https?:\/\/\S+/i.test(raw);
    
    if (isMissingTitle || isOnlyPriceLink) {
      const urls = raw.match(/https?:\/\/\S+/g) || [];
      const link = urls.length > 0 ? urls[0] : "";
      const p = deal.price ? ` @ ₹${deal.price}` : "";
      return `${t}${p}\n\n${link}`.trim();
    }
    return raw;
  };

  const [text, setText] = useState(getInitialText());
  const [imgUrl, setImgUrl] = useState(deal.imgUrl);
  const [imgFile, setImgFile] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [instruction, setInstruction] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const [prev, setPrev] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [retryingAffiliate, setRetryingAffiliate] = useState(false);
  const [scrapingImage, setScrapingImage] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewSrc = imgFile || imgUrl || null;
  const accent = catColor[deal.category] || "#9496B8";
  const isDirty = title !== deal.title || price !== String(deal.price || "") || imgUrl !== deal.imgUrl || text !== deal.affText;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setImgFile(ev.target?.result as string); setZoom(1); };
    reader.readAsDataURL(f);
  };

  const doRewrite = async () => {
    if (!instruction.trim()) return;
    setRewriting(true);
    setPrev(text);
    const result = await apiAiRewrite(deal.id, instruction);
    setText(result ?? aiRewriteSim(text, instruction));
    setInstruction("");
    setRewriting(false);
  };

  const doRetryAffiliate = async () => {
    setRetryingAffiliate(true);
    const result = await apiRetryAffiliate(deal.id);
    if (result) { setText(result); onToast("Affiliate link updated", "success"); }
    else onToast("Retry affiliate failed", "error");
    setRetryingAffiliate(false);
  };

  const doScrapeImage = async () => {
    setScrapingImage(true);
    const result = await apiScrapeImage(deal.id);
    if (result) {
      if (typeof result === "string") {
        setImgUrl(result);
        setImgFile(null);
      } else {
        if (result.imgUrl) { setImgUrl(result.imgUrl); setImgFile(null); }
        if (result.title) setTitle(result.title);
        if (result.price) setPrice(String(result.price));
        if (result.mrp) setMrp(String(result.mrp));
        if (result.affText) {
          setText(result.affText);
        } else if (result.title) {
          const urls = text.match(/https?:\/\/\S+/g) || [];
          const link = urls.length > 0 ? urls[0] : "";
          const p = result.price || price || "";
          const pStr = p ? ` @ ₹${p}` : "";
          setText(`${result.title}${pStr}\n\n${link}`.trim());
        }
      }
      onToast("✨ Product details & post text updated from store!", "success");
    } else {
      onToast("Image scrape failed", "error");
    }
    setScrapingImage(false);
  };

  const doSpam = async () => {
    const ok = await apiSpam(deal.id);
    if (ok) {
      onToast("Flagged as spam", "info");
      onRemove?.(deal.id);
      onClose();
    } else {
      onToast("Failed to flag spam", "error");
    }
  };

  const changes: Partial<Deal> = {
    title,
    imgUrl: imgFile || imgUrl,
    price: Number(price) || deal.price,
    mrp: Number(mrp) || deal.mrp,
    affText: text,
  };

  const previewPrice = Number(price) || deal.price;
  const previewMrp = Number(mrp) || deal.mrp;

  return (
    <>
      {lightbox && previewSrc && <ImageLightbox src={previewSrc} onClose={() => setLightbox(false)} />}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="w-full md:max-w-2xl max-h-[94dvh] flex flex-col rounded-t-2xl md:rounded-2xl overflow-hidden animate-slide-up"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,45,85,0.1)" }}>
              <PenLine size={13} style={{ color: "#FF2D55" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold" style={{ color: "var(--text)" }}>Edit Deal</p>
              <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>{deal.channel} · {fmtAgo(deal.ts)}</p>
            </div>
            <ScoreRing score={deal.score} size={32} verdict={deal.verdict} />
            {isDirty && (
              <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                Unsaved
              </span>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-fast" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col md:flex-row h-full">
              {/* Left: form */}
              <div className="flex-1 px-5 py-4 flex flex-col gap-4">
                {/* Image */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Product Image</label>
                  <div
                    className="relative rounded-xl overflow-hidden mb-3 cursor-zoom-in"
                    style={{ aspectRatio: "4/3", maxHeight: 200, background: "var(--bg-secondary)" }}
                    onClick={() => previewSrc && setLightbox(true)}
                  >
                    {previewSrc ? (
                      <>
                        <img
                          src={previewSrc}
                          alt=""
                          className="w-full h-full"
                          style={{ objectFit: "contain", transform: `scale(${zoom})`, transformOrigin: "center", transition: "transform 0.15s" }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-fast" style={{ background: "rgba(0,0,0,0.2)" }}>
                          <Maximize2 size={18} className="text-white/70" />
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setImgFile(null); setImgUrl(""); setZoom(1); }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(0,0,0,0.6)" }}
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: "var(--text-muted)" }}>
                        <span className="text-4xl" style={{ fontFamily: "'Segoe UI Emoji',sans-serif" }}>{deal.catEmoji}</span>
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  {previewSrc && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>🔍</span>
                      <input type="range" min={0.5} max={2.5} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1" />
                      <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)", fontFamily: "'JetBrains Mono',monospace" }}>{zoom.toFixed(1)}×</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={imgUrl}
                      onChange={(e) => setImgUrl(e.target.value)}
                      placeholder="https://image-url.com/photo.jpg"
                      className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none transition-fast"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)" }}
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-fast hover:opacity-80"
                      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "#9ca3af" }}
                    >
                      <Upload size={10} /> Upload
                    </button>
                    <button
                      onClick={doScrapeImage}
                      disabled={scrapingImage}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-fast hover:opacity-80 disabled:opacity-40"
                      style={{ background: "rgba(0,200,255,0.08)", border: "1px solid rgba(0,200,255,0.2)", color: "#00C8FF" }}
                      title="Auto-scrape image"
                    >
                      {scrapingImage ? <span className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" /> : <Globe size={10} />}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-fast"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>

                {/* Price */}
                {deal.dealType === "product" && (
                  <div className="grid grid-cols-2 gap-3">
                    {[["Sale Price (₹)", price, setPrice], ["MRP (₹)", mrp, setMrp]].map(([label, val, setter]) => (
                      <div key={label as string}>
                        <label className="block text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>{label as string}</label>
                        <input
                          type="number"
                          value={val as string}
                          onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-fast font-mono"
                          style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "'JetBrains Mono',monospace" }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Rewrite */}
                <div>
                  <div className="flex items-end justify-between mb-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Post Text (Affiliate)</label>
                    <span className="text-[9px] font-mono" style={{ color: "var(--text-dim)", fontFamily: "'JetBrains Mono',monospace" }}>{text.length} chars</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && doRewrite()}
                      placeholder='"make shorter", "add emojis", "clean up"…'
                      className="flex-1 px-3 py-2 rounded-xl text-xs focus:outline-none transition-fast"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)" }}
                    />
                    <button
                      onClick={doRewrite}
                      disabled={rewriting || !instruction.trim()}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-fast disabled:opacity-40"
                      style={{ background: "rgba(255,45,85,0.08)", color: "#FF2D55", border: "1px solid rgba(255,45,85,0.2)" }}
                    >
                      {rewriting
                        ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                        : <Sparkles size={10} />}
                      AI
                    </button>
                    {prev && (
                      <button
                        onClick={() => { setText(prev); setPrev(null); }}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-fast"
                        style={{ background: "rgba(220,38,38,0.08)", color: "#f87171", border: "1px solid rgba(220,38,38,0.2)" }}
                      >
                        <Undo2 size={10} /> Undo
                      </button>
                    )}
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                    className="w-full px-3.5 py-3 rounded-xl focus:outline-none resize-none tg-text transition-fast"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>

                {/* Original text + links */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ background: "var(--bg-sidebar)", borderColor: "var(--border)" }}>
                    <FileText size={10} style={{ color: "var(--text-muted)" }} />
                    <span className="text-[9px] font-bold uppercase tracking-widest flex-1" style={{ color: "var(--text-muted)" }}>Original Text</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(deal.originalText); onToast("Copied!", "success"); }}
                      className="flex items-center gap-1 text-[9px] font-semibold transition-fast hover:opacity-80"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Copy size={8} /> Copy
                    </button>
                  </div>
                  <div className="px-3 py-2.5 max-h-20 overflow-y-auto">
                    <p className="tg-text" style={{ color: "var(--text-muted)", fontSize: 10 }}>{deal.originalText || "No original text."}</p>
                  </div>
                  {extractUrls(deal.originalText).length > 0 && (
                    <div className="border-t px-3 py-2 flex flex-col gap-1.5" style={{ borderColor: "var(--border)" }}>
                      <p className="text-[8px] font-bold uppercase tracking-widest flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <Link size={7} /> Raw Links
                      </p>
                      {extractUrls(deal.originalText).slice(0, 3).map((url, i) => {
                        const clean = stripAffTag(url);
                        return (
                          <div key={i} className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: "var(--bg-secondary)" }}>
                            <span className="text-[9px] font-mono flex-1 truncate" style={{ color: "var(--text)", fontFamily: "'JetBrains Mono',monospace" }}>{clean}</span>
                            <button onClick={() => { navigator.clipboard.writeText(clean); onToast("Link copied!", "success"); }} className="flex-shrink-0 p-1 rounded-md transition-fast hover:opacity-80">
                              <Copy size={8} style={{ color: "var(--text-muted)" }} />
                            </button>
                            <a href={clean} target="_blank" rel="noreferrer" className="flex-shrink-0 p-1 rounded-md transition-fast hover:opacity-80">
                              <ExternalLink size={8} style={{ color: "var(--text-muted)" }} />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Mobile preview toggle */}
                <button
                  className="md:hidden text-[10px] font-semibold text-left transition-fast hover:opacity-80"
                  style={{ color: "var(--text-muted)" }}
                  onClick={() => setShowMobilePreview((v) => !v)}
                >
                  {showMobilePreview ? "▼ Hide" : "▶ Show"} Card Preview
                </button>

                {/* Mobile preview */}
                {showMobilePreview && (
                  <div className="md:hidden rounded-xl overflow-hidden border" style={{ border: "1px solid var(--border)" }}>
                    <CardPreview title={title} previewSrc={previewSrc} price={previewPrice} mrp={previewMrp} deal={deal} accent={accent} zoom={zoom} />
                  </div>
                )}
              </div>

              {/* Desktop preview */}
              <div className="hidden md:flex w-64 flex-shrink-0 flex-col gap-3 p-4 border-l" style={{ background: "#080A14", borderColor: "var(--border)" }}>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>Telegram Preview</p>
                <div className="tg-preview-wrap">
                  <div className="tg-preview-header">
                    <div className="tg-preview-avatar">B</div>
                    <div>
                      <div className="tg-preview-name">BestIndianDeals</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Channel</div>
                    </div>
                  </div>
                  <div className="tg-bubble">
                    {previewSrc && (
                      <img src={previewSrc} alt="" style={{ width: "100%", borderRadius: 8, marginBottom: 8, maxHeight: 140, objectFit: "cover" }}
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    )}
                    <div className="tg-bubble-text">
                      {text.split("\n").slice(0, 12).join("\n")
                        .replace(/\*\*(.+?)\*\*/g, (_, m) => `<b>${m}</b>`)
                        .replace(/~~(.+?)~~/g, (_, m) => `<s>${m}</s>`)
                        .split(/(https?:\/\/\S+)/g)
                        .map((part, i) =>
                          /^https?:\/\//.test(part)
                            ? <a key={i} href={part} className="tg-bubble-link" target="_blank" rel="noreferrer">{part.length > 32 ? part.slice(0,32) + "…" : part}</a>
                            : <span key={i} dangerouslySetInnerHTML={{ __html: part.replace(/<b>(.*?)<\/b>/g, '<strong style="color:#fff">$1</strong>').replace(/<s>(.*?)<\/s>/g, '<del>$1</del>') }} />
                        )
                      }
                    </div>
                    <div className="tg-bubble-time">{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} ✓✓</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>Live preview as it appears in Telegram</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t flex-shrink-0" style={{ borderColor: "var(--border)" }}>
            {/* Tertiary actions */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={doRetryAffiliate}
                disabled={retryingAffiliate}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-fast disabled:opacity-40"
                style={{ background: "rgba(0,214,143,0.08)", color: "#00D68F", border: "1px solid rgba(0,214,143,0.15)" }}
              >
                {retryingAffiliate ? <span className="w-2.5 h-2.5 border border-green-400 border-t-transparent rounded-full animate-spin" /> : <Zap size={9} />}
                Retry Affiliate
              </button>
              <button
                onClick={doScrapeImage}
                disabled={scrapingImage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-fast disabled:opacity-40"
                style={{ background: "rgba(0,200,255,0.08)", color: "#00C8FF", border: "1px solid rgba(0,200,255,0.15)" }}
              >
                {scrapingImage ? <span className="w-2.5 h-2.5 border border-cyan-400 border-t-transparent rounded-full animate-spin" /> : <Globe size={9} />}
                Scrape Image
              </button>
              <button
                onClick={doSpam}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-fast ml-auto"
                style={{ background: "rgba(220,38,38,0.08)", color: "#f87171", border: "1px solid rgba(220,38,38,0.15)" }}
              >
                <AlertTriangle size={9} /> Mark Spam
              </button>
            </div>
            {/* Primary actions */}
            <div className="flex items-center gap-2.5 px-5 py-3.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-fast hover:opacity-80"
                style={{ background: "var(--bg-secondary)", color: "#9ca3af", border: "1px solid var(--border)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onSaveDraft(changes); onClose(); }}
                disabled={!isDirty}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-fast disabled:opacity-30 hover:opacity-80"
                style={{ background: "var(--bg-secondary)", color: "var(--text)", border: "1px solid var(--border)" }}
              >
                Save Draft
              </button>
              <button
                onClick={() => { onSaveApprove(changes); onClose(); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold text-white transition-fast active:scale-[0.98]"
                style={{ background: "#00D68F", boxShadow: "0 4px 20px rgba(0,214,143,0.28)" }}
              >
                <Check size={14} strokeWidth={2.5} /> Save & Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CardPreview({ title, previewSrc, price, mrp, deal, accent, zoom }: {
  title: string; previewSrc: string | null; price: number; mrp: number;
  deal: Deal; accent: string; zoom: number;
}) {
  return (
    <>
      <div className="relative" style={{ aspectRatio: "1/1", background: "var(--bg-secondary)" }}>
        {previewSrc ? (
          <img
            src={previewSrc}
            alt=""
            className="w-full h-full"
            style={{ objectFit: "contain", padding: 8, transform: `scale(${zoom})`, transformOrigin: "center" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl" style={{ fontFamily: "'Segoe UI Emoji',sans-serif", background: `${accent}10` }}>
            {deal.catEmoji}
          </div>
        )}
        {deal.discount > 0 && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-white text-[9px] font-bold" style={{ background: discBg(deal.discount) }}>
            {Math.round(deal.discount)}% OFF
          </div>
        )}
      </div>
      <div className="p-2.5 flex flex-col gap-1" style={{ background: "var(--bg-card)" }}>
        <p className="text-[10px] font-semibold leading-snug line-clamp-2" style={{ color: "var(--text)" }}>{title || "Deal title…"}</p>
        {price > 0 && (
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs font-bold" style={{ color: "var(--text)", fontFamily: "'JetBrains Mono',monospace" }}>{fmt(price)}</span>
            {mrp > 0 && mrp > price && <span className="text-[9px] line-through" style={{ color: "var(--text-muted)" }}>{fmt(mrp)}</span>}
          </div>
        )}
      </div>
    </>
  );
}
