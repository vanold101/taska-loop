"use client";

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';

interface Household {
  id: string;
  name: string;
  ownerId: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  currentHousehold: Household | null;
  setCurrentHousehold: (household: Household | null) => void;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    currentHousehold,
    setCurrentHousehold
  };
}; 