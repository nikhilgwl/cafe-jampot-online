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
import AdCarousel from "@/components/AdCarousel";
import { categories, MenuItem } from "@/data/menuData";
import { useMenuItems } from "@/hooks/useMenuItems";
import { Skeleton } from "@/components/ui/skeleton";

import { fuzzyMatch } from "@/lib/fuzzySearch";
import { supabase } from "@/integrations/supabase/client";

/* =========================================================
   Delivery is controlled entirely by admin toggle in database.
   No time-based restrictions - admin has full control.
========================================================= */

const IndexContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vegFilter, setVegFilter] = useState<VegFilterType>("all");
  const [stockStatus, setStockStatus] = useState<{ [key: string]: boolean }>({});
  
  // Fetch menu items from database
  const { items: menuItems, loading: menuLoading } = useMenuItems();

  // Delivery state
  const [dbDeliveryOpen, setDbDeliveryOpen] = useState<boolean | null>(null);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isDeliveryLoading, setIsDeliveryLoading] = useState(true);

  /* ---------------- Fetch delivery flag ---------------- */
  useEffect(() => {
    const fetchDeliveryStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("delivery_settings")
          .select("is_open")
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Failed to fetch delivery status:", error);
          setDbDeliveryOpen(false);
        } else {
          setDbDeliveryOpen(data?.is_open ?? false);
        }
      } finally {
        setIsDeliveryLoading(false);
      }
    };

    fetchDeliveryStatus();

    const channel = supabase
      .channel("delivery-status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "delivery_settings" },
        (payload) => {
          const val = (payload.new as { is_open: boolean })?.is_open ?? false;
          setDbDeliveryOpen(val);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ---------------- Use admin toggle directly ---------------- */
  useEffect(() => {
    if (dbDeliveryOpen === null) return;
    setIsDeliveryOpen(dbDeliveryOpen);
  }, [dbDeliveryOpen]);

  /* ---------------- Fetch stock status ---------------- */
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

    const channel = supabase
      .channel("stock-status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_status" },
        (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const newData = payload.new as {
              item_id: string;
              is_available: boolean;
            };
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

  /* ---------------- Menu filtering logic ---------------- */
  const availableItems = useMemo(() => {
    return menuItems.filter((item) => stockStatus[item.id] !== false);
  }, [stockStatus, menuItems]);

  const applyVegFilter = (items: MenuItem[]) => {
    if (vegFilter === "all") return items;
    if (vegFilter === "veg") return items.filter((item) => item.isVeg);
    return items.filter((item) => !item.isVeg);
  };

  const cachedCategoryItems = useMemo(() => {
    const cache: { [key: string]: MenuItem[] } = {};
    categories.forEach((category) => {
      if (category.id !== "all") {
        const categoryItems = availableItems.filter(
          (item) => item.category === category.id
        );
        cache[category.id] = applyVegFilter(categoryItems);
      }
    });
    return cache;
  }, [vegFilter, availableItems, menuItems]);

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

    Object.keys(grouped).forEach((category) => {
      grouped[category] = applyVegFilter(grouped[category]);
      if (grouped[category].length === 0) {
        delete grouped[category];
      }
    });

    return grouped;
  }, [searchQuery, vegFilter, availableItems]);

  const showAllResults =
    searchQuery.trim() && Object.keys(allCategoryItems || {}).length > 0;

  /* ---------------- Render ---------------- */
  const isLoading = isDeliveryLoading || menuLoading;

  // Menu skeleton loader
  const MenuSkeleton = () => (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      <Skeleton className="h-8 w-40 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ✅ Loader */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">
              Checking café availability...
            </p>
          </div>
        </div>
      )}

      <Header isOpen={isDeliveryOpen} />
      
      {/* Ad Carousel - only show when delivery is open */}
      {!isLoading && isDeliveryOpen && (
        <AdCarousel
          onInternalLink={(link) => {
            console.log('onInternalLink called with:', link);
            // Handle internal menu item links
            // Format: #menu-item:oreo-shake or #oreo-shake
            const menuItemName = link.replace('#menu-item:', '').replace('#', '');
            console.log('Menu item name:', menuItemName);
            
            // For Oreo Shake, switch to cold-beverages category and search
            if (menuItemName.toLowerCase().includes('oreo')) {
              console.log('Navigating to Oreo Shake');
              setSelectedCategory('cold-beverages');
              setSearchQuery('Oreo Shake');
              
              // Scroll to the cold beverages section after a short delay
              setTimeout(() => {
                const section = document.getElementById('section-cold-beverages');
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  console.warn('Section cold-beverages not found');
                }
              }, 300);
            } else if (link.startsWith('#category:')) {
              // Handle category links: #category:cold-beverages
              const categoryId = link.replace('#category:', '');
              setSelectedCategory(categoryId);
              setSearchQuery('');
              
              setTimeout(() => {
                const section = document.getElementById(`section-${categoryId}`);
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 300);
            }
          }}
        />
      )}

      {!isLoading && isDeliveryOpen && (
        <>
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 w-full">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search menu items..."
                />
              </div>
              <VegFilter value={vegFilter} onChange={setVegFilter} />
            </div>
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </>
      )}

      <main className="flex-1 pb-24">
        {!isLoading && !isDeliveryOpen ? (
          /* CLOSED STATE */
          <div className="flex flex-col items-center justify-center text-center px-6 py-16 min-h-[50vh]">
            <p className="font-display text-xl md:text-2xl text-foreground max-w-md leading-relaxed">
              Your favorite cafe is currently closed. Please drop by later to
              order.
            </p>
            <p className="mt-6 text-lg text-muted-foreground">
              Bon Appétit Café Jampot ❤️
            </p>
          </div>
        ) : !isLoading && isDeliveryOpen ? (
          /* OPEN STATE */
          menuLoading ? (
            <MenuSkeleton />
          ) : showAllResults && allCategoryItems ? (
            Object.entries(allCategoryItems).map(([categoryId, items]) => (
              <MenuSection
                key={categoryId}
                categoryId={categoryId}
                items={items}
                searchQuery={searchQuery}
              />
            ))
          ) : !searchQuery.trim() ? (
            selectedCategory === "all" ? (
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
              (() => {
                const items = cachedCategoryItems[selectedCategory] || [];
                return items.length > 0 ? (
                  <MenuSection
                    categoryId={selectedCategory}
                    items={items}
                  />
                ) : null;
              })()
            )
          ) : (
            <MenuSection
              categoryId={selectedCategory}
              items={filteredItems}
              searchQuery={searchQuery}
            />
          )
        ) : null}
      </main>

      <Footer />

      {!isLoading && isDeliveryOpen && (
        <FloatingCart onViewCart={() => setIsCartOpen(true)} />
      )}
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
