import createGlobe from 'cobe';
import { useEffect, useRef } from 'react';

export default function Globe({
    className = "",
    size = 600,
    dark = true
}) {
    const canvasRef = useRef();

    useEffect(() => {
        let phi = 0;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: size * 2,
            height: size * 2,
            phi: 0,
            theta: 0,
            dark: dark ? 1 : 0,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.1, 0.1, 0.1], // Dark gray/black base
            markerColor: [0.83, 0.68, 0.21], // Gold (#D4AF37)
            glowColor: [0.83, 0.68, 0.21], // Gold glow
            markers: [
                // diverse locations
                { location: [19.0760, 72.8777], size: 0.1 }, // Mumbai
                { location: [28.6139, 77.2090], size: 0.08 }, // Delhi
                { location: [12.9716, 77.5946], size: 0.08 }, // Bangalore
                { location: [25.2048, 55.2708], size: 0.05 }, // Dubai (connection)
                { location: [51.5074, -0.1278], size: 0.05 }, // London (connection)
                { location: [40.7128, -74.0060], size: 0.05 }, // NYC (connection)
            ],
            onRender: (state) => {
                // Called on every animation frame.
                // `state` will be an empty object, return updated params.
                state.phi = phi;
                phi += 0.003; // Auto-rotation speed
            },
        });

        return () => {
            globe.destroy();
        };
    }, [size, dark]);

    return (
        <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
            <canvas
                ref={canvasRef}
                style={{ width: size, height: size, maxWidth: "100%", aspectRatio: 1 }}
                className="opacity-90 hover:opacity-100 transition-opacity duration-1000"
            />
        </div>
    );
}
