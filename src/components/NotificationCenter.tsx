import { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  ShoppingCart, 
  CheckCircle, 
  AlertCircle, 
  Info,
  User 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionText?: string;
  actionUrl?: string;
  sender?: {
    name: string;
    avatar?: string;
  };
};

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onAction?: (notification: Notification) => void;
}

export const NotificationCenter = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onAction
}: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && event.target instanceof HTMLElement) {
        const notificationCenter = document.getElementById('notification-center');
        if (notificationCenter && !notificationCenter.contains(event.target)) {
          setIsOpen(false);
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="relative" id="notification-center">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white px-1">
            {unreadCount}
          </span>
        )}
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-auto bottom-20 right-4 w-80 glass-effect rounded-lg shadow-lg border dark:border-gloop-dark-surface z-50"
            style={{
              maxWidth: "calc(100vw - 30px)",
              maxHeight: "calc(100vh - 150px)"
            }}
          >
            <div className="p-4 border-b dark:border-gloop-dark-surface">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Notifications</h3>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 px-2"
                      onClick={onMarkAllAsRead}
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7 px-2"
                    onClick={onClearAll}
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="overflow-y-auto overflow-x-hidden" style={{ maxHeight: "calc(100vh - 220px)" }}>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gloop-text-muted">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 border-b last:border-b-0 dark:border-gloop-dark-surface cursor-pointer hover:bg-accent ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      {notification.sender ? (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-gloop-primary text-white">
                            {notification.sender.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          {getTypeIcon(notification.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                          <span className="text-xs text-gloop-text-muted whitespace-nowrap ml-2">
                            {new Date(notification.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gloop-text-muted line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {notification.actionText && notification.actionUrl && (
                          <Button
                            variant="link"
                            className="text-xs h-auto p-0 mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onAction) onAction(notification);
                            }}
                            aria-label={`${notification.actionText} for notification: ${notification.title}`}
                          >
                            {notification.actionText}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter; 