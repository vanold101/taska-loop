import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { ItemSuggestion } from "@/services/DuplicateDetectionService";
import { TripItem } from "./TripDetailModal";
import { Badge } from "./ui/badge";

interface DuplicateItemDialogProps {
  suggestion: ItemSuggestion | null;
  isOpen: boolean;
  onClose: () => void;
  onAddAnyway: () => void;
  onMergeItems: (existingItem: TripItem, increaseBy: number) => void;
  onUpdate: (existingItem: TripItem) => void;
}

const DuplicateItemDialog = ({
  suggestion,
  isOpen,
  onClose,
  onAddAnyway,
  onMergeItems,
  onUpdate,
}: DuplicateItemDialogProps) => {
  if (!suggestion) return null;

  const { type, newItemName, existingItem, confidence, message } = suggestion;
  const isDuplicate = type === "duplicate";

  const handleAddAnyway = () => {
    onAddAnyway();
    onClose();
  };

  const handleMergeItems = () => {
    onMergeItems(existingItem, 1); // Increase quantity by 1
    onClose();
  };

  const handleUpdateExisting = () => {
    onUpdate(existingItem);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            {isDuplicate ? "Duplicate Item" : "Similar Item Found"}
          </DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        <div className="p-4 border rounded-md bg-amber-50 dark:bg-amber-900/20">
          <div className="mb-2">
            <span className="text-sm font-medium">New item:</span>{" "}
            <span className="text-sm">{newItemName}</span>
          </div>

          <div>
            <span className="text-sm font-medium">Existing item:</span>{" "}
            <span className="text-sm">{existingItem.name}</span>
            <div className="flex items-center mt-1 gap-2">
              <Badge variant="outline" className="text-xs">
                Qty: {existingItem.quantity}
              </Badge>
              {existingItem.price && (
                <Badge variant="outline" className="text-xs">
                  ${existingItem.price.toFixed(2)}
                </Badge>
              )}
              {!isDuplicate && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    confidence > 85
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : confidence > 75
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  }`}
                >
                  {confidence}% match
                </Badge>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddAnyway}
              className="sm:w-auto w-full"
            >
              Add Anyway
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={handleMergeItems}
              className="sm:w-auto w-full"
            >
              Increase Quantity (+1)
            </Button>
            
            {!isDuplicate && (
              <Button
                type="button"
                variant="default"
                onClick={handleUpdateExisting}
                className="sm:w-auto w-full"
              >
                Update Existing
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicateItemDialog; 