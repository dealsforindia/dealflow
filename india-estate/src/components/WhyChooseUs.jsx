import React from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { Home, Users, Award, TrendingUp } from 'lucide-react';
import Squares from './animations/Squares';

const StatCard = ({ icon: Icon, value, label, prefix = "", suffix = "" }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.5,
    });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5 }}
            className="flex flex-col items-center p-8 glass-effect rounded-3xl border border-white/10 hover:border-accent/50 transition-all duration-500 group premium-shadow hover:shadow-premium-lg h-full relative overflow-hidden"
        >
            {/* Animated Icon with Glow */}
            <motion.div
                className="relative p-5 bg-gradient-to-br from-accent/20 to-gold/20 rounded-full mb-6 text-accent group-hover:text-gold transition-colors duration-500"
                animate={inView ? { rotate: [0, 5, -5, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl group-hover:bg-gold/30 transition-colors duration-500"></div>
                <Icon className="w-10 h-10 relative z-10" />
            </motion.div>

            {/* Animated Counter */}
            <div className="text-5xl font-bold font-serif mb-3 text-gradient">
                {prefix}
                {inView ? <CountUp end={value} duration={2.5} separator="," /> : 0}
                {suffix}
            </div>

            {/* Label */}
            <div className="text-gray-400 font-medium tracking-wide uppercase text-sm text-center">{label}</div>

            {/* Decorative Line */}
            <div className="w-16 h-1 bg-gradient-to-r from-accent to-gold rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </motion.div>
    );
};

const WhyChooseUs = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Squares Background */}
            {/* Squares Background */}
            <div className="absolute inset-0 z-0 opacity-10">
                <Squares
                    direction="diagonal"
                    speed={0.5}
                    borderColor="#D4AF37"
                    squareSize={50}
                    hoverFillColor="#222"
                />
            </div>

            {/* Parallax Background (Faded) */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-bg/90 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                    alt="Skyscrapers"
                    className="w-full h-full object-cover fixed top-0 left-0 h-screen w-screen"
                    style={{ position: 'absolute' }}
                />
            </div>

            <div className="container mx-auto px-6 relative z-20">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-serif font-bold mb-6 text-gradient"
                    >
                        Redefining Luxury Real Estate
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed"
                    >
                        We don't just sell properties; we curate lifestyles. With over a decade of excellence, we connect the world's most discerning clients with India's finest homes.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard icon={Home} value={500} suffix="+" label="Premium Properties" />
                    <StatCard icon={Users} value={2500} suffix="+" label="Happy Families" />
                    <StatCard icon={TrendingUp} value={100} prefix="₹" suffix=" Cr+" label="Worth of Property Sold" />
                    <StatCard icon={Award} value={15} suffix="+" label="Industry Awards" />
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
