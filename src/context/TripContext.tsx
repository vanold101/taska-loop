import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TripItem {
  id: string;
  name: string;
  checked: boolean;
  addedBy: {
    id: string;
    name: string;
  };
  quantity: number;
  price?: number;
}

export interface Trip {
  id: string;
  name: string;
  items: TripItem[];
  isComplete: boolean;
  createdAt: number;
  createdBy: {
    id: string;
    name: string;
  };
  store?: string;
  totalAmount: number;
}

interface TripContextType {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  addItemToTrip: (tripId: string, item: Omit<TripItem, 'id'>) => void;
  updateTripItem: (tripId: string, itemId: string, updates: Partial<TripItem>) => void;
  deleteTripItem: (tripId: string, itemId: string) => void;
  completeTrip: (tripId: string) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

// Storage key for trips
const TRIPS_STORAGE_KEY = 'taska_trips';

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);

  // Load trips from localStorage on mount
  useEffect(() => {
    const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (storedTrips) {
      setTrips(JSON.parse(storedTrips));
    }
  }, []);

  // Save trips to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  const addTrip = (trip: Omit<Trip, 'id' | 'createdAt'>) => {
    const newTrip: Trip = {
      ...trip,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    setTrips(prev => [...prev, newTrip]);
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips(prev => prev.map(trip => 
      trip.id === id ? { ...trip, ...updates } : trip
    ));
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== id));
  };

  const addItemToTrip = (tripId: string, item: Omit<TripItem, 'id'>) => {
    const newItem: TripItem = {
      ...item,
      id: Date.now().toString(),
    };
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, items: [...trip.items, newItem] }
        : trip
    ));
  };

  const updateTripItem = (tripId: string, itemId: string, updates: Partial<TripItem>) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? {
            ...trip,
            items: trip.items.map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            )
          }
        : trip
    ));
  };

  const deleteTripItem = (tripId: string, itemId: string) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, items: trip.items.filter(item => item.id !== itemId) }
        : trip
    ));
  };

  const completeTrip = (tripId: string) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId ? { ...trip, isComplete: true } : trip
    ));
  };

  return (
    <TripContext.Provider value={{
      trips,
      setTrips,
      addTrip,
      updateTrip,
      deleteTrip,
      addItemToTrip,
      updateTripItem,
      deleteTripItem,
      completeTrip,
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrips = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
}; 