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
  const cartItem = items.find(i => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="menu-card flex flex-col h-full animate-fade-in group">
      <div className="flex-1 min-w-0 mb-4">
        <div className="flex items-start gap-2.5 mb-3">
          <span
            className={`veg-badge mt-0.5 ${
              item.isVeg ? 'veg-badge-veg' : 'veg-badge-nonveg'
            }`}
          >
            ●
          </span>
          <h3 className="font-medium text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
            {item.name}
          </h3>
        </div>
        <p className="text-xl font-bold text-primary tracking-tight">₹{item.price}</p>
      </div>

      <div className="mt-auto">
        {quantity === 0 ? (
          <Button
            onClick={() => addItem(item)}
            size="sm"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-10 gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between bg-primary rounded-xl overflow-hidden h-10 shadow-md">
            <button
              onClick={() => updateQuantity(item.id, quantity - 1)}
              className="px-4 h-full text-primary-foreground hover:bg-primary-foreground/10 transition-colors flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-primary-foreground font-bold text-lg min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => addItem(item)}
              className="px-4 h-full text-primary-foreground hover:bg-primary-foreground/10 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

MenuItem.displayName = 'MenuItem';

export default MenuItem;
