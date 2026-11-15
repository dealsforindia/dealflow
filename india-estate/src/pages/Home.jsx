import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeIn, slideIn } from '../utils/animations';

import Hero from '../components/Hero';
import PropertyGrid from '../components/PropertyGrid';
import Agents from '../components/Agents';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import MarketInsights from '../components/MarketInsights';
import PropertyStories from '../components/PropertyStories';
import EMICalculator from '../components/EMICalculator';
import LocalityGuide from '../components/LocalityGuide';
import ExclusiveAccess from '../components/ExclusiveAccess';

// Reusable Section Wrapper for Scroll Animations
const Section = ({ children, delay = 0, className = "" }) => (
    <motion.div
        variants={fadeIn('up', 'spring', delay, 0.5)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }} // Triggers when 10% of element is visible
        className={className}
    >
        {children}
    </motion.div>
);

const Home = () => {
    return (
        <div className="overflow-x-hidden">
            {/* Hero loads immediately, so we don't delay it */}
            <Hero />

            <div className="relative z-10 bg-bg">
                {/* Property Stories - Staggered Entry */}
                <Section delay={0.2} className="relative z-10 -mt-10 mb-10">
                    {/* Negative margin to overlap hero slightly if transparent, or just close gap */}
                    <PropertyStories />
                </Section>

                <Section delay={0.2}>
                    <WhyChooseUs />
                </Section>

                <Section delay={0.3}>
                    <LocalityGuide />
                </Section>

                <Section delay={0.2}>
                    <PropertyGrid />
                </Section>

                {/* Split layout for EMI & Market Insights for visual break */}
                <div className="container mx-auto px-4 gap-8">
                    <Section delay={0.4}>
                        <EMICalculator />
                    </Section>
                </div>

                <Section delay={0.2}>
                    <Testimonials />
                </Section>

                {/* The Vault - Distinct Vantablack Section */}
                <ExclusiveAccess />

                <Section delay={0.3}>
                    <MarketInsights />
                </Section>

                <Section delay={0.4}>
                    <Agents />
                </Section>
            </div>
        </div>
    );
};

export default Home;
