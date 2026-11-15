/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: '#030303',
                card: '#0A0A0A',
                accent: '#10b981', // Emerald primary accent
                gold: '#D4AF37',
                'gold-dim': '#8A701E',
                'gold-light': '#F4E4BC',
                platinum: '#E5E4E2',
                surface: 'rgba(255, 255, 255, 0.03)',
                // Premium gradient colors
                'purple-deep': '#6B46C1',
                'purple-light': '#9F7AEA',
                'blue-deep': '#2C5282',
                'blue-light': '#4299E1',
                'rose-deep': '#9B2C2C',
                'rose-light': '#FC8181',
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
                serif: ['Bodoni Moda', 'serif'],
                display: ['Italiana', 'serif'],
            },
            animation: {
                'marquee': 'marquee 60s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'slow-zoom': 'zoom 20s linear infinite',
                // New premium animations
                'shimmer': 'shimmer 2s linear infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float-3d': 'float-3d 8s ease-in-out infinite',
                'slide-up': 'slide-up 0.6s ease-out',
                'fade-in-up': 'fade-in-up 0.8s ease-out',
                'scale-in': 'scale-in 0.5s ease-out',
                'bounce-slow': 'bounce 3s infinite',
                'spin-slow': 'spin 8s linear infinite',
                'gradient-shift': 'gradient-shift 8s ease infinite',
                'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px)' }
                },
                zoom: {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.2)' }
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' }
                },
                glow: {
                    '0%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.3)' }
                },
                'float-3d': {
                    '0%, 100%': { transform: 'translateY(0) rotateX(0deg) rotateY(0deg)' },
                    '25%': { transform: 'translateY(-20px) rotateX(5deg) rotateY(5deg)' },
                    '50%': { transform: 'translateY(-10px) rotateX(-5deg) rotateY(-5deg)' },
                    '75%': { transform: 'translateY(-15px) rotateX(3deg) rotateY(-3deg)' }
                },
                'slide-up': {
                    '0%': { transform: 'translateY(100px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                'fade-in-up': {
                    '0%': { transform: 'translateY(30px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.9)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                },
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' }
                },
                'pulse-glow': {
                    '0%, 100%': {
                        opacity: '1',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
                    },
                    '50%': {
                        opacity: '0.8',
                        boxShadow: '0 0 40px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.4)'
                    }
                }
            },
            boxShadow: {
                'glow-sm': '0 0 15px rgba(16, 185, 129, 0.3)',
                'glow-md': '0 0 30px rgba(16, 185, 129, 0.4)',
                'glow-lg': '0 0 45px rgba(16, 185, 129, 0.5)',
                'glow-gold': '0 0 30px rgba(212, 175, 55, 0.4)',
                'inner-glow': 'inset 0 0 30px rgba(16, 185, 129, 0.2)',
                'premium': '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.1)',
                'premium-lg': '0 30px 90px rgba(0, 0, 0, 0.6), 0 0 60px rgba(16, 185, 129, 0.15)',
            },
            backdropBlur: {
                xs: '2px',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '100': '25rem',
                '128': '32rem',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            },
        },
    },
    plugins: [],
}
