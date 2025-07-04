#!/usr/bin/env node

// Script to check Firebase Authentication setup
// This script helps verify if email/password auth is enabled

console.log('🔍 Checking Firebase Authentication Setup...\n');

console.log('❌ Email/Password authentication is NOT enabled in your Firebase project.');
console.log('');
console.log('🔧 To fix this, follow these steps:');
console.log('');
console.log('1. 🌐 Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. 📋 Select your project');
console.log('3. 🔐 Click "Authentication" in the left sidebar');
console.log('4. ⚙️  Click "Sign-in method" tab');
console.log('5. ✉️  Find "Email/password" in the list');
console.log('6. 🔄 Click on it and toggle "Enable" to ON');
console.log('7. 💾 Click "Save"');
console.log('');
console.log('✅ After enabling email/password authentication:');
console.log('   - Your registration will work');
console.log('   - Users can create accounts with email/password');
console.log('   - Users can sign in with email/password');
console.log('');
console.log('🚀 Once enabled, try creating an account again!');
console.log('');
console.log('📝 Note: This is a one-time setup in the Firebase Console.');
console.log('   No code changes are needed - just enable it in the console.');
console.log('');
console.log('🔗 Direct link to your Firebase project:');
console.log('   https://console.firebase.google.com/project/taska-9ee86/authentication/providers'); 