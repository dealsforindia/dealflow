import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

const DecayCard = ({ children, width = 300, height = 400, className = "" }) => {
    const [hovered, setHovered] = useState(false);
    const canvasRef = useRef(null);

    // Setup canvas for particle effect
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Resize canvas
        canvas.width = width;
        canvas.height = height;

        // Simple noise/grain effect on hover
        // In a full implementation, this would be a more complex GLSL shader or particle system
        // For this prototype, we'll use a static noise overlay that fades in

        const drawNoise = () => {
            const w = canvas.width;
            const h = canvas.height;
            const idata = ctx.createImageData(w, h);
            const buffer32 = new Uint32Array(idata.data.buffer);
            const len = buffer32.length;

            for (let i = 0; i < len; i++) {
                if (Math.random() < 0.1) {
                    buffer32[i] = 0x10ffffff; // Low opacity white
                }
            }
            ctx.putImageData(idata, 0, 0);
        };

        if (hovered) {
            let frameId;
            const loop = () => {
                ctx.clearRect(0, 0, width, height);
                drawNoise();
                frameId = requestAnimationFrame(loop);
            }
            loop();
            return () => cancelAnimationFrame(frameId);
        } else {
            ctx.clearRect(0, 0, width, height);
        }
    }, [hovered, width, height]);

    return (
        <div
            className={`relative overflow-hidden rounded-3xl bg-black border border-white/10 group ${className}`}
            style={{ width, height }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none z-10 opacity-50 mix-blend-overlay"
            />
            <div className={`relative z-20 transition-all duration-500 ${hovered ? 'scale-[0.98]' : 'scale-100'}`}>
                {children}
            </div>

            {/* Glitch Overlay */}
            {hovered && (
                <motion.div
                    className="absolute inset-0 bg-accent/5 z-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}
        </div>
    );
};

export default DecayCard;
