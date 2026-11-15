import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Coffee, School, Building2, Trees } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const LocalityGuide = () => {
    const [activeTab, setActiveTab] = useState('Overview');

    const localities = [
        {
            name: "Worli, Mumbai",
            image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
            rating: 4.8,
            price: "₹45K - ₹85K / sq.ft",
            tags: ["Sea View", "Luxury", "Connected"],
            desc: "South Mumbai's most premium residential hub featuring skyline views and sea-link connectivity."
        },
        {
            name: "Whitefield, Bangalore",
            image: "https://images.unsplash.com/photo-1596176530529-181512960d73?w=800&q=80",
            rating: 4.6,
            price: "₹8K - ₹14K / sq.ft",
            tags: ["IT Hub", "Gated Communities", "Green"],
            desc: "The silicon valley of Bengaluru, perfect for tech professionals with world-class amenities."
        },
        {
            name: "Sector 42, Gurgaon",
            image: "https://images.unsplash.com/photo-1533614767277-c93d8b58a178?w=800&q=80",
            rating: 4.7,
            price: "₹18K - ₹25K / sq.ft",
            tags: ["Golf Course", "Premium", "Spacious"],
            desc: "Upscale living on Golf Course Road with ultra-luxury apartments and rapid metro access."
        }
    ];

    return (
        <section className="py-20 bg-black/20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold font-serif text-white mb-4"
                    >
                        Explore Top <span className="text-gradient">Localities</span>
                    </motion.h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Discover the most sought-after neighborhoods. Insights on price trends, connectivity, and lifestyle.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {localities.map((loc, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group relative rounded-2xl overflow-hidden glass-effect border border-white/10"
                        >
                            <div className="h-64 overflow-hidden relative">
                                <ImageWithFallback
                                    src={loc.image}
                                    alt={loc.name}
                                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <h3 className="text-2xl font-bold text-white mb-1">{loc.name}</h3>
                                    <div className="flex items-center gap-1 text-accent text-sm font-semibold">
                                        <MapPin className="w-4 h-4" />
                                        {loc.rating} / 5.0
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {loc.tags.map((tag, idx) => (
                                        <span key={idx} className="bg-white/5 border border-white/10 text-xs px-3 py-1 rounded-full text-gray-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                                    {loc.desc}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Price</p>
                                        <p className="text-white font-semibold">{loc.price}</p>
                                    </div>
                                    <button className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-colors">
                                        <Navigation className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white hover:bg-accent hover:border-transparent transition-all">
                        View All Neighborhoods
                    </button>
                </div>
            </div>
        </section>
    );
};

export default LocalityGuide;
