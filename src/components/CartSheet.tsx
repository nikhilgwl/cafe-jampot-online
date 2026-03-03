import React, { useState, useEffect } from "react";
import {
  Plus, Minus, Trash2, ShoppingBag, Phone,
  User, Building2, Send, Truck, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const CartSheet: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice: subtotal } = useCart();
  const { toast } = useToast();

  const [customerDetails, setCustomerDetails] = useState({ name: "", mobile: "", hostel: "", customHostel: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Delivery Logic
  const FREE_DELIVERY_THRESHOLD = 100;
  const deliveryFee = subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? 10 : 0;
  const finalTotal = subtotal + deliveryFee;
  const progress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  const handleSubmitOrder = () => {
    if (!customerDetails.name.trim() || customerDetails.mobile.length < 10 || !customerDetails.hostel) {
      toast({ title: "Missing Details", description: "Please fill all delivery info.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    // Format WhatsApp Message
    const orderItems = items.map(i => `• ${i.name} x${i.quantity} - ₹${i.price * i.quantity}`).join("\n");
    const hostelName = customerDetails.hostel === "Other" ? customerDetails.customHostel : customerDetails.hostel;

    const message = `🛒 *New Order: Cafe Jampot*\n\n*Details:*\n👤 ${customerDetails.name}\n📱 ${customerDetails.mobile}\n🏠 ${hostelName}\n\n*Order:*\n${orderItems}\n\nSubtotal: ₹${subtotal}\n🚚 Delivery: ${deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}\n💰 *Total: ₹${finalTotal}*`;

    // Trigger Success Animation
    setShowSuccess(true);

    // Redirect after short delay to let animation play
    setTimeout(() => {
      window.open(`https://wa.me/918789512909?text=${encodeURIComponent(message)}`, "_blank");
      clearCart();
      setShowSuccess(false);
      setIsSubmitting(false);
      onClose();
    }, 2000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-0 overflow-hidden flex flex-col">

        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-primary flex flex-col items-center justify-center text-primary-foreground p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <CheckCircle2 className="w-24 h-24 mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
              <p className="opacity-90">Redirecting you to WhatsApp to finalize with Mr. Ajay...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 border-b">
          <SheetHeader><SheetTitle className="flex items-center gap-2"><ShoppingBag className="text-primary" /> Your Cart</SheetTitle></SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-12 opacity-50"><ShoppingBag className="w-12 h-12 mx-auto mb-4" />Your cart is empty</div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="bg-secondary/30 p-4 rounded-xl">
                <div className="flex justify-between text-xs mb-2 font-medium">
                  <span>{subtotal >= 100 ? "Free Delivery Unlocked!" : `Add ₹${100 - subtotal} for Free Delivery`}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`h-full ${subtotal >= 100 ? 'bg-green-500' : 'bg-primary'}`} />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-card p-3 rounded-lg border">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium truncate">{item.name}</h4>
                      <p className="text-xs text-primary font-bold">₹{item.price * item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary rounded-md px-2 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="w-3 h-3" /></button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Form */}
              <div className="space-y-4 border-t pt-4">
                <Label className="text-lg font-bold">Delivery to Hostel</Label>
                <Input placeholder="Your Name" value={customerDetails.name} onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })} />
                <Input placeholder="Mobile Number" type="tel" value={customerDetails.mobile} onChange={e => setCustomerDetails({ ...customerDetails, mobile: e.target.value })} />
                <select
                  className="w-full p-2 rounded-md border bg-background"
                  value={customerDetails.hostel}
                  onChange={e => setCustomerDetails({ ...customerDetails, hostel: e.target.value })}
                >
                  <option value="">Select Hostel</option>
                  <option value="Fr. Enright">Fr. Enright</option>
                  <option value="Nilima">Nilima</option>
                  <option value="MTR">MTR</option>
                  <option value="St. Thomas">St. Thomas</option>
                  <option value="NH (Girls)">NH (Girls)</option>
                  <option value="NH (Boys)">NH (Boys)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-card border-t space-y-4">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between text-sm"><span>Delivery</span><span className={deliveryFee === 0 ? "text-green-600 font-bold" : ""}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span></div>
            <div className="flex justify-between text-xl font-bold border-t pt-2"><span>Total</span><span className="text-primary">₹{finalTotal}</span></div>
            <Button onClick={handleSubmitOrder} disabled={isSubmitting} className="w-full py-6 text-lg font-bold gap-2">
              <Send className="w-5 h-5" /> Place Order
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;