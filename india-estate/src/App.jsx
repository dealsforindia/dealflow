import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BookConsultationModal from './components/BookConsultationModal';
import SellPropertyModal from './components/SellPropertyModal';
import JoinAgentModal from './components/JoinAgentModal';
import PropertyDetailsModal from './components/PropertyDetailsModal';
import MortgageCalculatorModal from './components/MortgageCalculatorModal';
import CompareModal from './components/CompareModal';
import ArticleModal from './components/ArticleModal';
import ScrollToTop from './components/ScrollToTop';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import SmartChat from './components/SmartChat';
import ClickSpark from './components/animations/ClickSpark';
import Preloader from './components/Preloader';


import { Home as HomeIcon, Search, Key, Percent, Users, MessageCircle } from 'lucide-react';

// Pages
import Home from './pages/Home';
import Buy from './pages/Buy';
import Rent from './pages/Rent';
import Sell from './pages/Sell';
import AgentsPage from './pages/AgentsPage';
import About from './pages/About';

import Contact from './pages/Contact';
import Journal from './pages/Journal';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import TechDemo from './pages/TechDemo';

// Modern Libraries
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';

// Initialize Query Client
const queryClient = new QueryClient();

// Smooth Scrolling with Lenis
import Lenis from '@studio-freight/lenis';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import PageTransition from './components/PageTransition';

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/buy" element={<PageTransition><Buy /></PageTransition>} />
                <Route path="/rent" element={<PageTransition><Rent /></PageTransition>} />
                <Route path="/sell" element={<PageTransition><Sell /></PageTransition>} />
                <Route path="/agents" element={<PageTransition><AgentsPage /></PageTransition>} />
                <Route path="/about" element={<PageTransition><About /></PageTransition>} />
                <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                <Route path="/journal" element={<PageTransition><Journal /></PageTransition>} />

                {/* Demo Page */}
                <Route path="/demo" element={<PageTransition><TechDemo /></PageTransition>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/properties" element={<AdminProperties />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    // Disabled Lenis smooth scroll to eliminate delay - using native browser scroll
    // The CSS scroll-behavior: smooth in index.css still provides smooth scrolling
    // without the delay issues

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <ScrollToTop />
                    <Preloader />
                    <ScrollProgress />
                    <CustomCursor />
                    <ClickSpark
                        sparkColor='#fff'
                        sparkSize={10}
                        sparkRadius={15}
                        sparkCount={8}
                        duration={400}
                    >
                        <div className="min-h-screen bg-bg text-gray-100 font-sans selection:bg-accent selection:text-white">
                            <Navbar />

                            <AnimatedRoutes />

                            <Footer />
                            <BookConsultationModal />
                            <SellPropertyModal />
                            <JoinAgentModal />
                            <PropertyDetailsModal />
                            <MortgageCalculatorModal />
                            <CompareModal />
                            <ArticleModal />

                            {/* Legacy Toastify + New Sonner */}
                            <ToastContainer position="bottom-right" theme="dark" />
                            <Toaster position="top-center" richColors />

                            {/* Smart Chat & Back to Top */}
                            <SmartChat />
                            <BackToTop />

                        </div>
                    </ClickSpark>
                </Router>
            </QueryClientProvider>
        </HelmetProvider>
    );
}

export default App;
