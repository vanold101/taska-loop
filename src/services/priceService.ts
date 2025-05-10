// This service will fetch grocery item prices from various stores

// Mock data of grocery stores with prices and locations
const GROCERY_STORES = [
  {
    id: 'kroger1',
    name: 'Kroger',
    address: '3417 N High St, Columbus, OH 43214',
    coordinates: { lat: 40.031513, lng: -83.014337 },
    items: {
      'apple': { price: 1.29, unit: 'each' },
      'banana': { price: 0.59, unit: 'lb' },
      'bread': { price: 2.49, unit: 'loaf' },
      'milk': { price: 2.89, unit: 'gallon' },
      'eggs': { price: 3.49, unit: 'dozen' },
      'chicken': { price: 5.99, unit: 'lb' },
      'pasta': { price: 1.29, unit: 'box' },
      'tomato sauce': { price: 1.79, unit: 'can' },
    }
  },
  {
    id: 'aldi1',
    name: 'Aldi',
    address: '3620 N High St, Columbus, OH 43214',
    coordinates: { lat: 40.033779, lng: -83.014112 },
    items: {
      'apple': { price: 0.99, unit: 'each' },
      'banana': { price: 0.49, unit: 'lb' },
      'bread': { price: 1.99, unit: 'loaf' },
      'milk': { price: 2.69, unit: 'gallon' },
      'eggs': { price: 2.99, unit: 'dozen' },
      'chicken': { price: 5.49, unit: 'lb' },
      'pasta': { price: 0.99, unit: 'box' },
      'tomato sauce': { price: 1.49, unit: 'can' },
    }
  },
  {
    id: 'walmart1',
    name: 'Walmart',
    address: '3900 Morse Rd, Columbus, OH 43219',
    coordinates: { lat: 40.060691, lng: -82.933258 },
    items: {
      'apple': { price: 1.19, unit: 'each' },
      'banana': { price: 0.55, unit: 'lb' },
      'bread': { price: 2.29, unit: 'loaf' },
      'milk': { price: 2.79, unit: 'gallon' },
      'eggs': { price: 3.29, unit: 'dozen' },
      'chicken': { price: 5.79, unit: 'lb' },
      'pasta': { price: 1.19, unit: 'box' },
      'tomato sauce': { price: 1.59, unit: 'can' },
    }
  },
  {
    id: 'wholefoods1',
    name: 'Whole Foods',
    address: '1555 Lane Ave, Upper Arlington, OH 43221',
    coordinates: { lat: 40.013218, lng: -83.054726 },
    items: {
      'apple': { price: 1.99, unit: 'each' },
      'banana': { price: 0.79, unit: 'lb' },
      'bread': { price: 3.99, unit: 'loaf' },
      'milk': { price: 3.99, unit: 'gallon' },
      'eggs': { price: 4.99, unit: 'dozen' },
      'chicken': { price: 8.99, unit: 'lb' },
      'pasta': { price: 2.49, unit: 'box' },
      'tomato sauce': { price: 2.99, unit: 'can' },
    }
  },
  {
    id: 'traderjoes1',
    name: 'Trader Joe\'s',
    address: '1440 Gemini Pl, Columbus, OH 43240',
    coordinates: { lat: 40.086538, lng: -82.980335 },
    items: {
      'apple': { price: 1.49, unit: 'each' },
      'banana': { price: 0.69, unit: 'lb' },
      'bread': { price: 2.99, unit: 'loaf' },
      'milk': { price: 3.49, unit: 'gallon' },
      'eggs': { price: 3.99, unit: 'dozen' },
      'chicken': { price: 6.99, unit: 'lb' },
      'pasta': { price: 1.89, unit: 'box' },
      'tomato sauce': { price: 1.99, unit: 'can' },
    }
  }
];

export interface PriceData {
  price: number;
  unit: string;
}

export interface GroceryStore {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  items: Record<string, PriceData>;
}

export interface ItemPriceResult {
  item: string;
  bestPrice: {
    price: number;
    unit: string;
    store: GroceryStore;
    savings: {
      amount: number;
      percentage: number;
    };
  };
  otherStores: Array<{
    store: GroceryStore;
    price: number;
    unit: string;
  }>;
}

