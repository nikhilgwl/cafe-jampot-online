import React from 'react';
import jampotLogo from '@/assets/cafe-jampot-logo.png';

const Header: React.FC = () => {
  return (
    <header className="hero-section text-primary-foreground py-8 px-4">
      <div className="cafe-container text-center">
        <div className="flex flex-col items-center justify-center mb-2">
          <img 
            src={jampotLogo} 
            alt="Cafe Jampot Logo" 
            className="w-20 h-20 object-contain drop-shadow-lg"
          />
          <h1 className="font-display text-3xl font-bold tracking-wide uppercase mt-2">
            Café Jampot
          </h1>
          <p className="text-primary-foreground/80 text-sm font-medium tracking-widest mt-1">
            ESTD. 2022
          </p>
        </div>
        <p className="text-primary-foreground/90 text-sm font-medium mt-3">
          XLRI Campus • Fresh & Delicious
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
          Open for Delivery
        </div>
      </div>
    </header>
  );
};

export default Header;
