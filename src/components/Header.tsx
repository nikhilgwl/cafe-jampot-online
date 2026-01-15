import React from 'react';
import jampotLogo from '@/assets/cafe-jampot-logo.png';

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={jampotLogo} 
            alt="Cafe Jampot Logo" 
            className="w-10 h-10 object-contain drop-shadow-lg"
          />
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold tracking-wide uppercase leading-tight">
              Café Jampot
            </h1>
            <p className="text-primary-foreground/70 text-xs tracking-widest">
              XLRI Campus • Est. 2022
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs md:text-sm">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
          <span className="hidden sm:inline">Open for Delivery</span>
          <span className="sm:hidden">Open</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
