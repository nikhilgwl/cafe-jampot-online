import React from 'react';
import { Instagram, Phone } from 'lucide-react';
import jampotLogo from '@/assets/cafe-jampot-logo.png';

const Footer: React.FC = () => {
  return (
<footer className="mt-auto bg-primary text-primary-foreground py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img 
              src={jampotLogo} 
              alt="Cafe Jampot Logo" 
              className="w-5 h-5 object-contain"
            />
            <span className="font-display text-base font-semibold">Cafe Jampot</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <p className="flex items-center gap-1.5 text-primary-foreground/90">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 8789512909</span>
            </p>
            <a
              href="https://www.instagram.com/cafejampot?igsh=MXNmMjY3aTAwaGVuOA=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary-foreground/80 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
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
