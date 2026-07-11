import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import useDealStore from "../store";
import { cleanTitle, normalizeImageUrl, resolveChannelName, categoryEmoji, normalizeScore } from "../utils/helpers";
import {
  Activity, Check, X, Radio, Settings2, Zap, Tag,
  ToggleLeft, ToggleRight, Plus, Share2,
  PenLine, Sparkles, Upload, Search, Undo2, ImageOff, RefreshCw,
  AlertTriangle, ExternalLink, Shield,
  CheckCircle2, ThumbsUp, Rss,
  CheckSquare, Inbox as InboxIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type DealType = "product" | "trick";
type Status = "pending" | "posted" | "rejected";
type Tab = "Review" | "DesiDime" | "Posted" | "Channels" | "Settings";

interface Deal {
  fp_hash: string; title: string; description: string;
  price: number; original_price: number; category: string;
  dealType: DealType; channel: string; channelName: string;
  status: Status; emoji: string; ai_score: number; ts: number;
  discount_pct: number; signals: string[]; verdict: string;
  risk_factors: string[]; original_text: string; aff_text: string;
  img_url: string; affiliate_applied: boolean;
}

interface DesiDeal {
  id: string; title: string; price: number; original_price: number;
  category: string; emoji: string; upvotes: number; comments: number;
  ai_score: number; ts: number; status: Status; description: string; url: string;
}

interface PostedEntry {
  id: string; title: string; emoji: string; price: number;
  discount_pct: number; category: string; channel: string;
  posted_at: number; affiliate_applied: boolean;
}

interface AppSettings {
  output_channel: string; ai_style_prompt: string;
  dedup_window_hours: number; max_posts_per_cycle: number;
}

// ─── Store Deal → UI Deal Conversion ──────────────────────────────────────────
const buildVerdict = (score: number | null): string => {
  if (score === null) return "Unrated — AI score unavailable for this deal. Review manually.";
  if (score >= 8) return "Strong deal — high confidence score. Recommend posting immediately.";
  if (score >= 6) return "Decent deal — good price. Worth reviewing before posting.";
  if (score >= 4) return "Borderline — review carefully. Check if discount is genuine.";
  return "Low quality — likely spam or poor value. Reject unless compelling reason.";
};

function toUIDeal(d: any): Deal {
  const cat = (d.category || 'General').replace(/^[\p{Emoji}\s\u200d\ufe0f]+/u, '').trim() || 'General';
  const emoji = categoryEmoji(d.category || cat);
  const title = d.prod_name || d.title || cleanTitle(d) || "Untitled Deal";
  const price = Number(d.price) || Number(d.prices?.sale) || 0;
  const originalPrice = Number(d.original_price) || Number(d.prices?.mrp) || 0;
  const discountPct = d.discount_pct || d.prices?.discount_pct || 0;
  const rawScore = d.score != null ? d.score : d.ai_score;
  const score = rawScore != null ? (normalizeScore(rawScore) || 0) : 0;
  const signals: string[] = [];
  if (discountPct > 0) signals.push(`${Math.round(discountPct)}% off`);
  if (d.affiliate_applied) signals.push("Affiliated");
  if (d.coupon) signals.push(`Coupon: ${d.coupon}`);
  if (d.bank_offers?.length > 0) signals.push(`${d.bank_offers.length} bank offer${d.bank_offers.length > 1 ? 's' : ''}`);
  if (d.platforms?.length > 0) signals.push(d.platforms[0]);
  const channelName = d.channelName || resolveChannelName(d.channel || d.source_channel || '');
  return {
    ...d,
    fp_hash: d.fp_hash || d.id || '', title,
    description: d.description || (d.platforms?.length ? `Available on ${d.platforms.join(', ')}.` : ''),
    price, original_price: originalPrice, category: cat,
    dealType: (d.dealType || d.deal_type || 'product') as DealType,
    channel: d.channel || d.source_channel || '', channelName,
    status: (d.status || 'pending') as Status, emoji,
    ai_score: score, ts: Math.floor(d.ts || Date.now() / 1000),
    discount_pct: discountPct, signals: signals.slice(0, 4),
    risk_factors: d.risk_factors || [],
    verdict: buildVerdict(rawScore != null && rawScore <= 10 ? rawScore : rawScore != null ? rawScore / 10 : null),
    original_text: d.original_text || '', aff_text: d.aff_text || d.original_text || '',
    img_url: normalizeImageUrl(d) || '', affiliate_applied: !!d.affiliate_applied,
  };
}


// ─── Utils ────────────────────────────────────────────────────────────────────
const fmt = (p: number) => !p ? "Free" : `₹${Number(p).toLocaleString("en-IN")}`;
const fmtTime = (ts: number) => new Date(ts*1000).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
const fmtDate = (ts: number) => new Date(ts*1000).toLocaleDateString("en-IN",{day:"numeric",month:"short"});
const fmtAgo = (ts: number) => {
  const d = Math.floor((Date.now()/1000)-ts);
  if (d < 60) return `${d}s ago`; if (d < 3600) return `${Math.floor(d/60)}m ago`;
  return `${Math.floor(d/3600)}h ago`;
};
const scoreColor = (s: number) => s === 0 ? "#52536A" : s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : s >= 40 ? "#f97316" : "#ef4444";
const scoreLabel = (s: number) => s === 0 ? "Unrated" : s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Average" : "Low";
const catColor: Record<string,string> = {
  Electronics:"#7B5CE8", Fashion:"#ec4899", "Home & Kitchen":"#f59e0b",
  Home:"#f59e0b", Beauty:"#f472b6", Sports:"#10b981",
  Banking:"#f59e0b", Food:"#f97316", Computers:"#06b6d4",
  General:"#9496B8", Grocery:"#10b981", Travel:"#06b6d4",
  Books:"#f59e0b", Kids:"#f97316", Gaming:"#7B5CE8", Watches:"#a78bfa",
  Pet:"#10b981",
};
// AI rewrite is handled by the real backend via useDealStore.aiRewrite()

// ─── CSS ──────────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes cardEnter{from{opacity:0;transform:scale(0.93) translateY(20px);}to{opacity:1;transform:scale(1) translateY(0);}}
  @keyframes flyRight{to{transform:translateX(140vw) rotate(28deg);opacity:0;}}
  @keyframes flyLeft{to{transform:translateX(-140vw) rotate(-28deg);opacity:0;}}
  @keyframes flyUp{to{transform:translateY(-120vh) rotate(-8deg);opacity:0;}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
  @keyframes slideRight{from{opacity:0;transform:translateX(100%);}to{opacity:1;transform:translateX(0);}}
  @keyframes slideUp{from{opacity:0;transform:translateY(50px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes spin{to{transform:rotate(360deg);}}
  .card-enter{animation:cardEnter 0.4s cubic-bezier(0.22,1.2,0.56,1) both;}
  .fly-right{animation:flyRight 0.4s cubic-bezier(0.4,0,1,1) forwards;}
  .fly-left{animation:flyLeft 0.4s cubic-bezier(0.4,0,1,1) forwards;}
  .fly-up{animation:flyUp 0.38s cubic-bezier(0.4,0,1,1) forwards;}
  .shake-anim{animation:shake 0.5s ease;}
  .slide-right{animation:slideRight 0.28s cubic-bezier(0.16,1,0.3,1) both;}
  .slide-up{animation:slideUp 0.32s cubic-bezier(0.16,1,0.3,1) both;}
  .fade-in{animation:fadeIn 0.2s ease both;}
  .ai-spin{width:13px;height:13px;border:2px solid rgba(255,255,255,0.15);border-top-color:#818cf8;border-radius:50%;animation:spin 0.75s linear infinite;display:inline-block;vertical-align:middle;}
  .tg-text{white-space:pre-wrap;word-break:break-word;font-size:12.5px;line-height:1.65;font-family:'Inter','Plus Jakarta Sans',sans-serif;}
  input[type=range]{accent-color:#7B5CE8;}
  .score-glow-green{box-shadow:0 0 0 1px rgba(16,185,129,0.3),0 8px 40px rgba(16,185,129,0.15);}
  .score-glow-amber{box-shadow:0 0 0 1px rgba(245,158,11,0.3),0 8px 40px rgba(245,158,11,0.12);}
  .score-glow-red{box-shadow:0 0 0 1px rgba(239,68,68,0.3),0 8px 40px rgba(239,68,68,0.1);}
`;

// ─── Input ────────────────────────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm text-foreground border border-border bg-secondary focus:outline-none focus:ring-1 focus:ring-violet-500/40 placeholder:text-muted-foreground/50 transition-shadow";
const monoInputCls = inputCls + " font-mono";

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar(){
  const stats = useDealStore(s => s.stats);
  const wsStatus = useDealStore(s => s.wsStatus);
  const mb = stats?.mongodb || {};
  const items = [
    {label:"Pending", value:String(mb.pending ?? stats?.pending ?? '…'), color:"#7C7E9E", dot:"rgba(124,126,158,0.4)"},
    {label:"Posted",  value:String(mb.posted ?? stats?.posted ?? '…'),  color:"#34d399", dot:"rgba(52,211,153,0.3)"},
    {label:"Rejected",value:String(mb.rejected ?? 0),     color:"#fbbf24", dot:"rgba(251,191,36,0.3)"},
    {label:"Total",   value:String(mb.total ?? 0),         color:"#a78bfa", dot:"rgba(167,139,250,0.3)"},
    {label:"Dupes",   value:String(mb.dupes ?? 0),         color:"#f87171", dot:"rgba(248,113,113,0.3)"},
  ];
  return(
    <div className="flex-shrink-0 flex items-center border-b border-border overflow-x-auto" style={{background:"rgba(4,4,16,0.7)"}}>
      {items.map(({label,value,color,dot},i)=>(
        <div key={label} className={`flex items-center gap-2.5 px-4 py-2.5 flex-shrink-0 ${i<items.length-1?"border-r border-border":""}`}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:dot,boxShadow:`0 0 4px ${color}60`}}/>
          <span className="text-[12px] font-bold tracking-tight" style={{color,fontFamily:"'JetBrains Mono',monospace",fontVariantNumeric:"tabular-nums"}}>{value}</span>
          <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
        </div>
      ))}
      <div className="ml-auto px-5 py-2.5 flex-shrink-0 flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${wsStatus==="connected"?"bg-emerald-500/60 animate-pulse":"bg-red-500/60"}`}/>
        <span className="text-[10px] text-muted-foreground">{wsStatus==="connected"?"Live":"Offline"}</span>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (pin:string) => void }) {
  const [pin,setPin]=useState("");const [shake,setShake]=useState(false);const [ok,setOk]=useState(false);
  const add=(d:string)=>{
    if(pin.length>=4||ok)return;const next=pin+d;setPin(next);
    if(next.length===4){setOk(true);setTimeout(()=>onLogin(next),500);}
  };
  return(
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[340px] card-enter">
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#5B3FBB,#7B5CE8)",boxShadow:"0 0 40px rgba(123,92,232,0.3)"}}>
            <Activity size={24} className="text-white"/>
          </div>
          <div className="text-center">
            <div className="text-[22px] font-bold text-foreground tracking-tight">DealFlow</div>
            <div className="text-xs text-muted-foreground mt-0.5 tracking-wide">Deal review console</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8" style={{boxShadow:"0 40px 100px rgba(0,0,0,0.7)"}}>
          <div className={`flex justify-center gap-5 mb-8 ${shake?"shake-anim":""}`}>
            {[0,1,2,3].map(i=><div key={i} className="w-3 h-3 rounded-full transition-all duration-200" style={{background:i<pin.length?(ok?"#10b981":"#7B5CE8"):"rgba(255,255,255,0.08)",boxShadow:i<pin.length&&!shake?`0 0 12px ${ok?"rgba(16,185,129,0.8)":"rgba(123,92,232,0.75)"}`:"none",transform:i<pin.length?"scale(1.35)":"scale(1)"}}/>)}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d,i)=>(
              <button key={i} disabled={!d} onClick={()=>d==="⌫"?setPin(p=>p.slice(0,-1)):d?add(d):undefined}
                className={`h-13 rounded-xl text-[15px] font-semibold transition-all duration-100 ${!d?"invisible":d==="⌫"?"bg-muted text-muted-foreground hover:bg-muted/60 text-sm active:scale-95":"bg-secondary text-foreground hover:bg-violet-500/15 hover:text-violet-300 active:scale-95 border border-border/50"}`}
                style={{height:52,fontFamily:"'JetBrains Mono',monospace"}}>{d}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({score,size=48}:{score:number;size?:number}){
  const r=(size-7)/2,circ=2*Math.PI*r,color=scoreColor(score);
  return(
    <div className="relative flex-shrink-0" style={{width:size,height:size}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4.5}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4.5}
          strokeDasharray={`${(score/100)*circ} ${circ}`} strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 5px ${color}90)`}}/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{fontSize:size<40?9:size<52?11:12,color,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{score===0?"?":score}</span>
      </div>
    </div>
  );
}

// ─── Telegram Bubble ──────────────────────────────────────────────────────────
function TgBubble({deal,showAff=false,localImg}:{deal:Deal;showAff?:boolean;localImg?:string|null}){
  const text=showAff?deal.aff_text:deal.original_text;
  const img=localImg||deal.img_url||null;
  return(
    <div className="rounded-xl overflow-hidden border border-white/5" style={{background:"#0A0D14"}}>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/5">
        <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">{(deal.channelName || 'U')[0]}</div>
        <span className="text-xs font-semibold flex-1" style={{color:"#6FA3D8"}}>{deal.channelName || 'Unknown'}</span>
        <span className="text-[10px]" style={{color:"#4B5568"}}>{fmtTime(deal.ts)}</span>
      </div>
      <div className="p-3.5">
        {img&&<img src={img} alt="" className="w-full rounded-lg mb-3 object-cover" style={{maxHeight:150}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>}
        <p className="tg-text" style={{color:"#D4D8E8"}}>{text}</p>
      </div>
    </div>
  );
}

// ─── Telegram Preview ─────────────────────────────────────────────────────────
function TgPreview({text,imgUrl,imgFile}:{text:string;imgUrl:string;imgFile:string|null}){
  const img=imgFile||imgUrl||null;
  const limit=img?1024:4096;const count=text.length;const pct=count/limit;const over=pct>1;
  return(
    <div className="flex flex-col gap-2.5">
      <div className="rounded-xl overflow-hidden border border-white/5" style={{background:"#0A0D14"}}>
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/5">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white">D</div>
          <div><div className="text-xs font-bold" style={{color:"#D4D8E8"}}>Deals For India</div><div className="text-[10px]" style={{color:"#4B5568"}}>827.4K subscribers</div></div>
        </div>
        <div className="p-3.5">
          {img&&<img src={img} alt="" className="w-full rounded-lg mb-3 object-cover" style={{maxHeight:160}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>}
          <p className="tg-text" style={{color:"#D4D8E8",minHeight:48}}>{text||<span className="opacity-30">Empty post…</span>}</p>
          <div className="text-right text-[10px] mt-2" style={{color:"#4B5568"}}>{new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})} ✓✓</div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[10px] mb-1" style={{color:over?"#ef4444":"#4B5568"}}>
          <span className="font-mono">{count.toLocaleString()}</span>
          <span>{limit.toLocaleString()} max {img?"(caption)":"(text)"} {over&&"— OVER LIMIT"}</span>
        </div>
        <div className="h-0.5 rounded-full bg-white/5">
          <div className="h-full rounded-full transition-all" style={{width:`${Math.min(pct*100,100)}%`,background:over?"#ef4444":pct>0.9?"#f59e0b":"#7B5CE8"}}/>
        </div>
      </div>
    </div>
  );
}

// ─── AI Insights Pane ─────────────────────────────────────────────────────────
function AiPane({deal}:{deal:Deal}){
  const c=scoreColor(deal.ai_score),lbl=scoreLabel(deal.ai_score);
  const confidence=[
    {label:"Price data",val:deal.price>0?95:40},{label:"Discount",val:deal.discount_pct>0?98:20},
    {label:"Affiliate",val:deal.affiliate_applied?93:18},{label:"Image",val:deal.img_url?88:24},
  ];
  return(
    <div className="flex flex-col gap-5 px-4 py-4">
      <div className="flex gap-4 p-4 rounded-2xl border border-white/5" style={{background:"var(--card)"}}>
        <div className="relative flex-shrink-0" style={{width:80,height:80}}>
          <svg width={80} height={80} style={{transform:"rotate(-90deg)"}}>
            <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7}/>
            <circle cx={40} cy={40} r={32} fill="none" stroke={c} strokeWidth={7}
              strokeDasharray={`${(deal.ai_score/100)*201} 201`} strokeLinecap="round"
              style={{filter:`drop-shadow(0 0 8px ${c}70)`}}/>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{fontSize:20,fontWeight:800,color:c,fontFamily:"'JetBrains Mono',monospace"}}>{deal.ai_score===0?"?":deal.ai_score}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-foreground">AI Score</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{background:`${c}18`,color:c}}>{lbl}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{deal.verdict}</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Data Confidence</p>
        <div className="flex flex-col gap-2.5">
          {confidence.map(({label,val})=>(
            <div key={label}>
              <div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">{label}</span><span className="font-mono font-semibold text-foreground">{val}%</span></div>
              <div className="h-1 rounded-full bg-white/5"><div className="h-full rounded-full transition-all" style={{width:`${val}%`,background:val>80?"#10b981":val>50?"#f59e0b":"#ef4444"}}/></div>
            </div>
          ))}
        </div>
      </div>

      {deal.signals.length>0&&(
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">Positive Signals</p>
          <div className="flex flex-wrap gap-1.5">
            {deal.signals.map(s=>(
              <span key={s} className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium" style={{background:"rgba(16,185,129,0.1)",color:"#10b981",border:"1px solid rgba(16,185,129,0.15)"}}>
                <CheckCircle2 size={9}/>{s}
              </span>
            ))}
          </div>
        </div>
      )}

      {deal.risk_factors.length>0&&(
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">Risk Factors</p>
          <div className="flex flex-col gap-1.5">
            {deal.risk_factors.map(r=>(
              <div key={r} className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl font-medium" style={{background:"rgba(245,158,11,0.07)",color:"#f59e0b",border:"1px solid rgba(245,158,11,0.12)"}}>
                <AlertTriangle size={10}/>{r}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4 flex flex-col gap-0">
        {[["Category",deal.category],["Channel",deal.channelName],["Type",deal.dealType==="trick"?"Trick / Loot":"Product Deal"],["Affiliate",deal.affiliate_applied?"✅ EarnKaro":"⚠️ Not converted"]].map(([k,v])=>(
          <div key={k} className="flex justify-between text-xs py-2.5 border-b border-white/4 last:border-0">
            <span className="text-muted-foreground">{k}</span><span className="text-foreground font-medium">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Edit Drawer ──────────────────────────────────────────────────────────────
function EditDrawer({deal,onClose,onSaveApprove,onSaveDraft}:{deal:Deal;onClose:()=>void;onSaveApprove:(c:Partial<Deal>)=>void;onSaveDraft:(c:Partial<Deal>)=>void;}){
  const [title,setTitle]=useState(deal.title);const [text,setText]=useState(deal.aff_text);
  const [price,setPrice]=useState(String(deal.price||""));const [origPrice,setOrigPrice]=useState(String(deal.original_price||""));
  const [imgUrl,setImgUrl]=useState(deal.img_url);const [imgFile,setImgFile]=useState<string|null>(null);
  const [instruction,setInstruction]=useState("");const [rewriting,setRewriting]=useState(false);
  const [prev,setPrev]=useState<string|null>(null);const [uploading,setUploading]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);
  const isDirty=title!==deal.title||text!==deal.aff_text||price!==String(deal.price||"")||imgUrl!==deal.img_url;
  const doAiRewrite=async()=>{if(!instruction.trim())return;setRewriting(true);setPrev(text);const result=await useDealStore.getState().aiRewrite(deal.fp_hash,instruction,text,deal.dealType);if(result)setText(result);setInstruction("");setRewriting(false);};
  const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;setUploading(true);const reader=new FileReader();reader.onload=ev=>{setImgFile(ev.target?.result as string);setUploading(false);};reader.readAsDataURL(f);};
  const changes:Partial<Deal>={title,aff_text:text,img_url:imgUrl,price:Number(price)||deal.price,original_price:Number(origPrice)||deal.original_price};

  return(
    <div className="fixed inset-0 z-50 flex" style={{background:"rgba(0,0,0,0.8)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="slide-right ml-auto w-full max-w-5xl flex flex-col border-l border-border" style={{background:"var(--background)"}}>
        <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center"><PenLine size={15} className="text-violet-400"/></div>
          <div className="flex-1"><p className="text-sm font-bold text-foreground">Edit Deal</p><p className="text-[11px] text-muted-foreground">{deal.channelName} · {fmtAgo(deal.ts)}</p></div>
          {isDirty&&<span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{background:"rgba(245,158,11,0.12)",color:"#f59e0b",border:"1px solid rgba(245,158,11,0.2)"}}>Unsaved changes</span>}
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center bg-secondary text-muted-foreground hover:text-foreground transition-colors"><X size={15}/></button>
        </div>
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Title</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} className={inputCls}/>
            </div>
            {deal.dealType==="product"&&(
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Sale Price (₹)</label><input type="number" value={price} onChange={e=>setPrice(e.target.value)} className={monoInputCls}/></div>
                <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Original Price (₹)</label><input type="number" value={origPrice} onChange={e=>setOrigPrice(e.target.value)} className={monoInputCls}/></div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Image</label>
              {(imgFile||imgUrl)?<div className="relative rounded-xl overflow-hidden mb-2.5 border border-border" style={{maxHeight:110}}>
                <img src={imgFile||imgUrl} alt="" className="w-full object-cover" style={{maxHeight:110}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                <button onClick={()=>{setImgFile(null);setImgUrl("");}} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{background:"rgba(0,0,0,0.75)"}}><X size={11} className="text-white"/></button>
              </div>:<div className="h-14 rounded-xl flex items-center justify-center border border-dashed border-border mb-2.5 text-muted-foreground text-xs gap-1.5"><ImageOff size={13}/>No image attached</div>}
              <div className="flex gap-2">
                <input value={imgUrl} onChange={e=>setImgUrl(e.target.value)} placeholder="https://image-url.com/photo.jpg" className={inputCls+" flex-1 text-xs"}/>
                <button onClick={()=>fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-white/15 transition-colors"><Upload size={12}/>{uploading?"…":"Upload"}</button>
                <button onClick={async()=>{const data=await useDealStore.getState().scrapeImage(deal.fp_hash);if(data?.img_url)setImgUrl(data.img_url);}} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-white/15 transition-colors"><Search size={12}/>Scrape</button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
              </div>
            </div>
            <div>
              <div className="flex items-end justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Post Text</label>
                <span className="text-[10px] font-mono text-muted-foreground">{text.length} chars</span>
              </div>
              <div className="flex gap-2 mb-2.5">
                <input value={instruction} onChange={e=>setInstruction(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doAiRewrite()}
                  placeholder='"make shorter", "add emojis", "clean hashtags"…' className={inputCls+" flex-1 text-xs"}/>
                <button onClick={doAiRewrite} disabled={rewriting||!instruction.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 transition-all" style={{background:"rgba(123,92,232,0.12)",color:"#9B82F5",border:"1px solid rgba(123,92,232,0.25)"}}>
                  {rewriting?<><span className="ai-spin"/> Rewriting…</>:<><Sparkles size={12}/>AI Rewrite</>}</button>
                {prev&&<button onClick={()=>{setText(prev);setPrev(null);}} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border text-rose-400 hover:bg-rose-500/8 transition-colors"><Undo2 size={12}/>Undo</button>}
              </div>
              <textarea value={text} onChange={e=>setText(e.target.value)} rows={10}
                className="w-full px-3.5 py-3 rounded-xl text-xs text-foreground border border-border bg-secondary focus:outline-none focus:ring-1 focus:ring-violet-500/40 resize-none"
                style={{fontFamily:"'JetBrains Mono',monospace",lineHeight:1.65}}/>
            </div>
          </div>
          <div className="w-[300px] flex-shrink-0 overflow-y-auto p-5 flex flex-col gap-4 border-l border-border" style={{background:"var(--sidebar)"}}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">📱 Live Preview</p>
            <TgPreview text={text} imgUrl={imgUrl} imgFile={imgFile}/>
            <div className="rounded-xl p-3.5 border" style={{background:deal.affiliate_applied?"rgba(16,185,129,0.06)":"rgba(245,158,11,0.06)",borderColor:deal.affiliate_applied?"rgba(16,185,129,0.18)":"rgba(245,158,11,0.18)"}}>
              <p className="text-xs font-semibold" style={{color:deal.affiliate_applied?"#10b981":"#f59e0b"}}>{deal.affiliate_applied?"✅ Affiliated via EarnKaro":"⚠️ Not Affiliated"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{deal.affiliate_applied?"Links converted":"EarnKaro conversion failed"}</p>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-white/10 transition-colors">Cancel</button>
          <button onClick={()=>onSaveDraft(changes)} disabled={!isDirty} className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-secondary disabled:opacity-40 transition-colors">Save Draft</button>
          <button onClick={()=>onSaveApprove(changes)} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white active:scale-95 transition-all" style={{background:"#10b981",boxShadow:"0 4px 24px rgba(16,185,129,0.3)"}}><Check size={14} strokeWidth={2.5}/>Save & Approve</button>
        </div>
      </div>
    </div>
  );
}

// ─── Compose Drawer ───────────────────────────────────────────────────────────
function ComposeDrawer({onClose}:{onClose:()=>void}){
  const [title,setTitle]=useState("");const [text,setText]=useState("");
  const [type,setType]=useState<DealType>("product");const [price,setPrice]=useState("");const [origPrice,setOrigPrice]=useState("");
  const [imgUrl,setImgUrl]=useState("");const [imgFile,setImgFile]=useState<string|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);
  const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=ev=>setImgFile(ev.target?.result as string);reader.readAsDataURL(f);};
  return(
    <div className="fixed inset-0 z-50 flex" style={{background:"rgba(0,0,0,0.8)"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="slide-right ml-auto w-full max-w-4xl flex flex-col border-l border-border" style={{background:"var(--background)"}}>
        <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"rgba(123,92,232,0.12)"}}><Plus size={15} className="text-violet-400"/></div>
          <p className="text-sm font-bold text-foreground flex-1">Compose Deal</p>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center bg-secondary text-muted-foreground hover:text-foreground"><X size={15}/></button>
        </div>
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            <div className="flex gap-2 p-1 rounded-xl bg-secondary border border-border">
              {(["product","trick"] as DealType[]).map(t=><button key={t} onClick={()=>setType(t)} className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${type===t?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>{t==="trick"?"Trick / Loot":"Product Deal"}</button>)}
            </div>
            <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Deal headline…" className={inputCls}/></div>
            {type==="product"&&<div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Sale Price (₹)</label><input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0" className={monoInputCls}/></div>
              <div><label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Original Price (₹)</label><input type="number" value={origPrice} onChange={e=>setOrigPrice(e.target.value)} placeholder="0" className={monoInputCls}/></div>
            </div>}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Image</label>
              {(imgFile||imgUrl)?<div className="relative rounded-xl overflow-hidden mb-2.5 border border-border" style={{maxHeight:90}}><img src={imgFile||imgUrl} alt="" className="w-full object-cover" style={{maxHeight:90}}/><button onClick={()=>{setImgFile(null);setImgUrl("");}} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{background:"rgba(0,0,0,0.75)"}}><X size={11} className="text-white"/></button></div>:<div className="h-12 rounded-xl flex items-center justify-center border border-dashed border-border mb-2.5 text-muted-foreground text-xs gap-1.5"><ImageOff size={13}/>No image</div>}
              <div className="flex gap-2"><input value={imgUrl} onChange={e=>setImgUrl(e.target.value)} placeholder="https://…" className={inputCls+" flex-1 text-xs"}/><button onClick={()=>fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground"><Upload size={12}/>Upload</button><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/></div>
            </div>
            <div>
              <div className="flex items-end justify-between mb-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Post Text</label><span className="text-[10px] font-mono text-muted-foreground">{text.length} chars</span></div>
              <textarea value={text} onChange={e=>setText(e.target.value)} rows={10} placeholder="Write the Telegram post text here…" className="w-full px-3.5 py-3 rounded-xl text-xs text-foreground border border-border bg-secondary focus:outline-none focus:ring-1 focus:ring-violet-500/40 resize-none" style={{fontFamily:"'JetBrains Mono',monospace",lineHeight:1.65}}/>
            </div>
          </div>
          <div className="w-[280px] flex-shrink-0 overflow-y-auto p-5 flex flex-col gap-4 border-l border-border" style={{background:"var(--sidebar)"}}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">📱 Live Preview</p>
            <TgPreview text={text} imgUrl={imgUrl} imgFile={imgFile}/>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground border border-border transition-colors">Cancel</button>
          <button onClick={async()=>{await useDealStore.getState().composeDeal({title,text,deal_type:type,price:Number(price)||0,original_price:Number(origPrice)||0,img_url:imgUrl});onClose();}} disabled={!title.trim()&&!text.trim()} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white active:scale-95 transition-all disabled:opacity-40" style={{background:"#7B5CE8",boxShadow:"0 4px 20px rgba(123,92,232,0.28)"}}><Share2 size={14}/>Post to Channel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Deal Panel (right side) ──────────────────────────────────────────────────
function DealPanel({deal,onEdit}:{deal:Deal|null;onEdit:(d:Deal)=>void}){
  const [showAff,setShowAff]=useState(false);const [rightTab,setRightTab]=useState<"post"|"ai">("post");
  const fileRef=useRef<HTMLInputElement>(null);const [localImg,setLocalImg]=useState<string|null>(null);
  useEffect(()=>{setShowAff(false);setLocalImg(null);setRightTab("post");},[deal?.fp_hash]);
  if(!deal)return<div className="h-full flex items-center justify-center flex-col gap-3 opacity-30"><InboxIcon size={32} className="text-muted-foreground"/><p className="text-xs text-muted-foreground">Select a deal</p></div>;
  const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=ev=>setLocalImg(ev.target?.result as string);reader.readAsDataURL(f);};
  return(
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="flex gap-0.5 p-0.5 rounded-xl flex-1" style={{background:"var(--secondary)"}}>
          {([["post","Post"],["ai","AI Insights"]] as const).map(([v,l])=>(
            <button key={v} onClick={()=>setRightTab(v)} className={`flex-1 py-1.5 rounded-[10px] text-xs font-semibold transition-all ${rightTab===v?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>{l}</button>
          ))}
        </div>
        <button onClick={()=>onEdit(deal)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors" style={{background:"rgba(123,92,232,0.1)",color:"#9B82F5",border:"1px solid rgba(123,92,232,0.2)"}}>
          <PenLine size={12}/>Edit
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rightTab==="post"&&(
          <div className="px-4 py-4 flex flex-col gap-3.5">
            <div className="flex gap-0.5 p-0.5 rounded-xl" style={{background:"var(--secondary)"}}>
              {[["Raw",false],["Affiliated",true]].map(([l,v])=>(
                <button key={String(v)} onClick={()=>setShowAff(v as boolean)} className={`flex-1 py-1.5 rounded-[10px] text-xs font-semibold transition-all ${showAff===v?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>{l as string}</button>
              ))}
            </div>
            <TgBubble deal={deal} showAff={showAff} localImg={localImg}/>

            {/* Affiliate status */}
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl border" style={{background:deal.affiliate_applied?"rgba(16,185,129,0.05)":"rgba(245,158,11,0.05)",borderColor:deal.affiliate_applied?"rgba(16,185,129,0.15)":"rgba(245,158,11,0.15)"}}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:deal.affiliate_applied?"rgba(16,185,129,0.15)":"rgba(245,158,11,0.12)"}}>
                <CheckCircle2 size={13} style={{color:deal.affiliate_applied?"#10b981":"#f59e0b"}}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{color:deal.affiliate_applied?"#10b981":"#f59e0b"}}>{deal.affiliate_applied?"Affiliated via EarnKaro":"Not Affiliated"}</p>
                <p className="text-[10px] text-muted-foreground">{deal.affiliate_applied?"Links converted":"EarnKaro conversion failed"}</p>
              </div>
              {!deal.affiliate_applied&&<button className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"><RefreshCw size={9}/>Retry</button>}
            </div>

            {/* Image section */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-3.5 py-2 border-b border-border flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Image</span>
                {(localImg||deal.img_url)&&<span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold" style={{background:"rgba(16,185,129,0.1)",color:"#10b981"}}>Attached</span>}
              </div>
              <div className="p-3 flex flex-col gap-2">
                {(localImg||deal.img_url)?(
                  <div className="relative rounded-xl overflow-hidden border border-border">
                    <img src={localImg||deal.img_url} alt="" className="w-full object-cover" style={{maxHeight:120,background:"rgba(255,255,255,0.02)"}} onError={e=>{(e.target as HTMLImageElement).style.display="none";}}/>
                    <button onClick={()=>setLocalImg(null)} className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{background:"rgba(0,0,0,0.75)"}}><X size={10} className="text-white"/></button>
                  </div>
                ):(
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-dashed border-border" style={{background:"rgba(255,255,255,0.01)"}}>
                    <ImageOff size={14} className="text-muted-foreground flex-shrink-0 opacity-40"/>
                    <p className="text-xs text-muted-foreground opacity-60">No image — post will send text only</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={()=>fileRef.current?.click()} className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"><Upload size={11}/>{localImg||deal.img_url?"Replace":"Upload"}</button>
                  <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"><Search size={11}/>Scrape URL</button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
                </div>
              </div>
            </div>
          </div>
        )}
        {rightTab==="ai"&&<AiPane deal={deal}/>}
      </div>
    </div>
  );
}

// ─── Deal Card ────────────────────────────────────────────────────────────────
function DealCard({deal,tilt}:{deal:Deal;tilt?:"left"|"right"|"spam"|null}){
  const accent=catColor[deal.category]||"#7B5CE8";
  const sc=scoreColor(deal.ai_score);
  const isUnrated=deal.ai_score===0;
  return(
    <div className="w-full h-full rounded-3xl flex flex-col overflow-hidden select-none"
      style={{
        background:"var(--card)",
        border:`1px solid rgba(255,255,255,0.05)`,
        boxShadow:`0 0 0 1px rgba(0,0,0,0.4), 0 20px 60px rgba(0,0,0,0.5)${!isUnrated&&deal.ai_score>=80?`, 0 0 40px ${sc}10`:""}`,
        transform:tilt==="right"?"rotate(3.5deg) translateX(6px)":tilt==="left"?"rotate(-3.5deg) translateX(-6px)":tilt==="spam"?"rotate(-1deg) translateY(-4px)":"none",
        transition:"transform 0.2s cubic-bezier(0.34,1.56,0.64,1)"}}>

      {/* Category accent strip */}
      <div className="h-0.5 w-full flex-shrink-0" style={{background:`linear-gradient(90deg,${accent}80 0%,transparent 100%)`}}/>

      <div className="flex items-center px-5 py-3.5 flex-shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{background:`${accent}22`,color:accent,border:`1px solid ${accent}30`}}>{(deal.channelName || 'U')[0]}</div>
          <span className="text-[11px] font-medium text-muted-foreground truncate">{deal.channelName || 'Unknown'}</span>
          {deal.dealType==="trick"&&<span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold flex-shrink-0" style={{background:"rgba(251,191,36,0.1)",color:"#fbbf24"}}>TRICK</span>}
          {isUnrated&&<span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold flex-shrink-0" style={{background:"rgba(68,69,94,0.3)",color:"#7C7E9E"}}>UNRATED</span>}
        </div>
        <ScoreRing score={deal.ai_score} size={42}/>
      </div>

      <div className="flex items-center justify-center flex-shrink-0 relative overflow-hidden" style={{height:172,background:`radial-gradient(ellipse at 50% 70%, ${accent}18 0%, transparent 65%)`}}>
        <div role="img" aria-label={deal.category} style={{fontSize:84,lineHeight:1,fontFamily:"'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif",filter:`drop-shadow(0 8px 24px ${accent}44)`,userSelect:"none"}}>{deal.emoji}</div>
        <div className="absolute bottom-2.5 left-5 text-[10px] font-medium opacity-30 text-muted-foreground" style={{fontFamily:"'JetBrains Mono',monospace"}}>{fmtAgo(deal.ts)}</div>
        <div className="absolute bottom-2.5 right-5">
          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{background:`${accent}14`,color:accent,border:`1px solid ${accent}20`}}>{deal.category}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-5 py-4 flex-1 overflow-hidden">
        <h2 className="text-[13.5px] font-semibold text-foreground leading-snug" style={{display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{deal.title}</h2>
        {deal.price>0?(
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[24px] font-bold leading-none" style={{color:"#D8DAF0",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"-0.02em"}}>{fmt(deal.price)}</span>
            {deal.original_price>0&&<span className="text-xs text-muted-foreground line-through">{fmt(deal.original_price)}</span>}
            {deal.discount_pct>0&&<span className="text-xs font-bold" style={{color:"#34d399"}}>{Math.round(deal.discount_pct)}% off</span>}
          </div>
        ):<span className="text-lg font-bold" style={{color:"#fbbf24",fontFamily:"'JetBrains Mono',monospace"}}>Trick / Loot</span>}
        {(deal.signals?.length || 0) > 0 &&(
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {(deal.signals || []).slice(0,3).map(s=><span key={s} className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{background:"rgba(255,255,255,0.04)",color:"#7C7E9E",border:"1px solid rgba(255,255,255,0.05)"}}>{s}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Review View ──────────────────────────────────────────────────────────────
function ReviewView({deals,onApprove,onReject,onSpam,onEdit}:{deals:Deal[];onApprove:(h:string)=>void;onReject:(h:string)=>void;onSpam:(h:string)=>void;onEdit:(d:Deal)=>void;}){
  const pending=deals.filter(d=>d.status==="pending");
  const [exit,setExit]=useState<"left"|"right"|"up"|null>(null);
  const [hover,setHover]=useState<"approve"|"reject"|"spam"|null>(null);
  const top=pending[0]||null,next1=pending[1]||null,next2=pending[2]||null;

  const doApprove=useCallback(()=>{if(!top||exit)return;setExit("right");setTimeout(()=>{onApprove(top.fp_hash);setExit(null);},400);},[top,exit,onApprove]);
  const doReject=useCallback(()=>{if(!top||exit)return;setExit("left");setTimeout(()=>{onReject(top.fp_hash);setExit(null);},400);},[top,exit,onReject]);
  const doSpam=useCallback(()=>{if(!top||exit)return;setExit("up");setTimeout(()=>{onSpam(top.fp_hash);setExit(null);},400);},[top,exit,onSpam]);

  if(!top)return(
    <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-8">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.12)"}}>✅</div>
      <div><p className="text-sm font-semibold text-foreground" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Queue is empty</p><p className="text-xs text-muted-foreground mt-1.5">All deals reviewed. New ones appear as the bot scrapes.</p></div>
    </div>
  );

  return(
    <div className="flex-1 flex overflow-hidden">
      {/* ── Card stack + action buttons ── */}
      <div className="flex flex-col items-center justify-center gap-5 px-6 py-6 overflow-hidden flex-shrink-0 w-full md:w-[430px]">
        <div className="flex items-center gap-2 self-stretch justify-between">
          <span className="text-[11px] text-muted-foreground"><span style={{fontFamily:"'JetBrains Mono',monospace",color:"#D8DAF0",fontWeight:600}}>{pending.length}</span> pending</span>
          <div className="flex items-center gap-1">
            {pending.slice(0,Math.min(pending.length,10)).map((d,i)=>(
              <div key={d.fp_hash} className="rounded-full transition-all" style={{width:i===0?16:4,height:4,background:i===0?scoreColor(d.ai_score):"rgba(255,255,255,0.07)"}}/>
            ))}
            {pending.length>10&&<span className="text-[9px] text-muted-foreground ml-0.5" style={{fontFamily:"'JetBrains Mono',monospace"}}>+{pending.length-10}</span>}
          </div>
        </div>

        <div className="relative w-full" style={{height:450}}>
          {next2&&<div className="absolute inset-x-5 top-5 bottom-0" style={{transformOrigin:"top center",opacity:0.28,pointerEvents:"none",zIndex:1,transform:"scale(0.90)"}}><DealCard deal={next2}/></div>}
          {next1&&<div className="absolute inset-x-2.5 top-2.5 bottom-0" style={{transformOrigin:"top center",opacity:0.52,pointerEvents:"none",zIndex:2,transform:"scale(0.955)"}}><DealCard deal={next1}/></div>}
          <motion.div
            key={top.fp_hash}
            className={`absolute inset-0 z-10 ${exit==="right"?"fly-right":exit==="left"?"fly-left":exit==="up"?"fly-up":""}`}
            initial={{opacity:0,y:24,scale:0.94}}
            animate={{opacity:1,y:0,scale:1}}
            transition={{type:"spring",stiffness:280,damping:24}}>
            <DealCard deal={top} tilt={hover==="approve"?"right":hover==="reject"?"left":hover==="spam"?"spam":null}/>
          </motion.div>
          <AnimatePresence>
            {hover==="approve"&&<motion.div key="app-ov" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}} className="absolute inset-0 z-20 rounded-3xl pointer-events-none" style={{background:"rgba(16,185,129,0.04)",border:"2px solid rgba(16,185,129,0.35)"}}/>}
            {hover==="reject"&&<motion.div key="rej-ov" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}} className="absolute inset-0 z-20 rounded-3xl pointer-events-none" style={{background:"rgba(239,68,68,0.04)",border:"2px solid rgba(239,68,68,0.25)"}}/>}
            {hover==="spam"&&<motion.div key="spam-ov" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.15}} className="absolute inset-0 z-20 rounded-3xl pointer-events-none" style={{background:"rgba(245,158,11,0.04)",border:"2px solid rgba(245,158,11,0.25)"}}/>}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 w-full">
          <motion.button onMouseEnter={()=>setHover("reject")} onMouseLeave={()=>setHover(null)} onClick={doReject}
            whileHover={{scale:1.02}} whileTap={{scale:0.95}}
            transition={{type:"spring",stiffness:420,damping:26}}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
            style={{background:hover==="reject"?"rgba(224,84,84,0.14)":"rgba(224,84,84,0.08)",color:"#f87171",border:`1px solid ${hover==="reject"?"rgba(224,84,84,0.3)":"rgba(224,84,84,0.15)"}`,transition:"background 0.15s,border 0.15s"}}>
            <X size={15} strokeWidth={2.5}/> Reject
          </motion.button>
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <motion.button onMouseEnter={()=>setHover("spam")} onMouseLeave={()=>setHover(null)} onClick={doSpam}
              whileHover={{scale:1.06}} whileTap={{scale:0.92}}
              transition={{type:"spring",stiffness:420,damping:26}}
              className="w-11 h-10 rounded-xl flex items-center justify-center"
              style={{background:"rgba(251,191,36,0.08)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.15)"}}>
              <Shield size={14}/>
            </motion.button>
            <motion.button onClick={()=>onEdit(top)}
              whileHover={{scale:1.06}} whileTap={{scale:0.92}}
              transition={{type:"spring",stiffness:420,damping:26}}
              className="w-11 h-10 rounded-xl flex items-center justify-center border border-border text-muted-foreground hover:text-foreground" style={{transition:"color 0.15s"}}>
              <PenLine size={14}/>
            </motion.button>
          </div>
          <motion.button onMouseEnter={()=>setHover("approve")} onMouseLeave={()=>setHover(null)} onClick={doApprove}
            whileHover={{scale:1.02}} whileTap={{scale:0.95}}
            transition={{type:"spring",stiffness:420,damping:26}}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
            style={{background:hover==="approve"?"rgba(52,211,153,0.16)":"rgba(52,211,153,0.09)",color:"#34d399",border:`1px solid ${hover==="approve"?"rgba(52,211,153,0.32)":"rgba(52,211,153,0.18)"}`,boxShadow:hover==="approve"?"0 0 28px rgba(52,211,153,0.18)":"none",transition:"background 0.15s,border 0.15s,box-shadow 0.15s"}}>
            <Check size={15} strokeWidth={2.5}/> Approve
          </motion.button>
        </div>
        {top.verdict&&<p className="text-[11px] text-muted-foreground text-center leading-relaxed max-w-[280px] mx-auto hidden md:block" style={{opacity:0.5}}>{top.verdict}</p>}
      </div>

      {/* ── Detail panel (desktop only) ── */}
      <div className="hidden md:flex flex-1 flex-col border-l border-border overflow-hidden">
        <DealPanel deal={top} onEdit={onEdit}/>
      </div>
    </div>
  );
}

// ─── Queue View ───────────────────────────────────────────────────────────────
function QueueView({deals,onApprove,onReject,onSpam,onEdit}:{deals:Deal[];onApprove:(h:string)=>void;onReject:(h:string)=>void;onSpam:(h:string)=>void;onEdit:(d:Deal)=>void;}){
  const [filter,setFilter]=useState<"all"|"pending"|"posted">("all");
  const [search,setSearch]=useState("");const [sort,setSort]=useState<"latest"|"oldest"|"score">("latest");
  let visible=deals.filter(d=>filter==="all"?true:d.status===filter);
  if(search.trim())visible=visible.filter(d=>d.title.toLowerCase().includes(search.toLowerCase())||d.channelName.toLowerCase().includes(search.toLowerCase()));
  if(sort==="oldest")visible=[...visible].sort((a,b)=>a.ts-b.ts);else if(sort==="score")visible=[...visible].sort((a,b)=>b.ai_score-a.ai_score);else visible=[...visible].sort((a,b)=>b.ts-a.ts);
  return(
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-border flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 p-0.5 rounded-xl flex-1" style={{background:"var(--secondary)"}}>
            {(["all","pending","posted"] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={`flex-1 py-1.5 rounded-[10px] text-xs font-semibold capitalize transition-all ${filter===f?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>
                {f} <span className="font-mono opacity-60">{deals.filter(d=>f==="all"?true:d.status===f).length}</span>
              </button>
            ))}
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value as any)} className="text-xs px-2.5 py-2 rounded-xl border border-border text-muted-foreground focus:outline-none bg-secondary">
            <option value="latest">Latest</option><option value="oldest">Oldest</option><option value="score">Top score</option>
          </select>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search deals, channels…" className="w-full pl-9 pr-3 py-2 rounded-xl text-xs text-foreground border border-border bg-secondary focus:outline-none focus:ring-1 focus:ring-violet-500/40"/>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2">
        {visible.length===0&&<div className="py-16 text-center text-xs text-muted-foreground opacity-50">No deals match your filter</div>}
        {visible.map(deal=>{
          const accent=catColor[deal.category]||"#7B5CE8";
          return(
            <div key={deal.fp_hash} className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-border hover:border-white/10 hover:bg-card transition-all group" style={{background:"rgba(255,255,255,0.01)"}}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border border-white/5" style={{background:`${accent}0E`,fontFamily:"'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif"}}>{deal.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{deal.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {deal.price>0&&<span className="text-xs font-mono font-bold text-foreground">{fmt(deal.price)}</span>}
                  {deal.discount_pct>0&&<span className="text-xs font-semibold" style={{color:"#10b981"}}>{deal.discount_pct}% off</span>}
                  <span className="text-[11px] text-muted-foreground">{deal.channelName}</span>
                  <span className="text-[11px] text-muted-foreground opacity-60">{fmtAgo(deal.ts)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ScoreRing score={deal.ai_score} size={32}/>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>onEdit(deal)} className="w-7 h-7 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors"><PenLine size={11}/></button>
                  {deal.status==="pending"&&<>
                    <button onClick={()=>onApprove(deal.fp_hash)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"rgba(52,211,153,0.1)",color:"#34d399"}}><Check size={11} strokeWidth={2.5}/></button>
                    <button onClick={()=>onSpam(deal.fp_hash)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"rgba(251,191,36,0.1)",color:"#fbbf24"}}><Shield size={11}/></button>
                    <button onClick={()=>onReject(deal.fp_hash)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"rgba(224,84,84,0.1)",color:"#f87171"}}><X size={11} strokeWidth={2.5}/></button>
                  </>}
                  {deal.status==="posted"&&<span className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{background:"rgba(52,211,153,0.1)",color:"#34d399"}}>Posted</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DesiDime View ────────────────────────────────────────────────────────────
function DesiDimeView(){
  const deals = useDealStore(s => s.desidimeDeals).map(toUIDeal);
  const [selected,setSelected]=useState<any>(null);
  const [filter,setFilter]=useState<"pending"|"posted"|"rejected"|"all">("pending");
  let visible=deals.filter(d=>filter==="all"?true:d.status===filter);
  const approve=async (id:string)=>{
    // Add logic here to sync DesiDime deals back to pending/posted later if needed
  };
  const reject=async (id:string)=>{
  };
  
  useEffect(() => {
    useDealStore.getState().fetchDesidimeDeals();
  }, []);
  
  useEffect(() => {
    if (!selected && visible.length > 0) setSelected(visible[0]);
  }, [deals, filter]);

  if(deals.length===0) return(
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{background:"rgba(6,182,212,0.07)",border:"1px solid rgba(6,182,212,0.12)"}}>🛍️</div>
      <div>
        <p className="text-sm font-semibold text-foreground">DesiDime not connected</p>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-xs">The scraper hasn&apos;t synced yet. Deals will appear here automatically once the bot fetches from DesiDime.</p>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-3 py-2 rounded-xl border border-border" style={{background:"rgba(255,255,255,0.02)"}}>
        <span className="w-1.5 h-1.5 rounded-full" style={{background:"rgba(6,182,212,0.4)"}}/>Waiting for scraper…
      </div>
    </div>
  );

  return(
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-shrink-0 w-72 flex flex-col border-r border-border overflow-hidden">
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">DesiDime Scraper</p>
            <span className="flex items-center gap-1.5 text-[10px] font-semibold" style={{color:"#06b6d4"}}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"/>Syncing
            </span>
          </div>
          <div className="flex gap-0.5 p-0.5 rounded-xl" style={{background:"var(--secondary)"}}>
            {(["pending","posted","rejected"] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={`flex-1 py-1.5 rounded-[10px] text-[11px] font-semibold capitalize transition-all ${filter===f?"bg-card text-foreground shadow-sm":"text-muted-foreground hover:text-foreground"}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1.5">
          {visible.map(d=>(
            <button key={d.id} onClick={()=>setSelected(d)}
              className={`w-full text-left flex items-center gap-3 px-3.5 py-3.5 rounded-2xl transition-all border ${selected?.id===d.id?"border-cyan-500/25 bg-cyan-500/6":"border-transparent hover:border-white/6 hover:bg-secondary"}`}>
              <span className="text-2xl flex-shrink-0" style={{fontFamily:"'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif"}}>{d.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">{d.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] font-mono font-bold text-foreground">{fmt(d.price)}</span>
                  {d.original_price>0&&<span className="text-[10px] font-semibold" style={{color:"#10b981"}}>{Math.round((1-d.price/d.original_price)*100)}% off</span>}
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground ml-auto"><ThumbsUp size={9}/>{d.upvotes || 0}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected&&(
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 flex items-center gap-4 px-6 py-4 border-b border-border">
            <span className="text-3xl" style={{fontFamily:"'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif"}}>{selected.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground leading-tight">{selected.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.category} · {fmtAgo(selected.ts)}</p>
            </div>
            <ScoreRing score={selected.ai_score} size={48}/>
            <a href={selected.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors"><ExternalLink size={12}/>DesiDime</a>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-3">
              {[["Sale Price",fmt(selected.price),"#10b981"],["Original",selected.original_price>0?fmt(selected.original_price):"—","#5C6070"],[`${selected.upvotes} upvotes`,`${selected.comments} comments`,"#06b6d4"]].map(([k,v,c],i)=>(
                <div key={i} className="flex flex-col p-4 rounded-2xl border border-border" style={{background:"var(--card)"}}>
                  <span className="text-lg font-bold" style={{color:c as string,fontFamily:"'JetBrains Mono',monospace"}}>{v}</span>
                  <span className="text-[11px] text-muted-foreground mt-1">{k}</span>
                </div>
              ))}
            </div>
            <div><p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Description</p><p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p></div>
            <div className="p-4 rounded-2xl border border-border" style={{background:"var(--card)"}}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">AI Recommendation</p>
              <p className="text-sm text-foreground leading-relaxed">{selected.ai_score>=90?"Strong deal — high community upvotes and verified discount. Recommend posting.":selected.ai_score>=75?"Good deal — decent discount, worth posting after a quick review.":"Average deal — consider skipping or editing for more impact."}</p>
            </div>
          </div>
          {selected.status==="pending"&&(
            <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-t border-border">
              <button onClick={()=>reject(selected.id)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.97]" style={{background:"rgba(239,68,68,0.1)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.2)"}}><X size={15} strokeWidth={2.5}/>Reject</button>
              <button onClick={()=>approve(selected.id)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.97]" style={{background:"rgba(16,185,129,0.12)",color:"#10b981",border:"1px solid rgba(16,185,129,0.25)"}}><Check size={15} strokeWidth={2.5}/>Post to Channel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Posted View ──────────────────────────────────────────────────────────────
function PostedView(){
  const entries = useDealStore(s => s.deals.filter(d => d.status === 'posted')).map(toUIDeal);
  return(
    <div className="flex-1 overflow-y-auto">
      <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Posted History</p>
          <p className="text-xs text-muted-foreground mt-0.5">{entries.length > 0 ? `${entries.length} deals · most recent first` : "No posts yet this session"}</p>
        </div>
        <span className="text-[10px] px-2.5 py-1.5 rounded-lg font-semibold" style={{background:"rgba(52,211,153,0.08)",color:"#34d399",border:"1px solid rgba(52,211,153,0.15)"}}>@dealsforindia</span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-2">
        {entries.length===0&&(
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.12)"}}>✅</div>
            <div>
              <p className="text-sm font-medium text-foreground">No posts yet</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-xs">Deals you approve will appear here as a history log. Approved deals from this session show up instantly.</p>
            </div>
          </div>
        )}
        {entries.map((entry,i)=>{
          const accent=catColor[entry.category]||"#7B5CE8";
          const isToday=fmtDate(entry.ts)===fmtDate(T);
          const prevIsToday=i>0&&fmtDate(entries[i-1].ts)===fmtDate(T);
          const showDateSep=i===0||(isToday&&!prevIsToday)||(!isToday&&(i===0||fmtDate(entries[i-1].ts)!==fmtDate(entry.ts)));
          return(
            <div key={entry.id}>
              {showDateSep&&(
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-border"/>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{isToday?"Today":fmtDate(entry.ts)}</span>
                  <div className="flex-1 h-px bg-border"/>
                </div>
              )}
              <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-border hover:border-white/10 hover:bg-card transition-all" style={{background:"rgba(255,255,255,0.01)"}}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border border-white/5" style={{background:`${accent}0E`,fontFamily:"'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif"}}>{entry.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{entry.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {entry.price>0&&<span className="text-xs font-mono font-bold text-foreground">{fmt(entry.price)}</span>}
                    {entry.discount_pct>0&&<span className="text-xs font-semibold" style={{color:"#10b981"}}>{entry.discount_pct}% off</span>}
                    <span className="text-[11px] px-1.5 py-0.5 rounded-md font-medium" style={{background:`${accent}10`,color:accent}}>{entry.category}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-[11px] font-mono text-muted-foreground">{fmtTime(entry.ts)}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={entry.affiliate_applied?{background:"rgba(16,185,129,0.1)",color:"#10b981"}:{background:"rgba(255,255,255,0.04)",color:"#5C6070"}}>{entry.affiliate_applied?"Affiliated":"No aff."}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── Channels View ────────────────────────────────────────────────────────────
function ChannelsView(){
  const baseChs = useDealStore(s => s.channelConfig);
  const allDeals = useDealStore(s => s.deals);
  const addChannel = () => {
    const ch = window.prompt("Enter channel ID or @username");
    if(ch) useDealStore.getState().addChannel(ch);
  };
  const colors=["#7B5CE8","#06b6d4","#10b981","#f59e0b","#ec4899","#f97316","#a78bfa","#6ee7b7","#fbbf24","#fb7185","#67e8f9","#86efac"];
  const chs = baseChs.map((ch, i) => ({
    ...ch,
    deals_24h: ch.deals_24h ?? allDeals.filter(d => d.channel === ch.channel || d.source_channel === ch.channel || d.channel === ch.id || d.source_channel === ch.id).length,
    color: ch.color || colors[i % colors.length],
    last: ch.last || "—"
  }));
  return(
    <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-bold text-foreground">Source Channels</p><p className="text-xs text-muted-foreground mt-0.5">{chs.filter(c=>c.active).length} active · {chs.filter(c=>!c.active).length} paused</p></div>
        <button onClick={addChannel} className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl text-white transition-all active:scale-95" style={{background:"#7B5CE8",boxShadow:"0 4px 16px rgba(123,92,232,0.28)"}}><Plus size={13}/>Add Channel</button>
      </div>
      {chs.map(ch=>(
        <div key={ch.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border transition-colors" style={{background:"var(--card)"}}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold flex-shrink-0" style={{background:`${ch.color || '#7B5CE8'}12`,color:ch.color || '#7B5CE8'}}>{(ch.name || 'U')[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{ch.name || ch.channel || ch.id}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{ch.id} · {ch.last}</p>
          </div>
          <div className="text-right flex-shrink-0 mr-2">
            <p className="text-sm font-mono font-bold text-foreground">{ch.deals_24h}</p>
            <p className="text-[10px] text-muted-foreground">today</p>
          </div>
          <button onClick={()=>useDealStore.getState().toggleChannel(ch.channel || ch.id)} className="flex-shrink-0">
            {ch.active?<ToggleRight size={28} style={{color:"#10b981"}}/>:<ToggleLeft size={28} className="text-muted-foreground/40"/>}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Settings View ────────────────────────────────────────────────────────────
function SettingsView(){
  const s = useDealStore(store => store.settings) || {};
  const setS = (update: any) => useDealStore.getState().setSettings(update);
  const [saved,setSaved]=useState(false);
  const save=async ()=>{
    await useDealStore.getState().saveSettings();
    setSaved(true);setTimeout(()=>setSaved(false),2500);
  };
  return(
    <div className="flex-1 overflow-y-auto px-5 py-5 max-w-2xl flex flex-col gap-5">
      <div><p className="text-sm font-bold text-foreground">Settings</p><p className="text-xs text-muted-foreground mt-0.5">Bot pipeline configuration</p></div>

      {[{title:"Output",fields:[
        {label:"Output Channel",hint:"Telegram channel username where approved deals are posted.",children:<input value={s.output_channel} onChange={e=>setS(v=>({...v,output_channel:e.target.value}))} className={monoInputCls}/>},
        {label:`Max Posts per Cycle — ${s.max_posts_per_cycle}`,hint:"Maximum number of deals to post per scrape cycle.",children:<input type="range" min={1} max={20} value={s.max_posts_per_cycle} onChange={e=>setS(v=>({...v,max_posts_per_cycle:Number(e.target.value)}))} className="w-full mt-1"/>},
      ]},{title:"AI Rewrite",fields:[
        {label:"Style Prompt",hint:"Instruction given to the AI when rewriting deal posts.",children:<textarea value={s.ai_style_prompt} onChange={e=>setS(v=>({...v,ai_style_prompt:e.target.value}))} rows={4} className="w-full px-3.5 py-3 rounded-xl text-sm text-foreground border border-border bg-secondary focus:outline-none focus:ring-1 focus:ring-violet-500/40 resize-none"/>},
      ]},{title:"Deduplication",fields:[
        {label:`FP Hash TTL — ${s.dedup_window_hours}h`,hint:"Deals with the same fingerprint within this window are treated as duplicates.",children:<input type="range" min={1} max={72} value={s.dedup_window_hours} onChange={e=>setS(v=>({...v,dedup_window_hours:Number(e.target.value)}))} className="w-full mt-1"/>},
      ]}].map(section=>(
        <div key={section.title} className="rounded-2xl border border-border overflow-hidden" style={{background:"var(--card)"}}>
          <div className="px-5 py-3 border-b border-border"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{section.title}</p></div>
          <div className="px-5 py-5 flex flex-col gap-5">
            {section.fields.map(({label,hint,children})=>(
              <div key={label}><label className="block text-sm font-semibold text-foreground mb-0.5">{label}</label><p className="text-xs text-muted-foreground mb-2">{hint}</p>{children}</div>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-border overflow-hidden" style={{background:"var(--card)"}}>
        <div className="px-5 py-3 border-b border-border"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">API Keys</p></div>
        <div className="px-5 py-4 flex flex-col gap-2">
          <p className="text-xs text-muted-foreground mb-1">Keys are server-side only and not exposed in the UI.</p>
          {["TELEGRAM_BOT_TOKEN","OPENAI_API_KEY","EARNKARO_API_KEY"].map(k=>(
            <div key={k} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border" style={{background:"var(--secondary)"}}>
              <Shield size={12} className="text-muted-foreground flex-shrink-0"/>
              <span className="text-xs font-mono text-muted-foreground flex-1">{k}</span>
              <CheckCircle2 size={13} style={{color:"#10b981"}}/>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.98]" style={{background:saved?"#10b981":"#7B5CE8",boxShadow:`0 4px 24px ${saved?"rgba(16,185,129,0.3)":"rgba(123,92,232,0.28)"}`}}>
        {saved?<><CheckCircle2 size={16}/>Saved</>:<><Check size={16} strokeWidth={2.5}/>Save Settings</>}
      </button>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS: {id:Tab;icon:React.ElementType;label:string}[] = [
  {id:"Review",icon:Zap,label:"Review"},
  {id:"DesiDime",icon:Rss,label:"DesiDime"},
  {id:"Posted",icon:CheckSquare,label:"Posted"},
  {id:"Channels",icon:Radio,label:"Channels"},
  {id:"Settings",icon:Settings2,label:"Settings"},
];

function Sidebar({tab,setTab,pending,onCompose}:{tab:Tab;setTab:(t:Tab)=>void;pending:number;onCompose:()=>void}){
  return(
    <aside className="hidden md:flex flex-shrink-0 flex-col border-r border-border" style={{width:216,background:"var(--sidebar)"}}>
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"linear-gradient(135deg,#5B3FBB,#7B5CE8)",boxShadow:"0 0 18px rgba(123,92,232,0.35)"}}>
          <Activity size={14} className="text-white"/>
        </div>
        <div><p className="text-[13px] font-bold text-foreground leading-tight tracking-tight" style={{fontFamily:"'Plus Jakarta Sans',sans-serif"}}>DealFlow</p><p className="text-[10px] text-muted-foreground">Review Console</p></div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({id,icon:Icon,label})=>{
          const active=tab===id;
          return(
            <motion.button key={id} onClick={()=>setTab(id)}
              whileHover={{x:2}} whileTap={{scale:0.97}}
              transition={{type:"spring",stiffness:400,damping:28}}
              className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${active?"text-violet-200":"text-muted-foreground hover:text-foreground"}`}
              style={{border:"1px solid transparent"}}>
              {active&&(
                <motion.div layoutId="sidebar-pill" className="absolute inset-0 rounded-xl"
                  style={{background:"rgba(123,92,232,0.12)",border:"1px solid rgba(123,92,232,0.2)"}}
                  transition={{type:"spring",stiffness:350,damping:30}}/>
              )}
              <span className="relative flex items-center gap-3 w-full">
                <Icon size={15}/>
                {label}
                {id==="Review"&&pending>0&&(
                  <motion.span initial={{scale:0.7}} animate={{scale:1}} className="ml-auto text-[10px] font-bold rounded-md"
                    style={{background:"rgba(123,92,232,0.2)",color:"#a78bfa",minWidth:20,textAlign:"center",padding:"2px 6px",fontFamily:"'JetBrains Mono',monospace"}}>{pending}</motion.span>
                )}
              </span>
            </motion.button>
          );
        })}
      </nav>

      <div className="px-3 pb-5 border-t border-border pt-4">
        <motion.button onClick={onCompose} whileHover={{scale:1.02}} whileTap={{scale:0.96}}
          transition={{type:"spring",stiffness:400,damping:25}}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white"
          style={{background:"linear-gradient(135deg,#5B3FBB,#7B5CE8)",boxShadow:"0 4px 20px rgba(123,92,232,0.28)"}}>
          <Plus size={13}/>Compose
        </motion.button>
      </div>
    </aside>
  );
}

// ─── Mobile Header ────────────────────────────────────────────────────────────
function MobileHeader({tab,onCompose,pending}:{tab:Tab;onCompose:()=>void;pending:number}){
  return(
    <header className="md:hidden flex items-center gap-3 px-4 border-b border-border flex-shrink-0" style={{minHeight:50,background:"var(--sidebar)"}}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{background:"linear-gradient(135deg,#7C3AED,#7B5CE8)"}}><Activity size={14} className="text-white"/></div>
      <span className="text-sm font-bold text-foreground flex-1">{tab}</span>
      {pending>0&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:"#7B5CE8",color:"#fff"}}>{pending}</span>}
      <button onClick={onCompose} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg" style={{background:"rgba(123,92,232,0.12)",color:"#9B82F5",border:"1px solid rgba(123,92,232,0.2)"}}><Plus size={12}/>Compose</button>
    </header>
  );
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
function MobileNav({tab,setTab,pending}:{tab:Tab;setTab:(t:Tab)=>void;pending:number}){
  return(
    <nav className="md:hidden flex-shrink-0 flex items-center border-t border-border" style={{background:"var(--sidebar)"}}>
      {NAV_ITEMS.map(({id,icon:Icon,label})=>(
        <button key={id} onClick={()=>setTab(id)} className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 relative transition-colors ${tab===id?"text-violet-400":"text-muted-foreground"}`}>
          <Icon size={17}/>
          <span className="text-[9px] font-semibold">{label}</span>
          {id==="Review"&&pending>0&&<span className="absolute top-2 right-1/2 -translate-x-3 text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style={{background:"#7B5CE8",color:"#fff"}}>{pending}</span>}
        </button>
      ))}
    </nav>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App(){
  const authToken = useDealStore(s => s.authToken);
  const [tab,setTab]=useState<Tab>("Review");
  
  const deals = useDealStore(s => s.deals);
  const activeFilter = useDealStore(s => s.activeFilter);
  const filteredDeals = (activeFilter ? deals.filter(d => d.channel === activeFilter || d.source_channel === activeFilter) : deals).map(toUIDeal);
  
  const [editing,setEditing]=useState<Deal|null>(null);
  const [composing,setComposing]=useState(false);

  const toasts = useDealStore(s => s.toasts);

  useEffect(() => {
    if (authToken) {
      useDealStore.getState().connectWS();
    }
  }, [authToken]);

  if(!authToken)return<><style>{STYLES}</style><Login onLogin={useDealStore.getState().setAuthToken}/></>;

  const approve = (h:string) => useDealStore.getState().approveDeal(h);
  const reject = (h:string) => useDealStore.getState().rejectDeal(h);
  const spam = (h:string) => useDealStore.getState().markSpam(h);
  const saveEdit = (c:Partial<Deal>) => { if(editing) useDealStore.getState().editDeal(editing.fp_hash, c); setEditing(null); };
  const saveApprove = async (c:Partial<Deal>) => { 
    if(editing) {
      await useDealStore.getState().editDeal(editing.fp_hash, c);
      await useDealStore.getState().approveDeal(editing.fp_hash);
    }
    setEditing(null); 
  };

  const pending = filteredDeals.filter(d=>d.status==="pending").length;

  return(
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <style>{STYLES}</style>
      <div className="flex-1 flex overflow-hidden">
        <Sidebar tab={tab} setTab={setTab} pending={pending} onCompose={()=>setComposing(true)}/>
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader tab={tab} onCompose={()=>setComposing(true)} pending={pending}/>
          <StatsBar/>
          <AnimatePresence mode="wait">
            <motion.div key={tab} className="flex-1 flex flex-col overflow-hidden"
              initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}}
              transition={{duration:0.18,ease:"easeOut"}}>
              {tab==="Review"   &&<ReviewView deals={filteredDeals} onApprove={approve} onReject={reject} onSpam={spam} onEdit={setEditing}/>}
              {tab==="DesiDime" &&<DesiDimeView/>}
              {tab==="Posted"   &&<PostedView/>}
              {tab==="Channels" &&<ChannelsView/>}
              {tab==="Settings" &&<SettingsView/>}
            </motion.div>
          </AnimatePresence>
          <MobileNav tab={tab} setTab={setTab} pending={pending}/>
        </div>
      </div>
      {editing&&<EditDrawer deal={editing} onClose={()=>setEditing(null)} onSaveDraft={saveEdit} onSaveApprove={saveApprove}/>}
      {composing&&<ComposeDrawer onClose={()=>setComposing(false)}/>}
      
      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{opacity:0, y:20, scale:0.95}} animate={{opacity:1, y:0, scale:1}} exit={{opacity:0, scale:0.95, transition:{duration:0.15}}}
              className="px-4 py-3 rounded-xl shadow-lg border border-border flex items-center gap-3 text-sm font-semibold pointer-events-auto"
              style={{background:"var(--card)", color:t.type==="error"?"#ef4444":"#10b981"}}>
              {t.type==="error"?<X size={16}/>:<CheckCircle2 size={16}/>}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
