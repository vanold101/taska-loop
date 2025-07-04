import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip, TripItem } from '../types/trips';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);

  // Get storage keys for current user
  const getStorageKey = (key: string) => user ? `${key}_${user.id}` : key;

  // Load trips from localStorage on mount
  useEffect(() => {
    const savedTrips = localStorage.getItem(getStorageKey('trips'));
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    } else {
      // Start with empty trips for new users
      setTrips([]);
    }
  }, [user]);

  // Save trips to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(getStorageKey('trips'), JSON.stringify(trips));
    }
  }, [trips, user]);

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