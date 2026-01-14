import React, { useRef, useEffect } from 'react';
import { categories } from '@/data/menuData';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedButton = containerRef.current?.querySelector(`[data-category="${selectedCategory}"]`);
    if (selectedButton) {
      selectedButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedCategory]);

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border py-3">
      <ScrollArea className="w-full whitespace-nowrap">
        <div ref={containerRef} className="flex gap-2 px-4 max-w-7xl mx-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              data-category={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`category-pill flex items-center gap-2 whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'category-pill-active'
                  : 'category-pill-inactive'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};

export default CategoryFilter;
