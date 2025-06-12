import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BudgetAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onAdjust: (newBudget: number) => void;
}

export const BudgetAdjustModal: React.FC<BudgetAdjustModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  onAdjust,
}) => {
  const [budget, setBudget] = useState(currentBudget.toString());
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = parseFloat(budget);
    
    if (isNaN(newBudget) || newBudget <= 0) {
      toast({
        title: "Invalid Budget",
        description: "Please enter a valid budget amount.",
        variant: "destructive",
      });
      return;
    }

    onAdjust(newBudget);
    toast({
      title: "Budget Updated",
      description: `Monthly budget has been set to $${newBudget.toFixed(2)}`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Monthly Budget</DialogTitle>
          <DialogDescription>
            Set your monthly shopping budget target.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Monthly Budget</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter budget amount"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!budget || parseFloat(budget) <= 0}>
              Update Budget
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 