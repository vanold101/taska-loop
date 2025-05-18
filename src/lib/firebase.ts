// Firebase configuration for TaskaLoop
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  addDoc,
  serverTimestamp,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  connectAuthEmulator
} from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Define the window _env_ type for global runtime environment variables
declare global {
  interface Window {
    _env_?: Record<string, string>;
  }
}

// Check if we're running in development mode
const isDevelopment = () => {
  // Check if we're in a dev environment (localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }
  return process.env.NODE_ENV === 'development';
};

// Safe access to environment variables with fallbacks
const getEnvVar = (key: string): string => {
  // Check window._env_ first (commonly used for runtime env variables)
  if (typeof window !== 'undefined' && window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  
  // Then try process.env if it exists (server context or build-time env)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // Default fallback values for development/testing
  // This ensures the app doesn't break when env vars are missing
  const fallbackValues: Record<string, string> = {
    'NEXT_PUBLIC_FIREBASE_API_KEY': 'AIzaSyAHGQvFPkUxdRMiBdT6Q8srnqHBTjCl0sI',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'taska-loop.firebaseapp.com',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'taska-loop',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'taska-loop.appspot.com',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': '567819033549',
    'NEXT_PUBLIC_FIREBASE_APP_ID': '1:567819033549:web:62eba0211bb80639c8d456',
    'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': 'G-TT3JQPNPT0',
    'NODE_ENV': 'development'
  };
  
  return fallbackValues[key] || '';
};

// Define a dummy version of services for development
const createDummyService = (name: string) => {
  // Silent in production
  if (!isDevelopment()) return { dummy: true };
  return { dummy: true };
};

// Attempt to initialize messaging if supported
const initializeMessaging = async (app: any) => {
  if (isDevelopment()) {
    return createDummyService('messaging');
  }
  
  try {
    if (await isSupported()) {
      const messagingInstance = getMessaging(app);
      return messagingInstance;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID'),
  measurementId: getEnvVar('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'),
};

// Initialize Firebase
if (!firebaseConfig.apiKey) {
  console.error('Firebase API key is missing! Authentication will fail.');
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Check if we're in development mode
const isDev = isDevelopment();

// Connect to emulators in development mode
if (isDev) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    // Silent fail
  }
}

// Initialize other services - but skip analytics in development
let analytics = null;
let messagingInstance = null;

// Only initialize analytics and messaging in the browser and in production
if (typeof window !== 'undefined') {
  try {
    if (!isDev) {
      analytics = getAnalytics(app);
    } else {
      analytics = createDummyService('analytics');
    }
    
    // Initialize messaging
    messagingInstance = initializeMessaging(app);
  } catch (error) {
    // Create dummy services as fallback
    analytics = createDummyService('analytics');
    messagingInstance = createDummyService('messaging');
  }
}

export const messaging = messagingInstance;

// Export Firebase instances and functions
export { 
  app, 
  db, 
  auth,
  analytics,
  storage,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  serverTimestamp,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getToken,
  onMessage
};
