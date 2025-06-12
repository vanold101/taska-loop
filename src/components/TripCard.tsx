import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { ShoppingCart, Clock, User, Plus, Check, Share2, Trash2, Edit, Info, RotateCw, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { TouchTargetButton } from "@/components/ui/TouchTargetButton";
import { haptics } from "@/lib/haptics";
import { ActiveTripAnimation } from "@/components/ActiveTripAnimation";

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
  onStartTrip?: () => void;
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
  onStartTrip,
  isPast = false
}: TripCardProps) => {
  const { store, shopper, eta, itemCount, status } = trip;
  const [isActionsVisible, setActionsVisible] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef({
    isScrolling: false,
    startX: 0,
    startY: 0,
    lastTap: 0,
    swipeThreshold: 80,
    scrollThreshold: 10,
    doubleTapDelay: 300,
    currentX: 0
  });

  // Prevent swipe actions on completed/cancelled trips
  const canSwipe = status !== 'completed' && status !== 'cancelled';

  const handleGestureStart = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    const touch = 'touches' in event ? event.touches[0] : event;
    gestureRef.current.startX = touch.clientX;
    gestureRef.current.startY = touch.clientY;
    gestureRef.current.isScrolling = false;
  }, []);

  const handleGestureMove = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!canSwipe) return;

    const touch = 'touches' in event ? event.touches[0] : event;
    const deltaX = touch.clientX - gestureRef.current.startX;
    const deltaY = touch.clientY - gestureRef.current.startY;

    // Determine if user is trying to scroll vertically
    if (!gestureRef.current.isScrolling && Math.abs(deltaY) > gestureRef.current.scrollThreshold) {
      gestureRef.current.isScrolling = true;
      controls.set({ x: 0 }); // Reset any horizontal movement
      return;
    }

    // Only handle horizontal swipes if not scrolling
    if (!gestureRef.current.isScrolling && Math.abs(deltaX) > gestureRef.current.scrollThreshold) {
      event.preventDefault(); // Prevent scrolling once we've determined it's a swipe
      controls.set({ x: deltaX });
      gestureRef.current.currentX = deltaX;

      // Add haptic feedback at threshold points
      if (Math.abs(deltaX) >= gestureRef.current.swipeThreshold) {
        haptics.medium();
      }
    }
  }, [canSwipe, controls]);

  const handleGestureEnd = useCallback(async () => {
    if (!canSwipe || gestureRef.current.isScrolling) return;

    const currentX = gestureRef.current.currentX;

    if (currentX <= -gestureRef.current.swipeThreshold && onDeleteTrip) {
      haptics.heavy();
      onDeleteTrip();
    } else if (currentX >= gestureRef.current.swipeThreshold && onCompleteTrip) {
      haptics.heavy();
      onCompleteTrip();
    }

    // Animate back to center with spring physics
    controls.start({ 
      x: 0,
      transition: { type: "spring", stiffness: 500, damping: 30 }
    });
    gestureRef.current.currentX = 0;
  }, [canSwipe, controls, onDeleteTrip, onCompleteTrip]);

  const handleTap = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - gestureRef.current.lastTap;

    // Handle double tap
    if (timeSinceLastTap < gestureRef.current.doubleTapDelay) {
      event.preventDefault();
      event.stopPropagation();
      
      if (canSwipe && onAddItem) {
        haptics.medium();
        onAddItem({
          name: "New Item",
          quantity: 1,
          addedBy: {
            name: "You",
            avatar: "https://example.com/avatar.jpg"
          },
          checked: false
        });
      }
    } else if (onTripClick) {
      // Handle single tap after a delay to avoid double tap conflicts
      const target = event.target as HTMLElement;
      const isInteractive = target.tagName === 'BUTTON' || 
                           target.closest('button') !== null ||
                           target.role === 'button' ||
                           target.getAttribute('aria-label') !== null;
      
      if (!isInteractive) {
        // Remove the delay to make the click more responsive
        onTripClick();
        haptics.light();
      }
    }

    gestureRef.current.lastTap = now;
  }, [canSwipe, onAddItem, onTripClick]);

  const toggleActions = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(prev => !prev);
    haptics.light();
  }, []);

  return (
    <div className="relative">
      {/* Swipe action indicators */}
      <AnimatePresence>
        {canSwipe && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: gestureRef.current.currentX > gestureRef.current.swipeThreshold / 2 ? 1 : 0 
              }}
              exit={{ opacity: 0 }}
              className="absolute inset-y-0 left-0 flex items-center justify-center w-16 bg-green-500/10 rounded-l-lg"
            >
              <Check className="h-6 w-6 text-green-500" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: gestureRef.current.currentX < -gestureRef.current.swipeThreshold / 2 ? 1 : 0 
              }}
              exit={{ opacity: 0 }}
              className="absolute inset-y-0 right-0 flex items-center justify-center w-16 bg-red-500/10 rounded-r-lg"
            >
              <Trash2 className="h-6 w-6 text-red-500" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        ref={cardRef}
        className={cn(
          "premium-card overflow-hidden relative shadow-md dark:shadow-lg",
          trip.status === 'shopping' && "border-2 border-blue-500"
        )}
        animate={controls}
        drag={canSwipe ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onTouchStart={handleGestureStart}
        onTouchMove={handleGestureMove}
        onTouchEnd={handleGestureEnd}
        onMouseDown={handleGestureStart}
        onMouseMove={handleGestureMove}
        onMouseUp={handleGestureEnd}
        onClick={handleTap}
      >
        {/* Active trip animation */}
        <AnimatePresence>
          {trip.status === 'shopping' && (
            <ActiveTripAnimation shopper={trip.shopper} />
          )}
        </AnimatePresence>

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
              
              {/* Secondary actions menu */}
              <div className="flex items-center gap-2">
                {trip.status === 'open' && onStartTrip && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartTrip();
                    }}
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Start Trip
                  </Button>
                )}
                {onShareTrip && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShareTrip();
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
                {onEditTrip && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTrip();
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TripCard;
