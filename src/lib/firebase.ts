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
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  connectAuthEmulator,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  Auth
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics, Analytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage, isSupported, Messaging } from "firebase/messaging";
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

// Check if we're running in development mode
const isDevelopment = () => {
  // For React Native, we'll assume development mode
  return true;
};

// Your web app's Firebase configuration - using provided credentials
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCTgbkVXeVWF34YPMzy5MnhpmKp-lyK6Gc",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "taska-mobile-3c860.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "taska-mobile-3c860",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "taska-mobile-3c860.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "552365348974",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:552365348974:web:d58fe942284eeaeff26e7f",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RRP375FX6B"
};

// Initialize Firebase with the provided config
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let messagingInstance: Messaging | null = null;

try {
      // Initialize Firebase
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
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
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    if (isDevelopment()) {
      console.error('Please check your Firebase configuration in .env file');
    }
  }

export const messaging = messagingInstance;

// Export Firebase instances and functions
export { 
  app, 
  db, 
  auth,
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
  getToken,
  onMessage
};
