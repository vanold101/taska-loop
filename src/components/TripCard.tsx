import { motion } from "framer-motion";
import { ShoppingCart, Clock, User, Plus, Check, Share2, Trash2, Edit, Info, RotateCw, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

type TripCardProps = {
  trip: {
    id: string;
    store: string;
    shopper: {
      name: string;
      avatar: string;
    };
    eta: string;
    itemCount?: number;
    status: 'open' | 'shopping' | 'completed' | 'cancelled';
  };
  onTripClick?: () => void;
  onAddItem?: (item: any) => void;
  onDeleteTrip?: () => void;
  onShareTrip?: () => void;
  onCompleteTrip?: () => void;
  onEditTrip?: () => void;
  onReactivateTrip?: () => void;
  isPast?: boolean;
};

const TripCard = ({ 
  trip,
  onAddItem,
  onTripClick,
  onDeleteTrip,
  onShareTrip,
  onCompleteTrip,
  onEditTrip,
  onReactivateTrip,
  isPast = false
}: TripCardProps) => {
  const { store, shopper, eta, itemCount, status } = trip;
  const [isActionsVisible, setActionsVisible] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const startXRef = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const swipeThreshold = 80; // Pixels required to trigger action
  
  const getStatusVariant = () => {
    switch(status) {
      case 'open':
        return 'open';
      case 'shopping':
        return 'shopping';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
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
    
    if (swipeOffset <= -swipeThreshold && onDeleteTrip) {
      // Trigger delete action
      onDeleteTrip();
    } else if (swipeOffset >= swipeThreshold && onCompleteTrip) {
      // Trigger complete action
      onCompleteTrip();
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
    if (onTripClick) {
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
        onTripClick();
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
      onAddItem({
        name: "New Item",
        quantity: 1,
        addedBy: {
          name: "You",
          avatar: "https://example.com/avatar.jpg"
        },
        checked: false
      });
      
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

  const toggleActions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(!showActions);
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
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
        className="premium-card overflow-hidden relative shadow-md dark:shadow-lg"
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
              <h3 className="text-lg font-semibold">{store}</h3>
              <div className="flex items-center text-gloop-text-muted dark:text-gloop-dark-text-muted mt-1">
                <User className="h-3.5 w-3.5 mr-1" />
                <span className="text-[clamp(0.875rem,2vw,1rem)]">{shopper.name}</span>
                <span className="mx-1.5">•</span>
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span className="text-[clamp(0.875rem,2vw,1rem)]">{eta}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <StatusBadge variant={getStatusVariant()} className="capitalize">
                {status}
              </StatusBadge>
            </div>
          </div>
          
          {/* Combined action row with primary and secondary actions */}
          <div className="flex items-center justify-between mt-4">
            {/* Primary action - View trip items */}
            <div 
              className="flex items-center bg-gloop-accent dark:bg-gloop-dark-accent px-3 py-1.5 rounded-full cursor-pointer hover:bg-gloop-accent/80 transition-colors min-h-[40px]"
              onClick={(e) => {
                e.stopPropagation();
                if (onTripClick) onTripClick();
              }}
              aria-label="View trip items"
            >
              <ShoppingCart className="h-4 w-4 mr-2 text-gloop-primary" />
              <span className="text-[clamp(0.75rem,1.8vw,0.875rem)] font-medium">{itemCount ?? 0} items</span>
              <ChevronRight className="h-4 w-4 ml-1 text-gloop-primary" />
            </div>
            
            {/* Secondary actions menu - as a toggle instead of always visible */}
            <div className="flex items-center gap-2">
              {/* Show these buttons inline for larger screens or when actions menu is toggled */}
              {(isActionsVisible || showActions) && (
                <>
                  {status !== 'completed' && status !== 'cancelled' && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="min-w-[40px] min-h-[40px] p-2 flex items-center justify-center rounded-full bg-gloop-accent/50 hover:bg-gloop-accent dark:bg-gloop-dark-accent/50 dark:hover:bg-gloop-dark-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddItem) onAddItem({
                          name: "New Item",
                          quantity: 1,
                          addedBy: {
                            name: "You",
                            avatar: "https://example.com/avatar.jpg"
                          },
                          checked: false
                        });
                      }}
                      aria-label="Add item"
                    >
                      <Plus className="h-5 w-5 text-gloop-primary" />
                    </motion.button>
                  )}
                  
                  {status !== 'completed' && status !== 'cancelled' && onEditTrip && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1, transition: { delay: 0.05 } }}
                      className="min-w-[40px] min-h-[40px] p-2 flex items-center justify-center rounded-full bg-gloop-accent/50 hover:bg-gloop-accent dark:bg-gloop-dark-accent/50 dark:hover:bg-gloop-dark-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEditTrip) onEditTrip();
                      }}
                      aria-label="Edit trip"
                    >
                      <Edit className="h-5 w-5 text-gloop-primary" />
                    </motion.button>
                  )}
                  
                  {onShareTrip && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
                      className="min-w-[40px] min-h-[40px] p-2 flex items-center justify-center rounded-full bg-gloop-accent/50 hover:bg-gloop-accent dark:bg-gloop-dark-accent/50 dark:hover:bg-gloop-dark-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onShareTrip) onShareTrip();
                      }}
                      aria-label="Share trip"
                    >
                      <Share2 className="h-5 w-5 text-gloop-primary" />
                    </motion.button>
                  )}
                </>
              )}
              
              {/* Toggle button for actions menu */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="min-w-[40px] min-h-[40px] p-2 flex items-center justify-center rounded-full bg-gloop-accent hover:bg-gloop-accent/80 dark:bg-gloop-dark-accent dark:hover:bg-gloop-dark-accent/80"
                onClick={toggleActions}
                aria-label={showActions ? "Hide actions" : "Show actions"}
              >
                {showActions ? (
                  <X className="h-5 w-5 text-gloop-primary" />
                ) : (
                  <motion.span 
                    animate={{ rotate: showActions ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-medium"
                  >
                    <Info className="h-5 w-5 text-gloop-primary" />
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TripCard;
