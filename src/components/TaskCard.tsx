import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Edit, User, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { TaskData } from "./TaskDetailModal";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type TaskCardProps = {
  task: TaskData;
  onEdit: (task: TaskData) => void;
  onComplete: (taskId: string) => void;
  onShare: (taskId: string) => void;
  onDelete: (taskId: string) => void;
};

const TaskCard = ({ task, onEdit, onComplete, onShare, onDelete }: TaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getPriorityColor = () => {
    switch(task.priority) {
      case 'low':
        return 'border-l-gloop-success';
      case 'medium':
        return 'border-l-gloop-warning';
      case 'high':
        return 'border-l-gloop-danger';
      default:
        return 'border-l-gloop-outline';
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Card 
        className={cn(
          "overflow-hidden border-l-4 shadow-sm hover:shadow-md transition-all premium-card",
          getPriorityColor(),
          task.completed ? "opacity-70" : ""
        )}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className={cn(
                "text-lg font-medium mb-1",
                task.completed ? "line-through text-gloop-text-muted" : ""
              )}>
                {task.title}
              </h3>
              
              <div className="flex items-center text-sm text-gloop-text-muted space-x-2 mb-2">
                <Clock className="h-3 w-3" />
                <span>{formatDueDate(task.dueDate)}</span>
                
                {task.location && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">{task.location}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {task.isRotating && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                  Rotating
                </Badge>
              )}
              
              <Badge variant="outline" className={cn(
                "text-xs",
                task.priority === "high" ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800" :
                task.priority === "medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800" :
                "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
              )}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex -space-x-2">
              {task.assignees.map((assignee, index) => (
                <Avatar key={index} className="h-6 w-6 border-2 border-white dark:border-gloop-dark-surface">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="bg-gloop-primary text-white text-xs">
                    {assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              
              {task.assignees.length > 0 && (
                <div className="ml-1 text-xs text-gloop-text-muted flex items-center">
                  <span className="ml-2">{task.assignees.length > 1 ? `${task.assignees.length} people` : task.assignees[0].name}</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="premium-card">
                  <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare(task.id)} className="cursor-pointer">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(task.id)} className="cursor-pointer text-red-600 hover:text-red-700">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
        
        {!task.completed && (
          <CardFooter className="p-0">
            <Button 
              onClick={() => onComplete(task.id)}
              className="w-full rounded-none bg-gloop-bg hover:bg-gloop-bg/80 text-gloop-text-main border-t border-gloop-outline flex items-center justify-center h-10 dark:bg-gloop-dark-surface/50 dark:hover:bg-gloop-dark-surface dark:text-gloop-dark-text-main dark:border-gloop-dark-surface"
            >
              <CheckCircle className="h-4 w-4 mr-2 text-gloop-success" />
              Mark Complete
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {isHovered && !task.completed && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 z-10"
        >
          <Button
            size="icon"
            className="h-8 w-8 rounded-full shadow-md bg-gloop-primary hover:bg-gloop-primary-hover"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-4 w-4 text-white" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TaskCard;
