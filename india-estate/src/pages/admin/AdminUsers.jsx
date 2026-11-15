import React, { useState } from 'react';
import { toast } from 'react-toastify';
// lucide-react removed to debug

const AdminUsers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([
        { id: 1, name: "Rahul Sharma", email: "rahul@example.com", role: "Admin", status: "Active", joinDate: "Jan 12, 2024" },
        { id: 2, name: "Priya Patel", email: "priya.p@design.com", role: "Agent", status: "Active", joinDate: "Feb 05, 2024" },
        { id: 3, name: "Amit Kumar", email: "amit.k88@gmail.com", role: "User", status: "Banned", joinDate: "Mar 22, 2024" },
        { id: 4, name: "Sneha Reddy", email: "sneha.r@tech.io", role: "User", status: "Active", joinDate: "Apr 10, 2024" },
        { id: 5, name: "Vikram Singh", email: "vikram.s@realty.com", role: "Agent", status: "Active", joinDate: "May 15, 2024" },
    ]);

    const handleAction = (action, user) => {
        toast.success(`${action} action performed on ${user.name}`);
    };

    return (
        <div className="min-h-screen bg-bg text-white p-8 pt-24 pb-20">
            <div className="container mx-auto max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-white mb-2">User Management</h1>
                        <p className="text-gray-400">View and manage administrators, agents, and registered users.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-card border border-white/10 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-accent outline-none"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-300 outline-none">
                            <option>All Roles</option>
                            <option>Admin</option>
                            <option>Agent</option>
                            <option>User</option>
                        </select>
                        <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-gray-300 outline-none">
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Banned</option>
                        </select>
                    </div>
                </div>

                {/* Users List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                        <div key={user.id} className="bg-card border border-white/10 rounded-xl p-6 relative group hover:border-accent/30 transition-colors">
                            <div className="absolute top-4 right-4">
                                <button className="p-1 hover:bg-white/10 rounded text-gray-400">
                                    ⋮
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-2xl font-bold text-gray-300 border border-white/10">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{user.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                        user.role === 'Agent' ? 'bg-gold/10 text-gold border-gold/20' :
                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-400 mb-6">
                                <div className="flex items-center gap-3">
                                    📧 {user.email}
                                </div>
                                <div className="flex items-center gap-3">
                                    🛡️ Joined {user.joinDate}
                                </div>
                                <div className="flex items-center gap-3">
                                    {user.status === 'Active' ? (
                                        <span>✅</span>
                                    ) : (
                                        <span>❌</span>
                                    )}
                                    <span className={user.status === 'Active' ? 'text-green-500' : 'text-red-500'}>
                                        {user.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAction('Verify', user)}
                                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors"
                                >
                                    Verify
                                </button>
                                <button
                                    onClick={() => handleAction('Ban', user)}
                                    className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm text-red-400 transition-colors"
                                >
                                    {user.status === 'Active' ? 'Ban User' : 'Unban'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
