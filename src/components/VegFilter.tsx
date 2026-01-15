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
    <div className="flex items-center gap-1 bg-muted rounded-full p-1">
      <button
        onClick={() => onChange('all')}
        className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          value === 'all' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        All
      </button>
      <button
        onClick={() => onChange('veg')}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          value === 'veg' 
            ? "bg-green-600 text-white shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Leaf className="w-3 h-3" />
        <span className="hidden sm:inline">Veg</span>
      </button>
      <button
        onClick={() => onChange('non-veg')}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          value === 'non-veg' 
            ? "bg-red-600 text-white shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Drumstick className="w-3 h-3" />
        <span className="hidden sm:inline">Non-Veg</span>
      </button>
    </div>
  );
};

export default VegFilter;
