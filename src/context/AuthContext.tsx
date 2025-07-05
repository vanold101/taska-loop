import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';

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
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>; // Added registration
  logout: () => Promise<void>;
  updateChorePreferences: (preferences: ChorePreference[]) => Promise<void>;
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

  // Listen for Firebase auth state changes
  useEffect(() => {
    setIsLoading(true);
    
    // Check if Firebase auth is available
    if (!auth) {
      console.warn('Firebase auth is not initialized. Please check your Firebase configuration.');
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userObj));
      } else {
        setUser(null);
        localStorage.removeItem(AUTH_USER_KEY);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real Google sign-in
  const loginWithGoogle = async () => {
    if (!auth) {
      setError('Authentication is not available. Please check your internet connection and try again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      console.log('Attempting Google sign-in...');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google sign-in.');
      } else if (error.code === 'auth/configuration-not-found') {
        setError('Firebase Authentication is not configured. Please enable it in Firebase Console: https://console.firebase.google.com/project/taska-9ee86/authentication');
      } else {
        setError(`Failed to login: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      if (error.code === 'auth/user-not-found') {
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

  // Real logout
  const logout = async () => {
    if (!auth) {
      // If auth is not available, just clear local state
      setUser(null);
      localStorage.removeItem(AUTH_USER_KEY);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
      setError('Failed to logout. Please try again.');
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