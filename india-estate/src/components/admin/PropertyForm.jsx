import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Image as ImageIcon } from 'lucide-react';
import usePropertyStore from '../../store/usePropertyStore';
import { toast } from 'sonner';

const PropertyForm = ({ isOpen, onClose, editData = null }) => {
    const { addProperty, updateProperty } = usePropertyStore();

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        price: '',
        beds: '',
        baths: '',
        area: '',
        tag: 'New',
        image: ''
    });

    useEffect(() => {
        if (editData) {
            setFormData(editData);
        } else {
            setFormData({
                title: '',
                location: '',
                price: '',
                beds: '',
                baths: '',
                area: '',
                tag: 'New',
                image: ''
            });
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.title || !formData.price || !formData.location) {
            toast.error("Please fill in required fields");
            return;
        }

        try {
            if (editData) {
                updateProperty(editData.id, formData);
                toast.success("Property Updated Successfully");
            } else {
                // Determine a default image if none provided
                const dataToSave = {
                    ...formData,
                    image: formData.image || "https://images.unsplash.com/photo-1600596542815-2495db98cfa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                };
                addProperty(dataToSave);
                toast.success("New Property Listed Successfully");
            }
            onClose();
        } catch (error) {
            toast.error("Failed to save property");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-card border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-card z-10">
                    <h2 className="text-xl font-bold text-white font-serif">
                        {editData ? 'Edit Property' : 'Add New Property'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Preview Section */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Property Image URL</label>
                        <div className="flex gap-4 items-start">
                            <div className="w-32 h-20 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                                {formData.image ? (
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-600" />
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Paste image URL (e.g. Unsplash link)"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Title*</label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                                placeholder="e.g. Sea View Villa"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Price*</label>
                            <input
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                                placeholder="e.g. ₹5.5 Cr"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Location*</label>
                            <input
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                                placeholder="e.g. Bandra West, Mumbai"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Area</label>
                            <input
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                                placeholder="e.g. 2,500 sqft"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Beds</label>
                                <input
                                    type="number"
                                    value={formData.beds}
                                    onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Baths</label>
                                <input
                                    type="number"
                                    value={formData.baths}
                                    onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400">Tag</label>
                            <select
                                value={formData.tag}
                                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent outline-none"
                            >
                                <option value="New">New</option>
                                <option value="Luxury">Luxury</option>
                                <option value="Modern">Modern</option>
                                <option value="Heritage">Heritage</option>
                                <option value="Vacation">Vacation</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {editData ? 'Update Property' : 'Save Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PropertyForm;
