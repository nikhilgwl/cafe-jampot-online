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
    <div className="menu-card flex justify-between items-center gap-4 animate-fade-in">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm text-xs ${
              item.isVeg
                ? 'border-sage text-sage'
                : 'border-terracotta text-terracotta'
            }`}
          >
            ●
          </span>
          <h3 className="font-medium text-foreground truncate">{item.name}</h3>
        </div>
        <p className="text-lg font-semibold text-primary">₹{item.price}</p>
      </div>

      <div className="flex items-center">
        {quantity === 0 ? (
          <Button
            onClick={() => addItem(item)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
          >
            ADD
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-primary rounded-lg overflow-hidden">
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
