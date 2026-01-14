import React from 'react';
import { getItemsByCategory, categories } from '@/data/menuData';
import MenuItem from './MenuItem';

interface MenuSectionProps {
  categoryId: string;
}

const MenuSection: React.FC<MenuSectionProps> = ({ categoryId }) => {
  const items = getItemsByCategory(categoryId);
  const category = categories.find(c => c.id === categoryId);

  if (items.length === 0) return null;

  return (
    <section className="py-4 px-4">
      <div className="cafe-container">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>{category?.icon}</span>
          {category?.name}
        </h2>
        <div className="space-y-3">
          {items.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
