import { useState } from "react";
import TripCard from "../components/TripCard";
import FloatingActionButton from "../components/FloatingActionButton";
import CreateTripModal from "../components/CreateTripModal";
import { CreateTaskModal } from "../components/CreateTaskModal";
import NavBar from "../components/NavBar";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Filter, 
  Map, 
  Clock, 
  MapPin, 
  RotateCw, 
  Trash2, 
  Edit, 
  Share2, 
  Check, 
  Plus, 
  Info, 
  ShoppingCart,
  ChevronRight,
  ListTodo,
  CheckCircle,
  Store,
  Users,
  User,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
} from "../components/ui/dialog";
import { useToast } from "../hooks/use-toast";
import { useTaskContext } from "../context/TaskContext";
import { formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";
import NearbyStores from "../components/NearbyStores";

// Mock data for tasks
const mockTasks = [
  {
    id: '1',
    title: 'Take out trash',
    assignees: [
      { id: '1', name: 'You' },
      { id: '2', name: 'Rachel' }
    ],
    dueDate: '2025-05-02',
    isRotating: true,
    priority: 'high',
    isCompleted: false,
    location: null,
  },
  {
    id: '2',
    title: 'Clean kitchen',
    assignees: [
      { id: '1', name: 'You' },
    ],
    dueDate: '2025-05-03',
    isRotating: false,
    priority: 'medium',
    isCompleted: false,
    location: null,
  },
  {
    id: '3',
    title: 'Buy milk',
    assignees: [
      { id: '2', name: 'Rachel' },
    ],
    dueDate: '2025-05-01',
    isRotating: false,
    priority: 'low',
    isCompleted: true,
    location: 'Grocery Store',
  }
];

// Mock active trips data
const mockActiveTrips = [
  {
    id: '1',
    store: "Trader Joe's",
    shopper: {
      name: "Rachel",
      avatar: "https://example.com/rachel.jpg"
    },
    eta: "10 min",
    itemCount: 5,
    status: 'open' as const,
  }
];

const HomePage = () => {
  // State for modals
  const [isTripModalOpen, setTripModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<typeof mockTasks[0] | null>(null);
  
  // State for data
  const [trips, setTrips] = useState(mockActiveTrips);
  const [tasks, setTasks] = useState(mockTasks);
  const [activeTab, setActiveTab] = useState("all");
  
  // Get toast utility
  const { toast } = useToast();

  // Function to handle trip creation
  const handleCreateTrip = (data: { store: string; eta: string }) => {
    const newTrip = {
      id: Date.now().toString(),
      store: data.store,
      shopper: {
        name: "You",
        avatar: "https://example.com/you.jpg"
      },
      eta: `${data.eta} min`,
      itemCount: 0,
      status: 'open' as const,
    };

    setTrips([newTrip, ...trips]);
    setTripModalOpen(false);
  };

  // Function to handle task creation
  const handleCreateTask = (data: { title: string; dueDate: string; location?: string; coordinates?: { lat: number; lng: number } }) => {
    const newTask = {
      id: Date.now().toString(),
      title: data.title,
      assignees: [{ id: '1', name: 'You' }],
      dueDate: data.dueDate,
      isRotating: false,
      priority: 'medium' as 'low' | 'medium' | 'high',
      isCompleted: false,
      location: data.location || null,
      coordinates: data.coordinates || null,
    };

    setTasks([newTask, ...tasks]);
    setTaskModalOpen(false);
  };

  // Function to handle task completion
  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        // Find the task being toggled
        const isCompleting = !task.isCompleted;
        
        // Create a new task object with the updated completion status
        const updatedTask = {
          ...task,
          isCompleted: isCompleting
        };
        
        return updatedTask;
      }
      return task;
    }));
  };

  // Function to handle adding items to trips
  const handleAddItem = (tripId: string) => {
    // In a real app, this would open a modal to add items
    // For now, we'll just increment the item count
    setTrips(trips.map(trip => {
      if (trip.id === tripId) {
        return {
          ...trip,
          itemCount: trip.itemCount + 1
        };
      }
      return trip;
    }));
  };

  // Function to handle trip clicks
  const handleTripClick = (tripId: string) => {
    // In a real app, this would navigate to the trip detail page
    console.log(`Trip clicked: ${tripId}`);
  };

  // Function to handle share trip
  const handleShareTrip = (tripId: string) => {
    // In a real app, this would open a share dialog
    console.log(`Share trip: ${tripId}`);
  };

  // Function to handle complete trip
  const handleCompleteTrip = (tripId: string) => {
    setTrips(trips.filter(trip => trip.id !== tripId));
  };

  // Function to handle reactivate trip
  const handleReactivateTrip = (tripId: string) => {
    // In a real app, this would move the trip from completed back to active
    // For now, we'll just create a new trip with the same data
    const completedTrip = trips.find(trip => trip.id === tripId);
    if (completedTrip) {
      const reactivatedTrip = {
        ...completedTrip,
        id: Date.now().toString(),
        status: 'open' as const,
        eta: 'Reactivated'
      };
      setTrips([reactivatedTrip, ...trips]);
      
      // Show confirmation toast
      toast({
        title: "Trip reactivated",
        description: `Your trip to ${completedTrip.store} has been reactivated.`,
      });
    }
  };

  // Function to handle delete trip
  const handleDeleteTrip = (tripId: string) => {
    setTrips(trips.filter(trip => trip.id !== tripId));
  };

  // Function to handle edit trip
  const handleEditTrip = (tripId: string) => {
    // In a real app, this would open an edit dialog
    console.log(`Edit trip: ${tripId}`);
  };

  // Function to handle filter button click
  const handleFilterClick = () => {
    // In a real app, this would open a filter dialog
    console.log('Filter clicked');
  };

  // Function to view task details
  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setTaskDetailModalOpen(true);
    }
  };

  // Function to delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setTaskDetailModalOpen(false);
  };

  // Function to edit task
  const handleEditTask = (taskId: string) => {
    // In a real app, this would open an edit dialog
    console.log(`Edit task: ${taskId}`);
    setTaskDetailModalOpen(false);
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return !task.isCompleted;
    if (activeTab === "completed") return task.isCompleted;
    return true;
  });

  // Function to determine due date display
  const getDueDateDisplay = (date: string) => {
    const dueDate = new Date(date);
    
    if (isToday(dueDate)) {
      return "Today";
    } else if (isTomorrow(dueDate)) {
      return "Tomorrow";
    } else if (isPast(dueDate)) {
      return `${formatDistanceToNow(dueDate)} ago`;
    } else {
      return formatDistanceToNow(dueDate, { addSuffix: true });
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 hover:bg-red-600';
      case 'medium':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'low':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="pb-20">
      {/* Page header */}
      <header className="px-4 pt-6 pb-4 bg-white dark:bg-gloop-dark-surface border-b border-gloop-outline dark:border-gloop-dark-outline">
        <h1 className="text-2xl font-semibold">Task Loop</h1>
        <p className="text-sm text-gloop-text-muted dark:text-gloop-dark-text-muted">
          Your household management hub
        </p>
      </header>
      
      <main className="p-4 space-y-6">
        {/* Task filtering tabs */}
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4 bg-gloop-accent dark:bg-gloop-dark-accent">
            <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
            <TabsTrigger value="pending" className="text-sm">Pending</TabsTrigger>
            <TabsTrigger value="completed" className="text-sm">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0 space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gloop-text-muted dark:text-gloop-dark-text-muted">
                <ListTodo className="mx-auto h-10 w-10 mb-2 opacity-50" />
                <p>No tasks found. Create a new task to get started.</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <Card 
                  key={task.id} 
                  className="premium-card hover:shadow-md transition-shadow"
                  onClick={() => handleTaskClick(task.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-medium">{task.title}</span>
                          {task.isRotating && (
                            <RotateCw className="h-3.5 w-3.5 text-gloop-primary" />
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gloop-text-muted mt-1 gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{getDueDateDisplay(task.dueDate)}</span>
                          
                          {task.location && (
                            <>
                              <span className="mx-1">•</span>
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{task.location}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex -space-x-2">
                            {task.assignees.map((assignee, index) => (
                              <Avatar key={index} className="h-6 w-6 border-2 border-white dark:border-gloop-dark-surface">
                                <AvatarFallback className="text-xs">
                                  {assignee.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">{task.assignees.length} assignee{task.assignees.length !== 1 ? 's' : ''}</Badge>
                          <Badge className={`ml-auto text-xs text-white ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        variant={task.isCompleted ? "outline" : "default"}
                        size="icon"
                        className={`h-7 w-7 rounded-full ${task.isCompleted ? 'bg-gloop-success text-white' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTask(task.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0 space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gloop-text-muted dark:text-gloop-dark-text-muted">
                <CheckCircle className="mx-auto h-10 w-10 mb-2 opacity-50" />
                <p>All tasks completed. Great job!</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <Card 
                  key={task.id} 
                  className="premium-card hover:shadow-md transition-shadow"
                  onClick={() => handleTaskClick(task.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-medium">{task.title}</span>
                          {task.isRotating && (
                            <RotateCw className="h-3.5 w-3.5 text-gloop-primary" />
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gloop-text-muted mt-1 gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{getDueDateDisplay(task.dueDate)}</span>
                          
                          {task.location && (
                            <>
                              <span className="mx-1">•</span>
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{task.location}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex -space-x-2">
                            {task.assignees.map((assignee, index) => (
                              <Avatar key={index} className="h-6 w-6 border-2 border-white dark:border-gloop-dark-surface">
                                <AvatarFallback className="text-xs">
                                  {assignee.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">{task.assignees.length} assignee{task.assignees.length !== 1 ? 's' : ''}</Badge>
                          <Badge className={`ml-auto text-xs text-white ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        variant={task.isCompleted ? "outline" : "default"}
                        size="icon"
                        className={`h-7 w-7 rounded-full ${task.isCompleted ? 'bg-gloop-success text-white' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTask(task.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0 space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-gloop-text-muted dark:text-gloop-dark-text-muted">
                <CheckCircle className="mx-auto h-10 w-10 mb-2 opacity-50" />
                <p>No completed tasks yet.</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <Card 
                  key={task.id} 
                  className="premium-card hover:shadow-md transition-shadow"
                  onClick={() => handleTaskClick(task.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-medium">{task.title}</span>
                          {task.isRotating && (
                            <RotateCw className="h-3.5 w-3.5 text-gloop-primary" />
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gloop-text-muted mt-1 gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{getDueDateDisplay(task.dueDate)}</span>
                          
                          {task.location && (
                            <>
                              <span className="mx-1">•</span>
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{task.location}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex -space-x-2">
                            {task.assignees.map((assignee, index) => (
                              <Avatar key={index} className="h-6 w-6 border-2 border-white dark:border-gloop-dark-surface">
                                <AvatarFallback className="text-xs">
                                  {assignee.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">{task.assignees.length} assignee{task.assignees.length !== 1 ? 's' : ''}</Badge>
                          <Badge className={`ml-auto text-xs text-white ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        variant={task.isCompleted ? "outline" : "default"}
                        size="icon"
                        className={`h-7 w-7 rounded-full ${task.isCompleted ? 'bg-gloop-success text-white' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteTask(task.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
        
        {/* Active Shopping Trips Section */}
        {trips.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-2">
              <ShoppingCart className="h-5 w-5 text-gloop-primary" />
              Active Shopping Trips
            </h2>
            <div className="space-y-3">
              {trips.map(trip => (
                <Card 
                  key={trip.id} 
                  className="premium-card hover:shadow-md transition-shadow"
                  onClick={() => handleTripClick(trip.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{trip.store}</div>
                        <div className="text-sm flex items-center gap-1 mt-1 text-gloop-text-muted">
                          <User className="h-3.5 w-3.5" />
                          <span>{trip.shopper.name}</span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3.5 w-3.5" />
                          <span>ETA {trip.eta}</span>
                        </div>
                      </div>
                      <Badge className="bg-gloop-primary">
                        {trip.itemCount} {trip.itemCount === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
        
        {/* Nearby Stores Section */}
        <section>
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-2">
            <Store className="h-5 w-5 text-gloop-primary" />
            Nearby Stores
          </h2>
          <NearbyStores maxStores={3} />
        </section>
      </main>
      
      {/* Floating Action Button for creating new items */}
      <FloatingActionButton 
        onClick={() => setTaskModalOpen(true)}
        icon={<Plus className="h-5 w-5" />}
        className="bottom-32"
      />
      
      {/* Task creation modal */}
      <CreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />
      
      {/* Task detail modal */}
      <Dialog open={isTaskDetailModalOpen} onOpenChange={setTaskDetailModalOpen}>
        {selectedTask && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTask.title}
                {selectedTask.isRotating && <RotateCw className="h-4 w-4 text-gloop-primary" />}
              </DialogTitle>
              <DialogDescription>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gloop-text-muted" />
                    <span>{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                    
                    {selectedTask.location && (
                      <>
                        <span className="mx-1">•</span>
                        <MapPin className="h-4 w-4 text-gloop-text-muted" />
                        <span>{selectedTask.location}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gloop-text-muted" />
                    <span>Assignees: {selectedTask.assignees.map(a => a.name).join(', ')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gloop-text-muted" />
                    <span>Priority: {selectedTask.priority}</span>
                    
                    {selectedTask.isRotating && (
                      <>
                        <span className="mx-1">•</span>
                        <RotateCw className="h-4 w-4 text-gloop-text-muted" />
                        <span>Rotating task</span>
                      </>
                    )}
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1"
                onClick={() => handleDeleteTask(selectedTask.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-1"
                  onClick={() => handleEditTask(selectedTask.id)}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                
                <Button 
                  variant={selectedTask.isCompleted ? "outline" : "default"} 
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    handleCompleteTask(selectedTask.id);
                    setTaskDetailModalOpen(false);
                  }}
                >
                  <Check className="h-4 w-4" />
                  {selectedTask.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Bottom navigation */}
      <NavBar />
    </div>
  );
};

export default HomePage;
