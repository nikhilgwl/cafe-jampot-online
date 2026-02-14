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
import {
  categories,
  menuItems,
  MenuItem,
} from "@/data/menuData";

import { fuzzyMatch } from "@/lib/fuzzySearch";
import { isWithinDeliveryWindow } from "@/lib/deliveryWindow";
import { supabase } from "@/integrations/supabase/client";

const IndexContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vegFilter, setVegFilter] = useState<VegFilterType>("all");
  const [stockStatus, setStockStatus] = useState<{ [key: string]: boolean }>({});

  // Delivery state
  const [dbDeliveryOpen, setDbDeliveryOpen] = useState<boolean | null>(null);
  const [adminOverride, setAdminOverride] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isDeliveryLoading, setIsDeliveryLoading] = useState(true);

  /* ---------------- Fetch delivery flag ---------------- */
  useEffect(() => {
    const fetchDeliveryStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("delivery_settings")
          .select("is_open, admin_override")
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Failed to fetch delivery status:", error);
          setDbDeliveryOpen(false);
          setAdminOverride(false);
        } else {
          setDbDeliveryOpen(data?.is_open ?? false);
          setAdminOverride((data as any)?.admin_override ?? false);
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
          const newData = payload.new as { is_open: boolean; admin_override: boolean };
          setDbDeliveryOpen(newData?.is_open ?? false);
          setAdminOverride(newData?.admin_override ?? false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ---------------- Recompute final delivery ---------------- */
  useEffect(() => {
    if (dbDeliveryOpen === null) return;
    setIsDeliveryOpen(dbDeliveryOpen && (adminOverride || isWithinDeliveryWindow()));
  }, [dbDeliveryOpen, adminOverride]);

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
  }, [stockStatus]);

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
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ✅ Loader */}
      {isDeliveryLoading && (
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

      {!isDeliveryLoading && isDeliveryOpen && (
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
        {!isDeliveryLoading && !isDeliveryOpen ? (
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
        ) : !isDeliveryLoading && isDeliveryOpen ? (
          /* OPEN STATE */
          showAllResults && allCategoryItems ? (
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

      {!isDeliveryLoading && isDeliveryOpen && (
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
