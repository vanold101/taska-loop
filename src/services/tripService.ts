import { Trip, Item } from "@/context/TaskContext";
import { recordStoreVisit } from "@/services/StoreAnalyticsService";

// Constants
const TRIPS_STORAGE_KEY = 'taska_trips';
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=random'; // Better default avatar
const DEFAULT_ADDED_BY_USER = { name: 'System', avatar: DEFAULT_AVATAR }; // Placeholder for addedBy user object

// Types
export interface TripParticipant {
  id: string;
  name: string;
  avatar?: string;
}

export interface CreateTripData {
  store: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  eta?: string;
  participants?: TripParticipant[];
  shopper?: TripParticipant;
}

export interface CreateTripItemData {
  name: string;
  quantity?: number;
  unit?: string;
  price?: number;
  // notes?: string; // Assumed not in TaskContext.TripItem
  // category?: string; // Assumed not in TaskContext.TripItem
  // addedAt?: string; // Assumed not in TaskContext.TripItem
}

// Load trips from localStorage
export const loadTrips = (): Trip[] => {
  try {
    const stored = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load trips:', error);
  }
  return [];
};

// Save trips to localStorage
export const saveTrips = (trips: Trip[]): void => {
  try {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  } catch (error) {
    console.error('Failed to save trips:', error);
  }
};

// Get a single trip by ID
export const getTrip = (tripId: string): Trip | null => {
  const trips = loadTrips();
  return trips.find(t => t.id === tripId) || null;
};

// Add a new trip
export const addTrip = (data: CreateTripData): Trip => {
  const trips = loadTrips();
  
  const newTrip: Trip = {
    id: Date.now().toString(),
    store: data.store,
    location: data.location,
    coordinates: data.coordinates,
    eta: data.eta || new Date().toISOString(),
    status: 'open',
    items: [],
    participants: data.participants?.map(p => ({ id: p.id, name: p.name, avatar: p.avatar || DEFAULT_AVATAR })) || [],
    shopper: data.shopper ? { name: data.shopper.name, avatar: data.shopper.avatar || DEFAULT_AVATAR } : { name: 'User', avatar: DEFAULT_AVATAR },
    date: new Date().toISOString(),
  };
  
  trips.push(newTrip);
  saveTrips(trips);
  
  return newTrip;
};

// Update a trip
export const updateTrip = (tripId: string, updates: Partial<Trip>): Trip | null => {
  const trips = loadTrips();
  const index = trips.findIndex(t => t.id === tripId);
  
  if (index === -1) return null;
  
  const { id, ...validUpdates } = updates;
  
  const updatedTrip = {
    ...trips[index],
    ...validUpdates
  };
  
  trips[index] = updatedTrip;
  saveTrips(trips);
  
  return updatedTrip;
};

// Complete a trip and record store visit
export const completeTrip = (tripId: string): Trip | null => {
  const trips = loadTrips();
  const tripIndex = trips.findIndex(t => t.id === tripId);
  
  if (tripIndex === -1) return null;
  
  const trip = trips[tripIndex];
  
  const itemsWithPrices = trip.items.filter(item => item.price !== undefined && item.price > 0);
  
  if (itemsWithPrices.length > 0) {
    const total = itemsWithPrices.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);
    
    recordStoreVisit({
      store: trip.store,
      date: new Date().toISOString(),
      items: itemsWithPrices.map(item => ({
        name: item.name,
        price: item.price || 0,
        quantity: item.quantity || 1,
        unit: item.unit
      })),
      total
    });
  }
  
  const updatedTripData = { ...trip, status: 'completed' as 'completed' };
  
  trips[tripIndex] = updatedTripData;
  saveTrips(trips);
  return trips[tripIndex];
};

// Delete a trip
export const deleteTrip = (tripId: string): boolean => {
  const trips = loadTrips();
  const index = trips.findIndex(t => t.id === tripId);
  
  if (index === -1) return false;
  
  trips.splice(index, 1);
  saveTrips(trips);
  
  return true;
};

// Add item to trip
export const addItemToTrip = (tripId: string, itemData: CreateTripItemData): Trip | null => {
  const trips = loadTrips();
  const index = trips.findIndex(t => t.id === tripId);
  
  if (index === -1) return null;
  
  const trip = trips[index];
  const newItem: Item = {
    id: Date.now().toString(),
    name: itemData.name,
    quantity: itemData.quantity || 1,
    unit: itemData.unit,
    price: itemData.price,
    checked: false,
    addedBy: DEFAULT_ADDED_BY_USER, // Placeholder for actual user object
  };
  
  trip.items.push(newItem);
  trips[index] = trip;
  saveTrips(trips);
  
  return trip;
};

