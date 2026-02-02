
# Comprehensive Plan: Café Jampot Bug Fixes and Feature Integration

## Summary

This plan addresses 4 major issues/features in priority order:
1. **Bug 1 (CRITICAL)**: Orders not saving to database - CartSheet only sends WhatsApp but never inserts to database
2. **Bug 3 (HIGH)**: Menu items are hardcoded in `menuData.ts` - need to migrate to database with proper loading states
3. **Bug 2 (MEDIUM)**: Implement anonymous feedback system
4. **Bug 4 (LOW)**: Add advertisement carousel below header

Additionally, menu items from the physical menu cards will be added/updated.

---

## Bug 1: Orders Not Saving to Database (CRITICAL)

### Problem
The `CartSheet.tsx` component builds a WhatsApp message and opens `wa.me`, but **never inserts the order into the `orders` table**. The Dashboard reads from this empty table, showing no orders.

### Solution

**Step 1: Update CartSheet.tsx to save orders before WhatsApp redirect**

Modify `handleSubmitOrder()` to:
1. Get current authenticated user (if any)
2. Insert order into `orders` table with: items, total_amount, hostel_name, user_id
3. Handle success/error appropriately
4. Then open WhatsApp link

```text
Flow:
User submits order → Insert to database → Show success toast → Open WhatsApp
```

**Step 2: Add authentication awareness**

The RLS policy requires authentication (`auth.uid() IS NOT NULL`). Two options:
- **Option A**: Make authentication required to place orders (per your security constraints)
- **Option B**: Add a prompt for unauthenticated users to login first

Based on your memory note "Only authenticated users can place orders", Option A is correct.

### Files to Modify
- `src/components/CartSheet.tsx` - Add database insert before WhatsApp redirect

---

## Bug 3: Menu Items Database Integration (HIGH)

### Problem
Menu items are hardcoded in `src/data/menuData.ts`. To enable dynamic management (adding/updating items from admin panel), they should be in the database.

### Solution

**Step 1: Create `menu_items` table**

Database schema:
```text
menu_items table:
- id (UUID, primary key)
- name (text, not null)
- price (integer, not null)
- price_small (integer, nullable)
- price_large (integer, nullable)
- category (text, not null)
- is_veg (boolean, default true)
- is_available (boolean, default true)
- created_at (timestamp)
```

**Step 2: Migrate existing hardcoded items**

Insert all items from `menuData.ts` + new items from physical menu into database.

**Step 3: Update Index.tsx to fetch from database**

- Add loading skeleton while fetching menu items
- Fetch menu items from Supabase
- Handle error states gracefully
- Remove dependency on hardcoded `menuItems` array

**Step 4: Update Admin.tsx**

- Fetch menu items from database instead of hardcoded array
- Optionally add ability to edit items (future enhancement)

### New Menu Items to Add
From your physical menu cards:
- **Cold Beverages**: Cold Coffee (100), Cold Chocolate (100), Banana Chocolate (75), Milkshake (75), Soft Drinks (35), Masala Doodh Cold (40)
- **Hot Beverages**: Hot Coffee (40), Hot Chocolate (40), Bournvita (35), Tea Ginger (25), Tea Plain (20), Masala Chai (25), Lemon Tea (20), Black Tea (20)
- **Eggy Pops**: Boiled Eggs (30), Egg Bhurji (50), Egg Bhurji Toast (75), Omelette (50), Bread Omelette (80), Half Fry (50)
- **Momos**: Additional variants with half/full sizing
- **Today's Specials**: Pir Maggi (80), Cheesy Fries half/full, Peri Peri Cheesy Fries, etc.
- **Wai Wai Bhel** (80), **Egg Maggi** (65)

### Files to Modify
- Create new migration for `menu_items` table
- `src/pages/Index.tsx` - Fetch from database + loading state
- `src/pages/Admin.tsx` - Fetch from database
- `src/data/menuData.ts` - Keep categories only, remove items array
- `src/components/MenuSection.tsx` - No changes needed
- `src/components/MenuItem.tsx` - No changes needed

