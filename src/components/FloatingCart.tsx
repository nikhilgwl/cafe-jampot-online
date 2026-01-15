import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

interface FloatingCartProps {
  onViewCart: () => void;
}

const FloatingCart: React.FC<FloatingCartProps> = ({ onViewCart }) => {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
      <div className="cafe-container relative">
        <Button
          onClick={onViewCart}
          className="w-full floating-cart bg-primary hover:bg-primary/95 text-primary-foreground py-5 rounded-2xl flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="cart-badge">{totalItems}</span>
            </div>
            <div className="text-left">
              <span className="font-semibold block">View Cart</span>
              <span className="text-xs text-primary-foreground/70">{totalItems} items</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary-foreground/15 rounded-xl px-4 py-2">
            <span className="font-bold text-lg">₹{totalPrice}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default FloatingCart;
