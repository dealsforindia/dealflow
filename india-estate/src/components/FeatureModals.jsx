import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Play, Map, MessageCircle, FileText, CheckCircle, UserCheck, Calculator, Search, Camera, Briefcase, Phone, Handshake, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

// Generic Modal Wrapper
const ModalWrapper = ({ isOpen, onClose, title, children, icon: Icon }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-lg bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent sticky top-0 z-10 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            {Icon && <div className="p-2 bg-accent/20 rounded-lg text-accent"><Icon className="w-5 h-5" /></div>}
                            <h3 className="text-xl font-serif font-bold text-white">{title}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// 1. Area Report Modal
export const AreaReportModal = ({ isOpen, onClose, location }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Download Area Report" icon={FileText}>
        <div className="space-y-4">
            <p className="text-gray-300">Get detailed insights about <strong>{location || 'this location'}</strong> including price trends, upcoming infra, and more.</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
                {['Price History', 'Rental Yield', 'Infra Projects', 'Demographics'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-accent" /> {item}
                    </div>
                ))}
            </div>
            <button
                onClick={() => {
                    toast.info("Generating PDF Report...");
                    setTimeout(() => {
                        toast.success("Area Report Downloaded Successfully!");
                        onClose();
                    }, 2000);
                }}
                className="w-full py-3 bg-accent hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
                <Download className="w-4 h-4" /> Download PDF Report (Free)
            </button>
            <p className="text-xs text-center text-gray-500">Sent instantly to your registered email.</p>
        </div>
    </ModalWrapper>
);

// 2. Video Tour Modal
export const VideoTourModal = ({ isOpen, onClose, propertyTitle }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Virtual Video Tour" icon={Play}>
        <div className="aspect-video bg-black rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
            </div>
            <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"
                alt="Video Thumbnail"
                className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-medium truncate">{propertyTitle}</p>
                <div className="h-1 bg-white/30 rounded-full mt-2 overflow-hidden">
                    <div className="h-full w-1/3 bg-accent" />
                </div>
            </div>
        </div>
        <div className="mt-4 flex gap-2">
            <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                Schedule Live Tour
            </button>
            <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                Share Video
            </button>
        </div>
    </ModalWrapper>
);

