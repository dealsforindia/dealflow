import sys

path_cs = r'rudranil-deals-web/src/components/CategoryStories.tsx'
with open(path_cs, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace category_filter: 'all' for under199/budget stories
text = text.replace("id: 'under199',\n    title: 'Under ₹199',\n    emoji: '🏷️',\n    ring_color: 'from-yellow-400 via-orange-500 to-red-600',\n    badge: 'BUDGET',\n    category_filter: 'all',",
                    "id: 'under199',\n    title: 'Under ₹199',\n    emoji: '🏷️',\n    ring_color: 'from-yellow-400 via-orange-500 to-red-600',\n    badge: 'BUDGET',\n    category_filter: 'budget499',")

text = text.replace("id: 'under199',\n        title: 'Under ₹499 Loot',\n        emoji: '🏷️',\n        ring_color: 'from-teal-400 via-emerald-500 to-green-600',\n        badge: 'BUDGET',\n        category_filter: 'all',",
                    "id: 'under199',\n        title: 'Under ₹499 Loot',\n        emoji: '🏷️',\n        ring_color: 'from-teal-400 via-emerald-500 to-green-600',\n        badge: 'BUDGET',\n        category_filter: 'budget499',")

with open(path_cs, 'w', encoding='utf-8') as f:
    f.write(text)

print("CategoryStories.tsx patched")

path_app = r'rudranil-deals-web/src/App.tsx'
with open(path_app, 'r', encoding='utf-8') as f:
    text_app = f.read()

old_handler = """                    onSelectCategoryFilter={(cat) => {
                      setCollectionFilter('all');
                      setSelectedCategory(cat);
                      const dealGrid = document.getElementById('deals-section');
                      if (dealGrid) {
                        dealGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}"""

new_handler = """                    onSelectCategoryFilter={(cat) => {
                      if (cat === 'budget499' || cat === 'under199' || cat === 'under499') {
                        setCollectionFilter('budget499');
                        setSelectedCategory('All');
                      } else if (cat === 'loot70') {
                        setCollectionFilter('loot70');
                        setSelectedCategory('All');
                      } else {
                        setCollectionFilter('all');
                        setSelectedCategory(cat);
                      }
                      const dealGrid = document.getElementById('deals-section');
                      if (dealGrid) {
                        dealGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}"""

if old_handler in text_app:
    text_app = text_app.replace(old_handler, new_handler)
    with open(path_app, 'w', encoding='utf-8') as f:
        f.write(text_app)
    print("App.tsx patched successfully")
else:
    print("App.tsx target not found, checking normalized newlines...")
    norm_app = text_app.replace('\r\n', '\n')
    norm_old = old_handler.replace('\r\n', '\n')
    norm_new = new_handler.replace('\r\n', '\n')
    if norm_old in norm_app:
        norm_app = norm_app.replace(norm_old, norm_new)
        with open(path_app, 'w', encoding='utf-8', newline='\r\n') as f:
            f.write(norm_app.replace('\n', '\r\n'))
        print("App.tsx patched with normalized newlines!")
    else:
        print("FAILED to find handler in App.tsx")

