import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  id: string; // product id + size
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  size?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  serviceSharpen: boolean;
  setServiceSharpen: (val: boolean) => void;
  serviceInsurance: boolean;
  setServiceInsurance: (val: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bzj_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [serviceSharpen, setServiceSharpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bzj_service_sharpen') === 'true';
    } catch {
      return false;
    }
  });

  const [serviceInsurance, setServiceInsurance] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bzj_service_insurance') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bzj_cart_items', JSON.stringify(items));
    } catch (e) {
      console.error("Chyba při ukládání košíku do localStorage", e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('bzj_service_sharpen', String(serviceSharpen));
    } catch (e) {
      console.error(e);
    }
  }, [serviceSharpen]);

  useEffect(() => {
    try {
      localStorage.setItem('bzj_service_insurance', String(serviceInsurance));
    } catch (e) {
      console.error(e);
    }
  }, [serviceInsurance]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === newItem.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentItems, { ...newItem, quantity: 1 }];
    });
    openCart();
  };

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        cartTotal,
        cartCount,
        serviceSharpen,
        setServiceSharpen,
        serviceInsurance,
        setServiceInsurance,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
