// Types for store analytics
export interface StoreVisit {
  store: string;
  date: string; // ISO date string
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    unit?: string;
  }>;
  total: number;
}

export interface StoreFrequencyData {
  store: string;
  visitCount: number;
  lastVisit: string;
  totalSpent: number;
  averageSpent: number;
  mostBoughtItems: Array<{
    name: string;
    count: number;
    averagePrice: number;
  }>;
}

export interface ItemFrequencyData {
  name: string;
  totalPurchases: number;
  stores: Array<{
    store: string;
    purchaseCount: number;
    averagePrice: number;
    lastPurchaseDate: string;
  }>;
}

// Load store visits from localStorage
const loadStoreVisits = (): StoreVisit[] => {
  try {
    const stored = localStorage.getItem('storeVisits');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load store visits:', error);
  }
  return [];
};

// Save store visits to localStorage
const saveStoreVisits = (visits: StoreVisit[]): void => {
  try {
    localStorage.setItem('storeVisits', JSON.stringify(visits));
  } catch (error) {
    console.error('Failed to save store visits:', error);
  }
};

// Record a new store visit
export const recordStoreVisit = (visit: StoreVisit): void => {
  const visits = loadStoreVisits();
  visits.push(visit);
  saveStoreVisits(visits);
};

// Get store frequency data
export const getStoreFrequencyData = (): StoreFrequencyData[] => {
  const visits = loadStoreVisits();
  const storeMap = new Map<string, StoreFrequencyData>();

  // Process each visit
  visits.forEach(visit => {
    const store = visit.store;
    const existingData = storeMap.get(store) || {
      store,
      visitCount: 0,
      lastVisit: '',
      totalSpent: 0,
      averageSpent: 0,
      mostBoughtItems: []
    };

    // Update store data
    existingData.visitCount++;
    existingData.lastVisit = visit.date > existingData.lastVisit ? visit.date : existingData.lastVisit;
    existingData.totalSpent += visit.total;
    existingData.averageSpent = existingData.totalSpent / existingData.visitCount;

    // Update item frequency
    const itemCounts = new Map<string, { count: number; totalPrice: number }>();
    visit.items.forEach(item => {
      const existing = itemCounts.get(item.name) || { count: 0, totalPrice: 0 };
      existing.count += item.quantity;
      existing.totalPrice += item.price * item.quantity;
      itemCounts.set(item.name, existing);
    });

    // Update most bought items
    existingData.mostBoughtItems = Array.from(itemCounts.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        averagePrice: data.totalPrice / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Keep top 5 items

    storeMap.set(store, existingData);
  });

  return Array.from(storeMap.values())
    .sort((a, b) => b.visitCount - a.visitCount);
};

// Get item frequency data
export const getItemFrequencyData = (): ItemFrequencyData[] => {
  const visits = loadStoreVisits();
  const itemMap = new Map<string, ItemFrequencyData>();

  // Process each visit
  visits.forEach(visit => {
    visit.items.forEach(item => {
      const existingData = itemMap.get(item.name) || {
        name: item.name,
        totalPurchases: 0,
        stores: []
      };

      // Update total purchases
      existingData.totalPurchases += item.quantity;

      // Update store-specific data
      const storeIndex = existingData.stores.findIndex(s => s.store === visit.store);
      if (storeIndex === -1) {
        existingData.stores.push({
          store: visit.store,
          purchaseCount: item.quantity,
          averagePrice: item.price,
          lastPurchaseDate: visit.date
        });
      } else {
        const storeData = existingData.stores[storeIndex];
        const newCount = storeData.purchaseCount + item.quantity;
        storeData.averagePrice = (storeData.averagePrice * storeData.purchaseCount + item.price * item.quantity) / newCount;
        storeData.purchaseCount = newCount;
        storeData.lastPurchaseDate = visit.date > storeData.lastPurchaseDate ? visit.date : storeData.lastPurchaseDate;
      }

      itemMap.set(item.name, existingData);
    });
  });

  return Array.from(itemMap.values())
    .sort((a, b) => b.totalPurchases - a.totalPurchases);
};

// Get recent store visits
export const getRecentStoreVisits = (limit: number = 10): StoreVisit[] => {
  const visits = loadStoreVisits();
  return visits
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

// Get store visit history for a specific store
export const getStoreVisitHistory = (storeName: string): StoreVisit[] => {
  const visits = loadStoreVisits();
  return visits
    .filter(visit => visit.store === storeName)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Get frequently bought items at a specific store
export const getFrequentItemsAtStore = (
  storeName: string,
  limit: number = 5
): Array<{ name: string; frequency: number; averagePrice: number }> => {
  const visits = getStoreVisitHistory(storeName);
  const itemMap = new Map<string, { count: number; totalPrice: number }>();

  visits.forEach(visit => {
    visit.items.forEach(item => {
      const existing = itemMap.get(item.name) || { count: 0, totalPrice: 0 };
      existing.count += item.quantity;
      existing.totalPrice += item.price * item.quantity;
      itemMap.set(item.name, existing);
    });
  });

  return Array.from(itemMap.entries())
    .map(([name, data]) => ({
      name,
      frequency: data.count,
      averagePrice: data.totalPrice / data.count
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
}; 