import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer, textVariant, slideIn } from '../utils/animations';
import { Users, Target, Globe, Award, Briefcase, Heart, TrendingUp, Linkedin, Twitter, MessageCircle } from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';
import { CareersModal } from '../components/FeatureModals';
import SplitText from '../components/animations/SplitText';
import CountUp from '../components/animations/CountUp';

const About = () => {
    const [isCareersOpen, setIsCareersOpen] = useState(false);

    return (
        <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">

            {/* 3. Live Stats Counter (Floating) */}
            <motion.div
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                className="fixed top-32 right-0 bg-white/10 backdrop-blur-md p-4 rounded-l-xl border-y border-l border-white/10 z-40 hidden md:block"
            >
                <div className="text-center">
                    <div className="text-2xl font-bold text-accent">
                        <CountUp from={0} to={12000} separator="," duration={2} />+
                    </div>
                    <div className="text-xs text-gray-300">Happy Families</div>
                </div>
                <div className="w-full h-px bg-white/10 my-2" />
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                        ₹<CountUp from={0} to={500} duration={2.5} />Cr
                    </div>
                    <div className="text-xs text-gray-300">Assets Sold</div>
                </div>
            </motion.div>

            {/* Hero Section */}
            <div className="container mx-auto px-6 mb-20">
                <div className="text-center mb-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight"
                    >
                        Redefining Luxury
                    </motion.h1>
                </div>
                <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
                    Founded in 2010, India Estate has grown from a boutique agency in Mumbai to India's premier luxury real estate network.
                </p>

                {/* 1. Virtual Office Tour (Video Placeholder) */}
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group cursor-pointer">
                    <ImageWithFallback
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80"
                        alt="Office Tour"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                        </div>
                    </div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <p className="font-bold text-xl">Take a Virtual Tour</p>
                        <p className="text-sm text-gray-300">Headquarters, Mumbai</p>
                    </div>
                </div>
            </div>

            {/* 9. Founder's Message */}
            <div className="bg-white/5 py-20 border-y border-white/10">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent/20 blur-3xl -z-10" />
                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80" alt="Founder" className="rounded-2xl grayscale hover:grayscale-0 transition-all duration-500" />
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <Award className="w-12 h-12 text-accent mb-6" />
                        <h2 className="text-3xl font-serif font-bold text-white mb-6">"Everything we do is built on trust."</h2>
                        <p className="text-gray-300 mb-6 italic text-lg leading-relaxed">
                            "When I obtained my real estate license 15 years ago, I made a promise to prioritize the client's peace of mind above all else. Today, that philosophy continues to guide our 200+ agents across the country."
                        </p>
                        <div className="text-white font-bold">Rajiv Malhotra</div>
                        <div className="text-accent text-sm">Founder & CEO</div>

                        {/* 8. Social Wall (Mini) */}
                        <div className="flex gap-4 mt-8 pt-8 border-t border-white/10">
                            <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                            <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                            <MessageCircle className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-20 space-y-20">

                {/* 2. Team Timeline */}
                <section>
                    <h2 className="text-3xl font-serif font-bold text-center text-white mb-12">Our Journey</h2>
                    <div className="relative border-l-2 border-white/10 ml-6 md:ml-1/2 space-y-12">
                        {[
                            { year: '2010', title: 'The Beginning', desc: 'Started with a small office in Bandra.' },
                            { year: '2015', title: 'Going Digital', desc: 'Launched our first online portal.' },
                            { year: '2020', title: 'Pan-India Expansion', desc: 'Opened offices in Delhi, Bangalore & Goa.' },
                            { year: '2024', title: 'Best Luxury Agency', desc: 'Awarded by Real Estate Forum.' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: "-50px" }}
                                variants={fadeIn(i % 2 === 0 ? 'left' : 'right', 'spring', 0.2, 0.8)}
                                className="relative pl-8 md:pl-0"
                            >
                                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-accent rounded-full border-4 border-black" />
                                <div className={`md:flex items-center justify-between ${i % 2 === 0 ? 'md:flex-row-reverse' : ''} gap-12`}>
                                    <div className="md:w-1/2 mb-2 md:mb-0"></div>
                                    <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:text-right' : ''}`}>
                                        <span className="text-accent font-bold text-xl">{item.year}</span>
                                        <h3 className="text-white font-bold text-lg">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* 5. Global Locations Map */}
                <section className="bg-map-pattern bg-cover rounded-3xl p-12 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-black/80 group-hover:bg-black/70 transition-colors duration-700" />
                    <div className="relative z-10 text-center">
                        <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-4">Global Presence</h2>
                        <p className="text-gray-300 mb-8">Serving clients in 12 countries with partners in Dubai, London, and Singapore.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {['Mumbai', 'Dubai', 'London', 'New York', 'Singapore'].map(city => (
                                <span key={city} className="px-4 py-2 bg-white/10 rounded-full text-white text-sm border border-white/10 cursor-default hover:bg-accent hover:border-accent transition-colors">
                                    {city}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* 4. Awards Showcase */}
                    <div className="bg-gradient-to-br from-yellow-900/20 to-black p-8 rounded-2xl border border-yellow-500/20 text-center">
                        <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Excellence Award</h3>
                        <p className="text-sm text-gray-400">Best Luxury Brokerage 2024</p>
                    </div>

                    {/* 10. CSR Initiatives */}
                    <div className="bg-gradient-to-br from-green-900/20 to-black p-8 rounded-2xl border border-green-500/20 text-center">
                        <Heart className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Green Housing</h3>
                        <p className="text-sm text-gray-400">Planting 1000 trees every year</p>
                    </div>

                    {/* 6. Careers Section */}
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center flex flex-col justify-center">
                        <Briefcase className="w-12 h-12 text-white mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Join Our Team</h3>
                        <button
                            onClick={() => setIsCareersOpen(true)}
                            className="mt-2 text-accent font-bold hover:underline"
                        >
                            View Openings &rarr;
                        </button>
                    </div>
                </div>

                {/* 7. Press Coverage */}
                <section className="text-center pt-10 border-t border-white/10">
                    <p className="text-gray-500 uppercase tracking-widest text-sm mb-8">As Featured In</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale">
                        {['Forbes', 'Economic Times', 'Vogue Living', 'Architectural Digest'].map(brand => (
                            <span key={brand} className="text-2xl font-serif font-bold text-white">{brand}</span>
                        ))}
                    </div>
                </section>

            </div>

            <CareersModal isOpen={isCareersOpen} onClose={() => setIsCareersOpen(false)} />
        </div>
    );
};

export default About;
