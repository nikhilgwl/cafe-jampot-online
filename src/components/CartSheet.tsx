import React, { useState } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Phone,
  User,
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

interface CustomerDetails {
  name: string;
  mobile: string;
  hostel: string;
  customHostel?: string;
}

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSheet: React.FC<CartSheetProps> = ({ isOpen, onClose }) => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totalPrice,
  } = useCart();
  const { toast } = useToast();
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    mobile: "",
    hostel: "",
    customHostel: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = () => {
    if (!customerDetails.name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!customerDetails.mobile.trim() || customerDetails.mobile.length < 10) {
      toast({
        title: "Please enter a valid mobile number",
        variant: "destructive",
      });
      return;
    }
    if (
      !customerDetails.hostel.trim() &&
      !customerDetails.customHostel?.trim()
    ) {
      toast({ title: "Please enter your hostel name", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    // Format order for WhatsApp
    const orderItems = items
      .map(
        (item) =>
          `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`
      )
      .join("\n");

    const hostelName =
      customerDetails.hostel || customerDetails.customHostel || "";

    const message = `🛒 *New Order from Cafe Jampot Website*\n\n*Customer Details:*\n👤 Name: ${customerDetails.name}\n📱 Mobile: ${customerDetails.mobile}\n🏠 Hostel: ${hostelName}\n\n*Order:*\n${orderItems}\n\n💰 *Total: ₹${totalPrice}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/918789512909?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");

    toast({
      title: "Order sent! 🎉",
      description:
        "Your order has been sent via WhatsApp. Mr. Ajay will contact you soon.",
    });

    clearCart();
    setCustomerDetails({ name: "", mobile: "", hostel: "", customHostel: "" });
    setIsSubmitting(false);
    onClose();
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

              {/* Customer Details Form */}
              <div className='pt-4 border-t border-border space-y-4'>
                <h3 className='font-display text-lg font-semibold'>
                  Delivery Details
                </h3>

                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='name'
                      className='flex items-center gap-2 text-sm'
                    >
                      <User className='w-4 h-4' />
                      Your Name
                    </Label>
                    <Input
                      id='name'
                      placeholder='Enter your name'
                      value={customerDetails.name}
                      onChange={(e) =>
                        setCustomerDetails((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className='bg-secondary border-border'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label
                      htmlFor='mobile'
                      className='flex items-center gap-2 text-sm'
                    >
                      <Phone className='w-4 h-4' />
                      Mobile Number
                    </Label>
                    <Input
                      id='mobile'
                      type='tel'
                      placeholder='Enter your mobile number'
                      value={customerDetails.mobile}
                      onChange={(e) =>
                        setCustomerDetails((prev) => ({
                          ...prev,
                          mobile: e.target.value,
                        }))
                      }
                      className='bg-secondary border-border'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label
                      htmlFor='hostel'
                      className='flex items-center gap-2 text-sm'
                    >
                      <Building2 className='w-4 h-4' />
                      Hostel Name
                    </Label>

                    {/* Hostel Dropdown */}
                    <select
                      id='hostel'
                      value={customerDetails.hostel}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomerDetails((prev) => ({
                          ...prev,
                          hostel: value,
                        }));
                      }}
                      className='w-full rounded-md bg-secondary border border-border px-3 py-2 text-sm'
                    >
                      <option value=''>Select Hostel</option>
                      <option value='Fr. Enright'>Fr. Enright</option>
                      <option value='Nilima'>Nilima</option>
                      <option value='MTR'>MTR</option>
                      <option value='St. Thomas'>St. Thomas</option>
                      <option value='NH (Girls)'>NH (Girls)</option>
                      <option value='NH (Boys)'>NH (Boys)</option>
                      <option value='Other'>Other</option>
                    </select>

                    {/* Show only if Other is selected */}
                    {customerDetails.hostel === "Other" && (
                      <Input
                        placeholder='Enter hostel name'
                        value={customerDetails.customHostel || ""}
                        onChange={(e) =>
                          setCustomerDetails((prev) => ({
                            ...prev,
                            customHostel: e.target.value,
                          }))
                        }
                        className='bg-secondary border-border'
                      />
                    )}
                  </div>
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
                Place Order via WhatsApp
              </Button>

              <p className='text-xs text-muted-foreground text-center'>
                Your order will be sent to Mr. Ajay via WhatsApp
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
