import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ChevronDown, MapPin, Home, Building2, DollarSign, Calendar, Sparkles, Search } from 'lucide-react';

/**
 * AdvancedSearchModal - Comprehensive property search filters
 * Inspired by 99acres and NoBroker's advanced filtering systems
 */
const AdvancedSearchModal = ({ isOpen, onClose }) => {
    const [filters, setFilters] = useState({
        propertyType: [],
        priceRange: { min: '', max: '' },
        bedrooms: [],
        constructionStatus: [],
        furnishing: [],
        ageOfProperty: '',
        floorPreference: '',
        facing: '',
        amenities: []
    });

    const propertyTypes = ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial'];
    const bedroomOptions = ['1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
    const constructionStatuses = ['Ready to Move', 'Under Construction', 'New Launch'];
    const furnishingOptions = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];
    const ageOptions = ['New', '1-5 Years', '5-10 Years', '10+ Years'];
    const facingOptions = ['North', 'South', 'East', 'West', 'North-East', 'North-West', 'South-East', 'South-West'];
    const amenitiesOptions = ['Swimming Pool', 'Gym', 'Garden', 'Parking', 'Security', 'Power Backup', 'Lift', 'Club House'];

    const handleMultiSelect = (category, value) => {
        setFilters(prev => ({
            ...prev,
            [category]: prev[category].includes(value)
                ? prev[category].filter(item => item !== value)
                : [...prev[category], value]
        }));
    };

    const clearFilters = () => {
        setFilters({
            propertyType: [],
            priceRange: { min: '', max: '' },
            bedrooms: [],
            constructionStatus: [],
            furnishing: [],
            ageOfProperty: '',
            floorPreference: '',
            facing: '',
            amenities: []
        });
    };

    const applyFilters = () => {
        // Apply filters and close modal
        console.log('Applying filters:', filters);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-effect rounded-3xl border border-white/20 premium-shadow"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 glass-effect border-b border-white/10 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent/20 rounded-lg">
                                    <SlidersHorizontal className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white font-serif">Advanced Search</h2>
                                    <p className="text-sm text-gray-400">Find your perfect property</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Property Type */}
                        <FilterSection title="Property Type" icon={<Home className="w-5 h-5" />}>
                            <div className="flex flex-wrap gap-2">
                                {propertyTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => handleMultiSelect('propertyType', type)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filters.propertyType.includes(type)
                                                ? 'bg-accent text-white shadow-glow-sm'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Price Range */}
                        <FilterSection title="Price Range" icon={<DollarSign className="w-5 h-5" />}>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    placeholder="Min Price (₹)"
                                    value={filters.priceRange.min}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        priceRange: { ...prev.priceRange, min: e.target.value }
                                    }))}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
                                />
                                <input
                                    type="number"
                                    placeholder="Max Price (₹)"
                                    value={filters.priceRange.max}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        priceRange: { ...prev.priceRange, max: e.target.value }
                                    }))}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition-colors"
                                />
                            </div>
                        </FilterSection>

                        {/* Bedrooms */}
                        <FilterSection title="Bedrooms" icon={<Building2 className="w-5 h-5" />}>
                            <div className="flex flex-wrap gap-2">
                                {bedroomOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleMultiSelect('bedrooms', option)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filters.bedrooms.includes(option)
                                                ? 'bg-accent text-white shadow-glow-sm'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Construction Status */}
                        <FilterSection title="Construction Status" icon={<Calendar className="w-5 h-5" />}>
                            <div className="flex flex-wrap gap-2">
                                {constructionStatuses.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleMultiSelect('constructionStatus', status)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filters.constructionStatus.includes(status)
                                                ? 'bg-accent text-white shadow-glow-sm'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Furnishing */}
                        <FilterSection title="Furnishing Status" icon={<Sparkles className="w-5 h-5" />}>
                            <div className="flex flex-wrap gap-2">
                                {furnishingOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleMultiSelect('furnishing', option)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filters.furnishing.includes(option)
                                                ? 'bg-accent text-white shadow-glow-sm'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Amenities */}
                        <FilterSection title="Amenities" icon={<Sparkles className="w-5 h-5" />}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {amenitiesOptions.map((amenity) => (
                                    <label
                                        key={amenity}
                                        className="flex items-center gap-2 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors border border-white/10"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.amenities.includes(amenity)}
                                            onChange={() => handleMultiSelect('amenities', amenity)}
                                            className="w-4 h-4 accent-accent"
                                        />
                                        <span className="text-sm text-gray-300">{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </FilterSection>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 glass-effect border-t border-white/10 p-6">
                        <div className="flex gap-4">
                            <button
                                onClick={clearFilters}
                                className="flex-1 py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-300"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-accent to-gold text-white font-bold shadow-glow-md hover:shadow-glow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// Helper component for filter sections
const FilterSection = ({ title, icon, children }) => {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <div className="text-accent">{icon}</div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            {children}
        </div>
    );
};

export default AdvancedSearchModal;
