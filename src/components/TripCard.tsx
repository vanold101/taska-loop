import { motion } from "framer-motion";
import { ShoppingCart, Clock, User, Plus, Check, Share2, Trash2, Edit, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";

type TripCardProps = {
  trip: {
    id: string;
    store: string;
    shopper: {
      name: string;
      avatar: string;
    };
    eta: string;
    itemCount: number;
    status: 'open' | 'shopping' | 'completed' | 'cancelled';
  };
  onAddItem?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onComplete?: () => void;
  onEdit?: () => void;
  onReactivate?: () => void;
};

const TripCard = ({ 
  trip,
  onAddItem,
  onClick,
  onDelete,
  onShare,
  onComplete,
  onEdit,
  onReactivate
}: TripCardProps) => {
  const { store, shopper, eta, itemCount, status } = trip;
  const [isActionsVisible, setActionsVisible] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const startXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const swipeThreshold = 80; // Pixels required to trigger action
  
  const getStatusColor = () => {
    switch(status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'shopping':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Don't allow swiping on completed trips
    if (status === 'completed' || status === 'cancelled') {
      return;
    }
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;
    
    // Limit swipe to left (negative values) and right with max thresholds
    if (diff < 0) {
      // Left swipe (delete) - limit to -swipeThreshold
      setSwipeOffset(Math.max(diff, -swipeThreshold));
    } else {
      // Right swipe (complete) - limit to swipeThreshold
      setSwipeOffset(Math.min(diff, swipeThreshold));
    }
  };

  const handleTouchEnd = () => {
    // Don't allow swipe actions on completed trips
    if (status === 'completed' || status === 'cancelled') {
      return;
    }
    
    if (swipeOffset <= -swipeThreshold && onDelete) {
      // Trigger delete action
      onDelete();
    } else if (swipeOffset >= swipeThreshold && onComplete) {
      // Trigger complete action
      onComplete();
    }
    
    // Reset swipe position with animation
    setSwipeOffset(0);
  };

  const handleMouseEnter = () => {
    setActionsVisible(true);
  };

  const handleMouseLeave = () => {
    setActionsVisible(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger onClick if we have a handler
    if (onClick) {
      // Prevent default behavior to avoid any unwanted effects
      e.preventDefault();
      
      // Stop propagation to ensure other handlers don't execute
      e.stopPropagation();
      
      // Only execute if we're not clicking a child interactive element like a button
      const target = e.target as HTMLElement;
      const isButton = target.tagName === 'BUTTON' || 
                       target.closest('button') !== null ||
                       target.role === 'button' ||
                       target.getAttribute('aria-label') !== null;
      
      if (!isButton) {
        onClick();
      }
    }
  };

  const handleDoubleTap = (e: React.TouchEvent) => {
    // Prevent default to avoid zooming on mobile
    e.preventDefault();
    
    // Don't allow adding items to completed trips
    if (status === 'completed' || status === 'cancelled') {
      return;
    }
    
    // Double tap to add item
    if (onAddItem) {
      onAddItem();
      
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const handleInitialTouch = (e: React.TouchEvent) => {
    // Track double taps
    if (cardRef.current) {
      const lastTap = (cardRef.current as any).lastTap || 0;
      const currentTime = e.timeStamp;
      
      if (currentTime - lastTap < 300) {
        handleDoubleTap(e);
      }
      
      (cardRef.current as any).lastTap = currentTime;
    }
    
    // Start the swipe tracking
    handleTouchStart(e);
  };

  return (
    <div className="relative">
      {/* Swipe action indicators - only show when actively swiping */}
      {swipeOffset !== 0 && (
        <>
          {swipeOffset > 0 && (
            <div className="swipe-action swipe-action-left">
              <Check className="h-5 w-5" />
            </div>
          )}
          {swipeOffset < 0 && (
            <div className="swipe-action swipe-action-right">
              <Trash2 className="h-5 w-5" />
            </div>
          )}
        </>
      )}
      
      <motion.div
        ref={cardRef}
        className="premium-card overflow-hidden relative"
        style={{ 
          x: swipeOffset,
          touchAction: "pan-y"
        }}
        onTouchStart={handleInitialTouch}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        onDoubleClick={status !== 'completed' && status !== 'cancelled' ? onAddItem : undefined}
      >
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{store}</h3>
              <div className="flex items-center text-gloop-text-muted dark:text-gloop-dark-text-muted mt-1">
                <User className="h-3.5 w-3.5 mr-1" />
                <span className="text-sm">{shopper.name}</span>
                <span className="mx-1.5">•</span>
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span className="text-sm">{eta}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className={cn("text-xs px-2 py-0.5", getStatusColor())}>
                {status === 'open' ? 'Open' : 
                 status === 'shopping' ? 'Shopping' : 
                 status === 'completed' ? 'Completed' : 'Cancelled'}
              </Badge>
              
              <div 
                className="flex items-center bg-gloop-accent dark:bg-gloop-dark-accent px-2 py-0.5 rounded-full cursor-pointer hover:bg-gloop-accent/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick) onClick();
                }}
                aria-label="View trip items"
              >
                <ShoppingCart className="h-3 w-3 mr-1 text-gloop-primary" />
                <span className="text-xs font-medium">{itemCount} items</span>
              </div>
            </div>
          </div>
          
          {/* Quick action buttons - always visible on hover/tap */}
          <motion.div 
            className="flex justify-end mt-3 gap-1"
            initial={{ opacity: 1, y: 0 }}
            animate={{ 
              opacity: 1,
              y: 0
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Only show Add Item button for active trips */}
            {status !== 'completed' && status !== 'cancelled' && onAddItem && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="quick-action-btn bg-gloop-accent dark:bg-gloop-dark-accent text-gloop-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddItem();
                }}
                aria-label="Add item"
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            )}
            
            {/* Share button is available for all trips */}
            {onShare && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="quick-action-btn bg-gloop-accent dark:bg-gloop-dark-accent text-gloop-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                aria-label="Share trip"
              >
                <Share2 className="h-4 w-4" />
              </motion.button>
            )}
            
            {/* Only show Edit button for active trips */}
            {status !== 'completed' && status !== 'cancelled' && onEdit && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="quick-action-btn bg-gloop-accent dark:bg-gloop-dark-accent text-gloop-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                aria-label="Edit trip"
              >
                <Edit className="h-4 w-4" />
              </motion.button>
            )}
            
            {/* Only show Complete button for active trips */}
            {status !== 'completed' && status !== 'cancelled' && onComplete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="quick-action-btn bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                aria-label="Complete trip"
              >
                <Check className="h-4 w-4" />
              </motion.button>
            )}
            
            {/* Delete button is available for all trips */}
            {onDelete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="quick-action-btn bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="Delete trip"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            )}
            
            {/* Show Info button for completed trips */}
            {(status === 'completed' || status === 'cancelled') && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="quick-action-btn bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick) onClick();
                }}
                aria-label="View trip details"
              >
                <Info className="h-4 w-4" />
              </motion.button>
            )}
            
            {/* Reactivate button for completed trips */}
            {status === 'completed' && onReactivate && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="quick-action-btn bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onReactivate();
                }}
                aria-label="Reactivate trip"
              >
                <ShoppingCart className="h-4 w-4" />
              </motion.button>
            )}
          </motion.div>
        </div>
        
        {/* Swipe hint - subtle indicator */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
          <motion.div 
            className="h-1 w-10 rounded-full bg-gloop-outline dark:bg-gloop-dark-outline opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, repeat: 2, repeatType: "reverse" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default TripCard;
