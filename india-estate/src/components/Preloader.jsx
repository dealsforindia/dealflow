import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Enforce a minimum cinematic time, but ensure it always clears
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#030712] text-white overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }} // Custom bezier for premium feel
                >
                    <div className="relative text-center w-full max-w-4xl px-4">
                        {/* Premium Golden Line */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-8"
                        />

                        <div className="overflow-hidden py-4">
                            <motion.h1
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                className="text-5xl md:text-8xl font-serif font-bold tracking-tighter text-white"
                            >
                                LUXE<span className="text-[#D4AF37]">INDIA</span>
                            </motion.h1>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, letterSpacing: "0em" }}
                            animate={{ opacity: 1, letterSpacing: "0.5em" }}
                            transition={{ duration: 1.2, delay: 0.8 }}
                            className="text-white/60 text-xs md:text-sm uppercase font-light"
                        >
                            Redefining Real Estate
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;
