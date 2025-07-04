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
  updateProfile,
  connectAuthEmulator,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Check if we're running in development mode
const isDevelopment = () => {
  // Check if we're in a dev environment (localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }
  return import.meta.env.DEV;
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Please create a .env file with the required Firebase configuration.');
  console.error('See env.example for the required variables.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Check if we're in development mode
const isDev = isDevelopment();

// Flags to control whether to use emulators (set to false for real Firebase services)
const USE_AUTH_EMULATOR = false; // Disabled to use real Firebase auth
const USE_FIRESTORE_EMULATOR = false; // Disabled to use real Firebase Firestore
const USE_STORAGE_EMULATOR = false; // Disabled to use real Firebase Storage

// Connect to emulators in development mode
if (isDev) {
  try {
    // Only connect auth emulator if flag is enabled
    if (USE_AUTH_EMULATOR) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
    
    // Only connect Firestore emulator if flag is enabled
    if (USE_FIRESTORE_EMULATOR) {
      connectFirestoreEmulator(db, 'localhost', 8081);
    }
    
    // Only connect Storage emulator if flag is enabled
    if (USE_STORAGE_EMULATOR) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
  } catch (error) {
    // Silent fail - emulators might not be running
    console.log('Emulator connection failed, using production services');
  }
}

// Initialize other services - but skip analytics in development
let analytics = null;
let messagingInstance = null;

if (typeof window !== 'undefined') {
  try {
    // Only initialize analytics in production
    if (!isDev && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
    
    // Initialize messaging if supported
    isSupported().then((supported) => {
      if (supported) {
        messagingInstance = getMessaging(app);
      }
    });
  } catch (error) {
    console.log('Analytics/Messaging initialization failed:', error);
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
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  getToken,
  onMessage
};
