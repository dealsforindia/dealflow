import React from 'react';
import { Sparkles, Flame, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

export const MarqueeTicker: React.FC = () => {
  const items = [
    { 
      icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />, 
      badge: 'LIVE TELEMETRY',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      text: '85+ Verified Deals Streaming Live across 27 Telegram Channels & Stores' 
    },
    // Hidden purposely: Hardcoded fake deal
    /*
    { 
      icon: <Flame className="w-3.5 h-3.5 text-orange-400" />, 
      badge: 'MEGA PRICE DROP',
      badgeColor: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      text: 'Kamiliant by American Tourister Luggage Set of 3 at ₹3,899 (87% Off)' 
    },
    */
    // Hidden purposely: Unverified "0% Fake MRPs" marketing text
    /*
    { 
      icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />, 
      badge: 'ANTI-SCAM AI',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      text: '0% Fake MRPs • Every Deal Verified against 90-day Real Store Price History' 
    },
    */
    { 
      icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />, 
      badge: 'PRICE VERIFIED',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      text: 'Direct Store Checkout Links with Real-Time Price Verification' 
    },
    { 
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />, 
      badge: 'INSTANT LOOKUP',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      text: 'Paste any Amazon, Flipkart or Myntra link into search for instant price sanity check' 
    },
  ];

  return (
    <div className="w-full bg-[#060911]/95 border-b border-white/[0.08] backdrop-blur-md overflow-hidden py-2 text-[11px] font-semibold text-slate-300 select-none relative z-40">
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {items.concat(items).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2.5 mx-8 shrink-0">
            {item.icon}
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
              {item.badge}
            </span>
            <span className="tracking-tight text-slate-200 font-medium">{item.text}</span>
            <span className="text-slate-600 ml-4 font-mono">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
