import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip, TripItem } from '../types/trips';

// Sample data for the past 6 months
const generateSampleTrips = (): Trip[] => {
  const now = new Date();
  const trips: Trip[] = [];
  
  // Stores to rotate through
  const stores = ["Trader Joe's", "Whole Foods", "Costco", "Target", "Walmart", "Kroger"];
  const categories = ["Produce", "Dairy", "Meat", "Pantry", "Household", "Snacks"];
  const items = [
    { name: "Milk", category: "Dairy", price: 4.99, unit: "gal" },
    { name: "Eggs", category: "Dairy", price: 5.99, unit: "dozen" },
    { name: "Bread", category: "Pantry", price: 3.99, unit: "loaf" },
    { name: "Bananas", category: "Produce", price: 2.99, unit: "bunch" },
    { name: "Chicken Breast", category: "Meat", price: 12.99, unit: "lb" },
    { name: "Paper Towels", category: "Household", price: 15.99, unit: "pack" },
    { name: "Chips", category: "Snacks", price: 4.49, unit: "bag" },
    { name: "Apples", category: "Produce", price: 5.99, unit: "lb" },
    { name: "Cheese", category: "Dairy", price: 6.99, unit: "lb" },
    { name: "Pasta", category: "Pantry", price: 2.99, unit: "box" }
  ];
  
  // Generate trips for the past 6 months
  for (let i = 0; i < 6; i++) {
    // 4-6 trips per month
    const tripsThisMonth = 4 + Math.floor(Math.random() * 3);
    
    for (let j = 0; j < tripsThisMonth; j++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, Math.floor(Math.random() * 28) + 1);
      const store = stores[Math.floor(Math.random() * stores.length)];
      const itemCount = 3 + Math.floor(Math.random() * 8); // 3-10 items per trip
      
      const tripItems: TripItem[] = [];
      let totalAmount = 0;
      
      // Add some random items from our predefined list
      const shuffledItems = [...items].sort(() => Math.random() - 0.5).slice(0, itemCount);
      
      shuffledItems.forEach((item, k) => {
        const quantity = 1 + Math.floor(Math.random() * 3);
        const price = Number((item.price * (0.9 + Math.random() * 0.2)).toFixed(2)); // ±10% price variation
        const itemTotal = price * quantity;
        totalAmount += itemTotal;
        
        tripItems.push({
          id: `item-${date.getTime()}-${k}`,
          name: item.name,
          quantity,
          category: item.category,
          addedBy: 'user123',
          addedAt: date.toISOString(),
          price,
          checked: true,
          unit: item.unit
        });
      });
      
      trips.push({
        id: `trip-${date.getTime()}-${j}`,
        name: `Trip to ${store}`,
        store,
        status: 'completed',
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
        items: tripItems,
        members: ['user123'],
        totalAmount: Number(totalAmount.toFixed(2))
      });
    }
  }
  
  // Add a few active trips
  const activeTrips = 2;
  for (let i = 0; i < activeTrips; i++) {
    const store = stores[Math.floor(Math.random() * stores.length)];
    const tripItems: TripItem[] = [];
    const itemCount = 2 + Math.floor(Math.random() * 4); // 2-5 items per active trip
    let totalAmount = 0;
    
    // Add some random items from our predefined list
    const shuffledItems = [...items].sort(() => Math.random() - 0.5).slice(0, itemCount);
    
    shuffledItems.forEach((item, k) => {
      const quantity = 1 + Math.floor(Math.random() * 3);
      const price = Number((item.price * (0.9 + Math.random() * 0.2)).toFixed(2)); // ±10% price variation
      const itemTotal = price * quantity;
      totalAmount += itemTotal;
      
      tripItems.push({
        id: `item-${Date.now()}-active-${k}`,
        name: item.name,
        quantity,
        category: item.category,
        addedBy: 'user123',
        addedAt: new Date().toISOString(),
        price,
        checked: false,
        unit: item.unit
      });
    });
    
    trips.push({
      id: `trip-${Date.now()}-active-${i}`,
      name: `Trip to ${store}`,
      store,
      status: i === 0 ? 'open' : 'shopping',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: tripItems,
      members: ['user123'],
      totalAmount: Number(totalAmount.toFixed(2))
    });
  }
  
  return trips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

interface TripsContextType {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  addItemToTrip: (tripId: string, items: Omit<TripItem, 'id' | 'addedAt'>[]) => void;
  removeItemFromTrip: (tripId: string, itemId: string) => void;
  updateTripItem: (tripId: string, itemId: string, updates: Partial<TripItem>) => void;
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export function TripsProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);

  // Load trips from localStorage on mount or initialize with sample data
  useEffect(() => {
    const savedTrips = localStorage.getItem('trips');
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    } else {
      const sampleTrips = generateSampleTrips();
      setTrips(sampleTrips);
      localStorage.setItem('trips', JSON.stringify(sampleTrips));
    }
  }, []);

  // Save trips to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('trips', JSON.stringify(trips));
  }, [trips]);

  const addTrip = (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTrip: Trip = {
      ...trip,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTrips(prev => [...prev, newTrip]);
  };

  const updateTrip = (tripId: string, updates: Partial<Trip>) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId 
        ? { ...trip, ...updates, updatedAt: new Date().toISOString() }
        : trip
    ));
  };

  const deleteTrip = (tripId: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
  };

  const addItemToTrip = (tripId: string, items: Omit<TripItem, 'id' | 'addedAt'>[]) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id === tripId) {
        const newItems = items.map(item => ({
          ...item,
          id: Date.now().toString(),
          addedAt: new Date().toISOString(),
        }));
        
        // Calculate new total amount
        const newTotal = trip.items.concat(newItems).reduce((sum, item) => 
          sum + (item.price || 0) * item.quantity, 0
        );
        
        return {
          ...trip,
          items: [...trip.items, ...newItems],
          updatedAt: new Date().toISOString(),
          totalAmount: Number(newTotal.toFixed(2))
        };
      }
      return trip;
    }));
  };

  const removeItemFromTrip = (tripId: string, itemId: string) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id === tripId) {
        const updatedItems = trip.items.filter(item => item.id !== itemId);
        const newTotal = updatedItems.reduce((sum, item) => 
          sum + (item.price || 0) * item.quantity, 0
        );
        
        return {
          ...trip,
          items: updatedItems,
          updatedAt: new Date().toISOString(),
          totalAmount: Number(newTotal.toFixed(2))
        };
      }
      return trip;
    }));
  };

  const updateTripItem = (tripId: string, itemId: string, updates: Partial<TripItem>) => {
    setTrips(prev => prev.map(trip => {
      if (trip.id === tripId) {
        const updatedItems = trip.items.map(item => 
          item.id === itemId 
            ? { ...item, ...updates }
            : item
        );
        
        const newTotal = updatedItems.reduce((sum, item) => 
          sum + (item.price || 0) * item.quantity, 0
        );
        
        return {
          ...trip,
          items: updatedItems,
          updatedAt: new Date().toISOString(),
          totalAmount: Number(newTotal.toFixed(2))
        };
      }
      return trip;
    }));
  };

  return (
    <TripsContext.Provider value={{
      trips,
      addTrip,
      updateTrip,
      deleteTrip,
      addItemToTrip,
      removeItemFromTrip,
      updateTripItem,
    }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripsContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
} 