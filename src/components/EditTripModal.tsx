import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, AlertCircle, Clock, Store, Info, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { TripData } from "./TripDetailModal";

type EditTripModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUpdateTrip: (tripId: string, data: { store: string; eta: string }) => void;
  trip: TripData | null;
};

// Common store suggestions for convenience
const storeSuggestions = [
  "Trader Joe's",
  "Kroger",
  "Walmart",
  "Target",
  "Costco",
  "Whole Foods",
  "Aldi"
];

const EditTripModal = ({ isOpen, onClose, onUpdateTrip, trip }: EditTripModalProps) => {
  const { toast } = useToast();
  const [store, setStore] = useState("");
  const [eta, setEta] = useState("");
  const [errors, setErrors] = useState<{store?: string, eta?: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(storeSuggestions);

  // Initialize form values when trip data is available
  useEffect(() => {
    if (trip && isOpen) {
      setStore(trip.store);
      // Extract numeric value from eta string (e.g., "10 min" -> "10")
      const etaValue = trip.eta.replace(/\D/g, '');
      setEta(etaValue || "20");
      setErrors({});
      setShowSuggestions(false);
    }
  }, [trip, isOpen]);

  // Validate form on every change
  useEffect(() => {
    const newErrors: {store?: string, eta?: string} = {};
    
    if (!store.trim()) {
      newErrors.store = "Store name is required";
    }
    
    const etaNum = parseInt(eta);
    if (isNaN(etaNum) || etaNum < 5) {
      newErrors.eta = "ETA must be at least 5 minutes";
    } else if (etaNum > 120) {
      newErrors.eta = "ETA cannot exceed 120 minutes";
    }
    
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [store, eta]);

  // Filter suggestions based on input
  useEffect(() => {
    if (store.trim()) {
      const filtered = storeSuggestions.filter(s => 
        s.toLowerCase().includes(store.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(storeSuggestions);
    }
  }, [store]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || !trip) {
      toast({
        title: "Cannot update trip",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    onUpdateTrip(trip.id, { store, eta });
  };

  const handleStoreInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStore(e.target.value);
    setShowSuggestions(true);
  };

  const selectSuggestion = (suggestion: string) => {
    setStore(suggestion);
    setShowSuggestions(false);
  };

  if (!trip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-effect">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end">
            <Edit className="h-5 w-5 text-gloop-primary" />
            Edit Trip
          </DialogTitle>
          <DialogDescription>
            Update your trip details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2 relative">
            <Label htmlFor="store" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-gloop-primary" />
                <span>Store</span>
              </div>
              {errors.store && (
                <span className="text-xs text-destructive flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.store}
                </span>
              )}
            </Label>
            <Input
              id="store"
              placeholder="e.g. Trader Joe's, Costco, Target"
              value={store}
              onChange={handleStoreInput}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // Delay hiding suggestions to allow for clicks
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className={`premium-card ${errors.store ? "border-destructive" : ""}`}
            />
            
            {/* Store suggestions dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <motion.div 
                className="absolute z-10 w-full mt-1 glass-effect rounded-md shadow-lg border border-gloop-card-border"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ul className="py-1">
                  {filteredSuggestions.map((suggestion, index) => (
                    <motion.li 
                      key={index}
                      className="px-3 py-2 hover:bg-gloop-primary/10 cursor-pointer text-sm flex items-center"
                      onClick={() => selectSuggestion(suggestion)}
                      whileHover={{ x: 5 }}
                    >
                      <Store className="h-3 w-3 mr-2 text-gloop-primary" />
                      {suggestion}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eta" className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-gloop-primary" />
                Time until arrival
              </div>
              {errors.eta && (
                <span className="text-xs text-destructive flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.eta}
                </span>
              )}
            </Label>
            <div className="flex gap-3 items-center">
              <Input
                id="eta"
                type="number"
                min="5"
                max="120"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className={`w-24 premium-card ${errors.eta ? "border-destructive" : ""}`}
              />
              <span className="text-gloop-text-muted">minutes</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="premium-card">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid}
              className={`premium-gradient-btn ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Update Trip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTripModal;
