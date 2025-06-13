// Script to create admin accounts in Firebase Authentication
// Run this after enabling Firebase Authentication in the console

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAGSZ5xQCSNblC59O3obZY21vKjQqDOGfo',
  authDomain: 'taska-9ee86.firebaseapp.com',
  projectId: 'taska-9ee86',
  storageBucket: 'taska-9ee86.firebasestorage.app',
  messagingSenderId: '792099374659',
  appId: '1:792099374659:web:1889e837f8da1a4bb376f6',
  measurementId: 'G-9818PGVQ25'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Admin accounts to create
const adminAccounts = [
  {
    email: 'admin@taskaloop.com',
    password: 'TaskaAdmin123!',
    name: 'TaskaLoop Admin',
    role: 'admin'
  },
  {
    email: 'demo@taskaloop.com',
    password: 'TaskaDemo123!',
    name: 'Demo Admin',
    role: 'admin'
  },
  {
    email: 'test.admin@gmail.com',
    password: 'TestAdmin123!',
    name: 'Test Admin',
    role: 'admin'
  }
];

// Create admin accounts
const createAdminAccounts = async () => {
  console.log('🔧 Creating admin accounts in Firebase...\n');
  
  for (const admin of adminAccounts) {
    try {
      console.log(`Creating admin: ${admin.email}`);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, admin.email, admin.password);
      const uid = userCredential.user.uid;
      
      // Create user profile in Firestore
      const userProfile = {
        id: uid,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isAdmin: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=random`,
        createdAt: new Date().toISOString()
      };
      
      // Save to users collection
      await setDoc(doc(db, 'users', uid), userProfile);
      
      // Save to admins collection
      await setDoc(doc(db, 'admins', uid), userProfile);
      
      console.log(`✅ Successfully created: ${admin.email}`);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  Admin already exists: ${admin.email}`);
      } else {
        console.error(`❌ Error creating ${admin.email}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Admin setup complete!');
  console.log('\n📋 Admin Credentials:');
  console.log('==========================================');
  adminAccounts.forEach(admin => {
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${admin.password}`);
    console.log(`Name: ${admin.name}`);
    console.log('------------------------------------------');
  });
  
  console.log('\n💡 Instructions:');
  console.log('1. Use these credentials to login as admin');
  console.log('2. Admins will see sample data (trips, tasks, pantry items)');
  console.log('3. Regular users will start with blank data');
  console.log('4. Your email (devanshagarwal@gmail.com) is also configured as admin');
  
  process.exit(0);
};

// Run the script
createAdminAccounts().catch((error) => {
  console.error('❌ Script failed:', error.message);
  
  if (error.code === 'auth/configuration-not-found') {
    console.log('\n🚨 Firebase Authentication is not enabled!');
    console.log('Please enable it first:');
    console.log('1. Go to: https://console.firebase.google.com/project/taska-9ee86/authentication');
    console.log('2. Click "Get started"');
    console.log('3. Enable Google sign-in provider');
    console.log('4. Then run this script again');
  }
  
  process.exit(1);
}); 