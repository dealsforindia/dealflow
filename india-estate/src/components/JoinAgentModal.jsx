import React, { useState } from 'react';
import useUIStore from '../store/useUIStore';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const JoinAgentModal = () => {
    const { isAgentModalOpen, closeAgentModal } = useUIStore();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const onSubmit = (data) => {
        console.log("Agent Application:", data);
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            closeAgentModal();
            reset();
            toast.success("Application Submitted! HR will contact you.");
        }, 3000);
    };

    if (!isAgentModalOpen) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => closeAgentModal()}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-card border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => closeAgentModal()} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
                        <X />
                    </button>

                    {isSubmitted ? (
                        <div className="p-10 text-center flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-500"
                            >
                                <CheckCircle className="w-10 h-10" />
                            </motion.div>
                            <h2 className="text-2xl font-bold font-serif mb-2 text-white">Application Received</h2>
                            <p className="text-gray-400">Welcome to the future of real estate. We will be in touch.</p>
                        </div>
                    ) : (
                        <div className="p-8">
                            <h2 className="text-3xl font-serif font-bold mb-2 text-white">Join Our Team</h2>
                            <p className="text-gray-400 mb-6">Become a partner in our exclusive network.</p>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                    <input
                                        {...register("name", { required: true })}
                                        className="w-full bg-bg/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent"
                                        placeholder="Your Name"
                                    />
                                    {errors.name && <span className="text-red-500 text-xs">Required</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Phone</label>
                                        <input
                                            {...register("phone", { required: true })}
                                            className="w-full bg-bg/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent"
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">City</label>
                                        <input
                                            {...register("city", { required: true })}
                                            className="w-full bg-bg/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent"
                                            placeholder="City"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                                    <input
                                        {...register("email", { required: true })}
                                        type="email"
                                        className="w-full bg-bg/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Experience (Years)</label>
                                    <select {...register("experience")} className="w-full bg-bg/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent">
                                        <option>0-2 Years</option>
                                        <option>2-5 Years</option>
                                        <option>5-10 Years</option>
                                        <option>10+ Years</option>
                                    </select>
                                </div>

                                <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-accent/50 transition-colors cursor-pointer group">
                                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2 group-hover:text-accent transition-colors" />
                                    <span className="text-sm text-gray-400">Upload Resume / Portfolio (PDF)</span>
                                </div>

                                <button className="w-full bg-accent hover:bg-emerald-600 text-white font-bold py-3 rounded-lg mt-4 transition-all hover:scale-[1.02]">
                                    Submit Application
                                </button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default JoinAgentModal;
