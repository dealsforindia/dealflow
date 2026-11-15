import React from 'react';
import useUIStore from '../store/useUIStore';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';

const CompareModal = () => {
    const { isCompareModalOpen, closeCompareModal, compareList, removeFromCompare } = useUIStore();

    if (!isCompareModalOpen) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                onClick={() => closeCompareModal()}
            >
                <div className="relative w-full max-w-6xl">
                    <button
                        onClick={() => closeCompareModal()}
                        className="absolute -top-12 right-0 text-white hover:text-accent transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <table className="w-full min-w-[800px] text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-6 bg-black/40 text-gray-400 font-normal w-48 border-b border-white/10">Feature</th>
                                    {compareList.map((property) => (
                                        <th key={property.id} className="p-6 border-b border-white/10 min-w-[250px] relative group">
                                            <button
                                                onClick={() => removeFromCompare(property.id)}
                                                className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <div className="h-40 mb-4 rounded-lg overflow-hidden">
                                                <ImageWithFallback src={property.image} className="w-full h-full object-cover" />
                                            </div>
                                            <h3 className="text-xl font-serif font-bold text-white mb-1">{property.title}</h3>
                                            <p className="text-sm text-gray-400">{property.tag}</p>
                                        </th>
                                    ))}
                                    {/* Empty Slots */}
                                    {[...Array(3 - compareList.length)].map((_, i) => (
                                        <th key={`empty-${i}`} className="p-6 border-b border-white/10 min-w-[250px] bg-white/5">
                                            <div className="h-full flex items-center justify-center text-gray-600 border-2 border-dashed border-gray-700 rounded-xl">
                                                Select Property
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                <tr>
                                    <td className="p-6 border-b border-white/5 font-semibold text-gray-400 bg-black/20">Price</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-6 border-b border-white/5 text-xl font-bold text-white">{p.price}</td>
                                    ))}
                                    {[...Array(3 - compareList.length)].map((_, i) => <td key={i} className="border-b border-white/5 bg-white/5" />)}
                                </tr>
                                <tr>
                                    <td className="p-6 border-b border-white/5 font-semibold text-gray-400 bg-black/20">Location</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-6 border-b border-white/5">{p.location}</td>
                                    ))}
                                    {[...Array(3 - compareList.length)].map((_, i) => <td key={i} className="border-b border-white/5 bg-white/5" />)}
                                </tr>
                                <tr>
                                    <td className="p-6 border-b border-white/5 font-semibold text-gray-400 bg-black/20">Area</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-6 border-b border-white/5">{p.area}</td>
                                    ))}
                                    {[...Array(3 - compareList.length)].map((_, i) => <td key={i} className="border-b border-white/5 bg-white/5" />)}
                                </tr>
                                <tr>
                                    <td className="p-6 border-b border-white/5 font-semibold text-gray-400 bg-black/20">Configuration</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-6 border-b border-white/5">{p.beds} Beds, {p.baths} Baths</td>
                                    ))}
                                    {[...Array(3 - compareList.length)].map((_, i) => <td key={i} className="border-b border-white/5 bg-white/5" />)}
                                </tr>
                                <tr>
                                    <td className="p-6 border-b border-white/5 font-semibold text-gray-400 bg-black/20">Amenities</td>
                                    {compareList.map((p) => (
                                        <td key={p.id} className="p-6 border-b border-white/5 text-sm">
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>Swimming Pool</li>
                                                <li>Gymnasium</li>
                                                <li>24/7 Security</li>
                                            </ul>
                                        </td>
                                    ))}
                                    {[...Array(3 - compareList.length)].map((_, i) => <td key={i} className="border-b border-white/5 bg-white/5" />)}
                                </tr>
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default CompareModal;
