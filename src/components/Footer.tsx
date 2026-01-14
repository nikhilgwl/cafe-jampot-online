import React from 'react';
import { Instagram, Phone } from 'lucide-react';
import jampotLogo from '@/assets/cafe-jampot-logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-8 px-4 mt-8 pb-32">
      <div className="cafe-container text-center space-y-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <img 
            src={jampotLogo} 
            alt="Cafe Jampot Logo" 
            className="w-12 h-12 object-contain"
          />
          <span className="font-display text-lg font-semibold">Cafe Jampot</span>
        </div>

        <p className="text-primary-foreground/80 text-sm">
          XLRI Campus, Jamshedpur
        </p>

        <div className="space-y-2 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Phone className="w-4 h-4" />
            <span>For Delivery: Mr. Ajay - +91 8789512909</span>
          </p>
        </div>

        <a
          href="https://instagram.com/cafejampot"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm hover:text-primary-foreground/80 transition-colors"
        >
          <Instagram className="w-4 h-4" />
          @cafejampot
        </a>

        <p className="text-primary-foreground/60 text-xs pt-4">
          © 2026 Cafe Jampot. Made with ☕ at XLRI
        </p>
      </div>
    </footer>
  );
};

export default Footer;
