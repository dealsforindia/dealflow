import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, staggerContainer, textVariant } from '../utils/animations';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Search, Calendar, MapPin, Bed, Bath, Wifi, Car, Coffee, ShieldCheck, FileText, Bus, Dog, Sofa, Star, Zap, DollarSign } from 'lucide-react';
import { ChecklistModal, AgreementModal, LandlordRatingModal } from '../components/FeatureModals';

const rentals = [
    {
        id: 1,
        title: "Sunset Villa",
        location: "Anjuna, Goa",
        price: "₹45,000 / night",
        beds: 4,
        amenities: [Wifi, Car, Coffee],
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        pets: true,
        rating: 4.8
    },
    {
        id: 2,
        title: "Urban Loft",
        location: "Koramangala, Bangalore",
        price: "₹12,000 / night",
        beds: 2,
        amenities: [Wifi, Coffee],
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        pets: false,
        rating: 4.5
    },
    {
        id: 3,
        title: "Himalayan Retreat",
        location: "Manali, HP",
        price: "₹25,000 / night",
        beds: 3,
        amenities: [Wifi, Car, Coffee],
        image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        pets: true,
        rating: 4.9
    },
    {
        id: 4,
        title: "Lakeview Cottage",
        location: "Udaipur, Rajasthan",
        price: "₹35,000 / night",
        beds: 3,
        amenities: [Wifi, Car],
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        pets: true,
        rating: 4.7
    },
    {
        id: 5,
        title: "Sky High Penthouse",
        location: "Bandra, Mumbai",
        price: "₹60,000 / night",
        beds: 4,
        amenities: [Wifi, Car, Coffee],
        image: "https://images.unsplash.com/photo-1502005229766-939cb934fc45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        pets: false,
        rating: 4.9
    },
    {
        id: 6,
        title: "Forest Cabin",
        location: "Coorg, Karnataka",
        price: "₹18,000 / night",
        beds: 2,
        amenities: [Wifi, Coffee],
        image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        pets: true,
        rating: 4.6
    }
];

