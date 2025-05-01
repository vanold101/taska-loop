
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart } from "lucide-react";

type CreateTripModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { store: string; eta: string }) => void;
};

const CreateTripModal = ({ isOpen, onClose, onSubmit }: CreateTripModalProps) => {
  const [store, setStore] = useState("");
  const [eta, setEta] = useState("20"); // Default 20 minutes

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ store, eta });
    setStore("");
    setEta("20");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-gloop-primary" />
            I'm heading to...
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="store">Store</Label>
            <Input
              id="store"
              placeholder="e.g. Trader Joe's, Costco, Target"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eta">Time until arrival (minutes)</Label>
            <Input
              id="eta"
              type="number"
              min="5"
              max="120"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!store.trim()}
              style={{backgroundColor: '#4C6EF5'}}
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
