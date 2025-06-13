#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables with your actual values
const ENV_VARS = {
  // Firebase Configuration
  VITE_FIREBASE_API_KEY: 'AIzaSyAGSZ5xQCSNblC59O3obZY21vKjQqDOGfo',
  VITE_FIREBASE_AUTH_DOMAIN: 'taska-9ee86.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'taska-9ee86',
  VITE_FIREBASE_STORAGE_BUCKET: 'taska-9ee86.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '792099374659',
  VITE_FIREBASE_APP_ID: '1:792099374659:web:1889e837f8da1a4bb376f6',
  VITE_FIREBASE_MEASUREMENT_ID: 'G-9818PGVQ25',
  
  // Google OAuth Configuration
  VITE_GOOGLE_CLIENT_ID: '792099374659-4eiddlkvqda6hsmccbqcrqa7qhal9s46.apps.googleusercontent.com',
  
  // Google Maps API Key
  VITE_GOOGLE_MAPS_API_KEY: 'AIzaSyCC9n6z-koJp5qiyOOPRRag3qudrcfOeK8',
  
  // Environment
  NODE_ENV: 'development',
  
  // Firebase Messaging VAPID Key
  VITE_FIREBASE_VAPID_KEY: 'BHgGDXZJXOXFG_oYPIXiG3Y_NRQfEHvqhB0xG-GhQrFR9U6mRZ3OqPsvYyYHqeBGki0JgRqNEQTZQ3jHXq5xFrM'
};

const envPath = path.join(__dirname, '../.env');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('If you want to recreate it, please delete the existing .env file first.');
  process.exit(1);
}

// Create .env file content
const envContent = Object.entries(ENV_VARS)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Add comments for better organization
const envWithComments = `# Firebase Configuration
VITE_FIREBASE_API_KEY=${ENV_VARS.VITE_FIREBASE_API_KEY}
VITE_FIREBASE_AUTH_DOMAIN=${ENV_VARS.VITE_FIREBASE_AUTH_DOMAIN}
VITE_FIREBASE_PROJECT_ID=${ENV_VARS.VITE_FIREBASE_PROJECT_ID}
VITE_FIREBASE_STORAGE_BUCKET=${ENV_VARS.VITE_FIREBASE_STORAGE_BUCKET}
VITE_FIREBASE_MESSAGING_SENDER_ID=${ENV_VARS.VITE_FIREBASE_MESSAGING_SENDER_ID}
VITE_FIREBASE_APP_ID=${ENV_VARS.VITE_FIREBASE_APP_ID}
VITE_FIREBASE_MEASUREMENT_ID=${ENV_VARS.VITE_FIREBASE_MEASUREMENT_ID}

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=${ENV_VARS.VITE_GOOGLE_CLIENT_ID}

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=${ENV_VARS.VITE_GOOGLE_MAPS_API_KEY}

# Environment
NODE_ENV=${ENV_VARS.NODE_ENV}

# Firebase Messaging VAPID Key
VITE_FIREBASE_VAPID_KEY=${ENV_VARS.VITE_FIREBASE_VAPID_KEY}
`;

try {
  fs.writeFileSync(envPath, envWithComments);
  console.log('✅ .env file created successfully!');
  console.log('🔒 All API keys are now properly configured and will be hidden from GitHub.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: npm run generate-sw');
  console.log('2. Run: npm run dev');
  console.log('');
  console.log('🚨 IMPORTANT: Never commit the .env file to version control!');
} catch (error) {
  console.error('❌ Error creating .env file:', error);
  process.exit(1);
} 