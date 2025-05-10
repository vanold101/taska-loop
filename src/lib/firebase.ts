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
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGSZ5xQCSNblC59O3obZY21vKjQqDOGfo",
  authDomain: "taska-9ee86.firebaseapp.com",
  projectId: "taska-9ee86",
  storageBucket: "taska-9ee86.firebasestorage.app",
  messagingSenderId: "792099374659",
  appId: "1:792099374659:web:1889e837f8da1a4bb376f6",
  measurementId: "G-9818PGVQ25"
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
let messaging = null;

// Only initialize analytics and messaging in the browser
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  messaging = getMessaging(app);
}

// Export Firebase instances and functions
export { 
  app, 
  db, 
  auth,
  analytics,
  messaging,
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
