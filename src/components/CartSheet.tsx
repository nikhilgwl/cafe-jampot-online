import React, { useState } from "react";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Building2,
  Send,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const HOSTELS = [
  "Fr. Enright",
  "Nilima",
  "MTR",
  "St. Thomas",
  "NH (Girls)",
  "NH (Boys)",
  "Other",
];

const CartSheet: React.FC<CartSheetProps> = ({ isOpen, onClose }) => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totalPrice,
  } = useCart();
  const { toast } = useToast();
  const [hostel, setHostel] = useState("");
  const [customHostel, setCustomHostel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    const hostelName = hostel === "Other" ? customHostel : hostel;
    
    if (!hostelName.trim()) {
      toast({ title: "Please select your hostel", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user (if authenticated)
      const { data: { user } } = await supabase.auth.getUser();

      // Save order to database
      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        isVeg: item.isVeg,
      }));

      const { error } = await supabase.from("orders").insert({
        hostel_name: hostelName,
        items: orderItems,
        total_amount: totalPrice,
        status: "pending",
        user_id: user?.id || null,
      });

      if (error) {
        console.error("Error saving order:", error);
      }

      // Format order for WhatsApp
      const orderText = items
        .map(
          (item) =>
            `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`
        )
        .join("\n");

      const message = `🛒 *New Order from Cafe Jampot Website*\n\n*Hostel:* ${hostelName}\n\n*Order:*\n${orderText}\n\n💰 *Total: ₹${totalPrice}*`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/918789512909?text=${encodedMessage}`;

      window.open(whatsappUrl, "_blank");

      toast({
        title: "Order sent! 🎉",
        description: "Your order has been sent via WhatsApp.",
      });

      clearCart();
      setHostel("");
      setCustomHostel("");
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-lg bg-background border-border flex flex-col h-full'>
        <SheetHeader className='border-b border-border pb-4'>
          <SheetTitle className='font-display text-2xl flex items-center gap-2'>
            <ShoppingBag className='w-6 h-6 text-primary' />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className='flex-1 flex flex-col items-center justify-center text-center p-8'>
            <ShoppingBag className='w-16 h-16 text-muted-foreground/50 mb-4' />
            <h3 className='font-display text-xl text-muted-foreground'>
              Your cart is empty
            </h3>
            <p className='text-sm text-muted-foreground mt-2'>
              Add some delicious items from our menu!
            </p>
          </div>
        ) : (
          <>
            <div className='flex-1 overflow-y-auto py-4 space-y-3'>
              {items.map((item) => (
                <div
                  key={item.id}
                  className='menu-card flex items-center gap-4'
                >
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`w-3 h-3 border-2 flex items-center justify-center rounded-sm text-[8px] ${
                          item.isVeg
                            ? "border-sage text-sage"
                            : "border-terracotta text-terracotta"
                        }`}
                      >
                        ●
                      </span>
                      <h4 className='font-medium text-sm truncate'>
                        {item.name}
                      </h4>
                    </div>
                    <p className='text-primary font-semibold'>
                      ₹{item.price * item.quantity}
                    </p>
                  </div>

                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1 bg-secondary rounded-lg overflow-hidden'>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className='p-2 text-secondary-foreground hover:bg-secondary/80 transition-colors'
                      >
                        <Minus className='w-3 h-3' />
                      </button>
                      <span className='text-secondary-foreground font-bold w-6 text-center text-sm'>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className='p-2 text-secondary-foreground hover:bg-secondary/80 transition-colors'
                      >
                        <Plus className='w-3 h-3' />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className='p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}

              {/* Delivery Details */}
              <div className='pt-4 border-t border-border space-y-4'>
                <h3 className='font-display text-lg font-semibold'>
                  Delivery Details
                </h3>

                <div className='space-y-2'>
                  <Label htmlFor='hostel' className='flex items-center gap-2 text-sm'>
                    <Building2 className='w-4 h-4' />
                    Hostel Name
                  </Label>
                  <select
                    id='hostel'
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    className='w-full rounded-md bg-secondary border border-border px-3 py-2 text-sm'
                  >
                    <option value=''>Select Hostel</option>
                    {HOSTELS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  {hostel === "Other" && (
                    <Input
                      placeholder='Enter hostel name'
                      value={customHostel}
                      onChange={(e) => setCustomHostel(e.target.value)}
                      className='bg-secondary border-border'
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className='border-t border-border pt-4 space-y-4'>
              <div className='flex justify-between items-center text-lg'>
                <span className='font-medium'>Total</span>
                <span className='font-bold text-primary text-xl'>
                  ₹{totalPrice}
                </span>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className='w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold'
              >
                <Send className='w-5 h-5 mr-2' />
                {isSubmitting ? "Sending..." : "Place Order via WhatsApp"}
              </Button>

              <p className='text-xs text-muted-foreground text-center'>
                Your order will be sent to Cafe Jampot via WhatsApp
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;