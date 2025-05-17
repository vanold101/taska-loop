import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '@/components/NotificationCenter';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    // Sample notification for testing
    {
      id: '1',
      type: 'info',
      title: 'Welcome to Taska-Loop',
      message: 'Your household management companion. Start by creating a shopping trip!',
      timestamp: new Date(),
      read: false,
      actionText: 'New Trip',
      actionUrl: '/trips'
    }
  ]);

  // Load notifications from local storage
  useEffect(() => {
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications);
        // Convert string timestamps back to Date objects
        const processedNotifications = parsedNotifications.map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp)
        }));
        setNotifications(processedNotifications);
      } catch (error) {
        console.error('Failed to parse stored notifications:', error);
      }
    }
  }, []);

  // Save notifications to local storage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        removeNotification, 
        markAsRead, 
        markAllAsRead, 
        clearAll 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 