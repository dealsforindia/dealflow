import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';

const ImageWithFallback = ({ src, alt, className, ...props }) => {
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const handleLoad = () => {
        setLoaded(true);
    };

    const handleError = () => {
        setError(true);
    };

    return (
        <div className={`relative overflow-hidden ${className} bg-white/5`}>
            {/* Placeholder / Skeleton */}
            {!loaded && !error && (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
            )}

            {/* Error State - Fallback Gradient */}
            {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-gray-500 p-4 text-center">
                    <ImageOff className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-xs uppercase tracking-wider opacity-50">Image Unavailable</span>
                </div>
            ) : (
                <motion.img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={handleLoad}
                    onError={handleError}
                    {...props}
                />
            )}
        </div>
    );
};

export default ImageWithFallback;