const Rent = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);

    // Feature States
    const [isAgreementOpen, setIsAgreementOpen] = useState(false);
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    return (
        <div className="pt-24 min-h-screen pb-20 px-6 relative">

            {/* 2. Live Rents Ticker of Recent Activity */}
            <div className="absolute top-20 left-0 right-0 h-8 bg-black/40 backdrop-blur-sm border-y border-white/5 flex items-center overflow-hidden whitespace-nowrap z-0">
                <div className="animate-marquee flex gap-12 text-xs text-gray-400">
                    <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-400" /> Just Rented: 3BHK in Indiranagar - ₹45k</span>
                    <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-400" /> New Listing: Villa in Goa - ₹1.2L</span>
                    <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-400" /> Price Drop: Office in BKC - 10% Off</span>
                    <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-yellow-400" /> Trending: Co-living spaces in Pune</span>
                </div>
            </div>

            <div className="container mx-auto mt-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <motion.h1
                            variants={textVariant(0.2)}
                            initial="hidden"
                            animate="show"
                            className="text-4xl md:text-5xl font-serif font-bold text-white mb-4"
                        >
                            Luxury Rentals
                        </motion.h1>
                        <motion.p
                            variants={fadeIn('up', 'spring', 0.4, 0.6)}
                            initial="hidden"
                            animate="show"
                            className="text-gray-400 max-w-xl"
                        >
                            Experience the finest homes in India for your short-term stays. Curated for comfort and style.
                        </motion.p>

                        {/* 10. Popular Rental Areas Chips */}
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                            {['Bandra West', 'Indiranagar', 'Vagator', 'DLF Cyber City'].map(area => (
                                <button key={area} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 hover:bg-accent hover:text-white transition-colors">
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Filter & Tools */}
                    <div className="flex flex-col gap-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 border-r border-white/10">
                                <Calendar className="text-accent w-5 h-5" />
                                <DatePicker
                                    selected={startDate}
                                    onChange={handleDateChange}
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectsRange
                                    placeholderText="Select dates"
                                    className="bg-transparent text-white focus:outline-none w-48"
                                />
                            </div>
                            <button className="bg-accent hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold transition-colors">
                                Check
                            </button>
                        </div>

                        {/* 4. Agreement Generator Button */}
                        <button
                            onClick={() => setIsAgreementOpen(true)}
                            className="flex items-center justify-center gap-2 py-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                        >
                            <FileText className="w-4 h-4 text-accent" /> Generate Agreement
                        </button>
                    </div>
                </div>

                {/* 1. Rent Affordability Calculator Section */}
                <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-gray-900 to-black border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-400" /> Rent Budget Calculator
                        </h3>
                        <p className="text-sm text-gray-400">Not sure how much you should spend? Calculate your ideal rent.</p>
                    </div>
                    {showCalculator ? (
                        <div className="flex gap-4 items-center animate-in slide-in-from-right">
                            <input type="number" placeholder="Monthly Salary" className="bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white outline-none w-40" />
                            <div className="text-white font-bold">= ₹25,000</div>
                            <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-white text-xs">Close</button>
                        </div>
                    ) : (
                        <button onClick={() => setShowCalculator(true)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-colors">
                            Calculate Now
                        </button>
                    )}
                </div>

                <motion.div
                    variants={staggerContainer(0.1, 0.2)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {rentals.map((rental, i) => (
                        <motion.div
                            key={rental.id}
                            variants={fadeIn('up', 'spring', i * 0.1, 0.5)}
                            className="group bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-accent/50 transition-all hover:shadow-2xl hover:shadow-accent/5"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img src={rental.image} alt={rental.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-semibold border border-white/20">
                                    {rental.price}
                                </div>
                                {/* 6. Pet Policy Badge */}
                                {rental.pets && (
                                    <div className="absolute top-4 left-4 bg-green-500/20 backdrop-blur-md px-2 py-1 rounded-md text-green-400 text-xs font-bold border border-green-500/30 flex items-center gap-1">
                                        <Dog className="w-3 h-3" /> Pet Friendly
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-xl font-bold font-serif text-white">{rental.title}</h3>
                                    {/* 9. Landlord Rating System Trigger */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsRatingOpen(true); }}
                                        className="flex items-center gap-1 text-xs text-yellow-500 hover:bg-yellow-500/10 px-2 py-0.5 rounded transition-colors"
                                    >
                                        <Star className="w-3 h-3 fill-current" /> {rental.rating}
                                    </button>
                                </div>
                                <div className="flex items-center text-gray-400 text-sm mb-4">
                                    <MapPin className="w-4 h-4 mr-1 text-accent" />
                                    {rental.location}
                                </div>

                                {/* 5. Local Transport Guide (Quick Info) */}
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 bg-white/5 p-2 rounded-lg">
                                    <div className="flex items-center gap-1"><Bus className="w-3 h-3" /> 500m to Metro</div>
                                    <div className="flex items-center gap-1"><Car className="w-3 h-3" /> Cab Zone</div>
                                </div>

                                <div className="flex gap-4 border-t border-white/10 pt-4 text-gray-400 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Bed className="w-4 h-4" /> {rental.beds} Beds
                                    </div>
                                    {rental.amenities.map((Icon, idx) => (
                                        <div key={idx} className="flex items-center gap-1">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                    ))}
                                    {/* 7. Furnishing Cost Estimator Trigger */}
                                    <div className="ml-auto" title="Furnishing Estimate">
                                        <Sofa className="w-4 h-4 text-gray-500 hover:text-accent cursor-pointer" />
                                    </div>
                                </div>

                                {/* 8. Schedule Visit Button (Enhanced) */}
                                <div className="grid grid-cols-2 gap-2 mt-6">
                                    <button className="bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-lg font-semibold transition-all border border-white/5 text-sm">
                                        Book Now
                                    </button>
                                    <button
                                        onClick={() => setIsChecklistOpen(true)}
                                        className="bg-accent hover:bg-emerald-600 text-white py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-1"
                                    >
                                        <ShieldCheck className="w-4 h-4" /> Inspection
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* 3. Tenant Checklist Floating Action (Mobile) */}
                <div className="fixed bottom-24 left-6 z-50 md:hidden">
                    <button
                        onClick={() => setIsChecklistOpen(true)}
                        className="p-3 bg-gray-800 text-white rounded-full shadow-lg border border-white/20"
                    >
                        <ShieldCheck className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Modals */}
            <ChecklistModal isOpen={isChecklistOpen} onClose={() => setIsChecklistOpen(false)} />
            <AgreementModal isOpen={isAgreementOpen} onClose={() => setIsAgreementOpen(false)} />
            <LandlordRatingModal isOpen={isRatingOpen} onClose={() => setIsRatingOpen(false)} />
        </div>
    );
};

export default Rent;
