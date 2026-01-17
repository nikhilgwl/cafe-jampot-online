import React, { useState, useMemo, useEffect } from "react";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import MenuSection from "@/components/MenuSection";
import SearchBar from "@/components/SearchBar";
import VegFilter, { VegFilterType } from "@/components/VegFilter";
import FloatingCart from "@/components/FloatingCart";
import CartSheet from "@/components/CartSheet";
import Footer from "@/components/Footer";
import { categories, getItemsByCategory, menuItems, MenuItem } from "@/data/menuData";
import { fuzzyMatch } from "@/lib/fuzzySearch";
import { supabase } from "@/integrations/supabase/client";

const IndexContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vegFilter, setVegFilter] = useState<VegFilterType>("all");
  const [stockStatus, setStockStatus] = useState<{ [key: string]: boolean }>({});

  // Fetch stock status from database
  useEffect(() => {
    const fetchStockStatus = async () => {
      const { data } = await supabase
        .from("stock_status")
        .select("item_id, is_available");

      if (data) {
        const status: { [key: string]: boolean } = {};
        data.forEach((item: { item_id: string; is_available: boolean }) => {
          status[item.item_id] = item.is_available;
        });
        setStockStatus(status);
      }
    };

    fetchStockStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("stock-status")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "stock_status",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newData = payload.new as { item_id: string; is_available: boolean };
            setStockStatus((prev) => ({
              ...prev,
              [newData.item_id]: newData.is_available,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter out out-of-stock items
  const availableItems = useMemo(() => {
    return menuItems.filter((item) => stockStatus[item.id] !== false);
  }, [stockStatus]);

  const applyVegFilter = (items: MenuItem[]) => {
    if (vegFilter === "all") return items;
    if (vegFilter === "veg") return items.filter((item) => item.isVeg);
    return items.filter((item) => !item.isVeg);
  };

  // Pre-compute and cache all category items with veg filter applied
  const cachedCategoryItems = useMemo(() => {
    const cache: { [key: string]: MenuItem[] } = {};
    categories.forEach((category) => {
      if (category.id !== "all") {
        const categoryItems = availableItems.filter((item) => item.category === category.id);
        cache[category.id] = applyVegFilter(categoryItems);
      }
    });
    return cache;
  }, [vegFilter, availableItems]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    let items =
      selectedCategory === "all"
        ? availableItems
        : availableItems.filter((item) => item.category === selectedCategory);

    if (query) {
      items = items.filter((item) => fuzzyMatch(item.name, query));
    }

    return applyVegFilter(items);
  }, [searchQuery, selectedCategory, vegFilter, availableItems]);

  const allCategoryItems = useMemo(() => {
    if (!searchQuery.trim()) return null;

    // When searching, group results by category
    const grouped: { [key: string]: MenuItem[] } = {};
    const query = searchQuery.toLowerCase().trim();

    availableItems.forEach((item) => {
      if (fuzzyMatch(item.name, query)) {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      }
    });

    // Apply veg filter to grouped results
    Object.keys(grouped).forEach((category) => {
      grouped[category] = applyVegFilter(grouped[category]);
      if (grouped[category].length === 0) {
        delete grouped[category];
      }
    });

    return grouped;
  }, [searchQuery, vegFilter, availableItems]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const showAllResults =
    searchQuery.trim() && Object.keys(allCategoryItems || {}).length > 0;

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <Header />

      {/* Search Bar and Veg Filter */}
      <div className='sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3'>
        <div className='max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center'>
          <div className='flex-1 w-full'>
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder='Search menu items...'
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

      <main className='flex-1 pb-24'>
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
          // Show items based on selected category (no search)
          selectedCategory === "all" ? (
            // Show all categories when "all" is selected
            categories
              .filter((cat) => cat.id !== "all")
              .map((category) => {
                const items = cachedCategoryItems[category.id] || [];
                return items.length > 0 ? (
                  <MenuSection
                    key={category.id}
                    categoryId={category.id}
                    items={items}
                  />
                ) : null;
              })
          ) : (
            // Show only selected category
            (() => {
              const items = cachedCategoryItems[selectedCategory] || [];
              return items.length > 0 ? (
                <MenuSection categoryId={selectedCategory} items={items} />
              ) : null;
            })()
          )
        ) : (
          // Search active but in specific category
          <MenuSection
            categoryId={selectedCategory}
            items={filteredItems}
            searchQuery={searchQuery}
          />
        )}

        {searchQuery && filteredItems.length === 0 && !showAllResults && (
          <div className='text-center py-12 px-4'>
            <p className='text-muted-foreground'>
              No items found for "{searchQuery}"
              {vegFilter !== "all" &&
                ` in ${
                  vegFilter === "veg" ? "vegetarian" : "non-vegetarian"
                } options`}
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
