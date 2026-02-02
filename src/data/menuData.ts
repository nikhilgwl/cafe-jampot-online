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

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
}

export const categories: MenuCategory[] = [
  { id: "all", name: "All Items", icon: "📋" },
  { id: "quick-bites", name: "Quick Bites", icon: "🍟" },
  { id: "eggy-pops", name: "Eggy Pops", icon: "🥚" },
  { id: "sandwiches", name: "Sandwiches", icon: "🥪" },
  { id: "pasta", name: "Pasta", icon: "🍝" },
  { id: "chinese", name: "Chinese", icon: "🥡" },
  { id: "fried-rice", name: "Fried Rice", icon: "🍚" },
  { id: "mains", name: "Mains", icon: "🍛" },
  { id: "soups", name: "Soups", icon: "🍲" },
  { id: "winter-special", name: "Winter Special", icon: "❄️" },
  { id: "fries", name: "Fries", icon: "🍟" },
  { id: "cold-beverages", name: "Cold Drinks", icon: "🧊" },
  { id: "hot-beverages", name: "Hot Drinks", icon: "☕" },
];

export const menuItems: MenuItem[] = [
  // Quick Bites
  { id: "1", name: "Honey Chili Fries", price: 120, category: "quick-bites", isVeg: true },
  { id: "2", name: "Peri Peri Fries (Small)", price: 70, category: "quick-bites", isVeg: true },
  { id: "3", name: "Peri Peri Fries (Large)", price: 120, category: "quick-bites", isVeg: true },
  { id: "4", name: "Salted Fries (Small)", price: 60, category: "quick-bites", isVeg: true },
  { id: "5", name: "Salted Fries (Large)", price: 110, category: "quick-bites", isVeg: true },
  { id: "6", name: "Masala Peanuts", price: 80, category: "quick-bites", isVeg: true },
  { id: "7", name: "Poha (Small)", price: 60, category: "quick-bites", isVeg: true },
  { id: "8", name: "Poha (Large)", price: 90, category: "quick-bites", isVeg: true },
  { id: "9", name: "Corn Salt and Pepper", price: 110, category: "quick-bites", isVeg: true },
  { id: "10", name: "Plain Maggi", price: 50, category: "quick-bites", isVeg: true },
  { id: "11", name: "Vegetable Maggi", price: 60, category: "quick-bites", isVeg: true },
  { id: "12", name: "Cheese Maggi", price: 65, category: "quick-bites", isVeg: true },
  // Momos - Veg
  { id: "13", name: "Veg Chili Pan Fried Momos (6 pcs)", price: 100, category: "quick-bites", isVeg: true },
  { id: "14", name: "Veg Kurkure Momos (6 pcs)", price: 100, category: "quick-bites", isVeg: true },
  // Momos - Non-Veg
  { id: "13a", name: "Chicken Chili Pan Fried Momos (6 pcs)", price: 120, category: "quick-bites", isVeg: false },
  { id: "14a", name: "Chicken Kurkure Momos (6 pcs)", price: 120, category: "quick-bites", isVeg: false },

  // Sandwiches
  { id: "15", name: "Paneer Grill Sandwich", price: 90, category: "sandwiches", isVeg: true },
  { id: "16", name: "Corn Cheese Mayo Sandwich", price: 100, category: "sandwiches", isVeg: true },
  { id: "17", name: "Grill Sandwich", price: 60, category: "sandwiches", isVeg: true },
  { id: "18", name: "Cheese Grill Sandwich", price: 80, category: "sandwiches", isVeg: true },
  { id: "18a", name: "Chicken Grill Sandwich", price: 110, category: "sandwiches", isVeg: false },

  // Pasta - Veg
  { id: "19", name: "Veg Red Sauce Pasta", price: 130, category: "pasta", isVeg: true },
  { id: "20", name: "Veg White Sauce Pasta", price: 130, category: "pasta", isVeg: true },
  { id: "21", name: "Veg Pink Sauce Pasta", price: 130, category: "pasta", isVeg: true },
  // Pasta - Non-Veg
  { id: "19a", name: "Chicken Red Sauce Pasta", price: 150, category: "pasta", isVeg: false },
  { id: "20a", name: "Chicken White Sauce Pasta", price: 150, category: "pasta", isVeg: false },
  { id: "21a", name: "Chicken Pink Sauce Pasta", price: 150, category: "pasta", isVeg: false },

  // Chinese - Veg
  { id: "22", name: "Veg Chow Mein", price: 120, category: "chinese", isVeg: true },
  { id: "23", name: "Veg Garlic Chow Mein", price: 130, category: "chinese", isVeg: true },
  { id: "24", name: "Veg Schezwan Chow Mein", price: 130, category: "chinese", isVeg: true },
  // Chinese - Non-Veg
  { id: "22a", name: "Chicken Chow Mein", price: 140, category: "chinese", isVeg: false },
  { id: "23a", name: "Chicken Garlic Chow Mein", price: 150, category: "chinese", isVeg: false },
  { id: "24a", name: "Chicken Schezwan Chow Mein", price: 150, category: "chinese", isVeg: false },
  { id: "22b", name: "Egg Chow Mein", price: 130, category: "chinese", isVeg: false },
  { id: "23b", name: "Egg Garlic Chow Mein", price: 140, category: "chinese", isVeg: false },
  { id: "24b", name: "Egg Schezwan Chow Mein", price: 140, category: "chinese", isVeg: false },

  // Fried Rice - Veg
  { id: "25", name: "Veg Fried Rice", price: 120, category: "fried-rice", isVeg: true },
  { id: "26", name: "Veg Garlic Fried Rice", price: 130, category: "fried-rice", isVeg: true },
  { id: "27", name: "Veg Schezwan Fried Rice", price: 130, category: "fried-rice", isVeg: true },
  // Fried Rice - Non-Veg
  { id: "25a", name: "Chicken Fried Rice", price: 140, category: "fried-rice", isVeg: false },
  { id: "26a", name: "Chicken Garlic Fried Rice", price: 150, category: "fried-rice", isVeg: false },
  { id: "27a", name: "Chicken Schezwan Fried Rice", price: 150, category: "fried-rice", isVeg: false },
  { id: "25b", name: "Egg Fried Rice", price: 130, category: "fried-rice", isVeg: false },
  { id: "26b", name: "Egg Garlic Fried Rice", price: 140, category: "fried-rice", isVeg: false },
  { id: "27b", name: "Egg Schezwan Fried Rice", price: 140, category: "fried-rice", isVeg: false },

  // Mains - Veg
  { id: "28", name: "Chili Paneer (Dry)", price: 130, category: "mains", isVeg: true },
  { id: "29", name: "Chili Paneer (Gravy)", price: 130, category: "mains", isVeg: true },
  // Mains - Non-Veg
  { id: "28a", name: "Chili Chicken (Dry)", price: 150, category: "mains", isVeg: false },
  { id: "29a", name: "Chili Chicken (Gravy)", price: 150, category: "mains", isVeg: false },

  // Soups (Winter Special) - Veg
  { id: "30", name: "Veg Manchow Soup (Small)", price: 50, category: "soups", isVeg: true },
  { id: "31", name: "Veg Manchow Soup (Large)", price: 65, category: "soups", isVeg: true },
  { id: "32", name: "Lemon Coriander Soup (Small)", price: 50, category: "soups", isVeg: true },
  { id: "33", name: "Lemon Coriander Soup (Large)", price: 65, category: "soups", isVeg: true },
  { id: "34", name: "Chef's Special Soup (Small)", price: 50, category: "soups", isVeg: true },
  { id: "35", name: "Chef's Special Soup (Large)", price: 65, category: "soups", isVeg: true },
  // Soups - Non-Veg
  { id: "30a", name: "Chicken Manchow Soup (Small)", price: 60, category: "soups", isVeg: false },
  { id: "31a", name: "Chicken Manchow Soup (Large)", price: 80, category: "soups", isVeg: false },

  // Winter Special Quick Bites
  { id: "36", name: "Chilli Oil Eggs", price: 80, category: "winter-special", isVeg: false },
  { id: "37", name: "Chilli Oil Maggi", price: 60, category: "winter-special", isVeg: true },
  { id: "38", name: "Egg Sandwich", price: 70, category: "winter-special", isVeg: false },
  { id: "39", name: "Egg Masala", price: 80, category: "winter-special", isVeg: false },

  // Cheesy Fries
  { id: "40", name: "Cheesy Fries (Small)", price: 80, category: "fries", isVeg: true },
  { id: "41", name: "Cheesy Fries (Large)", price: 125, category: "fries", isVeg: true },
  { id: "42", name: "Cheesy Peri Peri Fries (Small)", price: 90, category: "fries", isVeg: true },
  { id: "43", name: "Cheesy Peri Peri Fries (Large)", price: 135, category: "fries", isVeg: true },

  // Cold Beverages
  { id: "44", name: "Cold Coffee", price: 60, category: "cold-beverages", isVeg: true },
  { id: "45", name: "Cold Chocolate", price: 75, category: "cold-beverages", isVeg: true },
  { id: "46", name: "Nimbu Pani", price: 25, category: "cold-beverages", isVeg: true },
  { id: "47", name: "Shikanji", price: 40, category: "cold-beverages", isVeg: true },
  { id: "48", name: "Cold Drink (200ml)", price: 20, category: "cold-beverages", isVeg: true },
  { id: "49", name: "Masala Coke", price: 35, category: "cold-beverages", isVeg: true },
  { id: "50", name: "Coke Float", price: 55, category: "cold-beverages", isVeg: true },
  { id: "51", name: "Iced Tea", price: 50, category: "cold-beverages", isVeg: true },

  // Hot Beverages
  { id: "52", name: "Hot Coffee", price: 30, category: "hot-beverages", isVeg: true },
  { id: "53", name: "Hot Chocolate", price: 75, category: "hot-beverages", isVeg: true },
  { id: "54", name: "Bournvita", price: 35, category: "hot-beverages", isVeg: true },
  { id: "55", name: "Ginger Tea", price: 25, category: "hot-beverages", isVeg: true },
  { id: "56", name: "Haldi Doodh", price: 40, category: "hot-beverages", isVeg: true },
];

export const getItemsByCategory = (categoryId: string): MenuItem[] => {
  return menuItems.filter(item => item.category === categoryId);
};
