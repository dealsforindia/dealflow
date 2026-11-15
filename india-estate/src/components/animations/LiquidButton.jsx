import React from 'react';
import { motion } from 'framer-motion';

const LiquidButton = ({ children, className = "", onClick }) => {
    return (
        <motion.button
            className={`relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden group ${className}`}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <div className="absolute inset-0 w-full h-full bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-out z-0" />
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                {children}
            </span>
        </motion.button>
    );
};

export default LiquidButton;
