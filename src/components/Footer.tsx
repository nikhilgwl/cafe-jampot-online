import React from 'react';
import { Instagram, Phone, MapPin } from 'lucide-react';
import jampotLogo from '@/assets/cafe-jampot-logo.png';
import FeedbackForm from './FeedbackForm';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-primary text-primary-foreground py-4 px-4 border-t border-primary-foreground/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-foreground/10 p-1 flex items-center justify-center">
              <img 
                src={jampotLogo} 
                alt="Cafe Jampot Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display text-base font-semibold">Cafe Jampot</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <a 
              href="tel:+918789512909"
              className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+91 8789512909</span>
            </a>
            <a
              href="https://www.instagram.com/cafejampot?igsh=MXNmMjY3aTAwaGVuOA=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              @cafejampot
            </a>
            <span className="flex items-center gap-1.5 text-primary-foreground/60">
              <MapPin className="w-3.5 h-3.5" />
              XLRI Campus
            </span>
            <FeedbackForm />
          </div>

          <p className="text-primary-foreground/50 text-xs">
            © 2026 Cafe Jampot
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
