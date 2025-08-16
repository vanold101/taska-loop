import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

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
  isAdmin?: boolean; // Added admin flag
}

// Define the AuthContext state
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateChorePreferences: (preferences: ChorePreference[]) => Promise<void>;
  createGuestUser: () => Promise<void>;
  isAdmin: boolean;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

// Local storage key for auth user
const AUTH_USER_KEY = 'authUser';

// Admin email addresses (you can add more)
const ADMIN_EMAILS = [
  'devansh.home@gmail.com', // Your main email
  'admin@taskaloop.com', // Test admin account
  'demo@taskaloop.com', // Demo admin account
  'test.admin@gmail.com', // Test admin account
  // Add more admin emails as needed
];

// Check if user is admin
const checkIsAdmin = (email?: string): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Create guest user to bypass authentication
  const createGuestUser = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a temporary guest user
      const guestUser: User = {
        id: 'guest-' + Date.now(),
        name: 'Guest User',
        email: 'guest@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Guest+User&background=random',
        chorePreferences: [],
        isAdmin: false,
      };

      // Set user in context and store locally
      setUser(guestUser);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(guestUser));
      console.log('Guest user created successfully:', guestUser);

    } catch (error: any) {
      console.error('Error creating guest user:', error);
      setError(`Failed to create guest user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple Google Sign-In using Firebase web auth
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!auth) {
        throw new Error('Firebase auth is not initialized');
      }

      // Use Firebase's Google provider
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      // Sign in with popup (works in Expo web and some mobile scenarios)
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user);

      // Create user account
      const googleUser: User = {
        id: result.user.uid,
        name: result.user.displayName || 'Google User',
        email: result.user.email || 'google.user@gmail.com',
        avatar: result.user.photoURL || 'https://ui-avatars.com/api/?name=Google+User&background=random',
        chorePreferences: [],
        isAdmin: checkIsAdmin(result.user.email || undefined),
      };

      setUser(googleUser);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(googleUser));
      console.log('Google OAuth sign-in successful:', googleUser);

    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled');
      } else if (error.code === 'auth/popupInnerHTML-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups and try again.');
      } else {
        setError(`Google sign-in failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    setIsLoading(true);
    
    // First, try to load user from AsyncStorage
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          // Only load real users, not mock users
          if (userObj.email && userObj.email !== 'google.user@example.com') {
            setUser(userObj);
            console.log('Loaded real user from storage:', userObj);
          } else {
            // Clear mock users from storage
            await AsyncStorage.removeItem(AUTH_USER_KEY);
            console.log('Cleared mock user from storage');
          }
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    };
    
    loadUserFromStorage();
    
    // Check if Firebase auth is available
    if (!auth) {
      console.warn('Firebase auth is not initialized. Please check your Firebase configuration.');
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set user info from Firebase
        const { uid, displayName, email, photoURL } = firebaseUser;
        const userObj: User = {
          id: uid,
          name: displayName || email || 'User',
          email: email || undefined,
          avatar: photoURL || `https://ui-avatars.com/api/?name=${displayName || email || 'User'}&background=random`,
          chorePreferences: [],
          isAdmin: checkIsAdmin(email || undefined),
        };
        setUser(userObj);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
      } else {
        setUser(null);
        await AsyncStorage.removeItem(AUTH_USER_KEY);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Email/password login for emulator testing
  const loginWithEmail = async (email: string, password: string) => {
    if (!auth) {
      setError('Authentication is not available. Please check your internet connection and try again.');
      throw new Error('Firebase auth not initialized');
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting email sign-in...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Email sign-in successful:', result.user);
    } catch (error: any) {
      console.error('Email login error:', error);
      if (error.code === 'auth/operation-not-allowed') {
        setError('Email/password authentication is not enabled. Please enable it in Firebase Console.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(`Login failed: ${error.message}`);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Sign out from Google Sign-In
      // The signInWithPopup does not have a direct signOut method like signOut()
      // For a simple logout, we can just set the user to null and remove from storage
      setUser(null);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      console.log('User logged out successfully from Google');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Google sign-out fails, clear local state
      setUser(null);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
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
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error("Error updating preferences:", error);
      setError("Failed to update preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Register with email
  const registerWithEmail = async (email: string, password: string, name: string) => {
    if (!auth) {
      setError('Authentication is not available. Please check your internet connection and try again.');
      throw new Error('Firebase auth not initialized');
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting email registration...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Email registration successful:', result.user);
      await updateProfile(result.user, { displayName: name });
    } catch (error: any) {
      console.error('Email registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak.');
      } else {
        setError(`Registration failed: ${error.message}`);
      }
      throw error;
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
    loginWithEmail,
    registerWithEmail,
    logout,
    updateChorePreferences,
    createGuestUser,
    isAdmin: checkIsAdmin(user?.email),
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