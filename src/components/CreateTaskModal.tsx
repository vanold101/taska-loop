import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Flag, MapPin, RotateCw, Users, AlertCircle } from "lucide-react";
import { format, isBefore, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; dueDate: string }) => void;
};

// Mock users for assignee selection
const mockUsers = [
  { id: '1', name: 'You', avatar: '' },
  { id: '2', name: 'Rachel', avatar: '' },
  { id: '3', name: 'Brian', avatar: '' },
  { id: '4', name: 'Ella', avatar: '' },
];

const CreateTaskModal = ({ isOpen, onClose, onSubmit }: CreateTaskModalProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isRotating, setIsRotating] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState([mockUsers[0]]);
  const [errors, setErrors] = useState<{title?: string, date?: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Reset form when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDate(new Date());
      setIsRotating(false);
      setIsLocationEnabled(false);
      setPriority("medium");
      setLocation("");
      setNotes("");
      setSelectedAssignees([mockUsers[0]]);
      setErrors({});
    }
  }, [isOpen]);

  // Validate form on every change
  useEffect(() => {
    const newErrors: {title?: string, date?: string} = {};
    
    if (!title.trim()) {
      newErrors.title = "Task title is required";
    }
    
    if (!date) {
      newErrors.date = "Due date is required";
    } else if (isBefore(date, startOfToday())) {
      newErrors.date = "Due date cannot be in the past";
    }
    
    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [title, date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast({
        title: "Cannot create task",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }
    
    const taskData = {
      title,
      dueDate: date.toISOString(),
      // Additional data that could be used in a full implementation
      priority,
      isRotating,
      location: isLocationEnabled ? location : null,
      notes,
      assignees: selectedAssignees
    };
    
    onSubmit(taskData);
    
    // Close modal - form reset happens in useEffect
    onClose();
  };
  
  const toggleAssignee = (user: typeof mockUsers[0]) => {
    setSelectedAssignees(prev => {
      // Always keep at least one assignee
      if (prev.length === 1 && prev[0].id === user.id) {
        return prev;
      }
      
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto premium-card">
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
            <Label htmlFor="title" className="flex items-center justify-between">
              Task Title
              {errors.title && (
                <span className="text-xs text-destructive flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.title}
                </span>
              )}
            </Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-destructive" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignees">Assignees</Label>
            <div className="flex flex-wrap gap-2">
              {mockUsers.map((user) => (
                <motion.div 
                  key={user.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="button"
                    variant={selectedAssignees.some(u => u.id === user.id) ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => toggleAssignee(user)}
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center justify-between">
              Due Date
              {errors.date && (
                <span className="text-xs text-destructive flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.date}
                </span>
              )}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                    errors.date && "border-destructive"
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
                  disabled={(date) => isBefore(date, startOfToday())}
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
                className={cn(
                  "flex-1",
                  priority === "low" ? "bg-green-500 hover:bg-green-600" : ""
                )}
              >
                <Flag className="h-4 w-4 mr-1" /> Low
              </Button>
              <Button 
                type="button" 
                variant={priority === "medium" ? "default" : "outline"}
                onClick={() => setPriority("medium")}
                className={cn(
                  "flex-1",
                  priority === "medium" ? "bg-yellow-500 hover:bg-yellow-600" : ""
                )}
              >
                <Flag className="h-4 w-4 mr-1" /> Medium
              </Button>
              <Button 
                type="button" 
                variant={priority === "high" ? "default" : "outline"}
                onClick={() => setPriority("high")}
                className={cn(
                  "flex-1",
                  priority === "high" ? "bg-red-500 hover:bg-red-600" : ""
                )}
              >
                <Flag className="h-4 w-4 mr-1" /> High
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
          
          {isRotating && selectedAssignees.length > 1 && (
            <div className="bg-blue-50 p-3 rounded-md text-sm">
              <p className="text-blue-700">
                This task will rotate between assignees each time it's completed.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
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

          {isLocationEnabled && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Enter a location or address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid}
              className={cn(
                "bg-gloop-primary hover:bg-gloop-primary-dark",
                !isFormValid && "opacity-50 cursor-not-allowed"
              )}
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
