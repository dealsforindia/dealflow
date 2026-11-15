import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, HelpCircle, ArrowRight, UserPlus, MessageSquare, Bus, Building, QrCode } from 'lucide-react';
import { CallbackModal, PartnerModal, FeedbackModal } from '../components/FeatureModals';
import axios from 'axios';
import { toast } from 'react-toastify';
import Globe from '../components/animations/Globe';


const Contact = () => {
    const [isCallbackOpen, setIsCallbackOpen] = useState(false);
    const [isPartnerOpen, setIsPartnerOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    // 5. Live Support Status
    const [isSupportOnline] = useState(true);

    return (
        <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">


            {/* 5. Support Status Indicator (Fixed) */}
            <div className="fixed top-24 right-6 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full ${isSupportOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-xs font-bold text-white">{isSupportOnline ? 'Support Online' : 'Support Offline'}</span>
            </div>

            {/* 3D Globe Background - Moved to negative z-index to prevent blocking */}
            <div className="absolute top-0 right-0 w-full h-full z-0 pointer-events-none overflow-hidden flex justify-end items-center opacity-30 md:opacity-50 mt-20">
                <div className="w-[800px] h-[800px] pointer-events-auto">
                    <Globe size={800} />
                </div>
            </div>

            <div className="container mx-auto px-6 relative z-10">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                    <div className="space-y-8">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">Let's <span className="text-accent">Talk</span></h1>
                            <p className="text-gray-400 text-lg max-w-md">Whether you're looking to buy, sell, or invest, our team of experts is ready to assist you.</p>
                        </motion.div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors">
                                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Headquarters</h3>
                                    <p className="text-gray-400">12th Floor, Trade Center, BKC<br />Mumbai, Maharashtra 400051</p>
                                    <button onClick={() => window.open('https://maps.google.com', '_blank')} className="text-accent text-sm font-bold mt-2 flex items-center gap-1 hover:underline">
                                        Get Directions <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors">
                                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-lg">Phone Support</h3>
                                    <p className="text-gray-400">+91 22 5555 0199</p>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => setIsCallbackOpen(true)}
                                            className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                        >
                                            Request Callback
                                        </button>

                                        {/* 2. WhatsApp Direct CTA */}
                                        <button className="px-4 py-2 bg-[#25D366] text-white text-sm font-bold rounded-lg hover:opacity-90 transition-colors flex items-center gap-2">
                                            <MessageCircle className="w-4 h-4" /> WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] -z-10" />
                        <h3 className="text-2xl font-bold text-white mb-6">Send us a message</h3>
                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            toast.success("Message sent successfully! We'll get back to you shortly.");
                            e.target.reset();
                        }}>
                            <div className="grid grid-cols-2 gap-4">
                                <input required type="text" placeholder="First Name" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none" />
                                <input required type="text" placeholder="Last Name" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none" />
                            </div>
                            <input required type="email" placeholder="Email Address" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none" />
                            <textarea required rows="4" placeholder="How can we help?" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-accent outline-none"></textarea>
                            <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                Send Message <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* 3. Office Locator Map (Interactive Placeholder) */}
                <div className="h-96 rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 relative mb-12 group">
                    <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&q=80" alt="Map" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                        <button className="px-6 py-3 bg-white text-black font-bold rounded-full shadow-lg flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-accent" /> Find Nearest Office
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {/* 6. Partner with Us */}
                    <div
                        onClick={() => setIsPartnerOpen(true)}
                        className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 cursor-pointer transition-all hover:-translate-y-1"
                    >
                        <UserPlus className="w-8 h-8 text-blue-400 mb-4" />
                        <h4 className="text-white font-bold mb-1">Partner With Us</h4>
                        <p className="text-sm text-gray-400">Join our network of builders & agents</p>
                    </div>

                    {/* 7. Feedback Form */}
                    <div
                        onClick={() => setIsFeedbackOpen(true)}
                        className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 cursor-pointer transition-all hover:-translate-y-1"
                    >
                        <MessageSquare className="w-8 h-8 text-yellow-400 mb-4" />
                        <h4 className="text-white font-bold mb-1">Feedback</h4>
                        <p className="text-sm text-gray-400">Help us improve our services</p>
                    </div>

                    {/* 4. FAQ Search Link */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 cursor-pointer transition-all hover:-translate-y-1">
                        <HelpCircle className="w-8 h-8 text-purple-400 mb-4" />
                        <h4 className="text-white font-bold mb-1">Help Center</h4>
                        <p className="text-sm text-gray-400">Browse FAQs and guides</p>
                    </div>

                    {/* 10. QR Code Contact */}
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 cursor-pointer transition-all hover:-translate-y-1 flex flex-col items-center text-center">
                        <QrCode className="w-8 h-8 text-white mb-4" />
                        <h4 className="text-white font-bold mb-1">Scan to Chat</h4>
                        <p className="text-sm text-gray-400">Connect instantly on mobile</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 9. Department Directory */}
                    <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Building className="w-5 h-5 text-accent" /> Department Directory
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Sales', email: 'sales@indiaestate.com', phone: 'Ext 101' },
                                { name: 'Rentals', email: 'rent@indiaestate.com', phone: 'Ext 102' },
                                { name: 'Legal', email: 'legal@indiaestate.com', phone: 'Ext 105' }
                            ].map((dept, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                                    <span className="text-white font-medium">{dept.name}</span>
                                    <div className="text-right text-sm text-gray-400">
                                        <div>{dept.email}</div>
                                        <div>{dept.phone}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 8. Transport Options Guide */}
                    <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Bus className="w-5 h-5 text-accent" /> Getting Here
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">M</div>
                                <div>
                                    <div className="text-white font-bold">Metro</div>
                                    <div className="text-sm text-gray-400">BKC Station (Aqua Line) - 5 mins walk</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">A</div>
                                <div>
                                    <div className="text-white font-bold">Airport</div>
                                    <div className="text-sm text-gray-400">CSIA T2 - 20 mins drive</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <CallbackModal isOpen={isCallbackOpen} onClose={() => setIsCallbackOpen(false)} />
            <PartnerModal isOpen={isPartnerOpen} onClose={() => setIsPartnerOpen(false)} />
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
        </div>
    );
};

export default Contact;
