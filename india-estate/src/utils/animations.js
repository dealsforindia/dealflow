// Comprehensive Animation Variants for Framer Motion

// 1. Container Stagger (The Orchestrator)
// Use this on parent containers (grids, lists) to stagger children animations
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
    hidden: {},
    show: {
        transition: {
            staggerChildren,
            delayChildren,
        },
    },
});

// 2. Fade In variants
export const fadeIn = (direction = 'up', type = 'spring', delay = 0, duration = 0.5) => ({
    hidden: {
        x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
        y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
        opacity: 0,
        scale: 0.95, // Subtle scale down for premium feel
    },
    show: {
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type,
            delay,
            duration,
            ease: "easeOut",
        },
    },
});

// 3. Zoom In (Good for images/cards)
export const zoomIn = (delay = 0, duration = 0.5) => ({
    hidden: {
        scale: 0.8,
        opacity: 0,
    },
    show: {
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            delay,
            duration,
            ease: 'easeOut',
        },
    },
});

// 4. Slide In (From sides)
export const slideIn = (direction, type, delay, duration) => ({
    hidden: {
        x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
        y: direction === 'up' ? '100%' : direction === 'down' ? '100%' : 0,
        opacity: 0, // Combining slide with fade is usually smoother
    },
    show: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
            type,
            delay,
            duration,
            ease: 'easeOut',
        },
    },
});

// 5. Text Reveal (Typewriter / Word by Word)
export const textVariant = (delay = 0) => ({
    hidden: {
        y: 20,
        opacity: 0,
    },
    show: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            duration: 0.8, // Slightly slower for elegance
            delay,
        },
    },
});

export const textContainer = {
    hidden: {
        opacity: 0,
    },
    show: (i = 1) => ({
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: i * 0.1 },
    }),
};

// 6. Navbar/Header Reveal
export const navVariants = {
    hidden: {
        opacity: 0,
        y: -50,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 140,
        },
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 80,
            delay: 0.3,
        },
    },
};

// 7. Footer Reveal
export const footerVariants = {
    hidden: {
        opacity: 0,
        y: 50,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 140,
        },
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 80,
            delay: 0.1,
        },
    },
};
