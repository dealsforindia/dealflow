import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, Award } from 'lucide-react';

/**
 * PriceAnalytics - Property price insights and trends
 * Inspired by Housing.com's Price Trend Engine and 99acres market data
 */
const PriceAnalytics = ({ property }) => {
    // Mock data - in real app, this would come from API
    const analytics = {
        currentPrice: property?.price || '₹2.5 Cr',
        pricePerSqFt: '₹15,500',
        marketAverage: '₹16,200',
        priceVsMarket: -4.3, // percentage
        priceChange3Months: +2.5,
        priceChange6Months: +5.2,
        priceChange1Year: +8.7,
        appreciation: '+12.5%',
        roi: '8.2% annually',
        demand: 'High',
        areaRating: 4.5,
        insights: [
            'Price is 4.3% below market average - Good deal!',
            'Property values in this area have grown 8.7% in the last year',
            'High demand locality with excellent infrastructure',
            'Expected price appreciation: 10-12% in next 2 years'
        ]
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-accent/20 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-accent" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white font-serif">Price Analytics</h3>
                    <p className="text-gray-400 text-sm">Market insights and trends</p>
                </div>
            </div>

            {/* Price Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    label="Property Price"
                    value={analytics.currentPrice}
                    icon={<DollarSign className="w-5 h-5" />}
                    trend={null}
                    color="accent"
                />
                <StatCard
                    label="Price/Sq.Ft"
                    value={analytics.pricePerSqFt}
                    icon={<Target className="w-5 h-5" />}
                    trend={analytics.priceVsMarket}
                    color={analytics.priceVsMarket > 0 ? 'red' : 'green'}
                />
                <StatCard
                    label="Market Average"
                    value={analytics.marketAverage}
                    icon={<BarChart3 className="w-5 h-5" />}
                    trend={null}
                    color="blue"
                />
            </div>

            {/* Price Trends */}
            <div className="glass-effect rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Price Trends</h4>
                <div className="grid grid-cols-3 gap-4">
                    <TrendCard period="3 Months" change={analytics.priceChange3Months} />
                    <TrendCard period="6 Months" change={analytics.priceChange6Months} />
                    <TrendCard period="1 Year" change={analytics.priceChange1Year} />
                </div>
            </div>

            {/* Investment Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-effect rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-gold" />
                        <h4 className="text-lg font-semibold text-white">Investment Potential</h4>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Expected Appreciation</span>
                            <span className="text-green-400 font-semibold">{analytics.appreciation}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Annual ROI</span>
                            <span className="text-accent font-semibold">{analytics.roi}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Demand Level</span>
                            <span className="text-gold font-semibold">{analytics.demand}</span>
                        </div>
                    </div>
                </div>

                <div className="glass-effect rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <Award className="w-5 h-5 text-accent" />
                        <h4 className="text-lg font-semibold text-white">Area Rating</h4>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-4xl font-bold text-gradient">{analytics.areaRating}</div>
                        <div className="flex-1">
                            <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-2 flex-1 rounded-full ${i < Math.floor(analytics.areaRating)
                                                ? 'bg-gradient-to-r from-accent to-gold'
                                                : 'bg-white/10'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-gray-400">Based on infrastructure, connectivity, and amenities</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Insights */}
            <div className="glass-effect rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Key Insights
                </h4>
                <div className="space-y-3">
                    {analytics.insights.map((insight, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg"
                        >
                            <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                            <p className="text-gray-300 text-sm">{insight}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Price History Chart Placeholder */}
            <div className="glass-effect rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">Price History</h4>
                <div className="h-64 flex items-center justify-center text-gray-400 border border-white/10 rounded-xl bg-white/5">
                    <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Interactive chart would go here</p>
                        <p className="text-sm text-gray-500">(Chart.js or Recharts integration)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ label, value, icon, trend, color }) => {
    const colorClasses = {
        accent: 'from-accent/20 to-accent/10 border-accent/30',
        green: 'from-green-500/20 to-green-500/10 border-green-500/30',
        red: 'from-red-500/20 to-red-500/10 border-red-500/30',
        blue: 'from-blue-500/20 to-blue-500/10 border-blue-500/30',
        gold: 'from-gold/20 to-gold/10 border-gold/30'
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 border`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{label}</span>
                <div className={`text-${color === 'accent' ? 'accent' : color === 'gold' ? 'gold' : `${color}-400`}`}>
                    {icon}
                </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            {trend !== null && (
                <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{Math.abs(trend)}% vs market</span>
                </div>
            )}
        </div>
    );
};

const TrendCard = ({ period, change }) => {
    const isPositive = change > 0;
    return (
        <div className="text-center p-4 bg-white/5 rounded-lg">
            <div className="text-gray-400 text-xs mb-2">{period}</div>
            <div className={`text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'} flex items-center justify-center gap-1`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? '+' : ''}{change}%</span>
            </div>
        </div>
    );
};

export default PriceAnalytics;