---

## Bug 2: Anonymous Feedback System (MEDIUM)

### Solution

**Step 1: Create `feedback` table**

Database schema:
```text
feedback table:
- id (UUID, primary key)
- category (text, check: product/website/service)
- feedback_text (text, not null, max 500 chars)
- created_at (timestamp)
```

RLS Policy: Anyone can INSERT (anonymous), only staff/admin can SELECT.

**Step 2: Create FeedbackForm component**

Features:
- Category dropdown (Product, Website, Service)
- Textarea with 100-word limit and character counter
- Submit button
- Success message after submission
- Fully anonymous (no user identification)

**Step 3: Add Feedback link/button to Footer**

Options:
- Add "Give Feedback" button in footer
- Or add a floating feedback button
- Or add a dedicated /feedback route

### Files to Create/Modify
- Create migration for `feedback` table
- Create `src/components/FeedbackForm.tsx`
- Modify `src/components/Footer.tsx` to include feedback trigger

---

## Bug 4: Advertisement Carousel (LOW)

### Solution

**Step 1: Create `advertisements` table**

Database schema:
```text
advertisements table:
- id (UUID, primary key)
- image_url (text, not null)
- link_url (text, nullable)
- active (boolean, default true)
- display_order (integer)
- created_at (timestamp)
```

RLS: Anyone can SELECT active ads, only admin can manage.

**Step 2: Create AdCarousel component**

Features:
- Auto-rotating every 5-7 seconds
- Manual prev/next navigation
- Responsive design
- Fetches active ads from database
- Clickable ads (optional link_url)
- Uses embla-carousel-react (already installed)

**Step 3: Add to Index.tsx**

Place carousel between Header and the sticky search/filter bar.

### Files to Create/Modify
- Create migration for `advertisements` table
- Create `src/components/AdCarousel.tsx`
- Modify `src/pages/Index.tsx` to include AdCarousel

---

## Technical Details

### Database Migrations Required

1. **menu_items table** with RLS (public read, staff/admin write)
2. **feedback table** with RLS (public insert, staff/admin read)
3. **advertisements table** with RLS (public read active, admin manage)
4. Seed data for menu_items with all items from menuData.ts + new items

### Component Architecture

```text
Index.tsx
├── Header (unchanged)
├── AdCarousel (NEW)
├── SearchBar + VegFilter (unchanged)
├── CategoryFilter (unchanged)
├── MenuSection (uses fetched items)
├── Footer
│   └── FeedbackForm trigger (NEW)
└── CartSheet (+ database save)
```

### Loading States

- Menu items: Show skeleton grid while loading
- Ad carousel: Show placeholder/shimmer while loading
- Feedback form: Show loading spinner during submission

---

## Implementation Order

1. **Phase 1 - Critical Bug Fix**
   - Fix CartSheet to save orders to database
   - Test order flow end-to-end

2. **Phase 2 - Menu Database Migration**
   - Create menu_items table
   - Migrate all existing + new items
   - Update Index.tsx and Admin.tsx to use database
   - Add loading skeletons

3. **Phase 3 - Feedback System**
   - Create feedback table
   - Build FeedbackForm component
   - Integrate into Footer

4. **Phase 4 - Ad Carousel**
   - Create advertisements table
   - Build AdCarousel component
   - Add to Index.tsx

---

## Testing Checklist

After implementation, verify:
- [ ] Orders save to database AND appear on dashboard
- [ ] Orders also trigger WhatsApp message
- [ ] Menu items load from database with loading state
- [ ] Out-of-stock items hidden correctly (using stock_status table)
- [ ] Feedback form works and stores anonymously
- [ ] Staff can view feedback submissions
- [ ] Ad carousel displays and auto-rotates
- [ ] All features work on mobile
