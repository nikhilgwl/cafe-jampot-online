import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { MenuItem as MenuItemType } from '@/data/menuData';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find(i => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="menu-card flex flex-col h-full animate-fade-in">
      <div className="flex-1 min-w-0 mb-3">
        <div className="flex items-start gap-2 mb-2">
          <span
            className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm text-xs flex-shrink-0 mt-0.5 ${
              item.isVeg
                ? 'border-sage text-sage'
                : 'border-terracotta text-terracotta'
            }`}
          >
            ●
          </span>
          <h3 className="font-medium text-foreground text-sm leading-tight">{item.name}</h3>
        </div>
        <p className="text-lg font-semibold text-primary">₹{item.price}</p>
      </div>

      <div className="flex items-center justify-center mt-auto">
        {quantity === 0 ? (
          <Button
            onClick={() => addItem(item)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold w-full"
          >
            ADD
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-primary rounded-lg overflow-hidden w-full justify-center">
            <button
              onClick={() => updateQuantity(item.id, quantity - 1)}
              className="p-2 text-primary-foreground hover:bg-primary/80 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-primary-foreground font-bold w-6 text-center">
              {quantity}
            </span>
            <button
              onClick={() => addItem(item)}
              className="p-2 text-primary-foreground hover:bg-primary/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItem;
