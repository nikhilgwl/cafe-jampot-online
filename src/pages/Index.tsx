import React, { useState, useMemo } from 'react';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import MenuSection from '@/components/MenuSection';
import SearchBar from '@/components/SearchBar';
import FloatingCart from '@/components/FloatingCart';
import CartSheet from '@/components/CartSheet';
import Footer from '@/components/Footer';
import { categories, getItemsByCategory, menuItems } from '@/data/menuData';

const IndexContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    if (!query) {
      // No search, return items for selected category
      return getItemsByCategory(selectedCategory);
    }
    
    // Search across all items or within selected category
    const itemsToSearch = selectedCategory === 'all' 
      ? menuItems 
      : getItemsByCategory(selectedCategory);
    
    return itemsToSearch.filter(item => 
      item.name.toLowerCase().includes(query)
    );
  }, [searchQuery, selectedCategory]);

  const allCategoryItems = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    // When searching, group results by category
    const grouped: { [key: string]: typeof menuItems } = {};
    const query = searchQuery.toLowerCase().trim();
    
    menuItems.forEach(item => {
      if (item.name.toLowerCase().includes(query)) {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      }
    });
    
    return grouped;
  }, [searchQuery]);

  const showAllResults = searchQuery.trim() && selectedCategory === categories[0].id;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Search Bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="cafe-container">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder="Search menu items..."
          />
        </div>
      </div>
      
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={(cat) => {
          setSelectedCategory(cat);
          if (searchQuery) setSearchQuery('');
        }}
      />
      
      <main className="pb-24">
        {showAllResults && allCategoryItems ? (
          // Show grouped results when searching in "All" category
          Object.entries(allCategoryItems).map(([categoryId, items]) => (
            <MenuSection 
              key={categoryId} 
              categoryId={categoryId} 
              items={items}
              searchQuery={searchQuery}
            />
          ))
        ) : (
          // Show single category results
          <MenuSection 
            categoryId={selectedCategory} 
            items={filteredItems}
            searchQuery={searchQuery}
          />
        )}
        
        {searchQuery && filteredItems.length === 0 && !showAllResults && (
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground">
              No items found for "{searchQuery}" in this category
            </p>
          </div>
        )}
        
        {searchQuery && showAllResults && Object.keys(allCategoryItems || {}).length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground">
              No items found for "{searchQuery}"
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
