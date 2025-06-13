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

const initialPantryItems: PantryItem[] = [
  { id: 'p1', name: 'Milk', quantity: 1, category: 'Dairy', lowStock: false, expiry: '2025-05-05' },
  { id: 'p2', name: 'Bread', quantity: 2, category: 'Bakery', lowStock: true, expiry: '2025-05-04' },
  { id: 'p3', name: 'Eggs', quantity: 12, category: 'Dairy', lowStock: false, expiry: '2025-05-10' },
  { id: 'p4', name: 'Bananas', quantity: 2, category: 'Produce', lowStock: true, expiry: '2025-05-03' },
];

export const PantryProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
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
          // Provide initial data based on user type
          const initialItems = user.isAdmin ? initialPantryItems : [];
          setPantryItems(initialItems);
          localStorage.setItem(storageKey, JSON.stringify(initialItems));
        }
      } else {
        // First time user - give admins sample data, regular users get blank pantry
        const initialItems = user.isAdmin ? initialPantryItems : [];
        setPantryItems(initialItems);
        localStorage.setItem(storageKey, JSON.stringify(initialItems));
      }
    } else {
      // No user logged in - clear pantry
      setPantryItems([]);
    }
  }, [user]);

  // Save pantry items whenever they change
  useEffect(() => {
    if (user && pantryItems.length > 0) {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(pantryItems));
    }
  }, [pantryItems, user]);

  const addPantryItem = (item: Omit<PantryItem, 'id'>) => {
    if (!user) return; // Don't allow adding items without login

    // Check if item already exists
    const existingItem = pantryItems.find(
      existing => existing.name.toLowerCase() === item.name.toLowerCase()
    );

    if (existingItem) {
      // Update existing item quantity
      setPantryItems(prev =>
        prev.map(existing =>
          existing.id === existingItem.id
            ? { ...existing, quantity: existing.quantity + item.quantity, lowStock: (existing.quantity + item.quantity) <= 1 }
            : existing
        )
      );
    } else {
      // Add new item
      setPantryItems(prev => [...prev, { ...item, id: `${user.id}_${Date.now()}` }]);
    }
  };

  const updatePantryItem = (id: string, updates: Partial<PantryItem>) => {
    if (!user) return; // Don't allow updates without login

    setPantryItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removePantryItem = (id: string) => {
    if (!user) return; // Don't allow removal without login

    setPantryItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <PantryContext.Provider value={{ pantryItems, addPantryItem, updatePantryItem, removePantryItem }}>
      {children}
    </PantryContext.Provider>
  );
};

export const usePantry = () => {
  const context = useContext(PantryContext);
  if (!context) {
    throw new Error('usePantry must be used within a PantryProvider');
  }
  return context;
}; 