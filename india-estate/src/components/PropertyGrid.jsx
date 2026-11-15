import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer } from '../utils/animations';
import { MapPin, Bed, Bath, Square, Heart, Eye, ArrowUpRight, Search, SlidersHorizontal, X, Check, Shield, CheckCircle, TrendingDown, Calendar, MessageCircle, Download } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import VanillaTilt from 'vanilla-tilt';
import { useNavigate } from 'react-router-dom';
import useUIStore from '../store/useUIStore';
import ImageWithFallback from './ImageWithFallback';
import AdvancedSearchModal from './AdvancedSearchModal';
import SpotlightCard from './animations/SpotlightCard';
import Magnetic from './animations/Magnetic';
import { BorderBeam } from './animations/BorderBeam';

import usePropertyStore from '../store/usePropertyStore';

// Removed hardcoded properties array - now using usePropertyStore


const PropertyCard = ({ property, index, isLoading, onOpenLightbox, isFavorite, onToggleFavorite, isCompareSelected, onToggleCompare, isCompareFull }) => {
    const tiltRef = useRef(null);

    useEffect(() => {
        if (!isLoading && tiltRef.current) {
            VanillaTilt.init(tiltRef.current, {
                max: 10,
                speed: 400,
                glare: true,
                "max-glare": 0.4,
                scale: 1.02
            });
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <div className="bg-card/50 rounded-2xl overflow-hidden border border-white/5 backdrop-blur-sm">
                <Skeleton height={280} baseColor="#1e293b" highlightColor="#334155" />
                <div className="p-6">
                    <Skeleton width="60%" height={24} baseColor="#1e293b" highlightColor="#334155" className="mb-2" />
                    <Skeleton width="40%" height={16} baseColor="#1e293b" highlightColor="#334155" className="mb-4" />
                    <Skeleton height={40} baseColor="#1e293b" highlightColor="#334155" className="rounded-xl mt-4" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            ref={tiltRef}
            variants={fadeIn('up', 'spring', index * 0.1, 0.6)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="group relative glass-effect rounded-3xl overflow-hidden border border-white/10 hover:border-accent/40 transition-all duration-500 premium-shadow hover:shadow-premium-lg"
        >
            {/* Image Container */}
            <div className="relative h-72 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                {/* Animated gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-gold/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                <ImageWithFallback
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />

                {/* Tags & Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {/* Main Tag */}
                    <span className="glass-effect text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-white/20 shadow-glow-sm">
                        {property.tag}
                    </span>

                    {/* Verification Badges */}
                    <div className="flex gap-2 flex-wrap">
                        {/* RERA Verified Badge */}
                        <span className="flex items-center gap-1 bg-green-500/90 text-white text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-sm">
                            <Shield className="w-3 h-3" />
                            RERA
                        </span>

                        {/* Verified Listing Badge */}
                        <span className="flex items-center gap-1 bg-blue-500/90 text-white text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-sm">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                        </span>
                    </div>
                </div>

                {/* Price Drop Indicator (Top Right) */}
                <div className="absolute top-4 right-4 z-20">
                    <span className="flex items-center gap-1 bg-red-500/90 text-white text-xs font-bold px-2 py-1.5 rounded-md backdrop-blur-sm animate-pulse">
                        <TrendingDown className="w-3 h-3" />
                        -5% Price Drop
                    </span>
                </div>

                {/* Floating Actions */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={() => onOpenLightbox(property)}
                        className="p-3 rounded-full bg-bg/80 text-white hover:bg-accent hover:text-white transition-colors backdrop-blur-md border border-white/10"
                        title="View Gallery"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare();
                        }}
                        disabled={!isCompareSelected && isCompareFull}
                        className={`p-3 rounded-full transition-colors backdrop-blur-md border border-white/10 ${isCompareSelected ? 'bg-accent text-white' : 'bg-bg/80 text-white hover:bg-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
                        title={isCompareSelected ? "Remove from Compare" : "Add to Compare"}
                    >
                        {isCompareSelected ? <Check className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite();
                        }}
                        className={`p-3 rounded-full bg-bg/80 transition-colors backdrop-blur-md border border-white/10 ${isFavorite ? 'text-red-500 bg-white/10' : 'text-white hover:bg-red-500 hover:text-white'}`}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Price Tag Overlay */}
                <div className="absolute bottom-4 left-4 z-20">
                    <div className="text-2xl font-bold text-white font-serif drop-shadow-2xl bg-gradient-to-r from-accent to-gold bg-clip-text text-transparent">{property.price}</div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 relative">
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-accent transition-colors font-serif truncate">
                    {property.title}
                </h3>
                <div className="flex items-center text-gray-400 mb-6 text-sm">
                    <MapPin className="w-4 h-4 mr-1 text-accent" />
                    {property.location}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-3 gap-2 py-4 border-t border-white/5 text-gray-300 text-sm mb-4">
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5">
                        <Bed className="w-4 h-4 text-accent" />
                        <span className="text-xs">{property.beds} Beds</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5">
                        <Bath className="w-4 h-4 text-accent" />
                        <span className="text-xs">{property.baths} Baths</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/5">
                        <Square className="w-4 h-4 text-accent" />
                        <span className="text-xs">{property.area}</span>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-accent/20 hover:border-accent/40 hover:text-accent transition-all duration-300 group">
                        <Calendar className="w-4 h-4" />
                        Schedule Visit
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-green-500/20 hover:border-green-500/40 hover:text-green-400 transition-all duration-300 group">
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                    </button>
                </div>

                <button
                    onClick={() => onOpenLightbox(property)}
                    className="w-full py-3.5 rounded-xl bg-accent/10 border border-accent/30 text-accent font-semibold hover:bg-accent hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-glow-sm hover:shadow-glow-md"
                >
                    View Details
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                </button>

                {/* Download Brochure Link */}
                <button className="w-full mt-2 text-xs text-gray-400 hover:text-accent transition-colors flex items-center justify-center gap-1">
                    <Download className="w-3 h-3" />
                    Download Brochure
                </button>
            </div>
        </motion.div>
    );
};



const PropertyGrid = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const { openPropertyDetails, favorites, toggleFavorite, compareList, addToCompare, removeFromCompare, openCompareModal } = useUIStore();
    const { properties } = usePropertyStore();

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [priceRange, setPriceRange] = useState("All");
    const [propertyType, setPropertyType] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);


    useEffect(() => {
        // Simulate loading delay
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    // New handler to open the premium details modal
    const openDetails = (property) => {
        openPropertyDetails(property);
    };

    // Filter Logic
    const filteredProperties = properties
        .filter(property => {
            const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                property.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLocation = selectedLocation === "All" || property.location.includes(selectedLocation);

            let matchesPrice = true;
            const priceVal = parseFloat(property.price.replace(/[^0-9.]/g, ''));
            if (priceRange === "Under 5 Cr") matchesPrice = priceVal < 5;
            if (priceRange === "5 Cr - 10 Cr") matchesPrice = priceVal >= 5 && priceVal <= 10;
            if (priceRange === "Above 10 Cr") matchesPrice = priceVal > 10;

            if (propertyType !== 'All' && property.tag !== propertyType) return false;

            return matchesSearch && matchesLocation && matchesPrice;
        })
        .sort((a, b) => {
            if (sortBy === 'priceLow') return parseInt(a.price.replace(/[^0-9]/g, '')) - parseInt(b.price.replace(/[^0-9]/g, ''));
            if (sortBy === 'priceHigh') return parseInt(b.price.replace(/[^0-9]/g, '')) - parseInt(a.price.replace(/[^0-9]/g, ''));
            return 0;
        });

    const locations = ["All", ...new Set(properties.map(p => p.location.split(', ')[1]))];

    return (
        <section className="py-24 px-6 relative bg-bg" id="properties">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto relative z-10">
                <div className="text-center mb-12">
                    {/* ... (Headings remain same, omitted for brevity) ... */}
                </div>

                {/* Search & Filter Bar */}
                <motion.div
                    variants={fadeIn('up', 'spring', 0.2, 0.8)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto mb-16 relative z-20"
                >
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-6">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search properties..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
                            />
                        </div>

                        {/* Advanced Search Button */}
                        <button
                            onClick={() => setIsAdvancedSearchOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-gold text-white font-semibold rounded-xl hover:shadow-glow-md transition-all duration-300 hover:scale-105"
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            Advanced Search
                        </button>

                        {/* Type Filter */}
                        <select
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value)}
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors"
                        >
                            <option value="All">All Types</option>
                            <option value="For Sale">For Sale</option>
                            <option value="For Rent">For Rent</option>
                            <option value="Featured">Featured</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent/50 transition-colors"
                        >
                            <option value="featured">Featured</option>
                            <option value="priceLow">Price: Low to High</option>
                            <option value="priceHigh">Price: High to Low</option>
                        </select>
                    </div>

                    {/* Advanced Search Modal */}
                    <AdvancedSearchModal
                        isOpen={isAdvancedSearchOpen}
                        onClose={() => setIsAdvancedSearchOpen(false)}
                    />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {(isLoading ? Array(6).fill({}) : filteredProperties).map((property, index) => (
                        <div key={isLoading ? `skeleton-${index}` : property.id} className="relative rounded-3xl overflow-hidden group">
                            <PropertyCard
                                property={property}
                                index={index}
                                isLoading={isLoading}
                                onOpenLightbox={() => openDetails(property)}
                                isFavorite={favorites.includes(property.id)}
                                onToggleFavorite={() => toggleFavorite(property.id)}
                                isCompareSelected={compareList.some(p => p.id === property.id)}
                                isCompareFull={compareList.length >= 3}
                                onToggleCompare={() => compareList.some(p => p.id === property.id) ? removeFromCompare(property.id) : addToCompare(property)}
                            />
                            {!isLoading && (
                                <BorderBeam
                                    duration={12}
                                    delay={9}
                                    size={300}
                                    colorFrom="#10b981"
                                    colorTo="#D4AF37"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Comparison Floating Drawer */}
                <AnimatePresence>
                    {compareList.length > 0 && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl flex items-center gap-6 w-[90%] max-w-2xl"
                        >
                            <div className="flex -space-x-4">
                                {compareList.map((p) => (
                                    <div key={p.id} className="w-12 h-12 rounded-full border-2 border-black overflow-hidden relative">
                                        <ImageWithFallback src={p.image} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {[...Array(3 - compareList.length)].map((_, i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-xs text-gray-500">
                                        +
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-semibold">{compareList.length} Selected to Compare</p>
                                <p className="text-xs text-gray-400">Select up to 3 properties</p>
                            </div>
                            <button
                                onClick={openCompareModal}
                                className="bg-accent hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg"
                            >
                                Compare Now
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="text-center mt-16 flex justify-center">
                    <Magnetic>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/buy')}
                            className="px-10 py-4 rounded-full border border-white/20 text-white hover:bg-white hover:text-bg transition-all duration-300 text-lg font-medium shadow-lg hover:shadow-white/20 flex items-center gap-2"
                        >
                            View All Properties
                            <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                        </motion.button>
                    </Magnetic>
                </div>
            </div>
        </section>
    );
};

export default PropertyGrid;
