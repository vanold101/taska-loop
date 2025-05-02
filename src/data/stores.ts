export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: 'grocery' | 'pharmacy' | 'hardware' | 'clothing' | 'electronics' | 'other';
  logo?: string;
  hours?: string;
  rating?: number;
}

// List of popular stores with realistic coordinates
export const stores: Store[] = [
  {
    id: "1",
    name: "Trader Joe's",
    address: "555 Market St, San Francisco, CA 94105",
    lat: 37.789,
    lng: -122.401,
    category: "grocery",
    hours: "8AM - 10PM",
    rating: 4.7
  },
  {
    id: "2",
    name: "Whole Foods Market",
    address: "399 4th St, San Francisco, CA 94107",
    lat: 37.781,
    lng: -122.396,
    category: "grocery",
    hours: "7AM - 10PM",
    rating: 4.5
  },
  {
    id: "3",
    name: "Target",
    address: "789 Mission St, San Francisco, CA 94103",
    lat: 37.784,
    lng: -122.406,
    category: "grocery",
    hours: "8AM - 11PM",
    rating: 4.3
  },
  {
    id: "4",
    name: "Walgreens",
    address: "456 Powell St, San Francisco, CA 94102",
    lat: 37.788,
    lng: -122.408,
    category: "pharmacy",
    hours: "24 hours",
    rating: 4.0
  },
  {
    id: "5",
    name: "CVS Pharmacy",
    address: "731 Market St, San Francisco, CA 94103",
    lat: 37.787,
    lng: -122.404,
    category: "pharmacy",
    hours: "24 hours",
    rating: 3.9
  },
  {
    id: "6",
    name: "Home Depot",
    address: "2675 Geary Blvd, San Francisco, CA 94118",
    lat: 37.782,
    lng: -122.447,
    category: "hardware",
    hours: "6AM - 9PM",
    rating: 4.2
  },
  {
    id: "7",
    name: "Safeway",
    address: "2020 Market St, San Francisco, CA 94114",
    lat: 37.769,
    lng: -122.428,
    category: "grocery",
    hours: "6AM - 12AM",
    rating: 4.1
  },
  {
    id: "8",
    name: "Costco",
    address: "450 10th St, San Francisco, CA 94103",
    lat: 37.771,
    lng: -122.412,
    category: "grocery",
    hours: "10AM - 8:30PM",
    rating: 4.6
  },
  {
    id: "9",
    name: "Best Buy",
    address: "1717 Harrison St, San Francisco, CA 94103",
    lat: 37.769,
    lng: -122.413,
    category: "electronics",
    hours: "10AM - 9PM",
    rating: 4.3
  },
  {
    id: "10",
    name: "Apple Store",
    address: "300 Post St, San Francisco, CA 94108",
    lat: 37.788,
    lng: -122.407,
    category: "electronics",
    hours: "10AM - 8PM",
    rating: 4.8
  },
  {
    id: "11",
    name: "Macy's",
    address: "170 O'Farrell St, San Francisco, CA 94102",
    lat: 37.786,
    lng: -122.407,
    category: "clothing",
    hours: "10AM - 9PM",
    rating: 4.0
  },
  {
    id: "12",
    name: "Nordstrom",
    address: "865 Market St, San Francisco, CA 94103",
    lat: 37.784,
    lng: -122.406,
    category: "clothing",
    hours: "10AM - 9PM",
    rating: 4.4
  },
  {
    id: "13",
    name: "Ace Hardware",
    address: "2020 Fillmore St, San Francisco, CA 94115",
    lat: 37.788,
    lng: -122.434,
    category: "hardware",
    hours: "8AM - 8PM",
    rating: 4.5
  },
  {
    id: "14",
    name: "Lowe's",
    address: "491 Bayshore Blvd, San Francisco, CA 94124",
    lat: 37.739,
    lng: -122.403,
    category: "hardware",
    hours: "6AM - 10PM",
    rating: 4.2
  },
  {
    id: "15",
    name: "Walmart",
    address: "1400 Shattuck Ave, Berkeley, CA 94709",
    lat: 37.881,
    lng: -122.269,
    category: "grocery",
    hours: "7AM - 11PM",
    rating: 3.8
  }
];

// Helper function to find a store by name (case insensitive partial match)
export const findStoreByName = (name: string): Store | undefined => {
  const lowerName = name.toLowerCase();
  return stores.find(store => 
    store.name.toLowerCase().includes(lowerName)
  );
};

// Helper function to get store suggestions based on partial name
export const getStoreSuggestions = (partialName: string): Store[] => {
  if (!partialName || partialName.length < 2) return [];
  
  const lowerName = partialName.toLowerCase();
  return stores.filter(store => 
    store.name.toLowerCase().includes(lowerName)
  ).slice(0, 5); // Limit to 5 suggestions
};

// Helper function to get stores by category
export const getStoresByCategory = (category: Store['category']): Store[] => {
  return stores.filter(store => store.category === category);
};

// Helper function to get nearby stores based on coordinates
export const getNearbyStores = (lat: number, lng: number, radiusMiles: number = 2): Store[] => {
  // Simple distance calculation (not accounting for Earth's curvature)
  // 1 degree of latitude ≈ 69 miles, 1 degree of longitude ≈ 55 miles at this latitude
  const latDiff = radiusMiles / 69;
  const lngDiff = radiusMiles / 55;
  
  return stores.filter(store => 
    Math.abs(store.lat - lat) < latDiff && 
    Math.abs(store.lng - lng) < lngDiff
  );
};
