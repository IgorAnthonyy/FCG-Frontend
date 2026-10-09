import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Game } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: Game[];
  addToCart: (game: Game) => void;
  removeFromCart: (gameId: number) => void;
  clearCart: () => void;
  isItemInCart: (gameId: number) => boolean;
  totalAmount: number;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Game[]>(() => {
    try {
      const saved = localStorage.getItem('fcg_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { success, info } = useToast();

  useEffect(() => {
    localStorage.setItem('fcg_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (game: Game) => {
    if (items.some((item) => item.id === game.id)) {
      info(`"${game.name}" já está no seu carrinho.`);
      return;
    }
    setItems((prev) => [...prev, game]);
    success(`"${game.name}" foi adicionado ao carrinho!`);
  };

  const removeFromCart = (gameId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== gameId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isItemInCart = (gameId: number) => {
    return items.some((item) => item.id === gameId);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price || 0), 0);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isItemInCart,
        totalAmount,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
