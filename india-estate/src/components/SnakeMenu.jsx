import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

const locations = [
    "Mumbai", "Delhi NCR", "Bangalore", "Kolkata", "Goa", "Hyderabad", "Pune", "Chennai"
];

const SnakeMenu = () => {
    const containerRef = useRef(null);

    const handleMouseEnter = (e) => {
        // Create a snake trail effect
        const colors = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

        // Quick GSAP stagger animation on the list items
        gsap.to(".location-item", {
            x: 10,
            stagger: 0.05,
            duration: 0.3,
            ease: "power2.out"
        });
    };

    const handleMouseLeave = () => {
        gsap.to(".location-item", {
            x: 0,
            stagger: 0.05,
            duration: 0.3,
            ease: "power2.in"
        });
    };

    return (
        <div
            className="relative group py-2"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={containerRef}
        >
            <span className="cursor-pointer hover:text-accent font-medium flex items-center gap-1">
                Locations <span className="text-xs transition-transform group-hover:rotate-180">▼</span>
            </span>

            <div className="absolute top-full left-0 mt-2 w-64 bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden hidden group-hover:block transform origin-top transition-all duration-300">
                <div className="p-4 grid grid-cols-1 gap-1">
                    {locations.map((loc, i) => (
                        <motion.div
                            key={loc}
                            className="location-item p-3 rounded-lg hover:bg-white/5 cursor-pointer text-gray-300 hover:text-white flex items-center justify-between group/item"
                            whileHover={{ x: 5 }}
                        >
                            <span className="font-medium">{loc}</span>
                            <span className="opacity-0 group-hover/item:opacity-100 text-accent text-xs">→</span>
                        </motion.div>
                    ))}
                </div>

                {/* Decorative Snake Line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent/0 via-accent/50 to-accent/0 opacity-50" />
            </div>
        </div>
    );
};

export default SnakeMenu;
