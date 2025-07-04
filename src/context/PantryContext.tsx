import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  lowStock: boolean;
  expiry?: string;
}

interface PantryContextType {
  pantryItems: PantryItem[];
  addPantryItem: (item: Omit<PantryItem, 'id'>) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  removePantryItem: (id: string) => void;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

export const PantryProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin } = useAuth();
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);

  // Get storage key for current user
  const getStorageKey = () => {
    return user ? `pantry_${user.id}` : 'pantry_default';
  };

  // Load pantry items for current user
  useEffect(() => {
    if (user) {
      const storageKey = getStorageKey();
      const storedItems = localStorage.getItem(storageKey);
      
      if (storedItems) {
        try {
          setPantryItems(JSON.parse(storedItems));
        } catch (error) {
          console.error('Error loading pantry items:', error);
          // On error, all users start with blank pantry
          setPantryItems([]);
          localStorage.setItem(storageKey, JSON.stringify([]));
        }
      } else {
        // All users start with completely empty pantry - no sample data
        setPantryItems([]);
        localStorage.setItem(storageKey, JSON.stringify([]));
      }
    } else {
      // No user logged in - clear pantry
      setPantryItems([]);
    }
  }, [user]);

  // Save pantry items whenever they change
  useEffect(() => {
    if (user) {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(pantryItems));
    }
  }, [pantryItems, user]);

  const addPantryItem = (item: Omit<PantryItem, 'id'>) => {
    const newItem: PantryItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substring(2),
    };
    setPantryItems(prev => [...prev, newItem]);
  };

  const updatePantryItem = (id: string, updates: Partial<PantryItem>) => {
    setPantryItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const removePantryItem = (id: string) => {
    setPantryItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <PantryContext.Provider value={{
      pantryItems,
      addPantryItem,
      updatePantryItem,
      removePantryItem,
    }}>
      {children}
    </PantryContext.Provider>
  );
};

export const usePantry = () => {
  const context = useContext(PantryContext);
  if (context === undefined) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
}; 