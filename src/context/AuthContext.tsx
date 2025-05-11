import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User type
export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

// Define the AuthContext state
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true to check initial auth status
  const [error, setError] = useState<string | null>(null);

  // Simulate checking initial auth status (e.g., from localStorage)
  useEffect(() => {
    setIsLoading(true);
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('authUser');
        console.error("Failed to parse stored user:", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Mock loginWithGoogle function
  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    // Simulate API call to Google
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUser: User = {
      id: '12345',
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: undefined, // You can add a mock avatar URL if you have one
    };
    setUser(mockUser);
    localStorage.setItem('authUser', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  // Mock logout function
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('authUser');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, loginWithGoogle, logout }}>
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