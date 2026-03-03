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
  { id: "chinese", name: "Chowmein", icon: "🥡" },
  { id: "fried-rice", name: "Fried Rice", icon: "🍚" },
  { id: "mains", name: "Mains", icon: "🍛" },
  { id: "soups", name: "Soups", icon: "🍲" },
  { id: "fries", name: "Fries", icon: "🍟" },
  { id: "cold-beverages", name: "Cold Drinks", icon: "🧊" },
  { id: "mocktails", name: "Mocktails", icon: "🍹" },
  { id: "hot-beverages", name: "Hot Drinks", icon: "☕" },
];

export const menuItems: MenuItem[] = [
  // Quick Bites
  // { id: "q1", name: "Masala Peanuts", price: 80, category: "quick-bites", isVeg: true },
  // { id: "q2", name: "Poha", price: 0, priceSmall: 60, priceLarge: 90, category: "quick-bites", isVeg: true, hasVariants: true },
  // { id: "q3", name: "Corn Salt and Pepper", price: 110, category: "quick-bites", isVeg: true },
  // { id: "q4", name: "Plain Maggi", price: 50, category: "quick-bites", isVeg: true },
  // { id: "q5", name: "Vegetable Maggi", price: 60, category: "quick-bites", isVeg: true },
  // { id: "q6", name: "Cheese Maggi", price: 65, category: "quick-bites", isVeg: true },
  // { id: "q7", name: "Egg Maggi", price: 65, category: "quick-bites", isVeg: false },
  // { id: "q8", name: "Wai Wai Bhel", price: 80, category: "quick-bites", isVeg: true },
  // { id: "q9", name: "Chilli Oil Maggi/PiP Maggi", price: 80, category: "quick-bites", isVeg: true },

  // // Momos
  // { id: "m1v", name: "Veg Chili Pan Fried Momos (6 pcs)", price: 100, category: "quick-bites", isVeg: true },
  // { id: "m1nv", name: "Chicken Chili Pan Fried Momos (6 pcs)", price: 120, category: "quick-bites", isVeg: false },
  // { id: "m2v", name: "Veg Kurkure Momos (6 pcs)", price: 100, category: "quick-bites", isVeg: true },
  // { id: "m2nv", name: "Chicken Kurkure Momos (6 pcs)", price: 120, category: "quick-bites", isVeg: false },
  // { id: "m3v", name: "Veg Fried Momos (6/10 pcs)", price: 0, priceSmall: 80, priceLarge: 110, category: "quick-bites", isVeg: true, hasVariants: true },
  // { id: "m3nv", name: "Chicken Fried Momos (6/10 pcs)", price: 0, priceSmall: 90, priceLarge: 130, category: "quick-bites", isVeg: false, hasVariants: true },
  // { id: "m4v", name: "Veg Steamed Momos (6/10 pcs)", price: 0, priceSmall: 60, priceLarge: 90, category: "quick-bites", isVeg: true, hasVariants: true },
  // { id: "m4nv", name: "Chicken Steamed Momos (6/10 pcs)", price: 0, priceSmall: 80, priceLarge: 120, category: "quick-bites", isVeg: false, hasVariants: true },

  // // Eggy Pops
  // { id: "e1", name: "Boiled Eggs", price: 30, category: "eggy-pops", isVeg: false },
  // { id: "e2", name: "Egg Bhurji", price: 50, category: "eggy-pops", isVeg: false },
  // { id: "e3", name: "Egg Bhurji + Toast", price: 75, category: "eggy-pops", isVeg: false },
  // { id: "e4", name: "Omelette", price: 50, category: "eggy-pops", isVeg: false },
  // { id: "e5", name: "Bread Omelette", price: 80, category: "eggy-pops", isVeg: false },
  // { id: "e6", name: "Half Fry", price: 50, category: "eggy-pops", isVeg: false },
  // { id: "e7", name: "Chilli Oil Eggs", price: 60, category: "eggy-pops", isVeg: false },
  // { id: "e8", name: "Egg Masala", price: 60, category: "eggy-pops", isVeg: false },

  // // Sandwiches
  // { id: "15", name: "Paneer Grill Sandwich", price: 90, category: "sandwiches", isVeg: true },
  // { id: "16", name: "Corn Cheese Mayo Sandwich", price: 100, category: "sandwiches", isVeg: true },
  // { id: "17", name: "Grill Sandwich", price: 60, category: "sandwiches", isVeg: true },
  // { id: "18", name: "Cheese Grill Sandwich", price: 80, category: "sandwiches", isVeg: true },
  // { id: "18a", name: "Chicken Grill Sandwich", price: 110, category: "sandwiches", isVeg: false },
  // { id: "s1", name: "Egg Sandwich", price: 70, category: "sandwiches", isVeg: false },

  // // Pasta
  // { id: "p1v", name: "Veg Red Sauce Pasta", price: 130, category: "pasta", isVeg: true },
  // { id: "p1nv", name: "Chicken Red Sauce Pasta", price: 160, category: "pasta", isVeg: false },
  // { id: "p2v", name: "Veg White Sauce Pasta", price: 130, category: "pasta", isVeg: true },
  // { id: "p2nv", name: "Chicken White Sauce Pasta", price: 160, category: "pasta", isVeg: false },
  // { id: "p3v", name: "Veg Pink Sauce Pasta", price: 130, category: "pasta", isVeg: true },
  // { id: "p3nv", name: "Chicken Pink Sauce Pasta", price: 160, category: "pasta", isVeg: false },

  // // Chinese
  // { id: "c1v", name: "Veg Chow Mein", price: 120, category: "chinese", isVeg: true },
  // { id: "c1nv", name: "Chicken Chow Mein", price: 150, category: "chinese", isVeg: false },
  // { id: "c1e", name: "Egg Chow Mein", price: 140, category: "chinese", isVeg: false },
  // { id: "c2v", name: "Veg Garlic Chow Mein", price: 130, category: "chinese", isVeg: true },
  // { id: "c2nv", name: "Chicken Garlic Chow Mein", price: 160, category: "chinese", isVeg: false },
  // { id: "c3v", name: "Veg Schezwan Chow Mein", price: 130, category: "chinese", isVeg: true },
  // { id: "c3nv", name: "Chicken Schezwan Chow Mein", price: 160, category: "chinese", isVeg: false },

  // // Fried Rice
  // { id: "f1v", name: "Veg Fried Rice", price: 120, category: "fried-rice", isVeg: true },
  // { id: "f1nv", name: "Chicken Fried Rice", price: 150, category: "fried-rice", isVeg: false },
  // { id: "f1e", name: "Egg Fried Rice", price: 140, category: "fried-rice", isVeg: false },
  // { id: "f2v", name: "Veg Garlic Fried Rice", price: 130, category: "fried-rice", isVeg: true },
  // { id: "f2nv", name: "Chicken Garlic Fried Rice", price: 160, category: "fried-rice", isVeg: false },
  // { id: "f3v", name: "Veg Schezwan Fried Rice", price: 130, category: "fried-rice", isVeg: true },
  // { id: "f3nv", name: "Chicken Schezwan Fried Rice", price: 160, category: "fried-rice", isVeg: false },

  // // Mains
  // { id: "28", name: "Chili Paneer (Dry/Gravy)", price: 130, category: "mains", isVeg: true },
  // { id: "28a", name: "Chili Chicken (Dry/Gravy)", price: 150, category: "mains", isVeg: false },

  // // Soups
  // // Veg Soups (₹50)
  // { id: "s2v", name: "Veg Manchow Soup", price: 50, category: "soups", isVeg: true },
  // { id: "s3v", name: "Veg Lemon Coriander Soup", price: 50, category: "soups", isVeg: true },
  // { id: "s4v", name: "Veg Chef's Special Soup", price: 50, category: "soups", isVeg: true },

  // // Non-Veg Soups (₹65)
  // { id: "s2nv", name: "Chicken Manchow Soup", price: 65, category: "soups", isVeg: false },
  // { id: "s3nv", name: "Chicken Lemon Coriander Soup", price: 65, category: "soups", isVeg: false },
  // { id: "s4nv", name: "Chicken Chef's Special Soup", price: 65, category: "soups", isVeg: false },

  // // Fries Category
  // { id: "f1", name: "Honey Chili Fries", price: 120, category: "fries", isVeg: true },
  // { id: "f2", name: "Cheesy Fries", price: 0, priceSmall: 80, priceLarge: 125, category: "fries", isVeg: true, hasVariants: true },
  // { id: "f3", name: "Cheesy Peri Peri Fries", price: 0, priceSmall: 90, priceLarge: 135, category: "fries", isVeg: true, hasVariants: true },
  // { id: "f4", name: "Peri Peri Fries", price: 0, priceSmall: 70, priceLarge: 120, category: "fries", isVeg: true, hasVariants: true },
  // { id: "f5", name: "Salted Fries", price: 0, priceSmall: 60, priceLarge: 110, category: "fries", isVeg: true, hasVariants: true },

  // // Cold Beverages

  // { id: "44", name: "Cold Coffee", price: 60, category: "cold-beverages", isVeg: true },
  // { id: "45", name: "Cold Chocolate", price: 75, category: "cold-beverages", isVeg: true },
  // { id: "b1", name: "Oreo Shake", price: 80, category: "cold-beverages", isVeg: true },
  // { id: "46", name: "Nimbu Pani", price: 25, category: "cold-beverages", isVeg: true },
  // { id: "47", name: "Shikanji", price: 40, category: "cold-beverages", isVeg: true },
  // { id: "48", name: "Cold Drink (200ml)", price: 20, category: "cold-beverages", isVeg: true },
  // { id: "49", name: "Masala Coke", price: 35, category: "cold-beverages", isVeg: true },
  // { id: "50", name: "Coke Float", price: 55, category: "cold-beverages", isVeg: true },
  // { id: "51", name: "Iced Tea", price: 50, category: "cold-beverages", isVeg: true },
  // { id: "52", name: "Cold Bournvita", price: 35, category: "cold-beverages", isVeg: true },
  // { id: "53", name: "Diet Coke", price: 40, category: "cold-beverages", isVeg: true },

  // // Mocktails (Separated)
  // { id: "mkt1", name: "Mojito", price: 60, category: "mocktails", isVeg: true },
  // { id: "mkt2", name: "Blue Lagoon", price: 60, category: "mocktails", isVeg: true },
  // { id: "mkt3", name: "Green Apple", price: 60, category: "mocktails", isVeg: true },
  // { id: "mkt4", name: "Peach Iced Tea", price: 60, category: "mocktails", isVeg: true },

  // // Hot Beverages
  // { id: "54", name: "Hot Coffee", price: 30, category: "hot-beverages", isVeg: true },
  // { id: "55", name: "Hot Chocolate", price: 75, category: "hot-beverages", isVeg: true },
  // { id: "56", name: "Ginger Tea", price: 25, category: "hot-beverages", isVeg: true },
  // { id: "59", name: "Haldi Dhoodh", price: 40, category: "hot-beverages", isVeg: true },
  // { id: "58", name: "Hot Bournvita", price: 35, category: "hot-beverages", isVeg: true },
];

export const getItemsByCategory = (categoryId: string): MenuItem[] => {
  return menuItems.filter(item => item.category === categoryId);
};