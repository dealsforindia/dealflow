import React from "react";

export function StoreLogo({ store, className = "w-6 h-6" }: { store?: string; className?: string }) {
  const s = (store || "").toLowerCase();

  // Amazon
  if (s.includes("amazon") || s.includes("amzn")) {
    return (
      <div className={`${className} rounded-md bg-[#232F3E] flex items-center justify-center p-1 text-white shadow-xs flex-shrink-0`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
          {/* Amazon 'a' with smile */}
          <path d="M12.5 15.8c-3.1 1.6-6.6 2-9.5.8-.4-.2-.8.2-.5.6 2.1 2.3 5.7 3.5 9.5 2.1 3.2-1.2 5.5-3.6 6.8-6.4.2-.4-.2-.7-.5-.5-1.4 1.1-3.6 2.5-5.8 3.4z" fill="#FF9900" />
          <path d="M18.8 12.2c-.3-.3-.9-.2-1.2.1-.4.4-.7.9-.9 1.4-.1.3.1.6.4.6.8 0 1.9-.3 2.5-1 .3-.3.1-.8-.8-1.1z" fill="#FF9900" />
          <text x="5" y="11" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif">a</text>
        </svg>
      </div>
    );
  }

  // BigBasket
  if (s.includes("bigbasket") || s.includes("bb")) {
    return (
      <div className={`${className} rounded-md bg-[#E23744] flex items-center justify-center p-0.5 text-white shadow-xs flex-shrink-0 font-bold`}>
        <span className="text-[11px] tracking-tighter leading-none font-black font-sans">bb</span>
      </div>
    );
  }

  // Myntra
  if (s.includes("myntra") || s.includes("myntr")) {
    return (
      <div className={`${className} rounded-md bg-white border border-gray-200 flex items-center justify-center p-1 shadow-xs flex-shrink-0`}>
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path d="M3 18L8.5 6l4 7.5L16.5 6 22 18h-4l-3-6.5-2.5 5h-1L9 11.5 6 18H3z" fill="url(#myntraGrad)" />
          <defs>
            <linearGradient id="myntraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F15A24" />
              <stop offset="50%" stopColor="#FF1493" />
              <stop offset="100%" stopColor="#ED1C24" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // Flipkart
  if (s.includes("flipkart") || s.includes("fkrt") || s.includes("fpkrt")) {
    return (
      <div className={`${className} rounded-md bg-[#FFE500] flex items-center justify-center p-0.5 text-[#2874F0] shadow-xs flex-shrink-0`}>
        <span className="text-xs font-black italic font-serif">f</span>
      </div>
    );
  }

  // Croma
  if (s.includes("croma")) {
    return (
      <div className={`${className} rounded-md bg-black flex items-center justify-center p-0.5 text-white shadow-xs flex-shrink-0`}>
        <span className="text-xs font-black font-sans">C</span>
      </div>
    );
  }

  // Nykaa
  if (s.includes("nykaa")) {
    return (
      <div className={`${className} rounded-md bg-[#FC2779] flex items-center justify-center p-0.5 text-white shadow-xs flex-shrink-0`}>
        <span className="text-[10px] font-black tracking-tight font-sans">N</span>
      </div>
    );
  }

  // AJIO
  if (s.includes("ajio") || s.includes("ajiio")) {
    return (
      <div className={`${className} rounded-md bg-[#2C4152] flex items-center justify-center p-0.5 text-white shadow-xs flex-shrink-0`}>
        <span className="text-[8px] font-black font-sans tracking-tighter">AJIO</span>
      </div>
    );
  }

  // Shopsy
  if (s.includes("shopsy")) {
    return (
      <div className={`${className} rounded-md bg-[#10B981] flex items-center justify-center p-0.5 text-white shadow-xs flex-shrink-0`}>
        <span className="text-xs font-black font-sans">S</span>
      </div>
    );
  }

  // Swiggy
  if (s.includes("swiggy") || s.includes("instamart")) {
    return (
      <div className={`${className} rounded-md bg-[#FC8019] flex items-center justify-center p-0.5 text-white shadow-xs flex-shrink-0`}>
        <span className="text-xs font-black font-sans">S</span>
      </div>
    );
  }

  // Blinkit
  if (s.includes("blinkit") || s.includes("grofers")) {
    return (
      <div className={`${className} rounded-md bg-[#F8CB46] flex items-center justify-center p-0.5 text-[#0C831F] shadow-xs flex-shrink-0`}>
        <span className="text-xs font-black font-sans">b</span>
      </div>
    );
  }

  // Zepto
  if (s.includes("zepto")) {
    return (
      <div className={`${className} rounded-md bg-[#800080] flex items-center justify-center p-0.5 text-white shadow-xs flex-shrink-0`}>
        <span className="text-xs font-black font-sans">Z</span>
      </div>
    );
  }

  // DesiDime
  if (s.includes("desidime") || s.includes("ddime")) {
    return (
      <div className={`${className} rounded-md bg-[#E53935] flex items-center justify-center p-0.5 text-white shadow-xs flex-shrink-0`}>
        <span className="text-[10px] font-black font-sans">DD</span>
      </div>
    );
  }

  // Default store initial badge
  const initial = (store || "S").trim().charAt(0).toUpperCase();
  return (
    <div className={`${className} rounded-md bg-indigo-50 border border-indigo-200/60 flex items-center justify-center p-0.5 text-indigo-700 shadow-xs flex-shrink-0 font-bold`}>
      <span className="text-[11px] font-bold font-sans">{initial}</span>
    </div>
  );
}
