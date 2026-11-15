import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialProperties = [
    {
        id: 1,
        title: "Sea Facing Penthouse",
        location: "Worli, Mumbai",
        price: "₹18.5 Cr",
        beds: 4,
        baths: 5,
        area: "3,200 sqft",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: "Luxury"
    },
    {
        id: 2,
        title: "Colonial Bungalow",
        location: "Lutyens, Delhi",
        price: "₹45.0 Cr",
        beds: 6,
        baths: 7,
        area: "8,000 sqft",
        image: "https://images.unsplash.com/photo-1600596542815-2495db98cfa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: "Heritage"
    },
    {
        id: 3,
        title: "Modern Tech Villa",
        location: "Whitefield, Bangalore",
        price: "₹6.8 Cr",
        beds: 4,
        baths: 4,
        area: "4,500 sqft",
        image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: "Modern"
    },
    {
        id: 4,
        title: "Portuguese Villa",
        location: "Assagao, Goa",
        price: "₹5.2 Cr",
        beds: 3,
        baths: 3,
        area: "2,800 sqft",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: "Vacation"
    },
    {
        id: 5,
        title: "Skyline Apartment",
        location: "Gachibowli, Hyderabad",
        price: "₹4.5 Cr",
        beds: 3,
        baths: 3,
        area: "2,400 sqft",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: "New"
    },
    {
        id: 6,
        title: "Lakeview Residence",
        location: "Udaipur, Rajasthan",
        price: "₹8.9 Cr",
        beds: 5,
        baths: 6,
        area: "5,000 sqft",
        image: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        tag: "Sceneric"
    }
];

const usePropertyStore = create(
    persist(
        (set) => ({
            properties: initialProperties,

            addProperty: (property) => set((state) => ({
                properties: [{ ...property, id: Date.now() }, ...state.properties]
            })),

            updateProperty: (id, updatedData) => set((state) => ({
                properties: state.properties.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
            })),

            deleteProperty: (id) => set((state) => ({
                properties: state.properties.filter((p) => p.id !== id)
            })),

            resetProperties: () => set({ properties: initialProperties })
        }),
        {
            name: 'india-estate-properties', // localStorage key
        }
    )
);

export default usePropertyStore;
