import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, MapPin, ArrowDown, Play } from 'lucide-react';
import MagneticButton from './MagneticButton';
import SplitText from './animations/SplitText';
import ShinyText from './animations/ShinyText';
import Aurora from './animations/Aurora';
import { fadeIn } from '../utils/animations';

const Hero = () => {
    // Parallax Effect
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);

    return (
        <section className="relative h-screen min-h-[800px] w-full overflow-hidden bg-[#030712]">
            {/* Cinematic Background Layer */}
            <div className="absolute inset-0 z-0">
                <Aurora
                    colorStops={["#00d2ff", "#3a7bd5", "#00d2ff"]} // Deep Ocean Blue
                    speed={0.3} // Slower, more elegant
                    amplitude={0.8}
                />
                <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark Overlay */}
            </div>

            {/* Main Content */}
            <motion.div
                style={{ y: y1 }}
                className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                        <span className="text-xs md:text-sm font-medium tracking-widest text-white uppercase">
                            Global Launch 2026
                        </span>
                    </div>
                </motion.div>

                <h1 className="text-6xl md:text-9xl font-serif font-bold text-white mb-6 tracking-tight">
                    <SplitText
                        text="LUXE INDIA"
                        className="block"
                        delay={50}
                    />
                    <SplitText
                        text="ESTATES"
                        className="block text-[#D4AF37] mt-2"
                        delay={70}
                    />
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, delay: 1.5 }}
                    className="max-w-2xl text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-12"
                >
                    Discover a curated collection of India's most exclusive penthouses, estates, and architectural marvels.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 2 }}
                    className="flex flex-col md:flex-row gap-6 relative z-30"
                >
                    <a href="#featured-properties">
                        <MagneticButton
                            className="px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-[#D4AF37] hover:text-white transition-all duration-500 transform hover:scale-105 shadow-2xl"
                            strength={0.2}
                        >
                            Explore Properties
                        </MagneticButton>
                    </a>

                    <button
                        onClick={() => window.open('https://www.youtube.com/watch?v=ysz5S6PUM-U', '_blank')}
                        className="px-10 py-5 bg-transparent border border-white/20 text-white font-medium rounded-full hover:bg-white/10 transition-all duration-500 backdrop-blur-sm flex items-center gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <Play className="w-4 h-4 fill-white" />
                        </div>
                        <ShinyText text="Watch Showreel" disabled={false} speed={3} className="custom-class" />
                    </button>
                </motion.div>
            </motion.div>

            {/* Floating Search Bar (Preserved & Polished) */}
            <div className="absolute bottom-24 left-0 right-0 z-30 px-6 pointer-events-none">
                <motion.div
                    variants={fadeIn('up', 'spring', 1, 1)}
                    initial="hidden"
                    animate="show"
                    className="max-w-4xl mx-auto glass-effect-strong p-2 rounded-full flex flex-col md:flex-row gap-2 premium-shadow pointer-events-auto"
                >
                    <div className="flex-1 flex items-center px-6 py-3 border-b md:border-b-0 md:border-r border-white/5">
                        <MapPin className="text-[#10b981] mr-3 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Location"
                            className="bg-transparent w-full outline-none text-white placeholder-gray-500 font-medium"
                        />
                    </div>
                    <div className="flex-1 flex items-center px-6 py-3">
                        <Search className="text-[#D4AF37] mr-3 w-5 h-5" />
                        <select className="bg-transparent w-full outline-none text-white appearance-none cursor-pointer font-medium">
                            <option className="bg-black text-gray-300">Property Type</option>
                            <option className="bg-black text-gray-300">Apartments</option>
                            <option className="bg-black text-gray-300">Villas</option>
                        </select>
                    </div>
                    <MagneticButton
                        className="bg-gradient-to-r from-[#10b981] to-emerald-600 hover:from-emerald-500 hover:to-[#10b981] text-white px-8 py-3 rounded-full font-bold shadow-lg"
                        strength={0.3}
                    >
                        Search
                    </MagneticButton>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent relative overflow-hidden">
                    <motion.div
                        className="absolute top-0 left-0 w-full h-1/2 bg-white"
                        animate={{ y: [0, 64, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
