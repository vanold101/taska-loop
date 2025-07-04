import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { inviteService } from '../services/InviteService';

export interface HouseholdMember {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  joinedAt: string;
}

interface HouseholdContextType {
  members: HouseholdMember[];
  currentHousehold: {
    id: string;
    name: string;
    ownerId: string;
  } | null;
  addMember: (member: Omit<HouseholdMember, 'id' | 'joinedAt'>) => void;
  removeMember: (memberId: string) => void;
  updateMember: (memberId: string, updates: Partial<HouseholdMember>) => void;
  inviteMember: (email: string, message?: string) => Promise<void>;
  inviteForExpense: (email: string, expenseAmount: number, expenseDescription: string, tripId?: string, tripName?: string) => Promise<void>;
  isLoading: boolean;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [currentHousehold, setCurrentHousehold] = useState<{
    id: string;
    name: string;
    ownerId: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get storage key for household data
  const getHouseholdStorageKey = (key: string) => {
    return user ? `household_${user.id}_${key}` : `household_${key}`;
  };

  // Load household data
  useEffect(() => {
    const loadHouseholdData = () => {
      try {
        if (!user) {
          setMembers([]);
          setCurrentHousehold(null);
          setIsLoading(false);
          return;
        }

        // Create default household for the user
        const defaultHousehold = {
          id: user.id,
          name: `${user.name}'s Household`,
          ownerId: user.id
        };
        setCurrentHousehold(defaultHousehold);

        // Load members from storage
        const storedMembers = localStorage.getItem(getHouseholdStorageKey('members'));
        if (storedMembers) {
          setMembers(JSON.parse(storedMembers));
        } else {
          // Start with just the current user as owner
          const ownerMember: HouseholdMember = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
            role: 'owner',
            joinedAt: new Date().toISOString()
          };
          setMembers([ownerMember]);
          localStorage.setItem(getHouseholdStorageKey('members'), JSON.stringify([ownerMember]));
        }
      } catch (error) {
        console.error('Error loading household data:', error);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHouseholdData();
  }, [user]);

  // Save members to storage whenever they change
  useEffect(() => {
    if (user && members.length > 0) {
      try {
        localStorage.setItem(getHouseholdStorageKey('members'), JSON.stringify(members));
      } catch (error) {
        console.error('Error saving household members:', error);
      }
    }
  }, [members, user]);

  const addMember = (memberData: Omit<HouseholdMember, 'id' | 'joinedAt'>) => {
    const newMember: HouseholdMember = {
      ...memberData,
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      joinedAt: new Date().toISOString()
    };
    setMembers(prev => [...prev, newMember]);
  };

  const removeMember = (memberId: string) => {
    // Don't allow removing the owner
    if (memberId === user?.id) return;
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const updateMember = (memberId: string, updates: Partial<HouseholdMember>) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, ...updates } : m
    ));
  };

  const inviteMember = async (email: string, message?: string) => {
    if (!user || !currentHousehold) {
      throw new Error('User or household not found');
    }

    try {
      await inviteService.sendHouseholdInvite({
        email,
        message,
        householdId: currentHousehold.id,
        householdName: currentHousehold.name,
        fromUser: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Error sending household invite:', error);
      throw error;
    }
  };

  const inviteForExpense = async (
    email: string, 
    expenseAmount: number, 
    expenseDescription: string, 
    tripId?: string, 
    tripName?: string
  ) => {
    if (!user) {
      throw new Error('User not found');
    }

    try {
      await inviteService.sendExpenseSplitInvite({
        email,
        expenseAmount,
        expenseDescription,
        tripId,
        tripName,
        fromUser: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Error sending expense split invite:', error);
      throw error;
    }
  };

  return (
    <HouseholdContext.Provider value={{
      members,
      currentHousehold,
      addMember,
      removeMember,
      updateMember,
      inviteMember,
      inviteForExpense,
      isLoading
    }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
} 