// Calculate distance between two coordinates in miles
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  // Haversine formula to calculate distance
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Find nearby grocery stores within a radius
export const findNearbyGroceryStores = (
  userLocation: { lat: number; lng: number },
  radius: number = 10 // Default radius of 10 miles
): GroceryStore[] => {
  return GROCERY_STORES.filter(store => {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      store.coordinates.lat,
      store.coordinates.lng
    );
    return distance <= radius;
  });
};

// Find the best price for a specific item across stores
export const findBestPrice = (
  item: string,
  stores: GroceryStore[]
): { store: GroceryStore; price: number; unit: string } | null => {
  const storesWithItem = stores.filter(
    store => store.items[item.toLowerCase()] !== undefined
  );

  if (storesWithItem.length === 0) return null;

  return storesWithItem.reduce(
    (best, store) => {
      const storePrice = store.items[item.toLowerCase()].price;
      if (storePrice < best.price) {
        return {
          store,
          price: storePrice,
          unit: store.items[item.toLowerCase()].unit
        };
      }
      return best;
    },
    {
      store: storesWithItem[0],
      price: storesWithItem[0].items[item.toLowerCase()].price,
      unit: storesWithItem[0].items[item.toLowerCase()].unit
    }
  );
};

// Find best prices for all items in a list
export const findBestPrices = (
  items: string[],
  userLocation: { lat: number; lng: number },
  radius: number = 10
): ItemPriceResult[] => {
  // Find nearby stores
  const nearbyStores = findNearbyGroceryStores(userLocation, radius);
  
  // If no nearby stores, return empty array
  if (nearbyStores.length === 0) return [];

  // Calculate best prices for each item
  return items.map(item => {
    const itemLower = item.toLowerCase();
    
    // Find stores that carry this item
    const storesWithItem = nearbyStores.filter(
      store => store.items[itemLower] !== undefined
    );
    
    if (storesWithItem.length === 0) {
      return {
        item,
        bestPrice: null,
        otherStores: []
      };
    }

    // Find best price
    const bestPriceStore = findBestPrice(itemLower, storesWithItem);
    
    if (!bestPriceStore) {
      return {
        item,
        bestPrice: null,
        otherStores: []
      };
    }

    // Calculate average price
    const totalPrice = storesWithItem.reduce(
      (sum, store) => sum + store.items[itemLower].price,
      0
    );
    const avgPrice = totalPrice / storesWithItem.length;

    // Calculate savings
    const savings = {
      amount: avgPrice - bestPriceStore.price,
      percentage: ((avgPrice - bestPriceStore.price) / avgPrice) * 100
    };

    // Get other stores (excluding the best price store)
    const otherStores = storesWithItem
      .filter(store => store.id !== bestPriceStore.store.id)
      .map(store => ({
        store,
        price: store.items[itemLower].price,
        unit: store.items[itemLower].unit
      }));

    return {
      item,
      bestPrice: {
        price: bestPriceStore.price,
        unit: bestPriceStore.unit,
        store: bestPriceStore.store,
        savings
      },
      otherStores
    };
  });
};

// Get a summary of which stores have the best prices for each item
export const getShoppingPlan = (
  priceResults: ItemPriceResult[]
): { 
  storeVisits: Array<{
    store: GroceryStore;
    items: Array<{item: string; price: number; unit: string}>;
    totalCost: number;
  }>;
  totalSavings: number;
} => {
  // Group items by store
  const storeMap = new Map<string, {
    store: GroceryStore;
    items: Array<{item: string; price: number; unit: string}>;
  }>();

  priceResults.forEach(result => {
    if (!result.bestPrice) return;

    const storeId = result.bestPrice.store.id;
    
    if (!storeMap.has(storeId)) {
      storeMap.set(storeId, {
        store: result.bestPrice.store,
        items: []
      });
    }

    storeMap.get(storeId).items.push({
      item: result.item,
      price: result.bestPrice.price,
      unit: result.bestPrice.unit
    });
  });

  // Calculate total cost and savings
  let totalSavings = 0;
  const storeVisits = Array.from(storeMap.values()).map(visit => {
    const totalCost = visit.items.reduce((sum, item) => sum + item.price, 0);
    
    // Add total cost to the store visit
    return {
      ...visit,
      totalCost
    };
  });

  // Calculate total savings compared to shopping at a single store
  totalSavings = priceResults.reduce((sum, result) => {
    if (!result.bestPrice) return sum;
    return sum + result.bestPrice.savings.amount;
  }, 0);

  return {
    storeVisits,
    totalSavings
  };
}; 