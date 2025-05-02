import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Clock, 
  Plus, 
  Trash2, 
  UserPlus, 
  Share2, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Types for trip data
export type TripItem = {
  id: string;
  name: string;
  quantity: number;
  addedBy: {
    name: string;
    avatar: string;
  };
  checked: boolean;
};

export type TripData = {
  id: string;
  store: string;
  shopper: {
    name: string;
    avatar: string;
  };
  eta: string;
  status: 'open' | 'shopping' | 'completed' | 'cancelled';
  items: TripItem[];
  participants: {
    id: string;
    name: string;
    avatar: string;
  }[];
};

type TripDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  trip: TripData | null;
  onAddItem: (tripId: string, item: Omit<TripItem, 'id'>) => void;
  onRemoveItem: (tripId: string, itemId: string) => void;
  onToggleItemCheck: (tripId: string, itemId: string) => void;
  onInviteParticipant: (tripId: string) => void;
  onCompleteTrip: (tripId: string) => void;
};

const TripDetailModal = ({ 
  isOpen, 
  onClose, 
  trip, 
  onAddItem, 
  onRemoveItem, 
  onToggleItemCheck,
  onInviteParticipant,
  onCompleteTrip
}: TripDetailModalProps) => {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const { toast } = useToast();
  
  // Reset form when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setNewItemName("");
      setNewItemQuantity(1);
    }
  }, [isOpen]);
  
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip) return;
    
    if (!newItemName.trim()) {
      toast({
        title: "Item name required",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }
    
    const newItem = {
      name: newItemName,
      quantity: newItemQuantity,
      addedBy: {
        name: "You", // In a real app, this would be the current user
        avatar: "https://example.com/you.jpg"
      },
      checked: false
    };
    
    onAddItem(trip.id, newItem);
    
    // Reset form
    setNewItemName("");
    setNewItemQuantity(1);
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };
  
  if (!trip) return null;
  
  const isUserShopper = trip.shopper.name === "You";
  const uncheckedItems = trip.items.filter(item => !item.checked);
  const checkedItems = trip.items.filter(item => item.checked);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto premium-card">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge className={cn(
              "capitalize flex items-center text-xs",
              trip.status === 'open' ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" :
              trip.status === 'shopping' ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" :
              trip.status === 'completed' ? "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800" :
              "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
            )}>
              {trip.status === 'open' && <Clock className="h-3 w-3 mr-1" />}
              {trip.status === 'shopping' && <ShoppingCart className="h-3 w-3 mr-1" />}
              {trip.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
              {trip.status === 'cancelled' && <AlertCircle className="h-3 w-3 mr-1" />}
              {trip.status}
            </Badge>
            
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onInviteParticipant(trip.id)}
              >
                <UserPlus className="h-4 w-4 text-gloop-primary" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
              >
                <Share2 className="h-4 w-4 text-gloop-primary" />
              </Button>
            </div>
          </div>
          
          <DialogTitle className="text-xl flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2 text-gloop-primary" />
            Trip to {trip.store}
          </DialogTitle>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6 border-2 border-white dark:border-gloop-dark-surface">
                <AvatarImage src={trip.shopper.avatar} />
                <AvatarFallback className="bg-gloop-primary text-white text-xs">
                  {trip.shopper.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gloop-text-muted">
                Shopper: <span className="font-medium text-gloop-text-main dark:text-gloop-dark-text-main">{trip.shopper.name}</span>
              </span>
            </div>
            
            <div className="text-sm text-gloop-text-muted flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              ETA: {trip.eta}
            </div>
          </div>
          
          <div className="flex -space-x-2 mt-2">
            {trip.participants.map((participant, index) => (
              <Avatar key={index} className="h-6 w-6 border-2 border-white dark:border-gloop-dark-surface">
                <AvatarImage src={participant.avatar} />
                <AvatarFallback className="bg-gloop-primary text-white text-xs">
                  {participant.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-6 w-6 rounded-full ml-1 p-0 flex items-center justify-center border-dashed"
              onClick={() => onInviteParticipant(trip.id)}
            >
              <Plus className="h-3 w-3" />
            </Button>
            
            {trip.participants.length > 0 && (
              <span className="ml-4 text-xs text-gloop-text-muted">
                {trip.participants.length} participant{trip.participants.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </DialogHeader>
        
        {trip.status !== 'completed' && trip.status !== 'cancelled' && (
          <form onSubmit={handleAddItem} className="flex gap-2 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Add an item..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="premium-card"
              />
            </div>
            
            <div className="w-16">
              <Input
                type="number"
                min="1"
                max="99"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
                className="premium-card"
              />
            </div>
            
            <Button type="submit" size="icon" className="premium-gradient-btn">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        )}
        
        <div className="space-y-4 mt-4">
          {uncheckedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Items to Get ({uncheckedItems.length})</h3>
              <ul className="space-y-2">
                <AnimatePresence>
                  {uncheckedItems.map((item) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between p-2 border rounded-md premium-card"
                    >
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full mr-2"
                          onClick={() => onToggleItemCheck(trip.id, item.id)}
                          disabled={!isUserShopper && trip.status === 'shopping'}
                        >
                          <div className="h-5 w-5 rounded-full border-2 border-gloop-primary flex items-center justify-center" />
                        </Button>
                        
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{item.name}</span>
                            {item.quantity > 1 && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                x{item.quantity}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center text-xs text-gloop-text-muted">
                            <Avatar className="h-3 w-3 mr-1">
                              <AvatarImage src={item.addedBy.avatar} />
                              <AvatarFallback className="text-[8px]">
                                {item.addedBy.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            Added by {item.addedBy.name}
                          </div>
                        </div>
                      </div>
                      
                      {(isUserShopper || item.addedBy.name === "You") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gloop-text-muted hover:text-gloop-danger"
                          onClick={() => onRemoveItem(trip.id, item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}
          
          {checkedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 text-gloop-text-muted">Checked Items ({checkedItems.length})</h3>
              <ul className="space-y-2">
                <AnimatePresence>
                  {checkedItems.map((item) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between p-2 border rounded-md premium-card opacity-60"
                    >
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full mr-2"
                          onClick={() => onToggleItemCheck(trip.id, item.id)}
                          disabled={!isUserShopper && trip.status === 'shopping'}
                        >
                          <div className="h-5 w-5 rounded-full border-2 border-gloop-primary flex items-center justify-center bg-gloop-primary text-white">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        </Button>
                        
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium line-through">{item.name}</span>
                            {item.quantity > 1 && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                x{item.quantity}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center text-xs text-gloop-text-muted">
                            <Avatar className="h-3 w-3 mr-1">
                              <AvatarImage src={item.addedBy.avatar} />
                              <AvatarFallback className="text-[8px]">
                                {item.addedBy.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            Added by {item.addedBy.name}
                          </div>
                        </div>
                      </div>
                      
                      {(isUserShopper || item.addedBy.name === "You") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gloop-text-muted hover:text-gloop-danger"
                          onClick={() => onRemoveItem(trip.id, item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}
          
          {trip.items.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gloop-text-muted">No items added yet</p>
              <p className="text-sm mt-1">Add items for {trip.shopper.name} to pick up</p>
            </div>
          )}
        </div>
        
        {isUserShopper && trip.status !== 'completed' && trip.status !== 'cancelled' && (
          <div className="mt-4 pt-4 border-t border-gloop-outline dark:border-gloop-dark-surface">
            <Button 
              className="w-full premium-gradient-btn"
              onClick={() => onCompleteTrip(trip.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {trip.status === 'open' ? 'Start Shopping' : 'Complete Trip'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TripDetailModal;
