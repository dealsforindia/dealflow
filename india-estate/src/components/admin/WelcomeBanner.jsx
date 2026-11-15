import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Settings } from 'lucide-react';

const WelcomeBanner = ({ username = 'Admin' }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-serif font-bold text-white mb-2"
                >
                    Good Evening, {username}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 flex items-center gap-2"
                >
                    Here's what's happening with your properties today.
                </motion.p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-white/10 border border-white/20 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-accent focus:bg-white/20 transition-all"
                    />
                </div>
                <button className="p-2 bg-card border border-white/10 rounded-full hover:bg-white/5 transition-colors relative">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="p-2 bg-card border border-white/10 rounded-full hover:bg-white/5 transition-colors">
                    <Settings className="w-5 h-5 text-gray-400" />
                </button>
            </div>
        </div>
    );
};

export default WelcomeBanner;
