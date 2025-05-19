// Script to create an admin user for the TaskaLoop application
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { exit } from 'process';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default admin credentials if not provided
const DEFAULT_ADMIN_EMAIL = 'admin@taskaloop.com';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_ADMIN_NAME = 'Admin User';

// Parse command line arguments
const args = process.argv.slice(2);
const email = args[0] || DEFAULT_ADMIN_EMAIL;
const password = args[1] || DEFAULT_ADMIN_PASSWORD;
const name = args[2] || DEFAULT_ADMIN_NAME;

// Get Firebase configuration
const getFirebaseConfig = () => {
  try {
    // First check for .env file
    const envConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    // Check if required fields are present
    if (envConfig.apiKey && envConfig.authDomain && envConfig.projectId) {
      return envConfig;
    }

    // Fall back to default values
    return {
      apiKey: 'AIzaSyAHGQvFPkUxdRMiBdT6Q8srnqHBTjCl0sI',
      authDomain: 'taska-loop.firebaseapp.com',
      projectId: 'taska-loop',
      storageBucket: 'taska-loop.appspot.com',
      messagingSenderId: '567819033549',
      appId: '1:567819033549:web:62eba0211bb80639c8d456',
      measurementId: 'G-TT3JQPNPT0'
    };
  } catch (error) {
    console.error('Error reading Firebase configuration:', error);
    exit(1);
  }
};

// Main function to create admin user
const createAdminUser = async () => {
  console.log(`Creating admin user with email: ${email}`);
  
  // Initialize Firebase
  const firebaseConfig = getFirebaseConfig();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  // Check if running in development mode (localhost)
  const isDevelopment = true; // Always use emulators when running this script
  
  // Connect to emulators
  if (isDevelopment) {
    console.log('Connecting to local Firebase emulators...');
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  
  try {
    // Check if admin collection exists
    const adminCollectionRef = collection(db, 'admins');
    
    // Check if an admin already exists with this email
    const adminQuery = query(adminCollectionRef, where('email', '==', email));
    const existingAdmins = await getDocs(adminQuery);
    
    if (!existingAdmins.empty) {
      console.error('An admin with this email already exists');
      exit(1);
    }
    
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    // Create admin profile in Firestore
    const adminData = {
      id: uid,
      name: name,
      email: email,
      isAdmin: true,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };
    
    // Save to admins collection
    await setDoc(doc(db, 'admins', uid), adminData);
    
    // Also create a regular user entry with admin role
    await setDoc(doc(db, 'users', uid), {
      id: uid,
      name: name,
      email: email,
      avatar: adminData.avatar,
      role: 'admin'
    });
    
    console.log(`Successfully created admin user with UID: ${uid}`);
    console.log('Admin credentials:');
    console.log(`- Email: ${email}`);
    console.log(`- Password: ${password}`);
    console.log(`- Name: ${name}`);
    
    exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    exit(1);
  }
};

// Run the script
createAdminUser(); 