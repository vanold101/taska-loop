import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
  DocumentSnapshot,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PRICE_ENTRIES_COLLECTION = 'priceEntries';

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
  createdAt?: any; // Firebase timestamp
  updatedAt?: any; // Firebase timestamp
}

// Add a new price entry
export const addPriceEntry = async (entry: Omit<PriceEntry, "dateRecorded" | "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const priceData = {
      ...entry,
      dateRecorded: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, PRICE_ENTRIES_COLLECTION), priceData);
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
      collection(db, PRICE_ENTRIES_COLLECTION),
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

// Get real-time price history for a specific item (with listener)
export const watchPriceHistoryForItem = (
  itemName: string, 
  callback: (entries: PriceEntry[]) => void,
  limitCount = 10
) => {
  const q = query(
    collection(db, PRICE_ENTRIES_COLLECTION),
    where("itemName", "==", itemName),
    orderBy("dateRecorded", "desc"),
    limit(limitCount)
  );
  
  return onSnapshot(q, (querySnapshot: QuerySnapshot) => {
    const entries: PriceEntry[] = [];
    querySnapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data()
      } as PriceEntry);
    });
    callback(entries);
  });
};

// Get the best (lowest) price for an item across stores
export const getBestPriceForItem = async (itemName: string): Promise<PriceEntry | null> => {
  try {
    const q = query(
      collection(db, PRICE_ENTRIES_COLLECTION),
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
      collection(db, PRICE_ENTRIES_COLLECTION),
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

// Get all stored prices (for debugging and admin features)
export const getAllPriceEntries = async (limitCount = 100): Promise<PriceEntry[]> => {
  try {
    const q = query(
      collection(db, PRICE_ENTRIES_COLLECTION),
      orderBy("dateRecorded", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as PriceEntry));
  } catch (error) {
    console.error("Error getting all price entries:", error);
    return [];
  }
};

// Find price comparison across stores
export const getItemPriceComparisonAcrossStores = async (
  itemName: string
): Promise<{ itemName: string, pricesByStore: Record<string, PriceEntry> }> => {
  try {
    const entries = await getPriceHistoryForItem(itemName, 50);
    const storeMap: Record<string, PriceEntry> = {};
    
    // Get the most recent price entry for each store
    entries.forEach(entry => {
      if (!storeMap[entry.storeName] || 
          new Date(entry.dateRecorded) > new Date(storeMap[entry.storeName].dateRecorded)) {
        storeMap[entry.storeName] = entry;
      }
    });
    
    return {
      itemName,
      pricesByStore: storeMap
    };
  } catch (error) {
    console.error("Error comparing prices across stores:", error);
    return { itemName, pricesByStore: {} };
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