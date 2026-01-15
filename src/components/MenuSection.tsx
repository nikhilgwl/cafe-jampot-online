import React from 'react';
import { MenuItem as MenuItemType, categories } from '@/data/menuData';
import MenuItem from './MenuItem';

interface MenuSectionProps {
  categoryId: string;
  items: MenuItemType[];
  searchQuery?: string;
}

const MenuSection: React.FC<MenuSectionProps> = ({ categoryId, items, searchQuery }) => {
  const category = categories.find(c => c.id === categoryId);

  if (items.length === 0) return null;

  return (
    <section id={`section-${categoryId}`} className="py-4 px-4 scroll-mt-36">
      <div className="cafe-container">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>{category?.icon}</span>
          {category?.name}
          {searchQuery && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({items.length} found)
            </span>
          )}
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {items.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
