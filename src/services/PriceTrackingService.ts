import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface PriceEntry {
  id?: string;
  itemName: string;
  itemId?: string; // For future integration with a central items database
  price: number;
  quantity: number;
  unit: string;
  storeName: string;
  storeId?: string; // For future integration with a stores database
  dateRecorded: string;
  recordedBy: {
    userId: string;
    userName: string;
  };
  notes?: string;
}

// Add a new price entry
export const addPriceEntry = async (entry: Omit<PriceEntry, "dateRecorded">): Promise<string> => {
  try {
    const priceData = {
      ...entry,
      dateRecorded: new Date().toISOString(),
    };
    
    const docRef = await addDoc(collection(db, "priceEntries"), priceData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding price entry:", error);
    throw error;
  }
};

// Get price history for a specific item
export const getPriceHistoryForItem = async (itemName: string, limitCount = 10): Promise<PriceEntry[]> => {
  try {
    const q = query(
      collection(db, "priceEntries"),
      where("itemName", "==", itemName),
      orderBy("dateRecorded", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as PriceEntry));
  } catch (error) {
    console.error("Error getting price history:", error);
    return [];
  }
};

// Get the best (lowest) price for an item across stores
export const getBestPriceForItem = async (itemName: string): Promise<PriceEntry | null> => {
  try {
    const q = query(
      collection(db, "priceEntries"),
      where("itemName", "==", itemName),
      orderBy("price", "asc"),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    } as PriceEntry;
  } catch (error) {
    console.error("Error getting best price:", error);
    return null;
  }
};

// Get recent prices at a specific store
export const getPricesAtStore = async (storeName: string, limitCount = 20): Promise<PriceEntry[]> => {
  try {
    const q = query(
      collection(db, "priceEntries"),
      where("storeName", "==", storeName),
      orderBy("dateRecorded", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as PriceEntry));
  } catch (error) {
    console.error("Error getting store prices:", error);
    return [];
  }
};

// Convert price to unit price for comparison (e.g., price per kg, price per liter)
export const calculateUnitPrice = (price: number, quantity: number, unit: string): number => {
  if (quantity <= 0) return 0;
  return price / quantity;
};

// Format a unit price for display
export const formatUnitPrice = (price: number, unit: string): string => {
  return `$${price.toFixed(2)}/${unit}`;
}; 