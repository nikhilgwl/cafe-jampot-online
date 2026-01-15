import React from 'react';
import { categories } from '@/data/menuData';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
  };

  return (
    <div className="bg-background/95 backdrop-blur-md border-b border-border py-3 px-4">
      <div className="flex flex-wrap gap-2 max-w-7xl mx-auto justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`category-pill flex items-center gap-2 ${
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
    </div>
  );
};

export default CategoryFilter;
