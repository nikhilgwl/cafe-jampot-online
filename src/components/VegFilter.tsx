import React from 'react';
import { Leaf, Drumstick } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VegFilterType = 'all' | 'veg' | 'non-veg';

interface VegFilterProps {
  value: VegFilterType;
  onChange: (value: VegFilterType) => void;
}

const VegFilter: React.FC<VegFilterProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-0.5 bg-muted/80 backdrop-blur-sm rounded-xl p-1 shadow-inner">
      <button
        onClick={() => onChange('all')}
        className={cn(
          "px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
          value === 'all' 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        All
      </button>
      <button
        onClick={() => onChange('veg')}
        className={cn(
          "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
          value === 'veg' 
            ? "bg-emerald-600 text-white shadow-md" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Leaf className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Veg</span>
      </button>
      <button
        onClick={() => onChange('non-veg')}
        className={cn(
          "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200",
          value === 'non-veg' 
            ? "bg-red-600 text-white shadow-md" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Drumstick className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Non-Veg</span>
      </button>
    </div>
  );
};

export default VegFilter;
