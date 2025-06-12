import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Store, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ScheduleTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (data: { store: string; date: Date; eta: string }) => void;
}

export const ScheduleTripModal: React.FC<ScheduleTripModalProps> = ({
  isOpen,
  onClose,
  onSchedule,
}) => {
  const [store, setStore] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [eta, setEta] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (store && date && eta) {
      onSchedule({ store, date, eta });
      onClose();
      // Reset form
      setStore("");
      setDate(undefined);
      setEta("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Trip</DialogTitle>
          <DialogDescription>
            Plan a shopping trip for a future date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="store">Store</Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="store"
                placeholder="Enter store name"
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eta">Estimated Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="eta"
                type="time"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!store || !date || !eta}>
              Schedule Trip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 