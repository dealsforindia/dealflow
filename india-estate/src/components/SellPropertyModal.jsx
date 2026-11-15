import React, { useState, useEffect } from 'react';
import useUIStore from '../store/useUIStore';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { X, Upload, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Confetti from 'react-confetti';

const steps = [
    { id: 1, title: "Property Basics" },
    { id: 2, title: "Details" },
    { id: 3, title: "Photos" },
    { id: 4, title: "Contact" }
];

const SellPropertyModal = () => {
    const { isSellModalOpen, closeSellModal } = useUIStore();
    const [step, setStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset, trigger } = useForm();
    const [images, setImages] = useState([]);

    // Reset form and state when modal opens/closes
    useEffect(() => {
        if (!isSellModalOpen) {
            setStep(1);
            setIsSubmitted(false);
            reset();
            setImages([]);
        }
    }, [isSellModalOpen, reset]);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        onDrop: acceptedFiles => {
            setImages(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            })));
        }
    });

    const nextStep = async () => {
        // Validate current step fields if I added scoped validation, simplistic for now
        // For a real app, you'd scope validation to current step fields
        const result = await trigger();
        if (result) setStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const onSubmit = (data) => {
        console.log({ ...data, images });
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            closeSellModal();
            setStep(1);
            setImages([]);
        }, 5000);
    };

    if (!isSellModalOpen) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => closeSellModal()} // Close modal on backdrop click
            >
                {isSubmitted && <Confetti numberOfPieces={200} recycle={false} />}

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-card border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-2xl font-serif font-bold text-white">List Your Property</h2>
                        <button onClick={() => closeSellModal()} className="text-gray-400 hover:text-white">
                            <X />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-white/5 h-1 w-full">
                        <motion.div
                            className="bg-accent h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto flex-1">
                        {isSubmitted ? (
                            <div className="text-center py-10">
                                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10 text-accent" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-2">Listing Submitted!</h3>
                                <p className="text-gray-400">Our experts will review your details and contact you shortly.</p>
                            </div>
                        ) : (
                            <form id="sell-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {step === 1 && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                                        <h3 className="text-xl text-white font-semibold mb-4">Property Basics</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Property Type</label>
                                                <select {...register("type")} className="w-full bg-bg border border-white/10 rounded-lg p-3 text-white outline-none">
                                                    <option>Apartment</option>
                                                    <option>Villa</option>
                                                    <option>Penthouse</option>
                                                    <option>Plot</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">City</label>
                                                <input {...register("city")} className="w-full bg-bg border border-white/10 rounded-lg p-3 text-white outline-none" placeholder="Mumbai" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Address / Locality</label>
                                            <input {...register("address")} className="w-full bg-bg border border-white/10 rounded-lg p-3 text-white outline-none" placeholder="Full Address" />
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                                        <h3 className="text-xl text-white font-semibold mb-4">Property Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Bedrooms</label>
                                                <input type="number" {...register("beds")} className="w-full bg-bg border border-white/10 rounded-lg p-3 text-white outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-1">Bathrooms</label>
                                                <input type="number" {...register("baths")} className="w-full bg-bg border border-white/10 rounded-lg p-3 text-white outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Area (sqft)</label>
                                            <input {...register("area")} className="w-full bg-bg border border-white/10 rounded-lg p-3 text-white outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Expected Price (₹)</label>
                                            <input {...register("price")} className="w-full bg-bg border border-white/10 rounded-lg p-3 text-white outline-none" />
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                                        <h3 className="text-xl text-white font-semibold mb-4">Upload Photos</h3>
                                        <div {...getRootProps()} className="border-2 border-dashed border-white/20 rounded-xl p-10 text-center cursor-pointer hover:border-accent transition-colors">
                                            <input {...getInputProps()} />
                                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-300">Drag & drop photos here, or click to select</p>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {files.map((file) => (
                                                <div key={file.name} className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10">
                                                    <img src={file.preview} className="w-full h-full object-cover" onLoad={() => URL.revokeObjectURL(file.preview)} />
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                                        <h3 className="text-xl text-white font-semibold mb-4">Contact Information</h3>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                            <input {...register("ownerName")} className="w-full bg-bg border border-white/10 rounded-lg p-3 text-white outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                                            <input {...register("ownerPhone")} className="w-full bg-bg border border-white/10 rounded-lg p-3 text-white outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Email</label>
                                            <input type="email" {...register("ownerEmail")} className="w-full bg-bg border border-white/10 rounded-lg p-3 text-white outline-none" />
                                        </div>
                                    </motion.div>
                                )}
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    {!isSubmitted && (
                        <div className="p-6 border-t border-white/10 flex justify-between">
                            <button
                                onClick={prevStep}
                                disabled={step === 1}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${step === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-white hover:bg-white/10'}`}
                            >
                                <ChevronLeft className="w-5 h-5" /> Back
                            </button>

                            {step < 4 ? (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-2 bg-white text-bg px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Next <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit(onSubmit)}
                                    className="flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors"
                                >
                                    Submit Listing
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default SellPropertyModal;
