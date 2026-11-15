import React, { useState } from 'react';
import useUIStore from '../store/useUIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer, textVariant, zoomIn } from '../utils/animations';
import { TrendingUp, ShieldCheck, Globe, Check, ChevronDown, Award, Users, Camera, FileText, Zap, DollarSign, ArrowRight } from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';
import { ValuationModal, InspectionModal, AgentSearchModal } from '../components/FeatureModals';

const Sell = () => {
    const { openSellModal } = useUIStore();

    // Feature States
    const [isValuationOpen, setIsValuationOpen] = useState(false);
    const [isInspectionOpen, setIsInspectionOpen] = useState(false);
    const [isAgentSearchOpen, setIsAgentSearchOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);

    const faqs = [
        { q: "How long does it take to sell?", a: "On average, premium properties in our network sell within 45 days." },
        { q: "What are the fees?", a: "We charge a standard 2% success fee only after the deal is closed." },
        { q: "Do you handle legal paperwork?", a: "Yes, our legal team manages the entire documentation process." }
    ];

    return (
        <div className="min-h-screen pt-24 pb-20 relative">

            {/* 3. Recent Sold Ticker */}
            <div className="absolute top-20 left-0 right-0 h-8 bg-green-900/20 backdrop-blur-sm border-y border-green-500/10 flex items-center overflow-hidden whitespace-nowrap z-0">
                <div className="animate-marquee flex gap-12 text-xs text-gray-400">
                    <span className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> SOLD: 4BHK Penthouse in Worli (₹12 Cr)</span>
                    <span className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> CLOSED: Villa in Alibaug (₹6.5 Cr)</span>
                    <span className="flex items-center gap-2"><Check className="w-3 h-3 text-green-400" /> SOLD: Farmhouse in Chhatarpur (₹25 Cr)</span>
                </div>
            </div>

            {/* 10. Free Inspection Sticky Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsInspectionOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-white text-black font-bold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
                <Camera className="w-5 h-5" />
                Book Free Inspection
            </motion.button>

            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mt-8">
                <div className="absolute inset-0 z-0">
                    <ImageWithFallback
                        src="https://images.unsplash.com/photo-1513584685908-7636e32cdfee?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Luxury Living Room"
                        className="w-full h-full opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-bg/20 via-bg/80 to-bg z-10" />
                </div>

                <div className="container mx-auto px-6 relative z-20 text-center">
                    <motion.h1
                        variants={textVariant(0.2)}
                        initial="hidden"
                        animate="show"
                        className="text-5xl md:text-7xl font-serif font-bold mb-6 text-white"
                    >
                        Sell with <span className="text-accent">Confidence</span>
                    </motion.h1>

                    {/* 1. Instant Valuation Tool Trigger */}
                    <div className="max-w-xl mx-auto mb-10 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 flex items-center gap-2 focus-within:border-accent transition-colors">
                        <div className="pl-4 text-gray-400">
                            <Zap className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Enter your property address..."
                            className="bg-transparent border-none outline-none text-white flex-1 h-12"
                        />
                        <button
                            onClick={() => setIsValuationOpen(true)}
                            className="bg-accent hover:bg-emerald-600 text-white font-bold px-6 py-2 rounded-full"
                        >
                            Get Estimate
                        </button>
                    </div>

                    <div className="flex justify-center gap-4">
                        <button
                            onClick={openSellModal}
                            className="bg-white/10 hover:bg-white/20 text-white text-lg font-bold px-8 py-3 rounded-full border border-white/10 backdrop-blur-md transition-all"
                        >
                            List Property
                        </button>
                        {/* 4. Agent Finder Trigger */}
                        <button
                            onClick={() => setIsAgentSearchOpen(true)}
                            className="bg-transparent hover:bg-white/5 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition-all border border-transparent hover:border-white/10"
                        >
                            Find Agent <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-6 py-12 space-y-20">

                {/* 2. Seller Success Stories Carousel */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-serif font-bold text-white">Success Stories</h2>
                        <button className="text-accent text-sm font-bold">View All</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer">
                                <img src={`https://images.unsplash.com/photo-${i === 1 ? '1564013799919-ab600027ffc6' : i === 2 ? '1600585154340-be6161a56a0c' : '1600596542815-2495db98cfa4'}?w=800&q=80`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100" alt="Success Story" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <p className="font-bold">Sold in 3 Weeks!</p>
                                    <p className="text-xs text-gray-300">Mr. Sharma, Mumbai</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. Marketing Plan Preview (Timeline) */}
                <section className="bg-white/5 rounded-3xl p-8 border border-white/10">
                    <h2 className="text-3xl font-serif font-bold text-white text-center mb-12">Our Premium Marketing Plan</h2>
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 -translate-y-1/2 hidden md:block" />
                        <motion.div
                            variants={staggerContainer(0.2, 0.1)}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-8"
                        >
                            {[
                                { icon: Camera, title: "Pro Shoot", desc: "4K Video & 360° Tours" },
                                { icon: Globe, title: "Global Listing", desc: "Listed on 20+ Portals" },
                                { icon: Users, title: "Buyer Network", desc: "Access to 50k+ HNIs" },
                                { icon: Award, title: "Negotiation", desc: "Best Price Guarantee" }
                            ].map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={fadeIn('up', 'spring', idx * 0.2, 0.6)}
                                    className="bg-bg border border-white/10 rounded-2xl p-6 text-center hover:border-accent/50 transition-colors relative"
                                >
                                    <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold relative z-10">{idx + 1}</div>
                                    <step.icon className="w-8 h-8 text-white/50 mx-auto mb-4" />
                                    <h3 className="font-bold text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-gray-400">{step.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* 8. ROI Calculator */}
                <section className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 border border-white/10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-6 h-6 text-green-400" />
                            <h2 className="text-3xl font-serif font-bold text-white">Profit Estimator</h2>
                        </div>
                        <p className="text-gray-400">See how much you could make after all fees and taxes.</p>
                    </div>
                    <div className="flex-1 w-full bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Expected Sale Price</span>
                            <span className="text-white font-bold">₹ 2,50,00,000</span>
                        </div>
                        <input type="range" className="w-full accent-accent h-2 bg-gray-700 rounded-lg appearance-none" />
                        <div className="flex justify-between text-sm pt-4 border-t border-white/10">
                            <span className="text-gray-400">Net Profit (Approx)</span>
                            <span className="text-green-400 font-bold text-lg">₹ 2,35,00,000</span>
                        </div>
                    </div>
                </section>

                {/* 5. Staging Tips Gallery */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6">Staging Secrets</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { title: "Lighting", img: "https://images.unsplash.com/photo-1513584685908-7636e32cdfee?w=400" },
                            { title: "Declutter", img: "https://images.unsplash.com/photo-1556912173-3db996ea0622?w=400" },
                            { title: "Plants", img: "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=400" },
                            { title: "Mirrors", img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=400" }
                        ].map((tip, i) => (
                            <div key={i} className="relative h-40 rounded-xl overflow-hidden group">
                                <img src={tip.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={tip.title} />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="text-white font-bold">{tip.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 9. FAQ Accordion */}
                    <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">Common Questions</h3>
                        <div className="space-y-2">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="border border-white/5 rounded-lg overflow-hidden bg-white/5">
                                    <button
                                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                        className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-white hover:bg-white/5 transition-colors"
                                    >
                                        {faq.q}
                                        <ChevronDown className={`w-4 h-4 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {activeFaq === idx && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 pt-0 text-sm text-gray-400">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 7. Legal Checklist Download */}
                    <section className="bg-accent/10 rounded-2xl p-6 border border-accent/20 flex flex-col justify-center text-center">
                        <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4 text-accent">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Seller's Legal Checklist</h3>
                        <p className="text-sm text-gray-400 mb-6">Don't miss a single document. Download our comprehensive guide to sales deed and taxation.</p>
                        <button className="bg-white text-accent font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors">
                            Download PDF List
                        </button>
                    </section>
                </div>

            </div>

            {/* Modals */}
            <ValuationModal isOpen={isValuationOpen} onClose={() => setIsValuationOpen(false)} />
            <InspectionModal isOpen={isInspectionOpen} onClose={() => setIsInspectionOpen(false)} />
            <AgentSearchModal isOpen={isAgentSearchOpen} onClose={() => setIsAgentSearchOpen(false)} />
        </div>
    );
};
export default Sell;
