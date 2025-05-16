import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User type
export interface ChorePreference {
  choreId: string; // Using chore ID (which is title for now, ideally a stable ID)
  preference: 'liked' | 'disliked' | 'neutral';
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  chorePreferences?: ChorePreference[]; // Added chore preferences
}

// Define the AuthContext state
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateChorePreferences: (preferences: ChorePreference[]) => Promise<void>; // Added function signature
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

// Local storage key for auth user
const AUTH_USER_KEY = 'authUser';

// Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true to check initial auth status
  const [error, setError] = useState<string | null>(null);

  // Check for saved auth on initial load
  useEffect(() => {
    try {
      setIsLoading(true);
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser({
          ...parsedUser, 
          chorePreferences: parsedUser.chorePreferences || [] 
        });
      }
    } catch (e) {
      console.error("Error loading auth state:", e);
      localStorage.removeItem(AUTH_USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Simulated Google sign-in
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user (in a real app, this would be the Google auth response)
      const mockUser: User = {
        id: 'google_' + Math.random().toString(36).substring(2, 9),
        name: 'Demo User',
        email: 'demo@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
        chorePreferences: [],
      };
      
      // Store the user in state and localStorage
      setUser(mockUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(mockUser));
      
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to login with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear auth state
      localStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
      
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to logout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update user's chore preferences
  const updateChorePreferences = async (preferences: ChorePreference[]) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Update the user with new preferences
      const updatedUser = { 
        ...user, 
        chorePreferences: preferences 
      };
      
      // Update state and localStorage
      setUser(updatedUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error("Error updating preferences:", error);
      setError("Failed to update preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    updateChorePreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 