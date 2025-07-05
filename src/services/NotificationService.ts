import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { app, db, auth, collection, addDoc, updateDoc, doc, getDoc, arrayUnion, arrayRemove } from '@/lib/firebase';

// Initialize Firebase Cloud Messaging - only if app is available
let messaging: any = null;
if (app) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging initialization failed:', error);
  }
}

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

// Check if notifications are supported in this environment
export const isNotificationSupported = async (): Promise<boolean> => {
  try {
    if (!messaging) return false;
    return await isSupported();
  } catch (error) {
    console.log('Notification support check failed:', error);
    return false;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging || !auth) {
      console.warn('Firebase services not available for notifications');
      return null;
    }

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
    if (!auth || !db) {
      console.warn('Firebase services not available for saving FCM token');
      return;
    }

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
    if (!auth || !db) {
      console.warn('Firebase services not available for removing FCM token');
      return;
    }

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

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.warn('Firebase Messaging not available');
    return () => {}; // Return empty unsubscribe function
  }

  try {
    return onMessage(messaging, callback);
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Send a notification to specific users
export const sendNotification = async (
  userIds: string[],
  notification: PushNotification
) => {
  try {
    if (!db) {
      console.warn('Firebase Firestore not available for sending notifications');
      return;
    }

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
    if (!db) {
      console.warn('Firebase Firestore not available for getting notification preferences');
      return null;
    }

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
    if (!db) {
      console.warn('Firebase Firestore not available for updating notification preferences');
      return false;
    }

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