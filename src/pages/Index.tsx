import React, { useState, useMemo } from 'react';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import MenuSection from '@/components/MenuSection';
import SearchBar from '@/components/SearchBar';
import VegFilter, { VegFilterType } from '@/components/VegFilter';
import FloatingCart from '@/components/FloatingCart';
import CartSheet from '@/components/CartSheet';
import Footer from '@/components/Footer';
import { categories, getItemsByCategory, menuItems } from '@/data/menuData';
import { fuzzyMatch } from '@/lib/fuzzySearch';

const IndexContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<VegFilterType>('all');

  const applyVegFilter = (items: typeof menuItems) => {
    if (vegFilter === 'all') return items;
    if (vegFilter === 'veg') return items.filter(item => item.isVeg);
    return items.filter(item => !item.isVeg);
  };

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let items = getItemsByCategory(selectedCategory);
    
    if (query) {
      items = items.filter(item => fuzzyMatch(item.name, query));
    }
    
    return applyVegFilter(items);
  }, [searchQuery, selectedCategory, vegFilter]);

  const allCategoryItems = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    // When searching, group results by category
    const grouped: { [key: string]: typeof menuItems } = {};
    const query = searchQuery.toLowerCase().trim();
    
    menuItems.forEach(item => {
      if (fuzzyMatch(item.name, query)) {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      }
    });

    // Apply veg filter to grouped results
    Object.keys(grouped).forEach(category => {
      grouped[category] = applyVegFilter(grouped[category]);
      if (grouped[category].length === 0) {
        delete grouped[category];
      }
    });
    
    return grouped;
  }, [searchQuery, vegFilter]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // When search is cleared, keep the selected category (already default behavior)
  };

  const showAllResults = searchQuery.trim() && Object.keys(allCategoryItems || {}).length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Search Bar and Veg Filter */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <SearchBar 
              value={searchQuery} 
              onChange={handleSearchChange}
              placeholder="Search menu items..."
            />
          </div>
          <VegFilter value={vegFilter} onChange={setVegFilter} />
        </div>
      </div>
      
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat);
        }}
      />
      
      <main className="flex-1 pb-24">
        {showAllResults && allCategoryItems ? (
          // Show grouped results when searching
          Object.entries(allCategoryItems).map(([categoryId, items]) => (
            <MenuSection 
              key={categoryId} 
              categoryId={categoryId} 
              items={items}
              searchQuery={searchQuery}
            />
          ))
        ) : !searchQuery.trim() ? (
          // Show items for selected category (no search)
          categories.map((category) => (
            <MenuSection 
              key={category.id}
              categoryId={category.id} 
              items={applyVegFilter(getItemsByCategory(category.id))}
            />
          ))
        ) : (
          // Search active but in specific category
          <MenuSection 
            categoryId={selectedCategory} 
            items={filteredItems}
            searchQuery={searchQuery}
          />
        )}
        
        {searchQuery && filteredItems.length === 0 && !showAllResults && (
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground">
              No items found for "{searchQuery}"
              {vegFilter !== 'all' && ` in ${vegFilter === 'veg' ? 'vegetarian' : 'non-vegetarian'} options`}
            </p>
          </div>
        )}
      </main>
      
      <Footer />
      <FloatingCart onViewCart={() => setIsCartOpen(true)} />
      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <CartProvider>
      <IndexContent />
    </CartProvider>
  );
};

export default Index;
