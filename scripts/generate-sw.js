import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the template file
const templatePath = path.join(__dirname, '../src/firebase-messaging-sw-template.js');
const outputPath = path.join(__dirname, '../public/firebase-messaging-sw.js');

try {
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Replace placeholders with actual environment variables
  template = template.replace('VITE_FIREBASE_API_KEY', process.env.VITE_FIREBASE_API_KEY || '');
  template = template.replace('VITE_FIREBASE_AUTH_DOMAIN', process.env.VITE_FIREBASE_AUTH_DOMAIN || '');
  template = template.replace('VITE_FIREBASE_PROJECT_ID', process.env.VITE_FIREBASE_PROJECT_ID || '');
  template = template.replace('VITE_FIREBASE_STORAGE_BUCKET', process.env.VITE_FIREBASE_STORAGE_BUCKET || '');
  template = template.replace('VITE_FIREBASE_MESSAGING_SENDER_ID', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '');
  template = template.replace('VITE_FIREBASE_APP_ID', process.env.VITE_FIREBASE_APP_ID || '');
  template = template.replace('VITE_FIREBASE_MEASUREMENT_ID', process.env.VITE_FIREBASE_MEASUREMENT_ID || '');
  
  // Write the generated service worker file
  fs.writeFileSync(outputPath, template);
  console.log('Firebase messaging service worker generated successfully.');
} catch (error) {
  console.error('Error generating service worker:', error);
  process.exit(1);
} 