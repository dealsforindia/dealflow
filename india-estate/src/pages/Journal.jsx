import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useUIStore from '../store/useUIStore';
import Magnetic from '../components/animations/Magnetic';

const articles = [
    {
        category: "Market Trend",
        title: "Why Mumbai's Sea-Facing Properties are Soaring",
        date: "Oct 12, 2024",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "Rajesh Kumar",
        readTime: "5 min"
    },
    {
        category: "Investment",
        title: "Goa: The New Hub for Digital Nomads & Investors",
        date: "Sep 28, 2024",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "Sarah Jenkins",
        readTime: "4 min"
    },
    {
        category: "Architecture",
        title: "Sustainable Luxury: The Rise of Green Villas",
        date: "Sep 15, 2024",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "Arun Patel",
        readTime: "6 min"
    },
    {
        category: "Legal",
        title: "Understanding RERA for Luxury Real Estate",
        date: "Aug 10, 2024",
        image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "Priya Sharma",
        readTime: "7 min"
    },
    {
        category: "Lifestyle",
        title: "The Art of Curating a Home Wine Cellar",
        date: "Jul 22, 2024",
        image: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "Michael Chang",
        readTime: "3 min"
    },
    {
        category: "Technology",
        title: "Smart Homes: The Future of Living",
        date: "Jun 05, 2024",
        image: "https://images.unsplash.com/photo-1558211583-d26f610c1eb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        author: "David Ross",
        readTime: "5 min"
    }
];

const Journal = () => {
    const navigate = useNavigate();
    const { openArticle } = useUIStore();

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 bg-bg">
            <div className="container mx-auto">
                {/* Header */}
                <div className="mb-16">
                    <Magnetic>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
                        </button>
                    </Magnetic>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="text-accent uppercase tracking-widest text-sm font-bold block mb-2">The Collection</span>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">The Journal</h1>
                        <p className="text-gray-400 max-w-2xl text-lg font-light leading-relaxed">
                            Insights, trends, and stories from the world of luxury real estate and architectural excellence.
                        </p>
                    </motion.div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {articles.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group cursor-pointer flex flex-col h-full"
                            onClick={() => openArticle(item)}
                        >
                            <div className="overflow-hidden rounded-2xl mb-6 relative aspect-[4/3] border border-white/5 shadow-2xl">
                                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white z-10 border border-white/10 uppercase tracking-wider">
                                    {item.category}
                                </div>
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>

                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-gray-500 text-xs mb-3 font-medium uppercase tracking-wide">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                    <span>{item.readTime} Read</span>
                                </div>

                                <h3 className="text-2xl font-serif font-bold text-white group-hover:text-accent transition-colors leading-tight mb-4 flex-1">
                                    {item.title}
                                </h3>

                                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300 font-medium">{item.author}</p>
                                        <p className="text-xs text-gray-500">Editor</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Journal;
