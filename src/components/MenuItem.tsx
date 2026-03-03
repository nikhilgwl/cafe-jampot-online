import React, { memo } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { MenuItem as MenuItemType } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = memo(({ item }) => {
  const { items, addItem, updateQuantity } = useCart();

  const renderAddToCart = (displayPrice: number, label?: string) => {
    const cartItemId = label ? `${item.id}-${label.toLowerCase()}` : item.id;
    const cartItem = items.find(i => i.id === cartItemId);
    const quantity = cartItem?.quantity || 0;

    if (quantity === 0) {
      return (
        <Button
          onClick={() => addItem({
            ...item,
            id: cartItemId,
            price: displayPrice,
            name: label ? `${item.name} (${label})` : item.name
          })}
          size="sm"
          // Reduced padding (px-2) and text size (text-xs) to prevent overflow
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg h-9 px-2 gap-1 shadow-sm transition-all text-xs sm:text-sm"
        >
          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            {label ? `${label.charAt(0)} - ₹${displayPrice}` : `Add - ₹${displayPrice}`}
          </span>
        </Button>
      );
    }

    return (
      <div className="flex w-full items-center justify-between bg-primary rounded-lg overflow-hidden h-9 shadow-sm">
        <button
          onClick={() => updateQuantity(cartItemId, quantity - 1)}
          className="flex-1 h-full text-primary-foreground hover:bg-primary-foreground/10 transition-colors flex items-center justify-center"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-primary-foreground font-bold text-xs px-1 min-w-[1.2rem] text-center">
          {quantity}
        </span>
        <button
          onClick={() => addItem({ ...item, id: cartItemId, price: displayPrice })}
          className="flex-1 h-full text-primary-foreground hover:bg-primary-foreground/10 transition-colors flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <div className="menu-card flex flex-col h-full animate-fade-in group border border-border/40 p-3 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0 mb-3">
        <div className="flex items-start gap-2 mb-1">
          <span className={`veg-badge mt-1 shrink-0 ${item.isVeg ? 'veg-badge-veg' : 'veg-badge-nonveg'}`}>
            ●
          </span>
          <h3 className="font-medium text-foreground text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {item.name}
          </h3>
        </div>
        {!item.hasVariants && (
          <p className="text-base font-bold text-primary">₹{item.price}</p>
        )}
      </div>

      <div className="mt-auto">
        {item.hasVariants ? (
          // Using a grid with 2 columns ensures they stay side-by-side without overlapping
          <div className="grid grid-cols-2 gap-2">
            {item.priceSmall !== undefined && renderAddToCart(item.priceSmall, 'Small')}
            {item.priceLarge !== undefined && renderAddToCart(item.priceLarge, 'Large')}
          </div>
        ) : (
          <div className="w-full">
            {renderAddToCart(item.price)}
          </div>
        )}
      </div>
    </div>
  );
});

MenuItem.displayName = 'MenuItem';

export default MenuItem;