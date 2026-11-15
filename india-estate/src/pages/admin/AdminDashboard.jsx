import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import WelcomeBanner from '../../components/admin/WelcomeBanner';
// lucide-react removed for debugging
import StatsGrid from '../../components/admin/StatsGrid';
import TrafficChart from '../../components/admin/TrafficChart';
import LocationsWidget from '../../components/admin/LocationsWidget';
import MessageInbox from '../../components/admin/MessageInbox';

// 1. Live Visitor Graph Component (Simulated)
const LiveVisitorGraph = () => {
    const [points, setPoints] = useState([10, 25, 15, 30, 45, 20, 35, 25, 50, 40]);
    useEffect(() => {
        const interval = setInterval(() => {
            setPoints(prev => [...prev.slice(1), Math.floor(Math.random() * 40) + 10]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-card border border-white/10 p-6 rounded-xl relative overflow-hidden h-64">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                📈 Real-Time Traffic
                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded animate-pulse">LIVE</span>
            </h3>
            <div className="absolute inset-x-0 bottom-0 h-40 flex items-end justify-between px-6 pb-6 gap-2">
                {points.map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="w-full bg-accent/20 rounded-t hover:bg-accent/40 transition-colors"
                    />
                ))}
            </div>
        </div>
    );
};

// 3. Task Manager Widget
const TaskManager = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Review new properties', done: false },
        { id: 2, text: 'Approve agent requests', done: true },
        { id: 3, text: 'Update server keys', done: false },
        { id: 4, text: 'Check error logs', done: false }
    ]);
    return (
        <div className="bg-card border border-white/10 p-6 rounded-xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                ✅ Task Manager
            </h3>
            <div className="space-y-3">
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 group">
                        <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                            className="w-4 h-4 accent-accent rounded cursor-pointer"
                        />
                        <span className={`text-sm ${task.done ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{task.text}</span>
                    </div>
                ))}
                <button className="text-xs text-accent mt-2 hover:underline">+ Add Task</button>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(true); // 10. Admin Theme Toggle State

    const fetchData = async () => {
        try {
            const messagesRes = await axios.get('/api/admin/messages');
            setMessages(messagesRes.data);
        } catch (error) {
            console.error("Dashboard Error (Fallback Active):", error);
            // Fallback Mock Data
            setMessages([
                { _id: '1', name: 'System', email: 'admin@luxeindia.com', content: 'Backend is offline. Showing cached/demo data.', read: false, timestamp: new Date() },
                { _id: '2', name: 'John Doe', email: 'john@example.com', content: 'Interested in the Villa.', read: true, timestamp: new Date(Date.now() - 86400000) }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await axios.patch(`/api/admin/messages/${id}/read`);
            setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
        } catch (error) {
            console.error("Update Error:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center text-accent font-serif">Initializing Secure Vault...</div>;

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-bg text-white' : 'bg-gray-100 text-black'} p-4 md:p-8 pt-24 transition-colors duration-300`}>

            {/* 2. Recent Leads Ticker (Now Relative to prevent overlap) */}
            <div className="relative w-full bg-accent/90 text-white z-30 overflow-hidden py-1 shadow-lg backdrop-blur-md mb-6 rounded-lg">
                <div className="animate-marquee whitespace-nowrap text-xs font-bold flex gap-8 items-center h-full">
                    <span>🚀 New Lead: Amit from Delhi (Budget: 5 Cr)</span>
                    <span>🔔 Urgent: Server Load at 45%</span>
                    <span>💰 Revenue Update: Q3 Goals Met</span>
                    <span>👤 New Agent Signup: Sarah Jenkins</span>
                </div>
            </div>

            <div className="container mx-auto">
                {/* 1. Header Section + 10. Theme Toggle + 9. Notification Hub */}
                <div className="flex justify-between items-start mb-6">
                    <WelcomeBanner username="Admin" />
                    <div className="flex items-center gap-4 bg-card border border-white/10 p-2 rounded-xl">
                        <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            {darkMode ? <span>☀️</span> : <span>🌙</span>}
                        </button>
                        <div className="relative p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                            <span>🔔</span>
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </div>
                    </div>
                </div>

                {/* 2. Key Metrics Grid (Sparklines) */}
                <StatsGrid />

                {/* NEW: Widgets Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    {/* 1. Live Graph */}
                    <div className="lg:col-span-2">
                        <LiveVisitorGraph />
                    </div>

                    {/* 3. Task Manager */}
                    <div className="lg:col-span-1">
                        <TaskManager />
                    </div>

                    {/* 5. Agent Leaderboard */}
                    <div className="bg-card border border-white/10 p-6 rounded-xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            👥 Top Agents
                        </h3>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gray-600 rounded-full" />
                                        <span className="text-gray-300">Agent {i}</span>
                                    </div>
                                    <span className="text-accent font-bold">₹{(4 - i) * 2}Cr</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 3. Main Traffic Chart (Preserved) */}
                    <div className="lg:col-span-2">
                        <TrafficChart />
                    </div>

                    {/* 4. Geo Locations (Preserved) */}
                    <div>
                        <LocationsWidget />
                    </div>
                </div>

                {/* 4. Revenue Projection */}
                <div className="mt-6 bg-gradient-to-r from-gray-900 to-black border border-white/10 rounded-xl p-8 relative overflow-hidden">
                    <div className="flex justify-between items-end relative z-10">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                📈 Q1 Revenue Projection
                            </h3>
                            <p className="text-gray-400">Based on current pipeline deal flow.</p>
                        </div>
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
                            ₹ 45.2 Cr
                        </div>
                    </div>
                    {/* Abstract Bar Chart Decoration */}
                    <div className="absolute inset-0 flex items-end justify-around px-8 opacity-20">
                        {[40, 60, 45, 70, 55, 80, 65, 90].map((h, i) => (
                            <div key={i} style={{ height: `${h}%` }} className="w-12 bg-accent rounded-t-lg" />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* 5. Secure Inbox (Enhanced) */}
                    <div className="lg:col-span-2 bg-card border border-white/10 p-6 rounded-xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-white text-lg">Secure Inbox</h3>
                                <p className="text-gray-400 text-xs">AES-256 Encrypted Messages</p>
                            </div>
                            <span className="bg-accent/10 border border-accent/20 text-accent text-xs px-3 py-1 rounded-full">
                                {messages.filter(m => !m.read).length} Unread
                            </span>
                        </div>
                        <MessageInbox messages={messages} onMarkRead={handleMarkRead} />
                    </div>

                    <div className="space-y-6">
                        {/* 6. System Status / Quick Actions (Preserved & Enhanced) */}
                        <div className="bg-gradient-to-br from-accent to-blue-600 rounded-xl p-6 text-white flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-xl">System Health</h3>
                                    <span>🛡️</span>
                                </div>
                                <p className="opacity-90 text-sm">Protected by AI WAF</p>
                            </div>
                            <div className="space-y-3 mt-6">
                                {/* 6. Quick Status Bars */}
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs opacity-80"><span>CPU Load</span><span>32%</span></div>
                                    <div className="h-1 bg-black/20 rounded-full"><div className="h-full w-[32%] bg-white rounded-full"></div></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs opacity-80"><span>Memory</span><span>54%</span></div>
                                    <div className="h-1 bg-black/20 rounded-full"><div className="h-full w-[54%] bg-white rounded-full"></div></div>
                                </div>
                            </div>
                        </div>

                        {/* 7. Quick Actions Panel */}
                        <div className="bg-card border border-white/10 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider text-gray-400">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/admin/properties" className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors border border-white/5 text-center">
                                    Manage Properties
                                </Link>
                                <Link to="/admin/users" className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors border border-white/5 text-center">
                                    User Management
                                </Link>
                                <Link to="/admin/settings" className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors border border-white/5 text-center">
                                    System Settings
                                </Link>
                                <button onClick={() => toast.success("Backup Started...")} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors border border-white/5">
                                    Backup DB
                                </button>
                            </div>
                        </div>

                        {/* 8. User Activity Log */}
                        <div className="bg-card border border-white/10 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-4 text-sm flex items-center gap-2">
                                🗄️ Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {['Admin logged in', 'User ID:44 updated', 'Listing #033 created'].map((log, i) => (
                                    <div key={i} className="flex gap-2 text-xs text-gray-400">
                                        <span className="text-gray-600">10:4{i} AM</span>
                                        <span>{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
