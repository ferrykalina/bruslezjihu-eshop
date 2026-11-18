import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
}

export interface SavedAddress {
  id: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string; // pending, paid, shipped, cancelled
  createdAt: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    imageUrl: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  savedAddresses: SavedAddress[];
  orderHistory: OrderHistoryItem[];
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  saveAddress: (address: Omit<SavedAddress, 'id'>) => void;
  deleteAddress: (id: string) => void;
  addMockOrder: (order: Omit<OrderHistoryItem, 'id' | 'createdAt'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('bzj_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    try {
      const saved = localStorage.getItem('bzj_auth_addresses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('bzj_auth_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bzj_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bzj_auth_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('bzj_auth_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  useEffect(() => {
    localStorage.setItem('bzj_auth_orders', JSON.stringify(orderHistory));
  }, [orderHistory]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Hrubá simulace přihlášení s prodlevou pro wow-loading-spinner efekt
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Pro ukázku pustíme každého, kdo zadá validní e-mail
    if (email.includes('@')) {
      const loggedUser: User = {
        id: 'u_' + Math.random().toString(36).substring(2, 9),
        email,
        name: email.split('@')[0].toUpperCase(),
        phone: '+420 123 456 789',
        role: 'customer'
      };
      setUser(loggedUser);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, name: string, phone?: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email.includes('@') && name.trim().length > 2) {
      const registeredUser: User = {
        id: 'u_' + Math.random().toString(36).substring(2, 9),
        email,
        name,
        phone,
        role: 'customer'
      };
      setUser(registeredUser);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setSavedAddresses([]);
    setOrderHistory([]);
  };

  const saveAddress = (addr: Omit<SavedAddress, 'id'>) => {
    const newAddress: SavedAddress = {
      ...addr,
      id: 'a_' + Math.random().toString(36).substring(2, 9)
    };
    setSavedAddresses(prev => {
      // Pokud je defaultní, ostatním defaultní sebereme
      let updated = prev;
      if (addr.isDefaultShipping) {
        updated = updated.map(a => ({ ...a, isDefaultShipping: false }));
      }
      if (addr.isDefaultBilling) {
        updated = updated.map(a => ({ ...a, isDefaultBilling: false }));
      }
      return [...updated, newAddress];
    });
  };

  const deleteAddress = (id: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
  };

  const addMockOrder = (orderData: Omit<OrderHistoryItem, 'id' | 'createdAt'>) => {
    const newOrder: OrderHistoryItem = {
      ...orderData,
      id: 'o_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toLocaleDateString('cs-CZ')
    };
    setOrderHistory(prev => [newOrder, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        savedAddresses,
        orderHistory,
        login,
        register,
        logout,
        saveAddress,
        deleteAddress,
        addMockOrder
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
