// Firebase configuration for TaskaLoop
import { initializeApp, FirebaseApp } from 'firebase/app';
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
  connectFirestoreEmulator,
  Firestore
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
  signInWithPopup,
  Auth
} from 'firebase/auth';
import { getAnalytics, Analytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage, isSupported, Messaging } from "firebase/messaging";
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

// Check if we're running in development mode
const isDevelopment = () => {
  // Check if we're in a dev environment (localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }
  return import.meta.env.DEV;
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

// Check if we have all required environment variables
const hasValidFirebaseConfig = missingEnvVars.length === 0;

// Only show error messages in development or if explicitly needed
if (!hasValidFirebaseConfig && isDevelopment()) {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Please create a .env file with the required Firebase configuration.');
  console.error('See env.example for the required variables.');
}

// Your web app's Firebase configuration - only if we have valid env vars
const firebaseConfig = hasValidFirebaseConfig ? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
} : null;

// Initialize Firebase only if we have valid config
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let messagingInstance: Messaging | null = null;

if (hasValidFirebaseConfig && firebaseConfig) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

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
        if (USE_AUTH_EMULATOR && auth) {
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        }
        
        // Only connect Firestore emulator if flag is enabled
        if (USE_FIRESTORE_EMULATOR && db) {
          connectFirestoreEmulator(db, 'localhost', 8081);
        }
        
        // Only connect Storage emulator if flag is enabled
        if (USE_STORAGE_EMULATOR && storage) {
          connectStorageEmulator(storage, 'localhost', 9199);
        }
      } catch (error) {
        // Silent fail - emulators might not be running
        console.log('Emulator connection failed, using production services');
      }
    }

    // Initialize other services - but skip analytics in development
    if (typeof window !== 'undefined') {
      try {
        // Only initialize analytics in production
        if (!isDev && firebaseConfig.measurementId && app) {
          analytics = getAnalytics(app);
        }
        
        // Initialize messaging if supported
        isSupported().then((supported) => {
          if (supported && app) {
            messagingInstance = getMessaging(app);
          }
        });
      } catch (error) {
        console.log('Analytics/Messaging initialization failed:', error);
      }
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    if (isDevelopment()) {
      console.error('Please check your Firebase configuration in .env file');
    }
  }
} else {
  // In production without valid config, show a user-friendly message
  if (!isDevelopment() && typeof window !== 'undefined') {
    console.warn('TaskaLoop: Firebase configuration is being loaded. Please refresh if you continue to see authentication issues.');
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
