import React, { useState, useEffect } from 'react';
import useUIStore from '../store/useUIStore';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pannellum } from "pannellum-react";
import { X, MapPin, Bed, Bath, Square, Calendar, Share2, Heart, Check, Calculator, ChevronRight, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Mock Data for Investment Graph
const chartData = {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [{
        label: 'Property Value (Cr)',
        data: [12.5, 13.2, 14.8, 16.5, 17.8, 18.5],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4
    }]
};

const chartOptions = {
    responsive: true,
    plugins: {
        legend: { position: 'top', labels: { color: 'white' } },
        title: { display: false }
    },
    scales: {
        y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.1)' } },
        x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
};

const PropertyDetailsModal = () => {
    const { selectedProperty, closePropertyDetails } = useUIStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [property, setProperty] = useState(null);

    useEffect(() => {
        if (selectedProperty) {
            setProperty({
                ...selectedProperty,
                description: "Experience the pinnacle of luxury in this architecturally stunning masterpiece. Featuring floor-to-ceiling windows, imported Italian marble, and a private infinity pool overlooking the skyline.",
                features: ["Smart Home Automation", "Private Elevator", "Wine Cellar", "Sky Deck"]
            });
        }
    }, [selectedProperty]);

    if (!selectedProperty) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                onClick={() => closePropertyDetails()}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="bg-bg border border-white/10 rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-accent/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Media Section (Left/Top) */}
                    <div className="w-full md:w-2/3 bg-black relative flex flex-col">
                        {/* Close Button Mobile */}
                        <button onClick={() => closePropertyDetails()} className="absolute top-4 right-4 z-50 md:hidden bg-black/50 p-2 rounded-full text-white">
                            <X />
                        </button>

                        <div className="flex-1 relative">
                            {activeTab === '360' ? (
                                <div className="absolute inset-0">
                                    <Pannellum
                                        width="100%"
                                        height="100%"
                                        image="https://pannellum.org/images/alma.jpg" // Placeholder 360
                                        pitch={10}
                                        yaw={180}
                                        hfov={110}
                                        autoLoad
                                        onLoad={() => console.log("panorama loaded")}
                                    />
                                    <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded text-xs text-white z-10">
                                        Interactive 360° View
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={property?.image || "https://images.unsplash.com/photo-1600596542815-2495db98cfa4?ixlib=rb-4.0.3&auto=format"}
                                    className="w-full h-full object-cover"
                                    alt="Property"
                                />
                            )}
                        </div>

                        {/* Tab Switcher on Image */}
                        <div className="absolute bottom-6 left-6 flex gap-2 z-20">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-2 rounded-lg backdrop-blur-md border border-white/20 transition-all ${activeTab === 'overview' ? 'bg-accent text-white' : 'bg-black/40 text-gray-300 hover:bg-black/60'}`}
                            >
                                Photos
                            </button>
                            <button
                                onClick={() => setActiveTab('360')}
                                className={`px-4 py-2 rounded-lg backdrop-blur-md border border-white/20 transition-all ${activeTab === '360' ? 'bg-accent text-white' : 'bg-black/40 text-gray-300 hover:bg-black/60'}`}
                            >
                                360° Tour
                            </button>
                            <button
                                onClick={() => setActiveTab('investment')}
                                className={`px-4 py-2 rounded-lg backdrop-blur-md border border-white/20 transition-all ${activeTab === 'investment' ? 'bg-accent text-white' : 'bg-black/40 text-gray-300 hover:bg-black/60'}`}
                            >
                                <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Trends</span>
                            </button>
                        </div>
                    </div>

                    {/* Details Section (Right/Bottom) */}
                    <div className="w-full md:w-1/3 p-8 overflow-y-auto border-l border-white/10 bg-card/95">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-serif font-bold text-white mb-2">{property?.title}</h2>
                                <div className="flex items-center text-gray-400">
                                    <MapPin className="w-4 h-4 mr-1 text-accent" />
                                    {property?.location}
                                </div>
                            </div>
                            <button onClick={() => closePropertyDetails()} className="hidden md:block text-gray-500 hover:text-white transition-colors">
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        {activeTab === 'investment' ? (
                            <div className="animate-in fade-in zoom-in duration-300">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Activity className="text-accent" /> Price Trends
                                </h3>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                                    <Line options={chartOptions} data={chartData} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Projected Yield</span>
                                        <span className="text-accent font-bold">5.8% / yr</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Area Appreciation</span>
                                        <span className="text-white font-bold">+12% (Last 3 yrs)</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-4 mb-8">
                                    <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <Bed className="w-5 h-5 mx-auto mb-1 text-accent" />
                                        <span className="text-sm text-gray-300 block">{property?.beds || 4} Beds</span>
                                    </div>
                                    <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <Bath className="w-5 h-5 mx-auto mb-1 text-accent" />
                                        <span className="text-sm text-gray-300 block">{property?.baths || 5} Baths</span>
                                    </div>
                                    <div className="flex-1 bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                        <Square className="w-5 h-5 mx-auto mb-1 text-accent" />
                                        <span className="text-sm text-gray-300 block">{property?.area || '3,200'} sqft</span>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm">
                                        {property?.description}
                                    </p>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-white mb-3">Premium Features</h3>
                                    <ul className="grid grid-cols-2 gap-2">
                                        {property?.features?.map((f, i) => (
                                            <li key={i} className="flex items-center text-gray-400 text-sm">
                                                <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2" />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}

                        <div className="sticky bottom-0 pt-4 bg-card border-t border-white/10 mt-auto">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400">Price</span>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-3xl font-serif font-bold text-white">{selectedProperty.price}</h3>
                                    <button
                                        onClick={() => useUIStore.getState().openMortgageModal()}
                                        className="ml-4 flex items-center gap-1 text-xs text-accent hover:text-white transition-colors border border-accent/20 rounded-full px-3 py-1"
                                    >
                                        <Calculator className="w-3 h-3" />
                                        Calculate EMI
                                    </button>
                                </div>
                            </div>

                            {/* Availability Checker */}
                            <div className="mb-4 bg-white/5 p-3 rounded-lg border border-white/10">
                                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide font-bold">Check Availability</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        className="bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-accent w-full"
                                    />
                                    <button
                                        onClick={() => {
                                            const btn = document.getElementById('check-btn');
                                            btn.innerHTML = "Available!";
                                            btn.classList.add('bg-emerald-500', 'text-white');
                                            setTimeout(() => {
                                                btn.innerHTML = "Check";
                                                btn.classList.remove('bg-emerald-500', 'text-white');
                                            }, 2000);
                                        }}
                                        id="check-btn"
                                        className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded text-sm font-medium transition-all"
                                    >
                                        Check
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg border border-white/10 transition-colors">
                                    Download Brochure
                                </button>
                                <button onClick={() => useUIStore.getState().openConsultation()} className="flex-[2] bg-accent hover:bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors">
                                    Schedule Viewing <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div >
        </AnimatePresence >,
        document.body
    );
};

export default PropertyDetailsModal;
