import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicDeal } from '../types';
import { ArrowLeft, ArrowUpRight, Zap, Target, History, ThumbsUp, ShieldCheck, ShoppingBag } from 'lucide-react';
import { getCleanImageUrl } from '../utils/imageUrl';

interface DealDetailsPageProps {
  deal: PublicDeal;
  onBack: () => void;
}

export default function DealDetailsPage({ deal, onBack }: DealDetailsPageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const discount = deal.discount_pct || 0;
  const isLoot = discount > 65;
  const priceColor = isLoot ? 'var(--primary-emerald)' : 'var(--accent-orange)';
  
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(deal.price ?? 0);

  const formattedMrp = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(deal.mrp ?? 0);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden" style={{ paddingTop: '80px', paddingBottom: '100px' }}>
      
      {/* 2026 Ambient Background Elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.6)] z-20"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        className="absolute bottom-20 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
       {/* Breadcrumbs / Back Navigation */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8 flex items-center justify-between">
          <button onClick={onBack} className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-300 bg-white/5 dark:bg-[#0D1527]/5 hover:bg-white/10 dark:bg-[#0D1527]/10 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-wide">Back to deals</span>
          </button>
          
          <div className="flex gap-2">
             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
               <ShieldCheck size={14} /> Verified Deal
             </div>
             {isLoot && (
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase tracking-wider">
                   <Zap size={14} fill="currentColor" /> Super Loot
                 </motion.div>
             )}
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Media */}
          <div className="lg:col-span-5 relative group perspective-1000">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="relative aspect-square rounded-[2rem] overflow-hidden bg-black/40 border border-white/10 shadow-2xl backdrop-blur-sm transform-style-3d group-hover:border-cyan-500/30 transition-colors duration-500"
              onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
            >
              {deal.image && (
                <motion.img 
                  animate={isHovered ? { scale: 1.05, rotate: 1 } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  src={getCleanImageUrl(deal.image)}
                  alt={deal.title}
                  className="w-full h-full object-contain p-8 drop-shadow-2xl z-10 relative"
                  onLoad={() => setImageLoaded(true)}
                />
              )}
              
              <AnimatePresence>
                {isHovered && (
                  <motion.div 
                    initial={{ top: '-10%', opacity: 0 }} animate={{ top: '110%', opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                    className="absolute inset-x-0 h-4 bg-gradient-to-b from-transparent via-cyan-400/40 to-cyan-400/10 z-20 shadow-[0_0_15px_rgba(34,211,238,0.5)] border-b border-cyan-400/60"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
