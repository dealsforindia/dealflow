import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { toast } from 'sonner';
import CountUp from 'react-countup';
import Confetti from 'react-confetti';
import { create } from 'zustand';
import { motion } from 'framer-motion';
import { Layers, Map as MapIcon, Box, Bell, MousePointer2 } from 'lucide-react';

// --- Zustand Store ---
const useStore = create((set) => ({
    bears: 0,
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),
}));

// --- 3D Component ---
const AnimatedSphere = () => {
    const mesh = useRef(null);
    useFrame((state) => {
        mesh.current.distort = 0.4 + Math.sin(state.clock.elapsedTime) * 0.2;
    });

    return (
        <Sphere args={[1, 100, 200]} scale={2} ref={mesh}>
            <MeshDistortMaterial
                color="#8352FD"
                attach="material"
                distort={0.4}
                speed={2}
                roughness={0}
            />
        </Sphere>
    );
};

const TechDemo = () => {
    const { bears, increasePopulation, removeAllBears } = useStore();
    const [showConfetti, setShowConfetti] = useState(false);

    const triggerConfetti = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        toast.success("Party Mode Activated! 🎉");
    };

    return (
        <div className="min-h-screen bg-bg text-white pt-24 pb-20 px-4">
            {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}

            <div className="container mx-auto max-w-6xl space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block bg-accent/10 border border-accent/20 px-4 py-1 rounded-full text-accent font-medium text-sm"
                    >
                        Mega Expansion Architecture
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        Tech Stack V2
                    </h1>
                    <div className="flex justify-center gap-8 text-xl font-mono text-gray-400">
                        <div>
                            <span className="text-white font-bold text-3xl block">
                                <CountUp end={20} duration={2} />+
                            </span>
                            Libraries
                        </div>
                        <div>
                            <span className="text-white font-bold text-3xl block">
                                <CountUp end={100} suffix="%" duration={2} />
                            </span>
                            Optimized
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* 1. 3D Visualization */}
                    <div className="bg-card border border-white/10 rounded-3xl overflow-hidden h-96 relative group">
                        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                            <Box className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold">Three.js + React Fiber</span>
                        </div>
                        <Canvas className="w-full h-full bg-black/50">
                            <ambientLight intensity={0.5} />
                            <directionalLight position={[10, 10, 5]} intensity={1} />
                            <AnimatedSphere />
                            <OrbitControls enableZoom={false} />
                        </Canvas>
                    </div>

                    {/* 2. Interactive Maps */}
                    <div className="bg-card border border-white/10 rounded-3xl overflow-hidden h-96 relative z-0">
                        <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                            <MapIcon className="w-4 h-4 text-green-400" />
                            <span className="text-xs font-bold">React Leaflet</span>
                        </div>
                        <MapContainer center={[19.0760, 72.8777]} zoom={11} scrollWheelZoom={false} className="w-full h-full z-10">
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                            <Marker position={[19.0760, 72.8777]}>
                                <Popup>
                                    Mumbai HQ <br /> Prime Location
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>

                    {/* 3. Swiper Carousel */}
                    <div className="bg-card border border-white/10 rounded-3xl p-6 relative">
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="w-5 h-5 text-blue-400" />
                            <h3 className="font-bold">Swiper JS</h3>
                        </div>
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={20}
                            slidesPerView={1}
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 2500, disableOnInteraction: false }}
                            className="w-full h-64 rounded-xl"
                        >
                            {[1, 2, 3, 4].map((i) => (
                                <SwiperSlide key={i}>
                                    <div className={`w-full h-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-white/5`}>
                                        Slide {i}
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* 4. Zustand & Sonner */}
                    <div className="bg-card border border-white/10 rounded-3xl p-6 relative">
                        <div className="flex items-center gap-2 mb-4">
                            <MousePointer2 className="w-5 h-5 text-orange-400" />
                            <h3 className="font-bold">State & Interaction</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl text-center">
                                <p className="text-xs text-gray-400 mb-1">Zustand Global State</p>
                                <div className="text-3xl font-mono font-bold text-accent mb-2">{bears}</div>
                                <button
                                    onClick={increasePopulation}
                                    className="w-full py-1.5 bg-accent/20 hover:bg-accent/30 text-accent text-xs rounded transition-colors"
                                >
                                    Add Bear 🐻
                                </button>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => toast.success('Success Notification')}
                                    className="w-full py-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Bell className="w-4 h-4" /> Toast Success
                                </button>
                                <button
                                    onClick={() => toast.error('Error Notification')}
                                    className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Bell className="w-4 h-4" /> Toast Error
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={triggerConfetti}
                            className="w-full mt-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-bold hover:opacity-90 transition-opacity"
                        >
                            Trigger Celebration Effect 🎉
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TechDemo;
