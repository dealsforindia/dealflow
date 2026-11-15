import React from 'react';
import { motion } from 'framer-motion';
import { Key, Lock } from 'lucide-react';
import LiquidButton from './animations/LiquidButton';
import { useInView } from 'react-intersection-observer';

const ExclusiveAccess = () => {
    const { ref, inView } = useInView({
        threshold: 0.3,
        triggerOnce: true
    });

    return (
        <section className="py-24 relative bg-black overflow-hidden flex items-center justify-center min-h-[60vh]">
            {/* Vantablack Effect - Light Absorption */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/20 via-black to-black z-0 pointer-events-none" />

            {/* Animated Grid that fades into darkness */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                }}
            />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                    animate={inView ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-8 premium-shadow">
                        <Key className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-5xl md:text-7xl font-playfair font-black text-white mb-6 tracking-tighter">
                        THE <span className="text-transparent bg-clip-text bg-gradient-to-br from-gray-100 to-gray-600">VAULT</span>
                    </h2>

                    <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                        Access our off-market "Pocket Listings". Properties so exclusive they never hit the public market.
                        <br />
                        <span className="text-accent text-sm uppercase tracking-widest mt-4 block">Invitation Only</span>
                    </p>

                    <LiquidButton onClick={() => window.location.href = '#contact'}>
                        <Lock className="w-4 h-4" />
                        REQUEST ACCESS
                    </LiquidButton>
                </motion.div>
            </div>
        </section>
    );
};

export default ExclusiveAccess;
