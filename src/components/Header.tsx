import React from 'react';
import { Coffee } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="hero-section text-primary-foreground py-8 px-4">
      <div className="cafe-container text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Coffee className="w-8 h-8" />
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Cafe Jampot
          </h1>
        </div>
        <p className="text-primary-foreground/80 text-sm font-medium">
          XLRI Campus • Fresh & Delicious
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
          <span className="w-2 h-2 bg-sage rounded-full animate-pulse"></span>
          Open for Delivery
        </div>
      </div>
    </header>
  );
};

export default Header;
