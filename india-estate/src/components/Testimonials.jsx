import React from 'react';
import Marquee from 'react-fast-marquee';
import { Quote } from 'lucide-react';
import Aurora from './animations/Aurora';
import BlurText from './animations/BlurText';
import SpotlightCard from './animations/SpotlightCard';

const reviews = [
    { name: "Aarav Patel", role: "CEO, TechFlow", text: "LuxeIndia found us a penthouse that wasn't even on the market. Their network is unmatched." },
    { name: "Sarah Jenkins", role: "Architect", text: "The attention to architectural detail in their curated listings is genuinely impressive." },
    { name: "Vikram Malhotra", role: "Investor", text: "Seamless transaction. Their legal team handled everything with absolute precision." },
    { name: "Priya Desai", role: "Fashion Designer", text: "They understood my aesthetic immediately. The villa in Goa is a dream come true." },
];

const Testimonials = () => {
    return (
        <section className="py-24 bg-bg border-y border-white/10 overflow-hidden relative">
            {/* Background Glow */}
            {/* Background Aurora */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <Aurora colorStops={['#D4AF37', '#ffffff', '#D4AF37']} speed={0.5} />
            </div>

            <div className="container mx-auto px-6 mb-12 text-center relative z-10">
                <span className="inline-block text-gold uppercase tracking-widest text-sm font-bold px-4 py-2 rounded-full border border-gold/30 bg-gold/5 mb-4">Client Stories</span>
                <div className="mt-4 flex justify-center">
                    <BlurText
                        text="Trusted by the Elite"
                        delay={150}
                        animateBy="words"
                        direction="top"
                        className="text-4xl md:text-5xl font-serif font-bold text-gradient"
                    />
                </div>
            </div>

            <Marquee gradient={true} gradientColor={[3, 3, 3]} speed={40} className="py-8">
                {reviews.map((r, i) => (
                    <SpotlightCard key={i} className="mx-6 p-0 rounded-3xl bg-transparent border-none">
                        <div className="p-8 glass-effect rounded-3xl w-[400px] relative hover:border-gold/50 transition-all duration-500 group premium-shadow hover:shadow-premium-lg h-full">
                            <Quote className="w-12 h-12 text-gold/30 absolute top-6 right-6 group-hover:text-gold/50 transition-colors duration-500 group-hover:rotate-12" />
                            <p className="text-gray-300 text-lg italic mb-6 leading-relaxed">"{r.text}"</p>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-gold/20 rounded-full flex items-center justify-center text-xl font-serif font-bold text-gradient border border-white/10">
                                    {r.name[0]}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">{r.name}</h4>
                                    <p className="text-accent text-sm font-medium">{r.role}</p>
                                </div>
                            </div>
                            {/* Decorative gradient line */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                    </SpotlightCard>
                ))}
            </Marquee>
        </section>
    );
};

export default Testimonials;
