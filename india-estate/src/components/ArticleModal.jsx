import React, { useEffect, useState } from 'react';
import useUIStore from '../store/useUIStore';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Share2, Tag } from 'lucide-react';

const mockContent = {
    "Why Mumbai's Sea-Facing Properties are Soaring": `
        <p class="mb-4">The allure of the Arabian Sea has always been a driving force in Mumbai's real estate market. However, recent trends indicate a significant surge in demand for sea-facing properties, driven by a combination of limited inventory and an increasing appetite for luxury living.</p>
        <p class="mb-4">"It's not just about the view anymore; it's about the lifestyle," says real estate analyst Rajesh Kumar. "Buyers are looking for homes that offer a serene escape from the bustling city life."</p>
        <h3 class="text-xl font-bold text-white mb-2">Key Drivers of Demand</h3>
        <ul class="list-disc list-inside mb-4 text-gray-300">
            <li>Limited supply in prime locations like Worli and Bandra.</li>
            <li>Rising aspirations of HNWIs (High Net-Worth Individuals).</li>
            <li>Infrastructure developments like the Coastal Road Project.</li>
        </ul>
        <p>With prices expected to appreciate by another 15% in the coming year, now might be the perfect time to invest in Mumbai's skyline.</p>
    `,
    "Goa: The New Hub for Digital Nomads & Investors": `
        <p class="mb-4">Once known strictly as a vacation spot, Goa is rapidly transforming into a permanent residence for digital nomads and investors alike. The shift to remote work has uncorked a massive demand for long-term rentals and luxury villas.</p>
        <p class="mb-4">Areas like Assagao and Siolim are witnessing a renaissance, with boutique cafes, co-working spaces, and high-speed internet infrastructure springing up to support this new demographic.</p>
        <h3 class="text-xl font-bold text-white mb-2">Why Invest Now?</h3>
        <p class="mb-4">Rental yields in North Goa have touched 6-8%, outperforming many metro cities. Furthermore, the upcoming Mopa Airport is set to boost connectivity, making it easier for international investors to access the region.</p>
    `,
    "Sustainable Luxury: The Rise of Green Villas": `
        <p class="mb-4">Sustainability is no longer a buzzword; it's a necessity. The luxury real estate market is pivoting towards eco-conscious living, with 'Green Villas' becoming the latest status symbol.</p>
        <p class="mb-4">These homes are equipped with solar panels, rainwater harvesting systems, and sustainable building materials that reduce the carbon footprint without compromising on comfort.</p>
        <h3 class="text-xl font-bold text-white mb-2">Features of a Green Villa</h3>
        <ul class="list-disc list-inside mb-4 text-gray-300">
            <li>Net-zero energy consumption.</li>
            <li>Biophilic design integrating nature indoors.</li>
            <li>Smart home energy management systems.</li>
        </ul>
    `
};

const ArticleModal = () => {
    const { selectedArticle, closeArticle } = useUIStore();
    const [content, setContent] = useState("");

    useEffect(() => {
        if (selectedArticle) {
            setContent(mockContent[selectedArticle.title] || "<p>Content loading...</p>");
        }
    }, [selectedArticle]);

    if (!selectedArticle) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                onClick={() => closeArticle()}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="bg-card border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => closeArticle()}
                        className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/80 transition-colors z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className="h-64 relative">
                        <img
                            src={selectedArticle.image}
                            alt={selectedArticle.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                            <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                                {selectedArticle.category}
                            </span>
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                                {selectedArticle.title}
                            </h2>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="flex items-center gap-6 text-gray-400 text-sm mb-8 border-b border-white/10 pb-6">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-accent" />
                                {selectedArticle.date}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-accent" />
                                5 min read
                            </div>
                            <button className="flex items-center gap-2 ml-auto hover:text-white transition-colors">
                                <Share2 size={16} /> Share
                            </button>
                        </div>

                        <div
                            className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />

                        <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Author" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-semibold">Written by</p>
                                    <p className="text-gray-400 text-xs">Vikram Malhotra</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-xs border border-white/10 px-3 py-1 rounded-full text-gray-400">#RealEstate</span>
                                <span className="text-xs border border-white/10 px-3 py-1 rounded-full text-gray-400">#Invest</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default ArticleModal;
