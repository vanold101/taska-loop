// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here.
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAGSZ5xQCSNblC59O3obZY21vKjQqDOGfo",
  authDomain: "taska-9ee86.firebaseapp.com",
  projectId: "taska-9ee86",
  storageBucket: "taska-9ee86.firebasestorage.app",
  messagingSenderId: "792099374659",
  appId: "1:792099374659:web:1889e837f8da1a4bb376f6",
  measurementId: "G-9818PGVQ25"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png', // Add your app icon path here
    badge: '/icon-192x192.png',
    data: payload.data,
    tag: payload.data?.tag || 'default',
    requireInteraction: true
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 