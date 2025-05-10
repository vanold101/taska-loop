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
    address: "3888 Townsfair Way, Columbus, OH 43219",
    lat: 39.9789,
    lng: -82.8677,
    category: "grocery",
    hours: "8AM - 9PM",
    rating: 4.7
  },
  {
    id: "2",
    name: "Whole Foods Market",
    address: "1555 W Lane Ave, Columbus, OH 43221",
    lat: 40.0065,
    lng: -83.0537,
    category: "grocery",
    hours: "7AM - 10PM",
    rating: 4.5
  },
  {
    id: "3",
    name: "Target",
    address: "1892 N High St, Columbus, OH 43201",
    lat: 39.9964,
    lng: -83.0091,
    category: "grocery",
    hours: "8AM - 11PM",
    rating: 4.3
  },
  {
    id: "4",
    name: "Walgreens",
    address: "1162 N High St, Columbus, OH 43201",
    lat: 39.9865,
    lng: -83.0044,
    category: "pharmacy",
    hours: "24 hours",
    rating: 4.0
  },
  {
    id: "5",
    name: "CVS Pharmacy",
    address: "2160 N High St, Columbus, OH 43201",
    lat: 40.0046,
    lng: -83.0104,
    category: "pharmacy",
    hours: "24 hours",
    rating: 3.9
  },
  {
    id: "6",
    name: "Home Depot",
    address: "2555 Brice Rd, Columbus, OH 43068",
    lat: 39.9259,
    lng: -82.8369,
    category: "hardware",
    hours: "6AM - 9PM",
    rating: 4.2
  },
  {
    id: "7",
    name: "Kroger",
    address: "1350 N High St, Columbus, OH 43201",
    lat: 39.9905,
    lng: -83.0069,
    category: "grocery",
    hours: "6AM - 12AM",
    rating: 4.1
  },
  {
    id: "8",
    name: "Costco",
    address: "3800 W Dublin Granville Rd, Columbus, OH 43235",
    lat: 40.0909,
    lng: -83.0763,
    category: "grocery",
    hours: "10AM - 8:30PM",
    rating: 4.6
  },
  {
    id: "9",
    name: "Best Buy",
    address: "3840 Morse Rd, Columbus, OH 43219",
    lat: 40.0606,
    lng: -82.9307,
    category: "electronics",
    hours: "10AM - 9PM",
    rating: 4.3
  },
  {
    id: "10",
    name: "Apple Store",
    address: "4195 The Strand E, Columbus, OH 43219",
    lat: 40.0529,
    lng: -82.9146,
    category: "electronics",
    hours: "10AM - 8PM",
    rating: 4.8
  },
  {
    id: "11",
    name: "Macy's",
    address: "1500 Polaris Pkwy, Columbus, OH 43240",
    lat: 40.1452,
    lng: -82.9823,
    category: "clothing",
    hours: "10AM - 9PM",
    rating: 4.0
  },
  {
    id: "12",
    name: "Giant Eagle",
    address: "280 E Whittier St, Columbus, OH 43206",
    lat: 39.9447,
    lng: -82.9913,
    category: "grocery",
    hours: "7AM - 10PM",
    rating: 4.2
  },
  {
    id: "13",
    name: "Ace Hardware",
    address: "1305 W Lane Ave, Columbus, OH 43221",
    lat: 40.0057,
    lng: -83.0491,
    category: "hardware",
    hours: "8AM - 8PM",
    rating: 4.5
  },
  {
    id: "14",
    name: "Lowe's",
    address: "2345 Silver Dr, Columbus, OH 43211",
    lat: 40.0127,
    lng: -82.9765,
    category: "hardware",
    hours: "6AM - 10PM",
    rating: 4.2
  },
  {
    id: "15",
    name: "Walmart",
    address: "3900 Morse Rd, Columbus, OH 43219",
    lat: 40.0602,
    lng: -82.9339,
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
