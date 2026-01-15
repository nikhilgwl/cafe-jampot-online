import React, { memo } from 'react';
import { MenuItem as MenuItemType, categories } from '@/data/menuData';
import MenuItem from './MenuItem';

interface MenuSectionProps {
  categoryId: string;
  items: MenuItemType[];
  searchQuery?: string;
}

const MenuSection: React.FC<MenuSectionProps> = memo(({ categoryId, items, searchQuery }) => {
  const category = categories.find(c => c.id === categoryId);

  if (items.length === 0) return null;

  return (
    <section id={`section-${categoryId}`} className="py-6 px-4 scroll-mt-36">
      <div className="cafe-container">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-header">
            <span className="text-2xl">{category?.icon}</span>
            <span>{category?.name}</span>
            {searchQuery && (
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {items.length} found
              </span>
            )}
          </h2>
          <span className="text-sm text-muted-foreground hidden sm:block">
            {items.length} items
          </span>
        </div>
        <div className="grid gap-4 sm:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {items.map((item, index) => (
            <div 
              key={item.id} 
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fade-in"
            >
              <MenuItem item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

MenuSection.displayName = 'MenuSection';

export default MenuSection;
