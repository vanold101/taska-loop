import { useState } from "react";
import TripCard from "@/components/TripCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import CreateTripModal from "@/components/CreateTripModal";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogFooter, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";

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

  // Determine which modal to open when the FAB is clicked
  const handleFabClick = () => {
    setTaskModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 pb-20 pt-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end">
          Welcome Back
        </h1>
        <Button variant="outline" onClick={handleFilterClick} className="premium-card">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="mb-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 premium-card">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <AnimatePresence>
        {filteredTasks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {filteredTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                whileHover={{ scale: 1.02 }}
                className="premium-card rounded-lg overflow-hidden"
              >
                <Card className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className={`h-6 w-6 rounded-full ${
                            task.isCompleted
                              ? "bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end text-white border-0"
                              : "border-gloop-card-border"
                          }`}
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          {task.isCompleted && <Check className="h-3 w-3" />}
                        </Button>
                        <div className="flex-1">
                          <div 
                            className={`font-medium ${
                              task.isCompleted ? "line-through text-gloop-text-muted" : ""
                            }`}
                            onClick={() => handleTaskClick(task.id)}
                          >
                            {task.title}
                          </div>
                          <div className="flex items-center text-xs text-gloop-text-muted mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                            
                            {task.location && (
                              <>
                                <span className="mx-1">•</span>
                                <MapPin className="h-3 w-3 mr-1" />
                                {task.location}
                              </>
                            )}
                            
                            {task.isRotating && (
                              <>
                                <span className="mx-1">•</span>
                                <RotateCw className="h-3 w-3 mr-1" />
                                Rotating
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Badge 
                          variant="outline" 
                          className={`
                            ${task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200' : 
                              task.priority === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200' : 
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200'}
                            mr-2
                          `}
                        >
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </Badge>
                        
                        <div className="flex -space-x-2">
                          {task.assignees.map((assignee, index) => (
                            <Avatar key={index} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-gloop-premium-gradient-start to-gloop-premium-gradient-end text-white">
                                {assignee.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 premium-card rounded-lg"
          >
            <div className="mb-3 mx-auto w-12 h-12 rounded-full bg-gloop-card-background flex items-center justify-center">
              <Check className="h-6 w-6 text-gloop-text-muted" />
            </div>
            <h3 className="text-lg font-medium mb-1">No tasks found</h3>
            <p className="text-sm text-gloop-text-muted mb-4">
              {activeTab === "completed" 
                ? "You haven't completed any tasks yet."
                : activeTab === "pending"
                ? "You don't have any pending tasks."
                : "You don't have any tasks yet."}
            </p>
            <Button 
              onClick={() => setTaskModalOpen(true)}
              className="premium-gradient-btn"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 mb-6">
        <h2 className="text-lg font-medium mb-3 flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2 text-gloop-primary" />
          Active Shopping Trips
        </h2>
        
        {trips.length > 0 ? (
          <div className="space-y-3">
            {trips.map(trip => (
              <TripCard 
                key={trip.id}
                trip={{
                  id: trip.id,
                  store: trip.store,
                  shopper: trip.shopper,
                  eta: trip.eta,
                  itemCount: trip.itemCount,
                  status: trip.status
                }}
                onAddItem={() => handleAddItem(trip.id)}
                onClick={() => handleTripClick(trip.id)}
                onShare={() => handleShareTrip(trip.id)}
                onComplete={() => handleCompleteTrip(trip.id)}
                onDelete={() => handleDeleteTrip(trip.id)}
                onEdit={() => handleEditTrip(trip.id)}
              />
            ))}
          </div>
        ) : (
          <Card className="premium-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="w-12 h-12 rounded-full bg-gloop-card-background flex items-center justify-center mb-3">
                <ShoppingCart className="h-6 w-6 text-gloop-text-muted" />
              </div>
              <h3 className="text-lg font-medium mb-1">No active trips</h3>
              <p className="text-sm text-gloop-text-muted text-center mb-4">
                Create a shopping trip to let others know you're heading to the store.
              </p>
              <Button 
                onClick={() => setTripModalOpen(true)}
                className="premium-gradient-btn"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start a Trip
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-3 flex items-center">
          <Map className="h-5 w-5 mr-2 text-gloop-primary" />
          Nearby Stores
        </h2>
        
        <div className="space-y-2">
          <Link to="/map">
            <Card className="premium-card hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">Trader Joe's</div>
                  <div className="text-sm text-gloop-text-muted">0.8 miles away</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gloop-text-muted" />
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/map">
            <Card className="premium-card hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">Whole Foods Market</div>
                  <div className="text-sm text-gloop-text-muted">1.2 miles away</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gloop-text-muted" />
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/map">
            <Card className="premium-card hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">Target</div>
                  <div className="text-sm text-gloop-text-muted">1.5 miles away</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gloop-text-muted" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <FloatingActionButton 
        onClick={handleFabClick} 
        icon={<Plus className="h-6 w-6" />}
      />
      
      <CreateTripModal
        isOpen={isTripModalOpen}
        onClose={() => setTripModalOpen(false)}
        onSubmit={handleCreateTrip}
      />
      
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Task Detail Modal */}
      <Dialog open={isTaskDetailModalOpen} onOpenChange={setTaskDetailModalOpen}>
        <DialogContent className="sm:max-w-[425px] premium-card">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <div 
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer mr-2 ${
                      selectedTask.isCompleted 
                        ? 'bg-gloop-primary border-gloop-primary' 
                        : 'border-gloop-outline'
                    }`}
                    onClick={() => handleCompleteTask(selectedTask.id)}
                  >
                    {selectedTask.isCompleted && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={selectedTask.isCompleted ? 'line-through text-gloop-text-muted' : ''}>
                    {selectedTask.title}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  Task Details
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Assigned to</h4>
                  <div className="flex items-center gap-2">
                    {selectedTask.assignees.map((assignee, index) => (
                      <div key={index} className="flex items-center">
                        <Avatar className="h-6 w-6 mr-1">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-gloop-premium-gradient-start to-gloop-premium-gradient-end text-white">
                            {assignee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{assignee.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Due Date</h4>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gloop-text-muted" />
                    <span className="text-sm">{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {selectedTask.location && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">Location</h4>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gloop-text-muted" />
                      <span className="text-sm">{selectedTask.location}</span>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Priority</h4>
                  <Badge 
                    className={`
                      ${selectedTask.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                        selectedTask.priority === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}
                    `}
                  >
                    {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                  </Badge>
                </div>
                
                {selectedTask.isRotating && (
                  <div className="mb-4">
                    <Badge variant="outline" className="bg-gloop-accent text-gloop-text-main border-none flex items-center">
                      <RotateCw className="h-3 w-3 mr-1" />
                      Rotating Task
                    </Badge>
                    <p className="text-xs text-gloop-text-muted mt-1">
                      This task rotates between assignees each time it's completed.
                    </p>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex justify-between">
                <Button 
                  variant="destructive" 
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setTaskDetailModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => handleEditTask(selectedTask.id)}
                    className="flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <NavBar />
    </div>
  );
};

export default HomePage;
