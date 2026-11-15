import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Image } from 'lucide-react';

const RevealImage = ({ src, alt, className, aspectRatio = "aspect-video", priority = false }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={cn("relative overflow-hidden bg-white/5", aspectRatio, className)}>
            {/* Shutter / Cover */}
            <motion.div
                initial={{ scaleY: 1 }}
                animate={isLoaded ? { scaleY: 0 } : { scaleY: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-accent z-20 origin-bottom"
            />

            {/* Secondary Shutter (Gold) */}
            <motion.div
                initial={{ scaleY: 1 }}
                animate={isLoaded ? { scaleY: 0 } : { scaleY: 1 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 bg-gold z-10 origin-bottom"
            />

            {/* Placeholder Icon */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-white/20 z-0">
                    <Image className="w-8 h-8" />
                </div>
            )}

            {/* Actual Image */}
            <motion.img
                src={src}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                onLoad={() => setIsLoaded(true)}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={isLoaded ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn("w-full h-full object-cover", className)}
            />
        </div>
    );
};

export default RevealImage;
