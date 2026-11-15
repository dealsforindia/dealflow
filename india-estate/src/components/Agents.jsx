import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Award, CheckCircle } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useState, useEffect } from 'react';

const Agents = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <section className="py-20 relative overflow-hidden">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 w-full">
                        <Skeleton width={150} height={20} baseColor="#202020" highlightColor="#444" className="mb-4" />
                        <Skeleton height={60} width="80%" baseColor="#202020" highlightColor="#444" className="mb-6" />
                        <Skeleton count={3} baseColor="#202020" highlightColor="#444" className="mb-2" />

                        <div className="mt-8 space-y-4">
                            <Skeleton height={60} baseColor="#202020" highlightColor="#444" className="rounded-xl" />
                            <Skeleton height={60} baseColor="#202020" highlightColor="#444" className="rounded-xl" />
                        </div>
                    </div>
                    <div className="flex-1 w-full max-w-lg">
                        <Skeleton height={500} baseColor="#202020" highlightColor="#444" className="rounded-3xl" />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Decorative Blob */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full -z-10" />

            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="flex-1"
                >
                    <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Trusted Expertise</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
                        Partner with India's <br /> Top Real Estate Agents
                    </h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        Our agents are not just salespeople; they are your strategic partners in wealth creation through real estate. With local expertise in Mumbai, Delhi, and Bangalore.
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-card p-3 rounded-full text-accent"><Award /></div>
                            <div>
                                <h4 className="font-bold text-lg">Certified Professionals</h4>
                                <p className="text-sm text-gray-500">RERA Registered Agents</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-card p-3 rounded-full text-accent"><CheckCircle /></div>
                            <div>
                                <h4 className="font-bold text-lg">Transparent Dealings</h4>
                                <p className="text-sm text-gray-500">No hidden charges, 100% legal backing</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <a href="tel:+917003996685" className="flex items-center gap-2 bg-white text-bg px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors">
                            <Phone className="w-5 h-5" /> Call Now
                        </a>
                        <a href="mailto:Sahanilotpal005@gmail.com" className="flex items-center gap-2 border border-white/20 text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-colors">
                            <Mail className="w-5 h-5" /> Email Us
                        </a>
                    </div>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="flex-1 w-full max-w-lg"
                >
                    <div className="bg-card p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative">
                        <h3 className="text-2xl font-bold mb-6 font-serif">Request a Callback</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                                <input type="text" className="w-full bg-bg/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors text-white" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                                <input type="tel" className="w-full bg-bg/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors text-white" placeholder="+91 98765 43210" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">City of Interest</label>
                                <select className="w-full bg-bg/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors text-white/70">
                                    <option>Mumbai</option>
                                    <option>Delhi NCR</option>
                                    <option>Bangalore</option>
                                    <option>Goa</option>
                                    <option>Hyderabad</option>
                                </select>
                            </div>
                            <button className="w-full bg-accent hover:bg-emerald-600 text-white font-bold py-4 rounded-xl mt-4 transition-transform hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/25">
                                Submit Request
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Agents;
