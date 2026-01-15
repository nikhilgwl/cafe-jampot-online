import React from 'react';
import { Instagram, Phone } from 'lucide-react';
import jampotLogo from '@/assets/cafe-jampot-logo.png';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-6 px-4 pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src={jampotLogo} 
              alt="Cafe Jampot Logo" 
              className="w-6 h-6 object-contain"
            />
            <span className="font-display text-lg font-semibold">Cafe Jampot</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm">
            <p className="flex items-center gap-2 text-primary-foreground/90">
              <Phone className="w-4 h-4" />
              <span>+91 8789512909</span>
            </p>
            <a
              href="https://www.instagram.com/cafejampot?igsh=MXNmMjY3aTAwaGVuOA=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-primary-foreground/80 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              @cafejampot
            </a>
          </div>

          <p className="text-primary-foreground/60 text-xs">
            © 2026 Cafe Jampot, XLRI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
