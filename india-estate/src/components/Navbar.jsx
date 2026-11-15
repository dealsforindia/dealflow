import React, { useState, useEffect } from 'react';
import { Menu, X, Smartphone, Home, Search, User, Phone, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navVariants } from '../utils/animations';
import { Link, useLocation } from 'react-router-dom';
import Magnetic from './animations/Magnetic';
import SnakeMenu from './SnakeMenu';
import useUIStore from '../store/useUIStore';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { openConsultation } = useUIStore();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHome = location.pathname === '/';

    return (
        <motion.nav
            variants={navVariants}
            initial="hidden"
            animate="show"
            className={`fixed w-full z-50 transition-all duration-500 ${scrolled || !isHome ? 'bg-bg/95 backdrop-blur-xl py-4 shadow-premium border-b border-white/20' : 'bg-transparent py-6'}`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link
                    to="/"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="flex items-center gap-2 text-2xl font-bold font-serif cursor-pointer z-50 group"
                >
                    <Home className="w-8 h-8 text-accent group-hover:text-gold transition-colors duration-300" />
                    <span className="text-white">Luxe<span className="text-gradient">India</span></span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-gray-300 font-medium z-40">
                    <Link to="/buy" className="relative hover:text-accent transition-colors duration-300 group">
                        Buy
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-gold group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link to="/rent" className="relative hover:text-accent transition-colors duration-300 group">
                        Rent
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-gold group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link to="/sell" className="relative hover:text-accent transition-colors duration-300 group">
                        Sell
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-gold group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <SnakeMenu />
                    <Link to="/agents" className="relative hover:text-accent transition-colors duration-300 group">
                        Agents
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-gold group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link to="/about" className="relative hover:text-accent transition-colors duration-300 group">
                        About
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-gold group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link to="/journal" className="relative hover:text-accent transition-colors duration-300 group">
                        Journal
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-gold group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link to="/contact" className="relative hover:text-accent transition-colors duration-300 group">
                        Contact
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-accent to-gold group-hover:w-full transition-all duration-300"></span>
                    </Link>

                    <button
                        className="bg-accent hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-glow-sm hover:shadow-glow-md"
                        onClick={() => openConsultation()}
                    >
                        Book Consultation
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden glass-effect border-t border-white/20 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4 text-gray-300">
                            <Link to="/buy" className="hover:text-accent" onClick={() => setIsOpen(false)}>Buy</Link>
                            <Link to="/rent" className="hover:text-accent" onClick={() => setIsOpen(false)}>Rent</Link>
                            <Link to="/sell" className="hover:text-accent" onClick={() => setIsOpen(false)}>Sell</Link>
                            <Link to="/agents" className="hover:text-accent" onClick={() => setIsOpen(false)}>Agents</Link>
                            <Link to="/about" className="hover:text-accent" onClick={() => setIsOpen(false)}>About</Link>
                            <Link to="/journal" className="hover:text-accent" onClick={() => setIsOpen(false)}>Journal</Link>
                            <Link to="/contact" className="hover:text-accent" onClick={() => setIsOpen(false)}>Contact</Link>
                            <button
                                className="bg-accent text-white px-6 py-3 rounded-full w-full"
                                onClick={() => { setIsOpen(false); openConsultation(); }}
                            >
                                Book Consultation
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
