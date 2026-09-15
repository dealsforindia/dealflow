import React from 'react';

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  badge?: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'All Loots', icon: '🔥', badge: 'Live' },
  { id: 'loot70', name: '70%+ Off', icon: '⚡', badge: 'Steal' },
  { id: 'Electronics', name: 'Electronics', icon: '📱' },
  { id: 'Fashion', name: 'Fashion', icon: '👗' },
  { id: 'Home', name: 'Home & Living', icon: '🏠' },
  { id: 'Kitchen', name: 'Kitchenware', icon: '🍳' },
  { id: 'Beauty', name: 'Beauty & Care', icon: '💄' },
  { id: 'Grocery', name: 'Grocery & Food', icon: '🍎' },
];

interface CategoryStoriesProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryStories: React.FC<CategoryStoriesProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-1" aria-label="Category Stories">
      <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1.5">
        {CATEGORIES.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
            (cat.id === 'all' && (!selectedCategory || selectedCategory === 'all'));

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 select-none border focus-ring ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.03]'
                  : 'bg-[#0E1424] hover:bg-[#151E34] text-slate-300 hover:text-white border-white/[0.08] hover:border-emerald-500/30'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
              {cat.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                    isSelected
                      ? 'bg-slate-950 text-emerald-400'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
