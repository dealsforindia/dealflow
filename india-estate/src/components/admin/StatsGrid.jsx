import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, IndianRupee, Users, Briefcase, Activity } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const data = [
    { v: 10 }, { v: 15 }, { v: 12 }, { v: 20 }, { v: 18 }, { v: 25 }, { v: 22 }
];

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-card border border-white/10 rounded-xl p-5 relative overflow-hidden group"
    >
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>

        <div className="flex items-end justify-between">
            <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {trendValue}
                <span className="text-gray-500 font-normal ml-1">vs last week</span>
            </div>

            <div className="h-10 w-24 opacity-50 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <Area
                            type="monotone"
                            dataKey="v"
                            stroke={trend === 'up' ? '#10b981' : '#ef4444'}
                            fill="none"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </motion.div>
);

const StatsGrid = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
                title="Total Revenue"
                value="₹4.2Cr"
                trend="up"
                trendValue="12.5%"
                icon={IndianRupee}
                color="text-green-500 bg-green-500"
                delay={0}
            />
            <StatCard
                title="Active Clients"
                value="842"
                trend="up"
                trendValue="8.2%"
                icon={Users}
                color="text-blue-500 bg-blue-500"
                delay={0.1}
            />
            <StatCard
                title="New Inquiries"
                value="64"
                trend="down"
                trendValue="2.1%"
                icon={Briefcase}
                color="text-orange-500 bg-orange-500"
                delay={0.2}
            />
            <StatCard
                title="System Health"
                value="98%"
                trend="up"
                trendValue="Stable"
                icon={Activity}
                color="text-purple-500 bg-purple-500"
                delay={0.3}
            />
        </div>
    );
};

export default StatsGrid;
