import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';


const AdminLogin = () => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API delay
        setTimeout(() => {
            if (username === 'admin' && password === 'admin123') {
                toast.success('Access Granted');
                localStorage.setItem('isAdmin', 'true');
                navigate('/admin/dashboard');
            } else {
                toast.error('Auth Failed: Invalid Credentials');
            }
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-card/50 backdrop-blur-xl border border-white/10 p-12 rounded-3xl w-full max-w-md relative z-10 text-center shadow-2xl"
            >
                <div className="flex justify-center mb-6">
                    <div className="bg-accent/20 p-4 rounded-full">
                        <ShieldCheck className="w-12 h-12 text-accent" />
                    </div>
                </div>

                <h1 className="text-3xl font-serif font-bold text-white mb-2">Admin Portal</h1>
                <p className="text-gray-400 mb-8">Secure Access Encrypted</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 text-white focus:border-accent outline-none transition-colors"
                            placeholder="Username"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 text-white focus:border-accent outline-none transition-colors"
                            placeholder="Password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-accent to-emerald-600 hover:from-emerald-400 hover:to-accent text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Verifying...' : 'Login'}
                    </button>

                    <p className="text-xs text-gray-500 mt-4">
                        Default: admin / admin123
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