// 3. Locality Map Modal
export const LocalityMapModal = ({ isOpen, onClose, location }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Neighborhood Guide" icon={Map}>
        <div className="space-y-4">
            <div className="h-48 bg-gray-800 rounded-xl overflow-hidden relative">
                <img
                    src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&q=80"
                    alt="Map"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <Map className="w-8 h-8 text-accent mb-2" />
                    <p className="text-white font-bold">Interactive Map Loading...</p>
                </div>
            </div>
            <div className="space-y-2">
                <h4 className="text-white font-medium">Nearby Highlights</h4>
                {[
                    { label: 'Schools', value: '4 Top Rated', color: 'blue' },
                    { label: 'Hospitals', value: '2 Multi-specialty', color: 'red' },
                    { label: 'Metro Station', value: '0.5 km away', color: 'green' }
                ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-300 text-sm">{item.label}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${item.color}-500/10 text-${item.color}-400`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </ModalWrapper>
);

// 4. Inquiry Modal
export const InquiryModal = ({ isOpen, onClose }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Quick Inquiry" icon={MessageCircle}>
        <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const loading = toast.loading("Sending inquiry...");
            setTimeout(() => {
                toast.update(loading, { render: "Inquiry Sent! An agent will contact you soon.", type: "success", isLoading: false, autoClose: 3000 });
                onClose();
            }, 1500);
        }}>
            <div>
                <label className="block text-xs text-gray-400 mb-1">I am interested in</label>
                <div className="flex gap-2">
                    {['Buying', 'Selling', 'Renting'].map(opt => (
                        <label key={opt} className="flex-1 cursor-pointer">
                            <input type="radio" name="interest" className="peer sr-only" />
                            <div className="text-center py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 peer-checked:bg-accent peer-checked:text-white peer-checked:border-accent transition-all">
                                {opt}
                            </div>
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Your Details</label>
                <input type="text" required placeholder="Name" className="w-full mb-2 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-accent outline-none" />
                <input type="text" required placeholder="Phone Number" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-accent outline-none" />
            </div>
            <div>
                <label className="block text-xs text-gray-400 mb-1">Message</label>
                <textarea placeholder="Tell us what you're looking for..." rows="3" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:border-accent outline-none"></textarea>
            </div>
            <button className="w-full py-3 bg-accent hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
                Send Inquiry
            </button>
        </form>
    </ModalWrapper>
);

// 5. Checklist Modal
export const ChecklistModal = ({ isOpen, onClose }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Tenant Checklist" icon={CheckCircle}>
        <div className="space-y-4">
            <p className="text-gray-300">Essential things to check before moving in.</p>
            <div className="space-y-2">
                {['Check water pressure & leaks', 'Verify electrical outlets', 'Inspect locks & security', 'Test appliances', 'Read lease terms carefully'].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-sm text-gray-300">{item}</span>
                    </div>
                ))}
            </div>
            <button
                onClick={() => toast.success("Checklist PDF Downloaded!")}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm"
            >
                Download as PDF
            </button>
        </div>
    </ModalWrapper>
);

// 6. Agreement Generator Modal
export const AgreementModal = ({ isOpen, onClose }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Rental Agreement" icon={FileText}>
        <div className="space-y-4 text-center">
            <div className="p-4 bg-accent/10 rounded-full inline-block mb-2">
                <FileText className="w-8 h-8 text-accent" />
            </div>
            <h4 className="text-lg font-bold text-white">Generate Instant Agreement</h4>
            <p className="text-sm text-gray-400">Create a legally valid rental agreement in minutes. E-stamp and delivery included.</p>
            <div className="grid grid-cols-2 gap-3 text-left">
                <input type="text" placeholder="Landlord Name" className="bg-black/20 border border-white/10 rounded p-2 text-sm text-white" />
                <input type="text" placeholder="Tenant Name" className="bg-black/20 border border-white/10 rounded p-2 text-sm text-white" />
            </div>
            <button
                onClick={() => {
                    const id = toast.loading("Drafting Agreement...");
                    setTimeout(() => toast.update(id, { render: "Agreement Ready! Sent to your email.", type: "success", isLoading: false, autoClose: 3000 }), 2000);
                }}
                className="w-full py-3 bg-accent hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
            >
                Start Drafting (Free)
            </button>
        </div>
    </ModalWrapper>
);

// 7. Landlord Rating Modal
export const LandlordRatingModal = ({ isOpen, onClose }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Rate Landlord" icon={UserCheck}>
        <div className="space-y-4">
            <p className="text-gray-300 text-sm">Share your experience to help future tenants.</p>
            <div className="flex justify-center gap-2 text-2xl text-yellow-500">
                {'★'.repeat(5)}
            </div>
            <textarea placeholder="Write a review..." rows="3" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-accent outline-none"></textarea>
            <button
                onClick={() => toast.success("Thank you for your review!")}
                className="w-full py-3 bg-accent text-white font-bold rounded-xl"
            >
                Submit Review
            </button>
        </div>
    </ModalWrapper>
);

// 8. Valuation Modal
export const ValuationModal = ({ isOpen, onClose }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Instant Valuation" icon={Calculator}>
        <div className="space-y-4">
            <p className="text-gray-300 text-sm">Get an AI-generated price estimate for your property.</p>
            <div className="space-y-3">
                <input type="text" placeholder="Enter Locality" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm" />
                <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Area (sq.ft)" className="bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm" />
                    <select className="bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm">
                        <option>2 BHK</option>
                        <option>3 BHK</option>
                        <option>Villa</option>
                    </select>
                </div>
            </div>
            <button
                onClick={() => toast.success("Valuation Report sent to your email!")}
                className="w-full py-3 bg-accent hover:bg-emerald-600 text-white font-bold rounded-xl"
            >
                Get Estimate
            </button>
        </div>
    </ModalWrapper>
);

// 9. Inspection Modal
export const InspectionModal = ({ isOpen, onClose }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Schedule Inspection" icon={Camera}>
        <div className="space-y-4">
            <div className=" bg-accent/10 p-4 rounded-xl text-center">
                <p className="text-accent font-bold">Free Professional Photoshoot 📸</p>
                <p className="text-xs text-gray-400">Included with inspection visit</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <input type="date" className="bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm" />
                <input type="time" className="bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm" />
            </div>
            <button
                onClick={() => toast.success("Inspection confirmed! Expert will call shortly.")}
                className="w-full py-3 bg-white text-black font-bold rounded-xl border border-transparent hover:bg-gray-200"
            >
                Confirm Visit
            </button>
        </div>
    </ModalWrapper>
);

// 10. Agent Search Modal
export const AgentSearchModal = ({ isOpen, onClose }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Find Local Agent" icon={Search}>
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
                <input type="text" placeholder="Search by area or name..." className="w-full pl-10 bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm" />
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-accent/30 cursor-pointer">
                        <div className="w-10 h-10 bg-gray-700 rounded-full" />
                        <div>
                            <h4 className="text-white font-bold text-sm">Estate Partner {i}</h4>
                            <p className="text-xs text-gray-400">XP: 5 Years • 4.8 ★</p>
                        </div>
                        <button
                            onClick={() => toast.success(`Contact shared with Agent!`)}
                            className="ml-auto text-xs bg-accent/10 text-accent px-2 py-1 rounded"
                        >
                            Select
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </ModalWrapper>
);

// 11. Careers Modal (About)
export const CareersModal = ({ isOpen, onClose }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Join Our Team" icon={Briefcase}>
        <div className="space-y-4">
            <p className="text-gray-300">We are always looking for talent. Current openings:</p>
            <div className="space-y-2">
                {['Senior Estate Agent', 'Marketing Manager', 'Tech Lead'].map(job => (
                    <div key={job} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-white text-sm">{job}</span>
                        <button
                            onClick={() => toast.success("Application Submitted!")}
                            className="text-xs bg-accent px-3 py-1 rounded text-white"
                        >
                            Apply
                        </button>
                    </div>
                ))}
            </div>
            <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-gray-400 mb-2">Or email your resume to careers@indiaestate.com</p>
            </div>
        </div>
    </ModalWrapper>
);

// 12. Schedule Callback Modal (Contact)
export const CallbackModal = ({ isOpen, onClose }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Request a Call" icon={Phone}>
        <div className="space-y-4">
            <p className="text-gray-300 text-sm">We'll call you back within 30 minutes.</p>
            <input type="text" placeholder="Your Name" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm" />
            <input type="text" placeholder="Phone Number" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm" />
            <button
                onClick={() => toast.success("Callback Scheduled! Expect a ring soon.")}
                className="w-full py-3 bg-accent text-white font-bold rounded-xl"
            >
                Schedule Call
            </button>
        </div>
    </ModalWrapper>
);

// 13. Partner Modal (Contact)
export const PartnerModal = ({ isOpen, onClose }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Partner With Us" icon={Handshake}>
        <div className="space-y-4">
            <p className="text-gray-300 text-sm">Join our network of builders and agents.</p>
            <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-accent text-center">
                    <span className="block text-white font-bold">Builder</span>
                </button>
                <button className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-accent text-center">
                    <span className="block text-white font-bold">Broker</span>
                </button>
            </div>
            <input type="email" placeholder="Official Email Info" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm" />
            <button
                onClick={() => toast.success("Thanks! Our partnership team will contact you.")}
                className="w-full py-3 bg-white text-black font-bold rounded-xl"
            >
                Submit Interest
            </button>
        </div>
    </ModalWrapper>
);

// 14. Feedback Modal (Contact)
export const FeedbackModal = ({ isOpen, onClose }) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Send Feedback" icon={MessageSquare}>
        <div className="space-y-4">
            <p className="text-gray-300 text-sm">Help us improve your experience.</p>
            <div className="flex justify-center gap-3">
                {['😠', '😐', '🙂', '😍'].map(emoji => (
                    <button key={emoji} className="text-2xl hover:scale-125 transition-transform">{emoji}</button>
                ))}
            </div>
            <textarea placeholder="Your comments..." rows="3" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-accent outline-none"></textarea>
            <button
                onClick={() => toast.success("Feedback sent! We appreciate it.")}
                className="w-full py-3 bg-accent text-white font-bold rounded-xl"
            >
                Send Feedback
            </button>
        </div>
    </ModalWrapper>
);
