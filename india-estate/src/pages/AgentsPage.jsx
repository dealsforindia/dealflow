import React, { useState } from 'react';
import useUIStore from '../store/useUIStore';
import { motion } from 'framer-motion';
import { Search, MapPin, Phone, Mail, Star, Award } from 'lucide-react';
import ImageWithFallback from '../components/ImageWithFallback';
import TiltedCard from '../components/animations/TiltedCard';

const staffMembers = [
    {
        id: 1,
        name: "Rajesh Malhotra",
        role: "Senior Estate Manager",
        location: "Mumbai",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        deals: 120
    },
    {
        id: 2,
        name: "Priya Sharma",
        role: "Luxury Villa Specialist",
        location: "Goa",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.8,
        deals: 85
    },
    {
        id: 3,
        name: "Vikram Singh",
        role: "Commercial Real Estate",
        location: "Delhi NCR",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 5.0,
        deals: 200
    },
    {
        id: 4,
        name: "Ananya Desai",
        role: "Residential Consultant",
        location: "Bangalore",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.7,
        deals: 60
    },
    {
        id: 5,
        name: "Arjun Reddy",
        role: "Land Acquisition Lead",
        location: "Hyderabad",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.9,
        deals: 150
    },
    {
        id: 6,
        name: "Meera Kapoor",
        role: "Interior Design Partner",
        location: "Mumbai",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        rating: 4.8,
        deals: 40
    }
];

const AgentsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredAgents = staffMembers.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-serif font-bold mb-6 text-white"
                    >
                        Meet Our Experts
                    </motion.h1>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-10">
                        Our team of certified professionals is dedicated to finding you the perfect property. With decades of combined experience, you are in safe hands.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-md mx-auto relative">
                        <input
                            type="text"
                            placeholder="Search by name or city..."
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-12 text-white outline-none focus:border-accent transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                </div>

                {/* Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAgents.map((agent, index) => (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-card/50 border border-white/5 rounded-2xl overflow-hidden hover:border-accent/30 transition-all hover:shadow-2xl hover:shadow-accent/5 group"
                        >
                            <div className="relative h-[280px] w-full bg-black/20">
                                <TiltedCard
                                    imageSrc={agent.image}
                                    altText={agent.name}
                                    captionText={agent.role}
                                    containerHeight="280px"
                                    containerWidth="100%"
                                    imageHeight="280px"
                                    imageWidth="100%"
                                    rotateAmplitude={10}
                                    scaleOnHover={1.05}
                                    showMobileWarning={false}
                                    showTooltip={true}
                                    displayOverlayContent={true}
                                    overlayContent={
                                        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent">
                                            <h3 className="text-xl font-bold text-white font-serif">{agent.name}</h3>
                                            <p className="text-accent text-sm font-medium">{agent.role}</p>
                                        </div>
                                    }
                                />
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-accent" />
                                        {agent.location}
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        {agent.rating}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-400 border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-1">
                                        <Award className="w-4 h-4 text-accent" />
                                        {agent.deals} Deals Closed
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-white/5">
                                        <Phone className="w-4 h-4" /> Call
                                    </button>
                                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-white/5">
                                        <Mail className="w-4 h-4" /> Email
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Join CTA */}
                <div className="mt-20 bg-accent/10 border border-accent/20 rounded-3xl p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <h2 className="text-3xl font-serif font-bold text-white mb-4 relative z-10">Are you a Real Estate Titan?</h2>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto relative z-10">
                        Join India's most prestigious real estate network. We provide the leads, the technology, and the brand. You bring the expertise.
                    </p>
                    <button
                        className="bg-accent hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-full transition-colors relative z-10 shadow-lg"
                        onClick={() => useUIStore.getState().openAgentModal()}
                    >
                        Apply Now
                    </button>
                    {/* Add extra padding to ensure content isn't cut off */}
                    <div className="h-4"></div>
                </div>
            </div>
        </div>
    );
};
export default AgentsPage;
