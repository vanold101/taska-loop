import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Flag, MapPin, RotateCw, Users, AlertCircle, InfoIcon, Save, UserPlus } from "lucide-react";
import { format, isBefore, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useHousehold, HouseholdMember } from "../context/HouseholdContext";

export type TaskData = {
  id: string;
  title: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  isRotating: boolean;
  location: string | null;
  notes: string;
  assignees: HouseholdMember[];
  completed?: boolean;
};

type TaskDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskData) => void;
  task: TaskData | null;
};

const TaskDetailModal = ({ isOpen, onClose, onSave, task }: TaskDetailModalProps) => {
  const { toast } = useToast();
  const { members, inviteMember } = useHousehold();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isRotating, setIsRotating] = useState(false);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<HouseholdMember[]>([]);
  const [errors, setErrors] = useState<{title?: string, date?: string}>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  // Reset form when dialog is opened and populate with task data if editing
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setDate(new Date(task.dueDate));
      setIsRotating(task.isRotating);
      setIsLocationEnabled(!!task.location);
      setPriority(task.priority);
      setLocation(task.location || "");
      setNotes(task.notes);
      setSelectedAssignees(task.assignees);
      setErrors({});
    } else if (isOpen && members.length > 0) {
      // For new tasks, default to the current user (owner)
      const currentUser = members.find(m => m.role === 'owner');
      setSelectedAssignees(currentUser ? [currentUser] : []);
    }
  }, [isOpen, task, members]);

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
        title: "Cannot save task",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    if (!date || !task) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }
    
    const taskData: TaskData = {
      ...task,
      title,
      dueDate: date.toISOString(),
      priority,
      isRotating,
      location: isLocationEnabled ? location : null,
      notes,
      assignees: selectedAssignees
    };
    
    onSave(taskData);
    
    toast({
      title: "Task updated",
      description: "Your changes have been saved",
    });
    
    // Close modal
    onClose();
  };
  
  const toggleAssignee = (member: HouseholdMember) => {
    setSelectedAssignees(prev => {
      // Always keep at least one assignee
      if (prev.length === 1 && prev[0].id === member.id) {
        return prev;
      }
      
      const isSelected = prev.some(u => u.id === member.id);
      if (isSelected) {
        return prev.filter(u => u.id !== member.id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter an email address to send the invitation",
        variant: "destructive",
      });
      return;
    }

    try {
      await inviteMember(inviteEmail, `You've been invited to help with tasks in our household!`);
      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${inviteEmail}`,
      });
      setIsInviteModalOpen(false);
      setInviteEmail("");
    } catch (error) {
      toast({
        title: "Failed to send invitation",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto premium-card">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(
                "premium-card",
                errors.title && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dueDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal premium-card",
                    !date && "text-muted-foreground",
                    errors.date && "border-red-500 focus-visible:ring-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 premium-card" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-red-500 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Assignees</Label>
            <div className="flex flex-wrap gap-2 premium-card p-3 rounded-lg">
              {members.map(member => (
                <Button
                  key={member.id}
                  type="button"
                  variant="outline"
                  className={cn(
                    "flex items-center gap-1 premium-card",
                    selectedAssignees.some(u => u.id === member.id) 
                      ? "bg-gloop-primary text-white hover:bg-gloop-primary-hover border-0" 
                      : ""
                  )}
                  onClick={() => toggleAssignee(member)}
                >
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarFallback className={selectedAssignees.some(u => u.id === member.id) ? "bg-white text-gloop-primary" : ""}>
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {member.name}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-1 premium-card border-dashed"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant={priority === "low" ? "default" : "outline"}
                onClick={() => setPriority("low")}
                className={cn(
                  "flex-1 premium-card",
                  priority === "low" ? "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white border-0" : ""
                )}
              >
                <Flag className="h-4 w-4 mr-1" /> Low
              </Button>
              <Button 
                type="button" 
                variant={priority === "medium" ? "default" : "outline"}
                onClick={() => setPriority("medium")}
                className={cn(
                  "flex-1 premium-card",
                  priority === "medium" ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white border-0" : ""
                )}
              >
                <Flag className="h-4 w-4 mr-1" /> Medium
              </Button>
              <Button 
                type="button" 
                variant={priority === "high" ? "default" : "outline"}
                onClick={() => setPriority("high")}
                className={cn(
                  "flex-1 premium-card",
                  priority === "high" ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0" : ""
                )}
              >
                <Flag className="h-4 w-4 mr-1" /> High
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between premium-card p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <RotateCw className="h-4 w-4 text-gloop-primary" />
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
            <div className="bg-blue-50 p-3 rounded-md text-sm border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
              <p className="text-blue-700 dark:text-blue-300 flex items-start">
                <InfoIcon className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                This task will rotate between assignees each time it's completed.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between premium-card p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gloop-primary" />
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
                className="premium-card"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none premium-card"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="premium-card">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid}
              className={cn(
                "premium-gradient-btn",
                !isFormValid && "opacity-50 cursor-not-allowed"
              )}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
