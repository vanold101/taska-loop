
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Flag, Map, RotateCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; dueDate: string }) => void;
};

const CreateTaskModal = ({ isOpen, onClose, onSubmit }: CreateTaskModalProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isRotating, setIsRotating] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive",
      });
      return;
    }
    
    const taskData = {
      title,
      dueDate: date.toISOString(),
    };
    
    onSubmit(taskData);
    
    // Reset form
    setTitle("");
    setDate(new Date());
    setIsRotating(false);
    setIsLocationEnabled(false);
    setPriority("medium");
    
    // Close modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Add a new task to your list. Tasks can be assigned to people and can have location reminders.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant={priority === "low" ? "default" : "outline"}
                onClick={() => setPriority("low")}
                className={priority === "low" ? "bg-green-500 hover:bg-green-600" : ""}
              >
                Low
              </Button>
              <Button 
                type="button" 
                variant={priority === "medium" ? "default" : "outline"}
                onClick={() => setPriority("medium")}
                className={priority === "medium" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                Medium
              </Button>
              <Button 
                type="button" 
                variant={priority === "high" ? "default" : "outline"}
                onClick={() => setPriority("high")}
                className={priority === "high" ? "bg-red-500 hover:bg-red-600" : ""}
              >
                High
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              <Label htmlFor="rotate-toggle" className="cursor-pointer">
                Rotation
              </Label>
            </div>
            <Switch 
              id="rotate-toggle" 
              checked={isRotating}
              onCheckedChange={setIsRotating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <Label htmlFor="location-toggle" className="cursor-pointer">
                Location Reminder
              </Label>
            </div>
            <Switch 
              id="location-toggle" 
              checked={isLocationEnabled}
              onCheckedChange={setIsLocationEnabled}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gloop-primary hover:bg-gloop-primary-dark"
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
