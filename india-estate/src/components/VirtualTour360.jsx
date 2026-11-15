import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Info } from 'lucide-react';

/**
 * VirtualTour360 - 360° Photo Viewer Component
 * Inspired by Housing.com and MagicBricks' virtual tour features
 * 
 * Note: For a full implementation, integrate Pannellum or Marzipano library
 * This is a simplified version showing the UI structure
 */
const VirtualTour360 = ({ images, isOpen, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [showInfo, setShowInfo] = useState(true);

    if (!isOpen) return null;

    const currentImage = images?.[currentImageIndex] || {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
        title: 'Living Room',
        description: 'Spacious living area with panoramic city views'
    };

    const hotspots = [
        { id: 1, x: 30, y: 40, label: 'Kitchen', targetIndex: 1 },
        { id: 2, x: 70, y: 50, label: 'Bedroom', targetIndex: 2 },
        { id: 3, x: 50, y: 70, label: 'Balcony', targetIndex: 3 }
    ];

    const handleHotspotClick = (targetIndex) => {
        setCurrentImageIndex(targetIndex);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] bg-black">
                {/* Header Controls */}
                <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-white font-serif">360° Virtual Tour</h2>
                            <span className="px-3 py-1 bg-accent/20 border border-accent/40 rounded-full text-accent text-sm font-semibold">
                                {currentImageIndex + 1} / {images?.length || 4}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                title="Toggle Info"
                            >
                                <Info className="w-5 h-5 text-white" />
                            </button>
                            <button
                                onClick={toggleFullscreen}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            >
                                {isFullscreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/10 hover:bg-red-500/50 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 360° Viewer Area */}
                <div className="relative w-full h-full">
                    {/* Main Image (Placeholder for 360° viewer) */}
                    <div
                        className="relative w-full h-full overflow-hidden cursor-move"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                    >
                        <img
                            src={currentImage.url}
                            alt={currentImage.title}
                            className="w-full h-full object-cover"
                        />

                        {/* Interactive Hotspots */}
                        {hotspots.map((hotspot) => (
                            <motion.button
                                key={hotspot.id}
                                onClick={() => handleHotspotClick(hotspot.targetIndex)}
                                className="absolute w-12 h-12 bg-accent/80 rounded-full border-4 border-white shadow-glow-md hover:scale-125 transition-transform cursor-pointer"
                                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                                whileHover={{ scale: 1.3 }}
                                animate={{
                                    boxShadow: [
                                        '0 0 20px rgba(16, 185, 129, 0.4)',
                                        '0 0 40px rgba(16, 185, 129, 0.6)',
                                        '0 0 20px rgba(16, 185, 129, 0.4)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    {hotspot.label}
                                </span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Info Panel */}
                    <AnimatePresence>
                        {showInfo && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-6 left-6 glass-effect rounded-2xl p-6 border border-white/20 max-w-md"
                            >
                                <h3 className="text-xl font-bold text-white mb-2">{currentImage.title}</h3>
                                <p className="text-gray-300 text-sm">{currentImage.description}</p>
                                <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    Click and drag to look around • Click hotspots to navigate
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <div className="flex items-center justify-between">
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                                disabled={zoom <= 0.5}
                            >
                                <ZoomOut className="w-5 h-5 text-white" />
                            </button>
                            <span className="text-white font-semibold min-w-[60px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                                disabled={zoom >= 3}
                            >
                                <ZoomIn className="w-5 h-5 text-white" />
                            </button>
                            <button
                                onClick={() => setZoom(1)}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors ml-2"
                                title="Reset Zoom"
                            >
                                <RotateCcw className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Room Navigation */}
                        <div className="flex items-center gap-2 overflow-x-auto max-w-2xl">
                            {images?.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`relative flex-shrink-0 group ${index === currentImageIndex ? 'ring-2 ring-accent' : ''
                                        }`}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.title}
                                        className="w-20 h-20 object-cover rounded-lg"
                                    />
                                    <div className={`absolute inset-0 bg-black/40 group-hover:bg-black/20 rounded-lg transition-colors ${index === currentImageIndex ? 'bg-accent/20' : ''
                                        }`} />
                                    <span className="absolute bottom-1 left-1 right-1 text-xs text-white font-medium text-center truncate">
                                        {img.title}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* AR/VR Options */}
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-accent/20 border border-accent/40 text-accent rounded-lg hover:bg-accent hover:text-white transition-all duration-300">
                                View in AR
                            </button>
                        </div>
                    </div>
                </div>

                {/* Instructions Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white/50 pointer-events-none">
                    <p className="text-lg font-semibold">Drag to explore • Scroll to zoom</p>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default VirtualTour360;
