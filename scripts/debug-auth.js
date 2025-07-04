#!/usr/bin/env node

// Comprehensive Firebase Authentication Debug Script
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Firebase Authentication Debug Tool\n');

// Check environment variables
console.log('📋 Checking Environment Variables:');
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

let envVarsValid = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    envVarsValid = false;
  }
});

if (!envVarsValid) {
  console.log('\n❌ Missing environment variables. Please check your .env file.');
  console.log('Expected format:');
  requiredEnvVars.forEach(varName => {
    console.log(`${varName}=your_value_here`);
  });
  process.exit(1);
}

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log('\n🔥 Firebase Configuration:');
console.log(`Project ID: ${firebaseConfig.projectId}`);
console.log(`Auth Domain: ${firebaseConfig.authDomain}`);
console.log(`API Key: ${firebaseConfig.apiKey.substring(0, 20)}...`);

try {
  // Initialize Firebase
  console.log('\n🚀 Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  console.log('✅ Firebase initialized successfully');

  // Test email/password registration
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  console.log('\n🧪 Testing Email/Password Registration...');
  console.log(`Email: ${testEmail}`);
  console.log(`Password: ${testPassword}`);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Registration successful!');
    console.log(`User ID: ${userCredential.user.uid}`);
    console.log(`Email: ${userCredential.user.email}`);

    // Test sign-in with the same credentials
    console.log('\n🧪 Testing Email/Password Sign-in...');
    const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Sign-in successful!');
    console.log(`User ID: ${signInCredential.user.uid}`);

    // Clean up - delete the test user
    try {
      await userCredential.user.delete();
      console.log('✅ Test user cleaned up');
    } catch (deleteError) {
      console.log('⚠️ Could not delete test user (this is normal)');
    }

  } catch (authError) {
    console.log('\n❌ Authentication Error:');
    console.log(`Code: ${authError.code}`);
    console.log(`Message: ${authError.message}`);

    switch (authError.code) {
      case 'auth/operation-not-allowed':
        console.log('\n🔧 Fix: Email/password authentication is not enabled.');
        console.log('Go to Firebase Console → Authentication → Sign-in method → Enable Email/password');
        break;
      case 'auth/weak-password':
        console.log('\n🔧 Fix: Password is too weak (minimum 6 characters)');
        break;
      case 'auth/email-already-in-use':
        console.log('\n🔧 Fix: Email is already registered');
        break;
      case 'auth/invalid-email':
        console.log('\n🔧 Fix: Invalid email format');
        break;
      case 'auth/network-request-failed':
        console.log('\n🔧 Fix: Network error - check your internet connection');
        break;
      case 'auth/api-key-not-valid':
        console.log('\n🔧 Fix: Invalid API key in Firebase configuration');
        break;
      case 'auth/app-deleted':
        console.log('\n🔧 Fix: Firebase app has been deleted');
        break;
      case 'auth/project-not-found':
        console.log('\n🔧 Fix: Firebase project not found - check project ID');
        break;
      default:
        console.log('\n🔧 Fix: Unknown error - check Firebase Console for more details');
    }
  }

} catch (initError) {
  console.log('\n❌ Firebase Initialization Error:');
  console.log(initError.message);
  console.log('\n🔧 Possible fixes:');
  console.log('1. Check your Firebase configuration');
  console.log('2. Verify your API key is correct');
  console.log('3. Ensure your project ID is correct');
  console.log('4. Check if your Firebase project exists');
}

console.log('\n🏁 Debug complete.');
console.log('\n💡 If you\'re still having issues:');
console.log('1. Check Firebase Console → Authentication → Users');
console.log('2. Look at Firebase Console → Authentication → Settings');
console.log('3. Verify your domain is authorized in Firebase Console');
console.log('4. Check browser network tab for detailed error messages'); 