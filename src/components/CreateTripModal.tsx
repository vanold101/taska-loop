import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, AlertCircle, Clock, Store, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type CreateTripModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { store: string; eta: string }) => void;
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

const CreateTripModal = ({ isOpen, onClose, onSubmit }: CreateTripModalProps) => {
  const { toast } = useToast();
  const [store, setStore] = useState("");
  const [eta, setEta] = useState("20"); // Default 20 minutes
  const [errors, setErrors] = useState<{store?: string, eta?: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(storeSuggestions);

  // Reset form when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setStore("");
      setEta("20");
      setErrors({});
      setShowSuggestions(false);
    }
  }, [isOpen]);

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
    
    if (!isFormValid) {
      toast({
        title: "Cannot broadcast trip",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({ store, eta });
  };

  const handleStoreInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStore(e.target.value);
    setShowSuggestions(true);
  };

  const selectSuggestion = (suggestion: string) => {
    setStore(suggestion);
    setShowSuggestions(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-effect">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            I'm heading to...
          </DialogTitle>
          <DialogDescription>
            Let others know you're making a shopping trip and they can request items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2 relative">
            <Label htmlFor="store" className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-blue-500" />
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
                className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ul className="py-1">
                  {filteredSuggestions.map((suggestion, index) => (
                    <motion.li 
                      key={index}
                      className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer text-sm flex items-center"
                      onClick={() => selectSuggestion(suggestion)}
                      whileHover={{ x: 5 }}
                    >
                      <Store className="h-3 w-3 mr-2 text-blue-500" />
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
                <Clock className="h-4 w-4 mr-1 text-blue-500" />
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
              <span className="text-gray-500 dark:text-gray-400">minutes</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Let others know when you expect to arrive at the store
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-md mt-4 border border-blue-100">
            <p className="text-sm text-blue-800 flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
              When you broadcast a trip, your circle members will be notified and can add items to your shopping list.
            </p>
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
              Broadcast Trip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTripModal;
