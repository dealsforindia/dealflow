import React, { useState } from 'react';
import { toast } from 'react-toastify';
// lucide-react temporarily removed to debug white screen


const AdminSettings = () => {
    const [settings, setSettings] = useState({
        siteName: 'LuxeIndia Estates',
        supportEmail: 'concierge@luxeindia.com',
        maintenanceMode: false,
        allowRegistration: true,
        emailNotifications: true,
        twoFactorAuth: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        toast.info("Saving configuration...");
        setTimeout(() => toast.success("System Settings Updated Successfully"), 1000);
    };

    return (
        <div className="min-h-screen bg-bg text-white p-8 pt-24 pb-20">
            <div className="container mx-auto max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-white mb-2">System Settings</h1>
                        <p className="text-gray-400">Configure global application parameters and security protocols.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        className="bg-accent hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-accent/20 transition-all hover:scale-105"
                    >
                        💾 Save Changes
                    </button>
                </div>

                <div className="space-y-6">
                    {/* General Settings */}
                    <section className="bg-card border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            🌍 General Configuration
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Site Name</label>
                                <input
                                    type="text"
                                    name="siteName"
                                    value={settings.siteName}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Support Email</label>
                                <input
                                    type="email"
                                    name="supportEmail"
                                    value={settings.supportEmail}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-accent outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Security Settings */}
                    <section className="bg-card border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            🔒 Security & Access
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3">
                                    <span>🖥️</span>
                                    <div>
                                        <h4 className="font-medium text-white">Maintenance Mode</h4>
                                        <p className="text-sm text-gray-500">Disable public access to the site</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3">
                                    <span>👤</span>
                                    <div>
                                        <h4 className="font-medium text-white">Allow Public Registration</h4>
                                        <p className="text-sm text-gray-500">Users can create accounts</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="allowRegistration" checked={settings.allowRegistration} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-3">
                                    <span>🔑</span>
                                    <div>
                                        <h4 className="font-medium text-white">Two-Factor Authentication (Admin)</h4>
                                        <p className="text-sm text-gray-500">Enforce 2FA for all admin accounts</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="twoFactorAuth" checked={settings.twoFactorAuth} onChange={handleChange} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Notifications */}
                    <section className="bg-card border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            🔔 Notifications
                        </h2>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                                <span>📧</span>
                                <div>
                                    <h4 className="font-medium text-white">Email Alerts</h4>
                                    <p className="text-sm text-gray-500">Receive emails for new leads and server status</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="emailNotifications" checked={settings.emailNotifications} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </label>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-500">
                            ☢️ Danger Zone
                        </h2>
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-medium text-white">Purge Cache</h4>
                                <p className="text-sm text-gray-500">Clear all temporary server data</p>
                            </div>
                            <button className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20">Clear Cache</button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
