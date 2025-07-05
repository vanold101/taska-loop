import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the template file (using the public file as template now)
const templatePath = path.join(__dirname, '../public/firebase-messaging-sw.js');
const outputPath = path.join(__dirname, '../public/firebase-messaging-sw.js');

try {
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Replace placeholders with actual environment variables
  template = template.replace('__VITE_FIREBASE_API_KEY__', process.env.VITE_FIREBASE_API_KEY || '');
  template = template.replace('__VITE_FIREBASE_AUTH_DOMAIN__', process.env.VITE_FIREBASE_AUTH_DOMAIN || '');
  template = template.replace('__VITE_FIREBASE_PROJECT_ID__', process.env.VITE_FIREBASE_PROJECT_ID || '');
  template = template.replace('__VITE_FIREBASE_STORAGE_BUCKET__', process.env.VITE_FIREBASE_STORAGE_BUCKET || '');
  template = template.replace('__VITE_FIREBASE_MESSAGING_SENDER_ID__', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '');
  template = template.replace('__VITE_FIREBASE_APP_ID__', process.env.VITE_FIREBASE_APP_ID || '');
  template = template.replace('__VITE_FIREBASE_MEASUREMENT_ID__', process.env.VITE_FIREBASE_MEASUREMENT_ID || '');
  
  // Write the generated service worker file
  fs.writeFileSync(outputPath, template);
  console.log('Firebase messaging service worker generated successfully.');
} catch (error) {
  console.error('Error generating service worker:', error);
  process.exit(1);
} 