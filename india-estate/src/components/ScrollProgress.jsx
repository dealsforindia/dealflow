import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * ScrollProgress - Visual indicator showing page scroll progress
 * Appears at the top of the page
 */
const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-gold to-accent origin-left z-[100]"
            style={{ scaleX }}
        />
    );
};

export default ScrollProgress;
