-- =====================================================
-- Phase 2: menu_items table for dynamic menu management
-- =====================================================
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  price_small INTEGER,
  price_large INTEGER,
  category TEXT NOT NULL,
  is_veg BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read menu items
CREATE POLICY "Anyone can read menu items"
ON public.menu_items
FOR SELECT
USING (true);

-- Staff/admin can insert menu items
CREATE POLICY "Staff can insert menu items"
ON public.menu_items
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Staff/admin can update menu items
CREATE POLICY "Staff can update menu items"
ON public.menu_items
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Staff/admin can delete menu items
CREATE POLICY "Staff can delete menu items"
ON public.menu_items
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- =====================================================
-- Phase 3: feedback table for anonymous feedback
-- =====================================================
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('product', 'website', 'service')),
  feedback_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback (anonymous)
CREATE POLICY "Anyone can insert feedback"
ON public.feedback
FOR INSERT
WITH CHECK (true);

-- Only staff/admin can read feedback
CREATE POLICY "Staff can read feedback"
ON public.feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- =====================================================
-- Phase 4: advertisements table for carousel
-- =====================================================
CREATE TABLE public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  link_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Anyone can read active advertisements
CREATE POLICY "Anyone can read active advertisements"
ON public.advertisements
FOR SELECT
USING (active = true);

-- Only admin can manage advertisements
CREATE POLICY "Admin can manage advertisements"
ON public.advertisements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- Seed menu_items with data from menuData.ts + new items
-- =====================================================
INSERT INTO public.menu_items (name, price, category, is_veg) VALUES
-- Quick Bites
('Honey Chili Fries', 120, 'quick-bites', true),
('Peri Peri Fries (Small)', 70, 'quick-bites', true),
('Peri Peri Fries (Large)', 120, 'quick-bites', true),
('Salted Fries (Small)', 60, 'quick-bites', true),
('Salted Fries (Large)', 110, 'quick-bites', true),
('Masala Peanuts', 80, 'quick-bites', true),
('Poha (Small)', 60, 'quick-bites', true),
('Poha (Large)', 90, 'quick-bites', true),
('Corn Salt and Pepper', 110, 'quick-bites', true),
('Plain Maggi', 50, 'quick-bites', true),
('Vegetable Maggi', 60, 'quick-bites', true),
('Cheese Maggi', 65, 'quick-bites', true),
('Egg Maggi', 65, 'quick-bites', false),
('Wai Wai Bhel', 80, 'quick-bites', true),
('Pir Maggi', 80, 'quick-bites', true),
-- Momos - Veg
('Veg Chili Pan Fried Momos (6 pcs)', 100, 'quick-bites', true),
('Veg Kurkure Momos (6 pcs)', 100, 'quick-bites', true),
('Veg Fried Momos (6 pcs)', 80, 'quick-bites', true),
('Veg Fried Momos (10 pcs)', 110, 'quick-bites', true),
('Veg Steamed Momos (6 pcs)', 60, 'quick-bites', true),
('Veg Steamed Momos (10 pcs)', 90, 'quick-bites', true),
-- Momos - Non-Veg
('Chicken Chili Pan Fried Momos (6 pcs)', 120, 'quick-bites', false),
('Chicken Kurkure Momos (6 pcs)', 120, 'quick-bites', false),
('Chicken Fried Momos (6 pcs)', 90, 'quick-bites', false),
('Chicken Fried Momos (10 pcs)', 130, 'quick-bites', false),
('Chicken Steamed Momos (6 pcs)', 80, 'quick-bites', false),
('Chicken Steamed Momos (10 pcs)', 120, 'quick-bites', false),

-- Eggy Pops (new category)
('Boiled Eggs', 30, 'eggy-pops', false),
('Egg Bhurji', 50, 'eggy-pops', false),
('Egg Bhurji Toast', 75, 'eggy-pops', false),
('Omelette', 50, 'eggy-pops', false),
('Bread Omelette', 80, 'eggy-pops', false),
('Half Fry', 50, 'eggy-pops', false),
('Egg Chilli Oil', 60, 'eggy-pops', false),
('Egg Masala', 60, 'eggy-pops', false),

-- Sandwiches
('Paneer Grill Sandwich', 90, 'sandwiches', true),
('Corn Cheese Mayo Sandwich', 100, 'sandwiches', true),
('Grill Sandwich', 60, 'sandwiches', true),
('Cheese Grill Sandwich', 80, 'sandwiches', true),
('Chicken Grill Sandwich', 110, 'sandwiches', false),

