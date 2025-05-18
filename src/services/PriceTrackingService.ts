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

export interface PriceRecommendation {
  itemName: string;
  bestPrice: PriceEntry;
  potentialSavings: number; // Savings compared to average price
  confidence: 'high' | 'medium' | 'low'; // Confidence based on recency and data points
  lastUpdated: string; // Date of the most recent price entry
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

// Get best price recommendations for a list of items
export const getBestPriceRecommendations = async (
  itemNames: string[]
): Promise<Record<string, PriceRecommendation>> => {
  try {
    const recommendations: Record<string, PriceRecommendation> = {};
    
    // Process each item to find recommendations
    for (const itemName of itemNames) {
      // Get price history for this item
      const priceHistory = await getPriceHistoryForItem(itemName, 20);
      
      if (priceHistory.length === 0) {
        continue; // Skip items with no price data
      }
      
      // Find the best price entry
      const bestPriceEntry = priceHistory.reduce((best, current) => {
        // Calculate unit prices for fair comparison
        const bestUnitPrice = calculateUnitPrice(best.price, best.quantity, best.unit);
        const currentUnitPrice = calculateUnitPrice(current.price, current.quantity, current.unit);
        
        return currentUnitPrice < bestUnitPrice ? current : best;
      }, priceHistory[0]);
      
      // Calculate average price for comparison
      const totalUnitPrice = priceHistory.reduce((total, entry) => {
        return total + calculateUnitPrice(entry.price, entry.quantity, entry.unit);
      }, 0);
      const avgUnitPrice = totalUnitPrice / priceHistory.length;
      
      // Calculate unit price of best price
      const bestUnitPrice = calculateUnitPrice(bestPriceEntry.price, bestPriceEntry.quantity, bestPriceEntry.unit);
      
      // Calculate potential savings (percentage compared to average)
      const potentialSavings = avgUnitPrice > 0 ? 
        ((avgUnitPrice - bestUnitPrice) / avgUnitPrice) * 100 : 0;
      
      // Determine confidence level based on data points and recency
      let confidence: 'high' | 'medium' | 'low' = 'low';
      const mostRecentDate = new Date(priceHistory[0].dateRecorded);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      if (priceHistory.length >= 5 && mostRecentDate > oneWeekAgo) {
        confidence = 'high';
      } else if (priceHistory.length >= 3 || mostRecentDate > oneWeekAgo) {
        confidence = 'medium';
      }
      
      // Create recommendation
      recommendations[itemName] = {
        itemName,
        bestPrice: bestPriceEntry,
        potentialSavings,
        confidence,
        lastUpdated: priceHistory[0].dateRecorded
      };
    }
    
    return recommendations;
  } catch (error) {
    console.error("Error getting price recommendations:", error);
    return {};
  }
};

// Get best price recommendations for an entire shopping list
export const getShoppingListRecommendations = async (
  items: { name: string; quantity?: number; unit?: string }[]
): Promise<{
  recommendations: Record<string, PriceRecommendation>;
  bestStore: { storeName: string; itemCount: number; potentialSavings: number } | null;
}> => {
  try {
    // Get recommendations for all items
    const itemNames = items.map(item => item.name);
    const recommendations = await getBestPriceRecommendations(itemNames);
    
    // Calculate which store has the most "best price" items
    const storeCount: Record<string, { itemCount: number; totalSavings: number }> = {};
    
    Object.values(recommendations).forEach(rec => {
      const storeName = rec.bestPrice.storeName;
      if (!storeCount[storeName]) {
        storeCount[storeName] = { itemCount: 0, totalSavings: 0 };
      }
      storeCount[storeName].itemCount += 1;
      storeCount[storeName].totalSavings += rec.potentialSavings;
    });
    
    // Find store with most best-price items
    let bestStore: { storeName: string; itemCount: number; potentialSavings: number } | null = null;
    let maxCount = 0;
    
    Object.entries(storeCount).forEach(([storeName, data]) => {
      if (data.itemCount > maxCount) {
        maxCount = data.itemCount;
        bestStore = { 
          storeName, 
          itemCount: data.itemCount,
          potentialSavings: data.totalSavings / data.itemCount // Average savings per item
        };
      }
    });
    
    return {
      recommendations,
      bestStore
    };
  } catch (error) {
    console.error("Error getting shopping list recommendations:", error);
    return {
      recommendations: {},
      bestStore: null
    };
  }
};

// Calculate unit price for comparison (e.g., price per kg, price per liter)
export const calculateUnitPrice = (price: number, quantity: number, unit: string): number => {
  if (quantity <= 0) return 0;
  return price / quantity;
};

// Format a unit price for display
export const formatUnitPrice = (price: number, unit: string): string => {
  return `$${price.toFixed(2)}/${unit}`;
}; 