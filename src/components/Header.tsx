import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import jampotLogo from '@/assets/cafe-jampot-logo.png';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchDeliveryStatus = async () => {
      const { data } = await supabase
        .from('delivery_settings')
        .select('is_open')
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setIsOpen(data.is_open);
      }
    };

    fetchDeliveryStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('delivery-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delivery_settings',
        },
        (payload) => {
          setIsOpen((payload.new as { is_open: boolean }).is_open);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <header className="bg-primary text-primary-foreground py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 backdrop-blur-sm p-1.5 flex items-center justify-center">
            <img 
              src={jampotLogo} 
              alt="Cafe Jampot Logo" 
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <div>
            <h1 className="font-display text-lg md:text-xl font-bold tracking-wide uppercase leading-tight">
              Café Jampot
            </h1>
            <p className="text-primary-foreground/60 text-[10px] md:text-xs tracking-widest uppercase">
              XLRI Campus • Est. 2022
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium shadow-md ${
          isOpen ? 'bg-emerald-500/90' : 'bg-red-500/90'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-white animate-pulse' : 'bg-white/70'}`}></span>
          <span className="text-white hidden sm:inline">{isOpen ? 'Open for Delivery' : 'Closed for Delivery'}</span>
          <span className="text-white sm:hidden">{isOpen ? 'Open' : 'Closed'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
