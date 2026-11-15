import { useCallback, useMemo } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

/**
 * ParticleBackground - Optimized luxury particle effect
 * Reduced particle count and disabled expensive effects for better performance
 */
const ParticleBackground = ({ density = 20, className = '' }) => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    const particlesConfig = useMemo(() => ({
        background: {
            color: {
                value: 'transparent',
            },
        },
        fpsLimit: 60,
        particles: {
            color: {
                value: ['#10b981', '#D4AF37', '#ffffff'],
            },
            move: {
                direction: 'none',
                enable: true,
                outModes: 'out',
                random: true,
                speed: 0.5,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    area: 1200,
                },
                value: density,
            },
            opacity: {
                value: { min: 0.1, max: 0.4 },
            },
            shape: {
                type: 'circle',
            },
            size: {
                value: { min: 1, max: 3 },
            },
        },
        detectRetina: true,
    }), [density]);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={particlesConfig}
            className={`absolute inset-0 pointer-events-none ${className}`}
        />
    );
};

export default ParticleBackground;
