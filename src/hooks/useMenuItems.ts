import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  priceSmall?: number;
  priceLarge?: number;
  category: string;
  description?: string;
  isVeg: boolean;
  hasVariants?: boolean;
}

interface DBMenuItem {
  id: string;
  name: string;
  price: number;
  price_small: number | null;
  price_large: number | null;
  category: string;
  is_veg: boolean;
  is_available: boolean;
}

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("is_available", true)
          .order("name", { ascending: true });

        if (fetchError) {
          console.error("Failed to fetch menu items:", fetchError);
          setError("Failed to load menu items");
        } else {
          const mappedItems: MenuItem[] = (data as DBMenuItem[]).map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            priceSmall: item.price_small ?? undefined,
            priceLarge: item.price_large ?? undefined,
            category: item.category,
            isVeg: item.is_veg,
          }));
          setItems(mappedItems);
        }
      } catch (err) {
        console.error("Menu items error:", err);
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return { items, loading, error };
}

export function useAllMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("menu_items")
          .select("*")
          .order("name", { ascending: true });

        if (fetchError) {
          console.error("Failed to fetch menu items:", fetchError);
          setError("Failed to load menu items");
        } else {
          const mappedItems: MenuItem[] = (data as DBMenuItem[]).map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            priceSmall: item.price_small ?? undefined,
            priceLarge: item.price_large ?? undefined,
            category: item.category,
            isVeg: item.is_veg,
            isAvailable: item.is_available,
          }));
          setItems(mappedItems);
        }
      } catch (err) {
        console.error("Menu items error:", err);
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return { items, loading, error };
}
