import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app, db, auth, collection, addDoc, updateDoc, doc, getDoc, arrayUnion, arrayRemove } from '@/lib/firebase';

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

// Your VAPID key from environment variables
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

if (!VAPID_KEY) {
  console.warn('Firebase VAPID key is not set. Push notifications may not work properly.');
  console.warn('Please set VITE_FIREBASE_VAPID_KEY in your environment variables.');
}

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  click_action?: string;
  data?: Record<string, string>;
}

// Check if notifications are supported
export const isNotificationSupported = async (): Promise<boolean> => {
  try {
    return await isSupported();
  } catch (error) {
    console.error('Error checking notification support:', error);
    return false;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const supported = await isNotificationSupported();
    if (!supported) {
      console.log('Notifications are not supported');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });

      // Save the token to the user's document in Firestore
      if (token) {
        await saveUserFCMToken(token);
      }

      return token;
    }
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Save user's FCM token to Firestore
const saveUserFCMToken = async (token: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('No user is currently signed in');
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // Update existing user document
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
        lastTokenUpdate: new Date().toISOString()
      });
    } else {
      // Create new user document
      await addDoc(collection(db, 'users'), {
        userId: currentUser.uid,
        fcmTokens: [token],
        lastTokenUpdate: new Date().toISOString(),
        notificationPreferences: {
          tripUpdates: true,
          paymentRequests: true,
          newMembers: true,
          chores: true
        }
      });
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

// Remove FCM token when user logs out
export const removeUserFCMToken = async (token: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      fcmTokens: arrayRemove(token)
    });
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
};

// Handle incoming messages when app is in foreground
export const setupForegroundNotificationListener = (
  callback: (notification: PushNotification) => void
) => {
  onMessage(messaging, (payload) => {
    console.log('Received foreground message:', payload);
    
    const notification: PushNotification = {
      title: payload.notification?.title || 'New Notification',
      body: payload.notification?.body || '',
      icon: payload.notification?.icon,
      data: payload.data
    };

    // Call the provided callback with the notification
    callback(notification);

    // Show a native notification if the app is not focused
    if (Notification.permission === 'granted' && document.visibilityState !== 'visible') {
      new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon,
        tag: payload.data?.tag || 'default',
        requireInteraction: true
      });
    }
  });
};

// Send a notification to specific users
export const sendNotification = async (
  userIds: string[],
  notification: PushNotification
) => {
  try {
    // Add notification to Firestore
    await addDoc(collection(db, 'notifications'), {
      ...notification,
      userIds,
      sent: false,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Get user's notification preferences
export const getNotificationPreferences = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data().notificationPreferences || {
        tripUpdates: true,
        paymentRequests: true,
        newMembers: true,
        chores: true
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
};

// Update user's notification preferences
export const updateNotificationPreferences = async (
  userId: string,
  preferences: Record<string, boolean>
) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      notificationPreferences: preferences
    });
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}; 