import React from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

interface FloatingCartProps {
  onViewCart: () => void;
}

const FloatingCart: React.FC<FloatingCartProps> = ({ onViewCart }) => {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className='fixed bottom-4 left-0 right-0 px-4 z-50'>
      <div className='cafe-container relative'>
        <Button
          onClick={onViewCart}
          className='
        max-w-3xl mx-auto
        bg-primary/95 backdrop-blur-xl
        hover:bg-primary
        py-4 px-4
        rounded-3xl
        flex items-center justify-between
        shadow-2xl shadow-primary/30
        transition-all duration-200
        hover:scale-[1.015]
        active:scale-[0.98]
      '
        >
          {/* Left Section */}
          <div className='flex items-center gap-4'>
            <div className='relative'>
              <div className='w-11 h-11 rounded-2xl flex items-center justify-center'>
                <ShoppingBag className='w-5 h-5' />
              </div>

              {/* Badge */}
              <span
                className='
            absolute -top-1.5 -right-1.5
            min-w-[20px] h-5 px-1
            rounded-full
            bg-yellow-400 text-black
            text-[11px] font-bold
            flex items-center justify-center
            shadow-md
          '
              >
                {totalItems}
              </span>
            </div>

            <div className='leading-tight'>
              <span className='font-semibold block text-sm'>View Cart</span>
              <span className='text-xs'>{totalItems} items added</span>
            </div>
          </div>

          {/* Right Section */}
          <div
            className='
        flex items-center gap-2
        rounded-2xl
        px-4 py-2
      '
          >
            <span className='font-bold text-lg tracking-tight'>
              ₹{totalPrice}
            </span>
            <ArrowRight className='w-5 h-5 opacity-80' />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default FloatingCart;