-- Pasta - Veg
('Veg Red Sauce Pasta', 130, 'pasta', true),
('Veg White Sauce Pasta', 130, 'pasta', true),
('Veg Pink Sauce Pasta', 130, 'pasta', true),
-- Pasta - Non-Veg
('Chicken Red Sauce Pasta', 150, 'pasta', false),
('Chicken White Sauce Pasta', 150, 'pasta', false),
('Chicken Pink Sauce Pasta', 150, 'pasta', false),

-- Chinese - Veg
('Veg Chow Mein', 120, 'chinese', true),
('Veg Garlic Chow Mein', 130, 'chinese', true),
('Veg Schezwan Chow Mein', 130, 'chinese', true),
-- Chinese - Non-Veg
('Chicken Chow Mein', 140, 'chinese', false),
('Chicken Garlic Chow Mein', 150, 'chinese', false),
('Chicken Schezwan Chow Mein', 150, 'chinese', false),
('Egg Chow Mein', 130, 'chinese', false),
('Egg Garlic Chow Mein', 140, 'chinese', false),
('Egg Schezwan Chow Mein', 140, 'chinese', false),

-- Fried Rice - Veg
('Veg Fried Rice', 120, 'fried-rice', true),
('Veg Garlic Fried Rice', 130, 'fried-rice', true),
('Veg Schezwan Fried Rice', 130, 'fried-rice', true),
-- Fried Rice - Non-Veg
('Chicken Fried Rice', 140, 'fried-rice', false),
('Chicken Garlic Fried Rice', 150, 'fried-rice', false),
('Chicken Schezwan Fried Rice', 150, 'fried-rice', false),
('Egg Fried Rice', 130, 'fried-rice', false),
('Egg Garlic Fried Rice', 140, 'fried-rice', false),
('Egg Schezwan Fried Rice', 140, 'fried-rice', false),

-- Mains - Veg
('Chili Paneer (Dry)', 130, 'mains', true),
('Chili Paneer (Gravy)', 130, 'mains', true),
-- Mains - Non-Veg
('Chili Chicken (Dry)', 150, 'mains', false),
('Chili Chicken (Gravy)', 150, 'mains', false),

-- Soups - Veg
('Veg Manchow Soup (Small)', 50, 'soups', true),
('Veg Manchow Soup (Large)', 65, 'soups', true),
('Lemon Coriander Soup (Small)', 50, 'soups', true),
('Lemon Coriander Soup (Large)', 65, 'soups', true),
('Chef''s Special Soup (Small)', 50, 'soups', true),
('Chef''s Special Soup (Large)', 65, 'soups', true),
-- Soups - Non-Veg
('Chicken Manchow Soup (Small)', 60, 'soups', false),
('Chicken Manchow Soup (Large)', 80, 'soups', false),

-- Winter Special
('Chilli Oil Eggs', 80, 'winter-special', false),
('Chilli Oil Maggi', 60, 'winter-special', true),
('Egg Sandwich', 70, 'winter-special', false),
('Egg Masala Winter', 80, 'winter-special', false),

-- Fries
('Cheesy Fries (Small)', 80, 'fries', true),
('Cheesy Fries (Large)', 125, 'fries', true),
('Cheesy Peri Peri Fries (Small)', 90, 'fries', true),
('Cheesy Peri Peri Fries (Large)', 135, 'fries', true),

-- Cold Beverages
('Cold Coffee', 100, 'cold-beverages', true),
('Cold Chocolate', 100, 'cold-beverages', true),
('Banana Chocolate', 75, 'cold-beverages', true),
('Milkshake', 75, 'cold-beverages', true),
('Soft Drinks', 35, 'cold-beverages', true),
('Masala Doodh (Cold)', 40, 'cold-beverages', true),
('Nimbu Pani', 25, 'cold-beverages', true),
('Shikanji', 40, 'cold-beverages', true),
('Cold Drink (200ml)', 20, 'cold-beverages', true),
('Masala Coke', 35, 'cold-beverages', true),
('Coke Float', 55, 'cold-beverages', true),
('Iced Tea', 50, 'cold-beverages', true),

-- Hot Beverages
('Hot Coffee', 40, 'hot-beverages', true),
('Hot Chocolate', 40, 'hot-beverages', true),
('Bournvita', 35, 'hot-beverages', true),
('Tea (Ginger)', 25, 'hot-beverages', true),
('Tea (Plain)', 20, 'hot-beverages', true),
('Masala Chai', 25, 'hot-beverages', true),
('Lemon Tea', 20, 'hot-beverages', true),
('Black Tea', 20, 'hot-beverages', true),
('Haldi Doodh', 40, 'hot-beverages', true);