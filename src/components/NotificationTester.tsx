"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  requestNotificationPermission,
  sendNotification,
  setupForegroundNotificationListener,
  isNotificationSupported,
  PushNotification
} from '@/services/NotificationService';
import { auth } from '@/lib/firebase';

export const NotificationTester = () => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    isNotificationSupported().then(setIsSupported);

    // Get current permission status
    setPermissionStatus(Notification.permission);

    // Set up foreground notification listener
    setupForegroundNotificationListener((notification: PushNotification) => {
      toast(notification.title, {
        description: notification.body,
      });
    });
  }, []);

  const requestPermission = async () => {
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setFcmToken(token);
        setPermissionStatus('granted');
        toast.success('Notification permission granted!');
      } else {
        toast.error('Failed to get notification token');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Error requesting permission');
    }
  };

  const sendTestNotification = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in first');
      return;
    }

    try {
      await sendNotification([auth.currentUser.uid], {
        title: 'Test Notification',
        body: 'This is a test notification from TaskaLoop!',
        data: {
          type: 'test',
          timestamp: new Date().toISOString()
        }
      });
      toast.success('Test notification sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };

  const sendDelayedNotification = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in first');
      return;
    }

    try {
      // Send a notification that will arrive in 5 seconds
      setTimeout(async () => {
        await sendNotification([auth.currentUser!.uid], {
          title: 'Delayed Notification',
          body: 'This notification was delayed by 5 seconds!',
          data: {
            type: 'delayed',
            timestamp: new Date().toISOString()
          }
        });
      }, 5000);
      
      toast.success('Delayed notification scheduled!');
    } catch (error) {
      console.error('Error scheduling delayed notification:', error);
      toast.error('Failed to schedule delayed notification');
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Notification Tester</h2>
        <p className="text-red-500">Push notifications are not supported in this browser.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Notification Tester</h2>
      
      <div className="space-y-4">
        <div>
          <p className="mb-2">Current Permission Status: <span className="font-medium">{permissionStatus}</span></p>
          {fcmToken && (
            <p className="text-sm text-gray-500 break-all">
              FCM Token: {fcmToken}
            </p>
          )}
        </div>

        <div className="space-x-4">
          {permissionStatus !== 'granted' && (
            <Button onClick={requestPermission}>
              Request Permission
            </Button>
          )}
          
          {permissionStatus === 'granted' && (
            <>
              <Button onClick={sendTestNotification}>
                Send Test Notification
              </Button>
              
              <Button onClick={sendDelayedNotification}>
                Send Delayed Notification
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}; 