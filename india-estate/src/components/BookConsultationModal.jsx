import React, { useState } from 'react';
import useUIStore from '../store/useUIStore';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';

const BookConsultationModal = () => {
    const { isConsultationOpen, closeConsultation } = useUIStore();
    const [startDate, setStartDate] = useState(new Date());
    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    const onSubmit = (data) => {
        console.log({ ...data, date: startDate });
        toast.success("Consultation Booked Successfully! We will contact you shortly.");
        reset();
        closeConsultation();
    };

    if (!isConsultationOpen) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => closeConsultation()}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-card border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => closeConsultation()} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <X />
                    </button>

                    <div className="p-8">
                        <h2 className="text-3xl font-serif font-bold mb-2">Book Consultation</h2>
                        <p className="text-gray-400 mb-6">Schedule a meeting with our premium estate agents.</p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Full Name</label>
                                <input
                                    {...register("name", { required: true })}
                                    className="w-full bg-bg/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent"
                                    placeholder="Your Name"
                                />
                                {errors.name && <span className="text-red-500 text-xs">Name is required</span>}
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Contact Number</label>
                                <input
                                    {...register("phone", { required: true })}
                                    className="w-full bg-bg/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent"
                                    placeholder="+91..."
                                />
                                {errors.phone && <span className="text-red-500 text-xs">Phone is required</span>}
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Preferred Date</label>
                                <div className="relative">
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        className="w-full bg-bg/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent"
                                    />
                                    <Calendar className="absolute right-3 top-3 text-gray-400 pointer-events-none w-5 h-5" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-accent hover:bg-emerald-600 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                                Confirm Booking
                            </button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default BookConsultationModal;
