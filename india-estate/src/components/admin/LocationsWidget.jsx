import React from 'react';
import { motion } from 'framer-motion';

const locations = [
    { country: 'Mumbai', flag: '🇮🇳', users: 1240, percent: 85 },
    { country: 'Delhi NCR', flag: '🇮🇳', users: 980, percent: 78 },
    { country: 'Bangalore', flag: '🇮🇳', users: 850, percent: 72 },
    { country: 'Hyderabad', flag: '🇮🇳', users: 720, percent: 65 },
    { country: 'Pune', flag: '🇮🇳', users: 640, percent: 58 },
    { country: 'Chennai', flag: '🇮🇳', users: 590, percent: 52 },
    { country: 'Kolkata', flag: '🇮🇳', users: 480, percent: 45 },
    { country: 'Ahmedabad', flag: '🇮🇳', users: 420, percent: 40 },
    { country: 'Gurgaon', flag: '🇮🇳', users: 380, percent: 35 },
    { country: 'Noida', flag: '🇮🇳', users: 350, percent: 32 },
    { country: 'Jaipur', flag: '🇮🇳', users: 290, percent: 28 },
    { country: 'Surat', flag: '🇮🇳', users: 250, percent: 25 },
    { country: 'Lucknow', flag: '🇮🇳', users: 210, percent: 20 },
    { country: 'Nagpur', flag: '🇮🇳', users: 180, percent: 18 },
    { country: 'Indore', flag: '🇮🇳', users: 150, percent: 15 },
];

const LocationsWidget = () => {
    return (
        <div className="bg-card border border-white/10 rounded-xl p-6 h-full">
            <h3 className="font-bold text-white text-lg mb-6">Top Regions</h3>

            <div className="space-y-6">
                {locations.map((loc, i) => (
                    <motion.div
                        key={loc.country}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300 flex items-center gap-2">
                                <span className="text-lg">{loc.flag}</span>
                                {loc.country}
                            </span>
                            <span className="text-white font-mono">{loc.users.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${loc.percent}%` }}
                                transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                                className={`h-full rounded-full ${i === 0 ? 'bg-accent' : 'bg-gray-600'}`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            <button className="w-full mt-8 py-2 text-xs text-gray-400 hover:text-white border border-dashed border-gray-700 rounded-lg hover:border-gray-500 transition-colors">
                View Full Geo-Report
            </button>
        </div>
    );
};

export default LocationsWidget;
