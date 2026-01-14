import React, { useState } from 'react';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import MenuSection from '@/components/MenuSection';
import FloatingCart from '@/components/FloatingCart';
import CartSheet from '@/components/CartSheet';
import Footer from '@/components/Footer';
import { categories } from '@/data/menuData';

const IndexContent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <main className="pb-24">
        <MenuSection categoryId={selectedCategory} />
      </main>
      <Footer />
      <FloatingCart onViewCart={() => setIsCartOpen(true)} />
      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <CartProvider>
      <IndexContent />
    </CartProvider>
  );
};

export default Index;
