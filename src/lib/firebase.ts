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
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// Initialize other services
let analytics = null;
let messagingInstance: any = null;

// Only initialize analytics and messaging in the browser
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  initializeMessaging();
}

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);

// Attempt to initialize messaging if supported
const initializeMessaging = async () => {
  try {
    if (await isSupported()) {
      messagingInstance = getMessaging(app);
      return messagingInstance;
    }
    return null;
  } catch (error) {
    console.error('Error initializing messaging:', error);
    return null;
  }
};

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
