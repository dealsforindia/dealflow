import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin } from 'lucide-react';
import usePropertyStore from '../../store/usePropertyStore';
import PropertyForm from '../../components/admin/PropertyForm';
import { toast } from 'sonner';

const AdminProperties = () => {
    const { properties, deleteProperty } = usePropertyStore();
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);

    const filteredProperties = properties.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (property) => {
        setEditingProperty(property);
        setIsFormOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this property? This action matches the user request to NOT delete anything unknowingly, so I am asking first!")) {
            deleteProperty(id);
            toast.success("Property deleted");
        }
    };

    const handleAddNew = () => {
        setEditingProperty(null);
        setIsFormOpen(true);
    };

    return (
        <div className="min-h-screen bg-bg text-white p-4 md:p-8 pt-24">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-serif mb-2">Property Management</h1>
                        <p className="text-gray-400">Manage your listings, prices, and availability.</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-accent hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-glow-sm hover:shadow-glow-md"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Property
                    </button>
                </div>

                {/* Search & Toolbar */}
                <div className="bg-card border border-white/10 p-4 rounded-xl mb-6 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search properties..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-accent outline-none"
                        />
                    </div>
                    <div className="text-sm text-gray-400">
                        Total Listings: <span className="text-white font-bold">{properties.length}</span>
                    </div>
                </div>

                {/* Properties Table */}
                <div className="bg-card border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                                    <th className="p-4">Property</th>
                                    <th className="p-4">Location</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Tag</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredProperties.map((property) => (
                                    <tr key={property.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                                                    <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-medium text-white">{property.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-accent" />
                                                {property.location}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-accent">{property.price}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300 border border-white/5">
                                                {property.tag}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(property)}
                                                    className="p-2 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(property.id)}
                                                    className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProperties.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500">
                                            No properties found matching "{search}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit/Add Modal */}
            <PropertyForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                editData={editingProperty}
            />
        </div>
    );
};

export default AdminProperties;
