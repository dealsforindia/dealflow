import { create } from 'zustand';

const useUIStore = create((set, get) => ({
    // Consultation Modal
    isConsultationOpen: false,
    openConsultation: () => set({ isConsultationOpen: true }),
    closeConsultation: () => set({ isConsultationOpen: false }),

    // Sell Property Modal
    isSellModalOpen: false,
    openSellModal: () => set({ isSellModalOpen: true }),
    closeSellModal: () => set({ isSellModalOpen: false }),

    // Agent Join Modal
    isAgentModalOpen: false,
    openAgentModal: () => set({ isAgentModalOpen: true }),
    closeAgentModal: () => set({ isAgentModalOpen: false }),

    // Property Details Modal
    selectedProperty: null,
    openPropertyDetails: (property) => set({ selectedProperty: property }),
    closePropertyDetails: () => set({ selectedProperty: null }),

    // Mortgage Calculator Modal
    isMortgageModalOpen: false,
    openMortgageModal: () => set({ isMortgageModalOpen: true }),
    closeMortgageModal: () => set({ isMortgageModalOpen: false }),

    // Favorites System (Persisted)
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
    toggleFavorite: (propertyId) => {
        const { favorites } = get();
        const isFavorite = favorites.includes(propertyId);
        const newFavorites = isFavorite
            ? favorites.filter(id => id !== propertyId)
            : [...favorites, propertyId];

        localStorage.setItem('favorites', JSON.stringify(newFavorites));
        set({ favorites: newFavorites });
    },

    // Comparison System
    compareList: [],
    addToCompare: (property) => {
        const { compareList } = get();
        if (compareList.length >= 3) return; // Max 3
        if (!compareList.find(p => p.id === property.id)) {
            set({ compareList: [...compareList, property] });
        }
    },
    removeFromCompare: (propertyId) => {
        const { compareList } = get();
        set({ compareList: compareList.filter(p => p.id !== propertyId) });
    },
    clearCompare: () => set({ compareList: [] }),

    isCompareModalOpen: false,
    openCompareModal: () => set({ isCompareModalOpen: true }),
    closeCompareModal: () => set({ isCompareModalOpen: false }),

    // Article Details Modal
    selectedArticle: null,
    openArticle: (article) => set({ selectedArticle: article }),
    closeArticle: () => set({ selectedArticle: null }),
}));

export default useUIStore;
