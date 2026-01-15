import React from 'react';
import jampotLogo from '@/assets/cafe-jampot-logo.png';

const Header: React.FC = () => {
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
        <div className="flex items-center gap-2 bg-emerald-500/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium shadow-md">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span className="text-white hidden sm:inline">Open for Delivery</span>
          <span className="text-white sm:hidden">Open</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
