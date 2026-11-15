import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TrafficChart = ({ data }) => {
    const chartData = data || Array.from({ length: 12 }, (_, i) => ({
        name: `Day ${i + 1}`,
        visitors: Math.floor(Math.random() * 5000) + 1000,
        pageviews: Math.floor(Math.random() * 8000) + 2000,
    }));

    return (
        <div className="bg-card border border-white/10 rounded-xl p-6 h-[480px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-lg">Traffic Overview</h3>
                <select className="bg-black/20 border border-white/10 rounded-lg text-xs text-gray-400 px-3 py-1 outline-none">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#666"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#666"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            cursor={{ fill: '#ffffff10' }}
                        />
                        <Bar dataKey="pageviews" name="Page Views" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#2563eb'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Added: Important Stuff under Traffic Overview as requested */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
                <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Top Source</p>
                    <p className="font-bold text-white text-sm">Google Search (45%)</p>
                </div>
                <div className="text-center border-l border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Avg. Duration</p>
                    <p className="font-bold text-white text-sm">4m 32s</p>
                </div>
                <div className="text-center border-l border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Bounce Rate</p>
                    <p className="font-bold text-red-400 text-sm">34%</p>
                </div>
            </div>
        </div>
    );
};

export default TrafficChart;
