import React from 'react';
import { useNavigate } from 'react-router-dom';
import jampotLogo from '@/assets/jampot-logo.png';

interface HeaderProps {
  isOpen: boolean;
  dineInOnly?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isOpen, dineInOnly }) => {
  const navigate = useNavigate();
  return (
    <header className="bg-primary text-primary-foreground py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={jampotLogo}
            alt="Cafe Jampot Logo"
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
          />
          <div>
            <h1 className="font-display text-lg md:text-xl font-bold tracking-wide uppercase leading-tight">
              Café Jampot
            </h1>
            <p className="text-primary-foreground/60 text-[10px] md:text-xs tracking-widest uppercase">
              XLRI Campus • Est. 2022
            </p>
          </div>
        </div>
        {/* ── Merch CTA — remove this block when no longer needed ── */}
        <button
          onClick={() => navigate('/merch')}
          className="hidden sm:flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #ffd764, #ffb347)',
            color: '#1a0d05',
            boxShadow: '0 0 0 0 rgba(255,215,100,0.7)',
            animation: 'merch-ping 1.8s ease-in-out infinite',
          }}
        >
          <span>✨</span>
          <span>Check out our Merch!</span>
        </button>
        {/* mobile: icon-only */}
        <button
          onClick={() => navigate('/merch')}
          className="flex sm:hidden items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #ffd764, #ffb347)',
            color: '#1a0d05',
            animation: 'merch-ping 1.8s ease-in-out infinite',
          }}
        >
          ✨ Merch
        </button>
        <style>{`@keyframes merch-ping { 0%,100%{box-shadow:0 0 0 0 rgba(255,215,100,0.7)} 50%{box-shadow:0 0 0 8px rgba(255,215,100,0)} }`}</style>
        {/* ── end merch CTA ── */}

        <div className={`flex items-center gap-2 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium shadow-md ${
          isOpen ? 'bg-emerald-500/90' : dineInOnly ? 'bg-amber-500/90' : 'bg-red-500/90'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-white animate-pulse' : 'bg-white/70'}`}></span>
          <span className="text-white hidden sm:inline">
            {isOpen ? 'Open for Delivery' : dineInOnly ? 'Dine-in Only' : 'Closed for Delivery'}
          </span>
          <span className="text-white sm:hidden">
            {isOpen ? 'Open' : dineInOnly ? 'Dine-in' : 'Closed'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;