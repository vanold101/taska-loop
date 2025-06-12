import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BudgetAdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSave: (newBudget: number) => void;
}

export default function BudgetAdjustmentDialog({
  isOpen,
  onClose,
  currentBudget,
  onSave
}: BudgetAdjustmentDialogProps) {
  const [budget, setBudget] = useState(currentBudget);
  const { toast } = useToast();

  const handleSave = () => {
    if (budget < 0) {
      toast({
        title: "Invalid Budget",
        description: "Budget cannot be negative.",
        variant: "destructive"
      });
      return;
    }
    
    onSave(budget);
    onClose();
    toast({
      title: "Budget Updated",
      description: "Your monthly budget has been updated successfully."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Monthly Budget</DialogTitle>
          <DialogDescription>
            Set your monthly shopping budget. This helps you track and manage your spending.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="budget" className="text-right">
              Budget
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="pl-7"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 