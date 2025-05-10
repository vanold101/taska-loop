// Types for price history
export type PriceRecord = {
  itemName: string;
  price: number;
  store: string;
  date: string; // ISO date string
  quantity: number;
  unit?: string; // e.g., 'lb', 'kg', 'ea'
};

export type PriceHistory = {
  [itemKey: string]: PriceRecord[];
};

// Normalize item names for consistent lookups
export const normalizeItemName = (name: string): string => {
  return name.toLowerCase().trim();
};

// Generate a unique key for an item
const getItemKey = (name: string): string => {
  return normalizeItemName(name);
};

// Load price history from localStorage
const loadPriceHistory = (): PriceHistory => {
  try {
    const stored = localStorage.getItem('priceHistory');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load price history:', error);
  }
  return {};
};

// Save price history to localStorage
const savePriceHistory = (history: PriceHistory): void => {
  try {
    localStorage.setItem('priceHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save price history:', error);
  }
};

// Add or update a price record
export const recordPrice = (
  itemName: string,
  price: number,
  store: string,
  quantity: number = 1,
  unit?: string
): void => {
  const history = loadPriceHistory();
  const itemKey = getItemKey(itemName);
  
  const newRecord: PriceRecord = {
    itemName: itemName,
    price,
    store,
    date: new Date().toISOString(),
    quantity,
    unit
  };
  
  if (!history[itemKey]) {
    history[itemKey] = [];
  }
  
  // Add the new price record
  history[itemKey].push(newRecord);
  
  // Keep only the last 10 records
  if (history[itemKey].length > 10) {
    history[itemKey] = history[itemKey].slice(-10);
  }
  
  savePriceHistory(history);
};

// Get last recorded price for an item
export const getLastPrice = (itemName: string): PriceRecord | null => {
  const history = loadPriceHistory();
  const itemKey = getItemKey(itemName);
  
  if (!history[itemKey] || history[itemKey].length === 0) {
    return null;
  }
  
  // Sort by date and return the most recent record
  const sorted = [...history[itemKey]].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return sorted[0];
};

// Calculate unit price
export const getUnitPrice = (record: PriceRecord): number => {
  return record.price / record.quantity;
};

// Get price history for an item
export const getPriceHistory = (itemName: string): PriceRecord[] => {
  const history = loadPriceHistory();
  const itemKey = getItemKey(itemName);
  
  if (!history[itemKey]) {
    return [];
  }
  
  // Return sorted by date, newest first
  return [...history[itemKey]].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// Check if current price is higher than previous price by a percentage threshold
export const isPriceHigher = (
  itemName: string,
  currentPrice: number,
  threshold: number = 10 // Default 10%
): { isHigher: boolean; difference: number; previousPrice: number | null } => {
  const lastRecord = getLastPrice(itemName);
  
  if (!lastRecord) {
    return { isHigher: false, difference: 0, previousPrice: null };
  }
  
  const lastUnitPrice = getUnitPrice(lastRecord);
  const priceDifference = ((currentPrice - lastUnitPrice) / lastUnitPrice) * 100;
  
  return {
    isHigher: priceDifference > threshold,
    difference: priceDifference,
    previousPrice: lastUnitPrice
  };
}; 