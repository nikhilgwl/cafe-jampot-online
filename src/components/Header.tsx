import React from 'react';
import jampotLogo from '@/assets/jampot-logo.png';

interface HeaderProps {
  isOpen: boolean;
  dineInOnly?: boolean; // ← NEW
}

const Header: React.FC<HeaderProps> = ({ isOpen, dineInOnly }) => {

  // Badge logic:
  const badgeColor = isOpen
    ? 'bg-emerald-500/90'
    : dineInOnly
      ? 'bg-amber-500/90'   // amber = dine-in only
      : 'bg-red-500/90';    // red = fully closed

  const badgeLabel = isOpen ? 'Open for Delivery' : dineInOnly ? 'Dine-in Only' : 'Closed';
  const badgeLabelShort = isOpen ? 'Open' : dineInOnly ? 'Dine-in' : 'Closed';
  return (
    <header className="bg-primary text-primary-foreground py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[68px] h-[68px] rounded-3xl bg-primary-foreground/10 backdrop-blur-sm p-2 flex items-center justify-center">
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
        <div className={`flex items-center gap-2 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium shadow-md ${badgeColor}`}>
          <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-white animate-pulse' : 'bg-white/70'}`}></span>
          <span className="text-white hidden sm:inline">{badgeLabel}</span>
          <span className="text-white sm:hidden">{badgeLabelShort}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
