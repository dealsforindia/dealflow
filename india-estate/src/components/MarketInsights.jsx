import React from 'react';
import { motion } from 'framer-motion';

import { ArrowRight, TrendingUp } from 'lucide-react';
import useUIStore from '../store/useUIStore';
import { useNavigate } from 'react-router-dom';

const insights = [
    { category: "Market Trend", title: "Why Mumbai's Sea-Facing Properties are Soaring", date: "Oct 12, 2024", image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
    { category: "Investment", title: "Goa: The New Hub for Digital Nomads & Investors", date: "Sep 28, 2024", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
    { category: "Architecture", title: "Sustainable Luxury: The Rise of Green Villas", date: "Sep 15, 2024", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" }
];

const TextDecode = ({ originalText, className }) => {

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const [text, setText] = React.useState(originalText);

    const onMouseOver = () => {
        let iteration = 0;
        const interval = setInterval(() => {
            setText(originalText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) {
                        return originalText[index];
                    }
                    return letters[Math.floor(Math.random() * 26)];
                })
                .join("")
            );

            if (iteration >= originalText.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 30);
    };

    return (
        <span onMouseEnter={onMouseOver} className={className}>
            {text}
        </span>
    );
};

const MarketInsights = () => {
    const { openArticle } = useUIStore();
    const navigate = useNavigate();

    return (
        <section className="py-24 container mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <span className="text-gold uppercase tracking-widest text-sm font-bold">The Journal</span>
                    <h2 className="text-4xl font-serif font-bold text-white mt-4">Market Insights</h2>
                </div>
                <button
                    onClick={() => navigate('/journal')}
                    className="hidden md:flex items-center gap-2 text-white hover:text-gold transition-colors"
                >
                    Read the Journal <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {insights.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() => openArticle(item)}
                    >
                        <div className="overflow-hidden rounded-2xl mb-6 relative aspect-[4/3]">
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white z-10 border border-white/10 uppercase tracking-wider">
                                {item.category}
                            </div>
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-gold text-sm mb-2 font-medium">
                            <TrendingUp className="w-4 h-4" /> {item.date}
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-gold transition-colors leading-snug">
                            <TextDecode originalText={item.title} />
                        </h3>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default MarketInsights;
