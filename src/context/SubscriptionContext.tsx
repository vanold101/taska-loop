import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type SubscriptionTier = 'free' | 'plus' | 'premium';

export interface SubscriptionLimits {
  maxActiveTrips: number;
  maxActiveTasks: number;
  maxPantryItems: number;
  maxExpensesPerMonth: number;
  maxHouseholdMembers: number;
  maxReceiptScansPerMonth: number;
  maxSavedLocations: number;
  hasReceiptScanning: boolean;
  hasBarcodeScanning: boolean;
  hasAIFeatures: boolean;
  hasRecurringItems: boolean;
  hasAdvancedExpenseSplitting: boolean;
  hasCalendarIntegration: boolean;
  hasExportFeatures: boolean;
  hasBulkOperations: boolean;
  hasAdvancedAnalytics: boolean;
  hasSmartHomeIntegration: boolean;
  hasPrioritySupport: boolean;
}

export interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  limits: SubscriptionLimits;
  isAdmin: boolean;
  upgradeTier: (newTier: SubscriptionTier) => void;
  checkLimit: (feature: keyof SubscriptionLimits, currentUsage?: number) => boolean;
  showUpgradePrompt: (feature: string) => void;
}

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxActiveTrips: 10,
    maxActiveTasks: 50,
    maxPantryItems: 100,
    maxExpensesPerMonth: 0,
    maxHouseholdMembers: 1,
    maxReceiptScansPerMonth: 0,
    maxSavedLocations: 5,
    hasReceiptScanning: false,
    hasBarcodeScanning: false,
    hasAIFeatures: false,
    hasRecurringItems: false,
    hasAdvancedExpenseSplitting: false,
    hasCalendarIntegration: false,
    hasExportFeatures: false,
    hasBulkOperations: false,
    hasAdvancedAnalytics: false,
    hasSmartHomeIntegration: false,
    hasPrioritySupport: false,
  },
  plus: {
    maxActiveTrips: Infinity,
    maxActiveTasks: Infinity,
    maxPantryItems: Infinity,
    maxExpensesPerMonth: Infinity,
    maxHouseholdMembers: 5,
    maxReceiptScansPerMonth: 0,
    maxSavedLocations: Infinity,
    hasReceiptScanning: false,
    hasBarcodeScanning: true,
    hasAIFeatures: true,
    hasRecurringItems: true,
    hasAdvancedExpenseSplitting: true,
    hasCalendarIntegration: true,
    hasExportFeatures: true,
    hasBulkOperations: true,
    hasAdvancedAnalytics: false,
    hasSmartHomeIntegration: false,
    hasPrioritySupport: true,
  },
  premium: {
    maxActiveTrips: Infinity,
    maxActiveTasks: Infinity,
    maxPantryItems: Infinity,
    maxExpensesPerMonth: Infinity,
    maxHouseholdMembers: Infinity,
    maxReceiptScansPerMonth: Infinity,
    maxSavedLocations: Infinity,
    hasReceiptScanning: true,
    hasBarcodeScanning: true,
    hasAIFeatures: true,
    hasRecurringItems: true,
    hasAdvancedExpenseSplitting: true,
    hasCalendarIntegration: true,
    hasExportFeatures: true,
    hasBulkOperations: true,
    hasAdvancedAnalytics: true,
    hasSmartHomeIntegration: true,
    hasPrioritySupport: true,
  },
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');

  // Get storage key for current user
  const getStorageKey = (key: string) => user ? `${key}_${user.id}` : key;

  // Load tier from localStorage on mount
  useEffect(() => {
    if (user && !isAdmin) {
      // Non-admin users always start as free tier
      // Reset any existing premium subscriptions for demo purposes
      setCurrentTier('free');
      localStorage.setItem(getStorageKey('subscription_tier'), 'free');
    } else if (isAdmin) {
      // Admin accounts get premium tier by default
      setCurrentTier('premium');
    }
  }, [user, isAdmin]);

  // Save tier to localStorage
  useEffect(() => {
    if (user && !isAdmin) {
      localStorage.setItem(getStorageKey('subscription_tier'), currentTier);
    }
  }, [currentTier, user, isAdmin]);

  const limits = TIER_LIMITS[currentTier];

  const upgradeTier = (newTier: SubscriptionTier) => {
    if (!isAdmin) {
      setCurrentTier(newTier);
    }
  };

  const checkLimit = (feature: keyof SubscriptionLimits, currentUsage?: number) => {
    const limit = limits[feature];
    
    if (typeof limit === 'boolean') {
      return limit;
    }
    
    if (typeof limit === 'number' && currentUsage !== undefined) {
      return currentUsage < limit;
    }
    
    return true;
  };

  const showUpgradePrompt = (feature: string) => {
    // This would trigger an upgrade modal/toast
    console.log(`Upgrade needed for: ${feature}`);
  };

  const value: SubscriptionContextType = {
    currentTier: isAdmin ? 'premium' : currentTier,
    limits,
    isAdmin,
    upgradeTier,
    checkLimit,
    showUpgradePrompt,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 