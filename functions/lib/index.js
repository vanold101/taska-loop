"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldNotifications = exports.sendNotification = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Initialize Firebase Admin
admin.initializeApp();
// Handle sending notifications when a new notification document is created
exports.sendNotification = functions.firestore
    .document('notifications/{notificationId}')
    .onCreate(async (snap, context) => {
    const notification = snap.data();
    const notificationId = context.params.notificationId;
    try {
        // Skip if already sent
        if (notification.sent)
            return null;
        // Get user tokens
        const userTokens = [];
        for (const userId of notification.userIds) {
            const userDoc = await admin.firestore()
                .collection('users')
                .doc(userId)
                .get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData === null || userData === void 0 ? void 0 : userData.fcmTokens) {
                    // Handle both single token and array of tokens
                    const tokens = Array.isArray(userData.fcmTokens)
                        ? userData.fcmTokens
                        : [userData.fcmTokens];
                    userTokens.push(...tokens);
                }
            }
        }
        if (userTokens.length === 0) {
            console.log('No valid tokens found for users:', notification.userIds);
            return null;
        }
        // Prepare notification message
        const message = {
            tokens: userTokens,
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: notification.data || {},
            webpush: {
                notification: {
                    icon: notification.icon || '/icon-192x192.png',
                    click_action: notification.click_action || '/',
                    requireInteraction: true
                },
                fcmOptions: {
                    link: notification.click_action || '/'
                }
            }
        };
        // Send the notification
        const response = await admin.messaging().sendMulticast(message);
        console.log('Successfully sent notifications:', response.successCount);
        // Handle failed tokens
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(userTokens[idx]);
                    console.error('Failed to send notification:', resp.error);
                }
            });
            // Remove failed tokens from users
            for (const userId of notification.userIds) {
                await admin.firestore()
                    .collection('users')
                    .doc(userId)
                    .update({
                    fcmTokens: admin.firestore.FieldValue.arrayRemove(...failedTokens)
                });
            }
        }
        // Mark notification as sent
        await admin.firestore()
            .collection('notifications')
            .doc(notificationId)
            .update({
            sent: true,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            successCount: response.successCount,
            failureCount: response.failureCount
        });
        return null;
    }
    catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
});
// Clean up old notifications
exports.cleanupOldNotifications = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const snapshot = await admin.firestore()
        .collection('notifications')
        .where('createdAt', '<', thirtyDaysAgo.toISOString())
        .get();
    const batch = admin.firestore().batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Deleted ${snapshot.size} old notifications`);
    return null;
});
//# sourceMappingURL=index.js.map