// Update item in trip
export const updateTripItem = (
  tripId: string,
  itemId: string,
  updates: Partial<Omit<Item, 'id'>>
): Trip | null => {
  const trips = loadTrips();
  const tripIndex = trips.findIndex(t => t.id === tripId);
  
  if (tripIndex === -1) return null;
  
  const trip = trips[tripIndex];
  const itemIndex = trip.items.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) return null;
  
  trip.items[itemIndex] = {
    ...trip.items[itemIndex],
    ...updates
  };
  
  trips[tripIndex] = trip;
  saveTrips(trips);
  
  return trip;
};

// Remove item from trip
export const removeItemFromTrip = (tripId: string, itemId: string): Trip | null => {
  const trips = loadTrips();
  const tripIndex = trips.findIndex(t => t.id === tripId);
  
  if (tripIndex === -1) return null;
  
  const trip = trips[tripIndex];
  const itemIndex = trip.items.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) return null;
  
  trip.items.splice(itemIndex, 1);
  trips[tripIndex] = trip;
  saveTrips(trips);
  
  return trip;
};

// Toggle item checked status
export const toggleItemChecked = (tripId: string, itemId: string): Trip | null => {
  const trips = loadTrips();
  const tripIndex = trips.findIndex(t => t.id === tripId);
  
  if (tripIndex === -1) return null;
  
  const trip = trips[tripIndex];
  const itemIndex = trip.items.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) return null;
  
  trip.items[itemIndex] = {
    ...trip.items[itemIndex],
    checked: !trip.items[itemIndex].checked
  };
  
  trips[tripIndex] = trip;
  saveTrips(trips);
  
  return trip;
};

// Add participant to trip
export const addParticipantToTrip = (
  tripId: string,
  participant: TripParticipant 
): Trip | null => {
  const trips = loadTrips();
  const tripIndex = trips.findIndex(t => t.id === tripId);
  
  if (tripIndex === -1) return null;
  
  const trip = trips[tripIndex];
  
  if (!trip.participants) {
    trip.participants = [];
  }
  
  if (trip.participants.some(p => p.id === participant.id)) {
    return trip; 
  }
  
  trip.participants.push({ 
    id: participant.id, 
    name: participant.name, 
    avatar: participant.avatar || DEFAULT_AVATAR 
  });
  trips[tripIndex] = trip;
  saveTrips(trips);
  
  return trip;
};

// Remove participant from trip
export const removeParticipantFromTrip = (
  tripId: string,
  participantId: string
): Trip | null => {
  const trips = loadTrips();
  const tripIndex = trips.findIndex(t => t.id === tripId);

  if (tripIndex === -1) return null;

  const trip = trips[tripIndex];

  if (!trip.participants || trip.participants.length === 0) return trip;

  const participantToRemove = trip.participants.find(p => p.id === participantId);

  if (trip.participants.length === 1 && participantToRemove) return trip;
  
  if (trip.shopper && participantToRemove && trip.shopper.name === participantToRemove.name) {
    return trip; 
  }
  
trip.participants = trip.participants.filter(p => p.id !== participantId);
  trips[tripIndex] = trip;
  saveTrips(trips);
  return trip;
};


// Update trip shopper
export const updateTripShopper = (
  tripId: string,
  shopperData: TripParticipant 
): Trip | null => {
  const trips = loadTrips();
  const tripIndex = trips.findIndex(t => t.id === tripId);

  if (tripIndex === -1) return null;

  const trip = trips[tripIndex];

  const shopperForContext = {
    id: shopperData.id, 
    name: shopperData.name,
    avatar: shopperData.avatar || DEFAULT_AVATAR
  };

  if (!trip.participants?.some(p => p.id === shopperForContext.id)) {
    if (!trip.participants) {
      trip.participants = [];
    }
    trip.participants.push(shopperForContext);
  }
  
  trip.shopper = { 
    name: shopperData.name, 
    avatar: shopperData.avatar || DEFAULT_AVATAR 
  };
  trips[tripIndex] = trip;
  saveTrips(trips);
  
  return trip;
};
