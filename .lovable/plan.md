

## Admin Override for Delivery Time Logic

### Current Behavior
- The `isWithinDeliveryWindow()` function in `Index.tsx` automatically restricts delivery to Mon-Sat 6:45 PM - 2:00 AM.
- The admin toggle in the database (`delivery_settings.is_open`) is **ANDed** with the time check, so the admin can only **close** during open hours -- never **open** outside hours.

### Desired Behavior
- Outside scheduled hours, delivery is **automatically closed**.
- The admin can **override** this and force delivery open at any time.
- If the admin closes delivery during scheduled hours, it stays closed.

### Solution: Add an `admin_override` flag

**Database change:** Add a boolean `admin_override` column to `delivery_settings`. When the admin toggles delivery ON outside of scheduled hours, set `admin_override = true`. This tells the frontend: "ignore the time check."

**New logic in `Index.tsx`:**
```text
if admin_override is true AND is_open is true:
    delivery = OPEN (regardless of time)
else:
    delivery = is_open AND isWithinDeliveryWindow()
```

**Admin panel flow in `Admin.tsx`:**
When the admin toggles delivery ON:
1. Check if it's outside the scheduled window.
2. If outside hours, show a confirmation: "Cafe is outside scheduled hours (Mon-Sat 6:45 PM - 2:00 AM). Open anyway?"
3. If confirmed, set both `is_open = true` and `admin_override = true`.
4. If it's within hours, just set `is_open = true` and `admin_override = false`.

When the admin toggles delivery OFF:
- Set `is_open = false` and `admin_override = false`.

### Files to Change

1. **Database migration** -- Add `admin_override` boolean column (default `false`) to `delivery_settings`.

2. **`src/pages/Index.tsx`**
   - Keep the `isWithinDeliveryWindow()` function.
   - Fetch `admin_override` alongside `is_open` from `delivery_settings`.
   - Update delivery logic: `setIsDeliveryOpen(dbDeliveryOpen && (adminOverride || isWithinDeliveryWindow()))`.
   - Update the realtime subscription to also track `admin_override`.

3. **`src/pages/Admin.tsx`**
   - Copy the `isWithinDeliveryWindow()` function (or extract to a shared utility).
   - When toggling ON outside hours, show a confirmation dialog/toast asking the admin to confirm.
   - Update the database call to also set `admin_override` accordingly.

### Technical Details

**Migration SQL:**
```text
ALTER TABLE delivery_settings ADD COLUMN admin_override boolean NOT NULL DEFAULT false;
```

**Decision logic (Index.tsx):**
```text
finalOpen = is_open AND (admin_override OR isWithinDeliveryWindow())
```

This preserves automatic closing outside hours while giving the admin full power to override when needed.

