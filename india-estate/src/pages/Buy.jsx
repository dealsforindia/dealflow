import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer, slideIn } from '../utils/animations';
import { Search, Filter, Home, MapPin, TrendingUp, Calculator, UserCheck, FileText, Video, Scale, Clock, MessageSquare, BadgePercent } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import useUIStore from '../store/useUIStore';
import { AreaReportModal, VideoTourModal, LocalityMapModal, InquiryModal } from '../components/FeatureModals';

// Fix Leaflet Icon
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const properties = [
    { id: 1, title: "Sea Facing Penthouse", lat: 19.0178, lng: 72.8478, price: "₹18.5 Cr", location: "Worli, Mumbai", trend: "+12%" },
    { id: 2, title: "Colonial Bungalow", lat: 28.6139, lng: 77.2090, price: "₹45.0 Cr", location: "Lutyens, Delhi", trend: "+5%" },
    { id: 3, title: "Modern Tech Villa", lat: 12.9716, lng: 77.5946, price: "₹6.8 Cr", location: "Whitefield, Bangalore", trend: "+18%" },
    { id: 4, title: "Portuguese Villa", lat: 15.2993, lng: 74.1240, price: "₹5.2 Cr", location: "Assagao, Goa", trend: "+8%" },
];

const Buy = () => {
    const [selectedId, setSelectedId] = useState(null);
    const { openMortgageModal, openConsultation } = useUIStore();

    // New Modal States
    const [areaReportOpen, setAreaReportOpen] = useState(false);
    const [videoTourOpen, setVideoTourOpen] = useState(false);
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
    const [selectedPropertyForModal, setSelectedPropertyForModal] = useState(null);

    // 7. Compare Tray State
    const [compareList, setCompareList] = useState([]);
    const addToCompare = (id) => {
        if (compareList.includes(id)) setCompareList(compareList.filter(c => c !== id));
        else if (compareList.length < 3) setCompareList([...compareList, id]);
    };

    return (
        <div className="pt-24 min-h-screen flex flex-col md:flex-row h-screen overflow-hidden relative">

            {/* 10. Quick Inquiry Floating Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setInquiryModalOpen(true)}
                className="fixed bottom-24 right-6 z-50 p-4 bg-accent text-white rounded-full shadow-lg shadow-accent/30 flex items-center justify-center md:hidden"
            >
                <MessageSquare className="w-6 h-6" />
            </motion.button>

            {/* Sidebar / List */}
            <div className="w-full md:w-1/3 bg-card border-r border-white/10 flex flex-col h-full z-10">
                <div className="p-6 border-b border-white/10 shrink-0">
                    <h1 className="text-3xl font-serif font-bold text-white mb-4">Buy Property</h1>

                    {/* 1. Investment Hotspots Carousel */}
                    <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex gap-3">
                            {['Top Yield: Hyderabad', 'Growth: Pune East', 'Luxury: SoBo'].map((spot, i) => (
                                <div key={i} className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-white/10 to-transparent border border-white/10 rounded-lg flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3 text-green-400" />
                                    <span className="text-xs font-medium text-white">{spot}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search location..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 text-white outline-none focus:border-accent text-sm"
                            />
                        </div>
                        <button className="bg-white/5 p-2 rounded-lg border border-white/10 hover:bg-white/10 text-white">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <motion.div
                    variants={staggerContainer(0.1, 0.2)}
                    initial="hidden"
                    animate="show"
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                    {properties.map((p, index) => (
                        <motion.div
                            key={p.id}
                            variants={fadeIn('up', 'spring', index * 0.1, 0.5)}
                            onClick={() => setSelectedId(p.id)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border group relative ${selectedId === p.id ? 'bg-accent/10 border-accent' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white group-hover:text-accent transition-colors">{p.title}</h3>
                                <span className="text-accent font-serif font-bold">{p.price}</span>
                            </div>
                            <div className="flex items-center text-gray-400 text-sm mb-3">
                                <MapPin className="w-3 h-3 mr-1" />
                                {p.location}
                                <span className="ml-auto text-green-400 text-xs flex items-center bg-green-500/10 px-2 py-0.5 rounded">
                                    <TrendingUp className="w-3 h-3 mr-1" /> {p.trend}
                                </span>
                            </div>

                            {/* Additive Buttons Row */}
                            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/10">
                                {/* 3. Mortgage Calculator Button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); openMortgageModal(); }}
                                    className="flex flex-col items-center justify-center text-[10px] text-gray-400 hover:text-white"
                                    title="EMI Calculator"
                                >
                                    <Calculator className="w-4 h-4 mb-1" />
                                    EMI
                                </button>

                                {/* 6. Video Tour Button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedPropertyForModal(p.title); setVideoTourOpen(true); }}
                                    className="flex flex-col items-center justify-center text-[10px] text-gray-400 hover:text-white"
                                    title="Video Tour"
                                >
                                    <Video className="w-4 h-4 mb-1" />
                                    Tour
                                </button>

                                {/* 5. Area Report Download */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setAreaReportOpen(true); }}
                                    className="flex flex-col items-center justify-center text-[10px] text-gray-400 hover:text-white"
                                    title="Area Report"
                                >
                                    <FileText className="w-4 h-4 mb-1" />
                                    Report
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); addToCompare(p.id); }}
                                    className={`flex flex-col items-center justify-center text-[10px] ${compareList.includes(p.id) ? 'text-accent' : 'text-gray-400 hover:text-white'}`}
                                    title="Compare"
                                >
                                    <Scale className="w-4 h-4 mb-1" />
                                    Compare
                                </button>
                            </div>
                        </motion.div>
                    ))}


                    {/* 2. Price Trend Widget (In-feed) */}
                    <div className="p-4 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-white/10 rounded-xl mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <BadgePercent className="w-5 h-5 text-indigo-400" />
                            <h4 className="font-bold text-white">Market Trends</h4>
                        </div>
                        <p className="text-xs text-gray-300 mb-3">Property prices in Mumbai have risen by <span className="text-green-400 font-bold">8.5%</span> in the last quarter.</p>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-[70%] bg-indigo-500 rounded-full"></div>
                        </div>
                    </div>

                    {/* 4. Talk to Expert Card */}
                    <div className="p-4 bg-gradient-to-r from-accent/20 to-emerald-900/20 border border-accent/20 rounded-xl flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white text-sm">Need Expert Advice?</h4>
                            <p className="text-xs text-gray-400">Get free consultation from top agents.</p>
                        </div>
                        <button
                            onClick={openConsultation}
                            className="p-2 bg-accent text-white rounded-lg hover:scale-105 transition-transform"
                        >
                            <UserCheck className="w-5 h-5" />
                        </button>
                    </div>

                    {/* 8. Recently Viewed Section */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                        <h4 className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">
                            <Clock className="w-3 h-3" /> Recently Viewed
                        </h4>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {[1, 3].map(id => {
                                const p = properties.find(prop => prop.id === id);
                                return (
                                    <div key={id} className="min-w-[120px] p-2 bg-white/5 rounded-lg border border-white/5">
                                        <div className="text-xs font-bold text-white truncate">{p.title}</div>
                                        <div className="text-[10px] text-accent">{p.price}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Map */}
            <motion.div
                variants={slideIn('right', 'tween', 0.2, 0.8)}
                initial="hidden"
                animate="show"
                className="w-full md:w-2/3 h-[50vh] md:h-full relative"
            >
                <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {properties.map(p => (
                        <Marker key={p.id} position={[p.lat, p.lng]}>
                            <Popup className="custom-popup">
                                <div className="text-black font-sans">
                                    <strong>{p.title}</strong><br />
                                    {p.price}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* 9. Neighborhood Map Button Overlay */}
                <div className="absolute top-6 right-6 z-[400]">
                    <button
                        onClick={() => setMapModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold rounded-lg shadow-xl hover:bg-gray-100 transition-colors"
                    >
                        <MapPin className="w-4 h-4" />
                        Explore Neighborhoods
                    </button>
                </div>

                {/* 7. Compare Tray (Floating) */}
                <AnimatePresence>
                    {compareList.length > 0 && (
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="absolute bottom-6 left-6 right-6 z-[400] md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[400px]"
                        >
                            <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-xl p-3 flex items-center justify-between shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="bg-accent text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                        {compareList.length}
                                    </div>
                                    <span className="text-white text-sm font-medium">Properties Selected</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCompareList([])}
                                        className="text-gray-400 text-xs hover:text-white px-2"
                                    >
                                        Clear
                                    </button>
                                    <button className="px-4 py-1.5 bg-accent text-white text-sm font-bold rounded-lg hover:bg-emerald-600">
                                        Compare Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Modals */}
            <AreaReportModal isOpen={areaReportOpen} onClose={() => setAreaReportOpen(false)} location="Mumbai" />
            <VideoTourModal isOpen={videoTourOpen} onClose={() => setVideoTourOpen(false)} propertyTitle={selectedPropertyForModal} />
            <LocalityMapModal isOpen={mapModalOpen} onClose={() => setMapModalOpen(false)} location="Current View" />
            <InquiryModal isOpen={inquiryModalOpen} onClose={() => setInquiryModalOpen(false)} />
        </div >
    );
};

export default Buy;
