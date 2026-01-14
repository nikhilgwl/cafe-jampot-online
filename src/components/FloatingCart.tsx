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
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
      <div className="cafe-container">
        <Button
          onClick={onViewCart}
          className="w-full floating-cart bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="cart-badge">{totalItems}</span>
            </div>
            <span className="font-semibold">View Cart</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">₹{totalPrice}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default FloatingCart;
