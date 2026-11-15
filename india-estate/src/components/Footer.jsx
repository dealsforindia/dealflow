import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Home, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Magnetic from './animations/Magnetic';
import { footerVariants } from '../utils/animations';
import { toast } from 'sonner';

const Footer = () => {
    return (
        <motion.footer
            variants={footerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="bg-[#030712] text-gray-400 font-light border-t border-white/10 relative overflow-hidden"
        >
            {/* Elegant Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
            </div>

            <div className="container mx-auto px-6 pt-24 pb-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    <div className="space-y-8">
                        <a href="#" className="flex items-center gap-2 text-3xl font-bold font-serif text-white group">
                            <Home className="w-8 h-8 text-[#D4AF37] group-hover:text-accent transition-colors duration-300" />
                            <span>Luxe<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-[#D4AF37] to-accent">India</span></span>
                        </a>
                        <p className="text-lg leading-relaxed text-gray-500 max-w-xs">
                            Curating the finest real estate experiences for the world's most discerning clientele.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <Magnetic key={i}>
                                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-accent hover:text-white transition-all duration-300 border border-white/10 hover:border-accent">
                                        <Icon className="w-4 h-4" />
                                    </a>
                                </Magnetic>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white text-lg font-serif font-bold mb-8">Quick Access</h4>
                        <ul className="space-y-4">
                            {['Properties', 'Agents', 'Sell', 'About Us', 'Contact'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-500 hover:text-[#D4AF37] hover:translate-x-2 transition-all inline-flex items-center gap-2 group">
                                        <span className="w-0 h-0.5 bg-[#D4AF37] group-hover:w-4 transition-all duration-300"></span>
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-lg font-serif font-bold mb-8">Concierge</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4">
                                <MapPin className="w-6 h-6 text-[#D4AF37] shrink-0 mt-1" />
                                <span className="leading-relaxed">One BKC, Bandra Kurla Complex, Mumbai, Maharashtra 400051</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone className="w-6 h-6 text-[#D4AF37] shrink-0" />
                                <span>+91 7003996685</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail className="w-6 h-6 text-[#D4AF37] shrink-0" />
                                <span>concierge@luxeindia.com</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-lg font-serif font-bold mb-8">The Insider</h4>
                        <p className="text-gray-500 mb-6">Join our exclusive circle for off-market listings and market insights.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                            />
                            <button
                                onClick={() => toast.success("Welcome to the Inner Circle! 🥂")}
                                className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-accent to-[#D4AF37] hover:from-[#D4AF37] hover:to-accent text-black font-bold rounded-md px-6 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
                    <p>&copy; 2026 LuxeIndia Estates. A Division of Prestige Group.</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <a href="#" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-[#D4AF37] transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-[#D4AF37] transition-colors">Sitemap</a>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;
