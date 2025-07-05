import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Plugin to generate service worker during build
const serviceWorkerPlugin = () => {
  return {
    name: 'generate-service-worker',
    buildStart() {
      // Generate service worker with environment variables
      const swPath = path.join(__dirname, 'public/firebase-messaging-sw.js');
      if (fs.existsSync(swPath)) {
        let template = fs.readFileSync(swPath, 'utf8');
        
        // Replace placeholders with actual environment variables
        template = template.replace('__VITE_FIREBASE_API_KEY__', process.env.VITE_FIREBASE_API_KEY || '');
        template = template.replace('__VITE_FIREBASE_AUTH_DOMAIN__', process.env.VITE_FIREBASE_AUTH_DOMAIN || '');
        template = template.replace('__VITE_FIREBASE_PROJECT_ID__', process.env.VITE_FIREBASE_PROJECT_ID || '');
        template = template.replace('__VITE_FIREBASE_STORAGE_BUCKET__', process.env.VITE_FIREBASE_STORAGE_BUCKET || '');
        template = template.replace('__VITE_FIREBASE_MESSAGING_SENDER_ID__', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '');
        template = template.replace('__VITE_FIREBASE_APP_ID__', process.env.VITE_FIREBASE_APP_ID || '');
        template = template.replace('__VITE_FIREBASE_MEASUREMENT_ID__', process.env.VITE_FIREBASE_MEASUREMENT_ID || '');
        
        // Write the generated service worker file
        fs.writeFileSync(swPath, template);
        console.log('Service worker generated with environment variables');
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorkerPlugin()],
  base: process.env.NODE_ENV === 'production' ? '/taska-loop/' : './',
  server: {
    port: 8080,
    host: true,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
}); 