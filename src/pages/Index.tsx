import { useState, useEffect } from "react";
import TripCard from "../components/TripCard";
import FloatingActionButton from "../components/FloatingActionButton";
import CreateTripModal from "../components/CreateTripModal";
import { CreateTaskModal, Task as ModalTask } from "../components/CreateTaskModal";
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
  User as UserIcon,
  Calendar,
  LogOut
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
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
import { useTaskContext, Task as ContextTask, Trip as ContextTrip, TripItem, TripParticipant } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow, isPast, isToday, isTomorrow, parseISO } from "date-fns";
import NearbyStores from "../components/NearbyStores";
import TripDetailModal from "../components/TripDetailModal";

// Define TaskAssignee locally if not directly importable with avatar
type TaskAssignee = { id: string; name: string; avatar?: string };

// Mock data for tasks
const mockTasks: ModalTask[] = [
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
  const { 
    tasks: contextTasks, 
    addTask: addContextTask, 
    updateTask: updateContextTask, 
    deleteTask: deleteContextTask,
    trips: contextTrips,
    addTrip: addContextTrip,
    updateTrip: updateContextTrip,
  } = useTaskContext();
  const { user, logout, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isTripModalOpen, setTripModalOpen] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ModalTask | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // State for TripDetailModal
  const [selectedTripForDetail, setSelectedTripForDetail] = useState<ContextTrip | null>(null);
  const [isTripDetailModalOpen, setIsTripDetailModalOpen] = useState(false);

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!authIsLoading && !user) {
      navigate('/login');
    }
  }, [user, authIsLoading, navigate]);

  const handleCreateTrip = (data: { store: string; eta: string }) => {
    const newTripData: Omit<ContextTrip, 'id'> = { 
      store: data.store,
      location: data.store, 
      coordinates: { lat: 0, lng: 0 }, 
      eta: data.eta,
      status: 'open' as const,
      items: [],
      participants: [{ id: 'user-1', name: 'You', avatar: 'https://example.com/you.jpg' }], 
      shopper: { name: 'You', avatar: 'https://example.com/you.jpg' },
      date: new Date().toISOString(),
    };
    addContextTrip(newTripData);
    setTripModalOpen(false);
    toast({ title: "Trip Broadcasted!", description: `Your trip to ${data.store} is live.` });
  };

  const handleCreateTask = (data: { 
    title: string; 
    dueDate: string; 
    location?: string | null;
    coordinates?: { lat: number; lng: number }; 
    assignees?: TaskAssignee[]; 
    priority?: 'low' | 'medium' | 'high'; 
    isRotating?: boolean; 
  }) => {
    const newTaskForContext: Omit<ContextTask, 'id'> = { 
      title: data.title,
      assignees: data.assignees?.map(a => ({ ...a, avatar: a.avatar || '' })) || [{ id: 'user-1', name: 'You', avatar: '' }], 
      dueDate: data.dueDate,
      isRotating: data.isRotating || false,
      priority: data.priority || 'medium',
      location: data.location || 'N/A',
      coordinates: data.coordinates || { lat: 0, lng: 0 }, 
      completed: false,
    };
    addContextTask(newTaskForContext);
    setTaskModalOpen(false);
    toast({ title: "Task Created!", description: `${data.title} has been added.` });
  };
  
  const handleOpenEditTaskModal = (taskId: string) => {
    const taskFromContext = contextTasks.find(t => t.id === taskId);
    if (taskFromContext) {
      const modalTask: ModalTask = {
        id: taskFromContext.id,
        title: taskFromContext.title,
        dueDate: taskFromContext.dueDate,
        priority: taskFromContext.priority,
        isCompleted: taskFromContext.completed,
        isRotating: taskFromContext.isRotating,
        location: taskFromContext.location,
        coordinates: taskFromContext.coordinates,
        assignees: taskFromContext.assignees?.map(a => ({id: a.id, name: a.name})) 
      };
      setTaskToEdit(modalTask);
      setIsEditingTask(true);
    } else {
      toast({ title: "Error", description: "Task not found.", variant: "destructive" });
    }
  };
  
  const handleTaskUpdate = (updatedModalTask: ModalTask) => {
    if (!taskToEdit || !taskToEdit.id) return;
    
    const taskUpdateForContext: Partial<ContextTask> = {
        title: updatedModalTask.title,
        dueDate: updatedModalTask.dueDate,
        priority: updatedModalTask.priority,
        completed: updatedModalTask.isCompleted,
        isRotating: updatedModalTask.isRotating,
        location: updatedModalTask.location || 'N/A',
        coordinates: updatedModalTask.coordinates || { lat: 0, lng: 0 },
        assignees: updatedModalTask.assignees?.map(a => ({ id: a.id, name: a.name, avatar: '' })) 
    };

    updateContextTask(taskToEdit.id, taskUpdateForContext);
    setIsEditingTask(false);
    setTaskToEdit(null);
    toast({ title: "Task Updated!", description: `${updatedModalTask.title} has been updated.` });
  };

  const handleCompleteTask = (taskId: string) => {
    const task = contextTasks.find(t => t.id === taskId);
    if (task) {
      updateContextTask(taskId, { ...task, completed: !task.completed });
      toast({
        title: task.completed ? "Task Reactivated" : "Task Completed!",
        description: `${task.title} status updated.`
      });
    }
  };
  
  const handleDeleteTask = (taskId: string) => {
    const task = contextTasks.find(t => t.id === taskId);
    if (task && window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteContextTask(taskId);
      toast({ title: "Task Deleted", description: `${task.title} has been removed.`, variant: "destructive" });
    }
  };

  const filteredTasks = contextTasks.filter(task => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return !task.completed;
    if (activeTab === "completed") return task.completed;
    return true;
  });

  const getDueDateDisplay = (dateString: string) => {
    if (!dateString) return "No due date";
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      if (isPast(date)) return `${formatDistanceToNow(date)} ago`;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return "Invalid date";
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const renderTaskCard = (task: ContextTask, index: number) => {
    const isTaskPastDue = task.dueDate && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
    const assignees = task.assignees || [];

    return (
      <motion.div
        key={task.id || `task-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="premium-card flex flex-col"
      >
        <CardContent className="p-4 space-y-3 flex-grow text-center">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-[clamp(0.9rem,2vw,1.05rem)] mr-2 flex-1 break-words">
              {task.title}
            </h3>
            <Badge variant="outline" className={`capitalize ${getPriorityColor(task.priority)} whitespace-nowrap`}>
              {task.priority}
            </Badge>
          </div>
          
          <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 space-x-2">
            <Clock className="h-3 w-3" />
            <span className={isTaskPastDue && !task.completed ? "text-red-500 dark:text-red-400 font-medium" : ""}>
              {getDueDateDisplay(task.dueDate)}
            </span>
          </div>

          {assignees.length > 0 && (
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 space-x-2">
              <Users className="h-3 w-3" />
              <div className="flex -space-x-2 overflow-hidden">
                {assignees.slice(0, 3).map(assignee => (
                  assignee && assignee.name && (
                    <Avatar key={assignee.id} className="inline-block h-5 w-5 rounded-full ring-2 ring-background dark:ring-slate-900">
                      <AvatarFallback className="text-[10px] bg-primary/20 dark:bg-primary/30">
                        {assignee.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )
                ))}
              </div>
              {assignees.length > 3 && (
                <span className="text-[10px] pl-1">+{assignees.length - 3} more</span>
              )}
            </div>
          )}

          {task.location && task.location !== 'N/A' && (
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 space-x-2">
              <MapPin className="h-3 w-3" />
              <span>{task.location}</span>
            </div>
          )}
          
          {task.isRotating && (
            <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 space-x-2">
              <RotateCw className="h-3 w-3" />
              <span>Rotating Task</span>
            </div>
          )}
        </CardContent>
        <div className="p-3 border-t border-border/70 dark:border-border/50 flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => task.id && handleCompleteTask(task.id)} 
            disabled={!task.id}
          >
            <Check className={`h-3.5 w-3.5 mr-1.5 ${task.completed ? "text-green-500" : ""}`} />
            {task.completed ? "Mark Incomplete" : "Mark Complete"}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => task.id && handleOpenEditTaskModal(task.id)} 
            disabled={!task.id}
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20"
            onClick={() => task.id && handleDeleteTask(task.id)} 
            disabled={!task.id}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    );
  };

  // Function to open TripDetailModal for adding/viewing items
  const handleOpenTripDetailModal = (tripId: string) => {
    const trip = contextTrips.find(t => t.id === tripId);
    if (trip) {
      setSelectedTripForDetail(trip);
      setIsTripDetailModalOpen(true);
    } else {
      toast({ title: "Error", description: "Trip not found.", variant: "destructive" });
    }
  };

  // Function to add an item to a trip in context
  const handleAddItemToContextTrip = (tripId: string, itemData: Omit<TripItem, 'id' | 'addedBy' | 'checked'>) => {
    const trip = contextTrips.find(t => t.id === tripId);
    if (trip) {
      const newItem: TripItem = {
        ...itemData,
        id: Date.now().toString(), // Generate unique ID
        addedBy: { name: "You", avatar: "" }, // Assuming current user adds item
        checked: false,
      };
      const updatedItems = [...trip.items, newItem];
      updateContextTrip(tripId, { items: updatedItems });
      toast({ title: "Item Added", description: `${itemData.name} added to ${trip.store}.` });
    } else {
      toast({ title: "Error", description: "Could not add item, trip not found.", variant: "destructive" });
    }
  };
  
  // Placeholder for updating item in context (price, unit, etc.)
  const handleUpdateTripItemContext = (tripId: string, itemId: string, itemUpdates: Partial<Omit<TripItem, 'id' | 'addedBy'>>) => {
    const trip = contextTrips.find(t => t.id === tripId);
    if (trip) {
      const updatedItems = trip.items.map(item => 
        item.id === itemId ? { ...item, ...itemUpdates } : item
      );
      updateContextTrip(tripId, { items: updatedItems });
      toast({ title: "Item Updated", description: `Item details updated in ${trip.store}.`});
    } else {
      toast({ title: "Error", description: "Could not update item, trip not found.", variant: "destructive" });
    }
  };
  
  // Placeholder for deleting item from context
  const handleDeleteTripItemContext = (tripId: string, itemId: string) => {
    const trip = contextTrips.find(t => t.id === tripId);
    if (trip) {
      const updatedItems = trip.items.filter(item => item.id !== itemId);
      updateContextTrip(tripId, { items: updatedItems });
      toast({ title: "Item Deleted", description: `Item removed from ${trip.store}.`, variant: "destructive"});
    } else {
      toast({ title: "Error", description: "Could not delete item, trip not found.", variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header removed based on user request */}
      
      {!authIsLoading && user && (
        <main className="flex-grow px-[5vw] md:px-[8vw] lg:px-[10vw] py-6 md:py-8 space-y-6 md:space-y-8 pb-20 md:pb-24">
          <section>
            {/* ... existing quick actions or overview content ... */}
          </section>

          {contextTrips.filter(trip => trip.status !== 'completed' && trip.status !== 'cancelled').length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h2 className="text-[clamp(1.5rem,3vw,1.875rem)] font-semibold flex items-center">
                  <Store className="h-6 w-6 mr-2 text-blue-500" />
                  Active Trips
                </h2>
                <Link to="/trips" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                  <Button variant="ghost" size="sm" className="ml-auto text-sm">View All</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {contextTrips
                  .filter(trip => trip.status !== 'completed' && trip.status !== 'cancelled')
                  .slice(0, 3)
                  .map((trip, index) => {
                    const cardTrip = { 
                      ...trip, // Spread properties of trip (type Trip, which has no itemCount by default)
                      itemCount: trip.items.filter(item => !item.checked).length, // Define itemCount based on unchecked items
                      shopper: trip.shopper || { name: "Unknown Shopper", avatar: "" },
                    };
                    return (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <TripCard
                          trip={cardTrip}
                          onTripClick={() => handleOpenTripDetailModal(trip.id)}
                          onAddItem={() => handleOpenTripDetailModal(trip.id)}
                          onCompleteTrip={() => updateContextTrip(trip.id, { status: 'completed' })} 
                          onDeleteTrip={() => {
                            if (window.confirm(`Are you sure you want to delete the trip to ${trip.store}?`)) {
                              console.log("Placeholder: Delete trip", trip.id);
                              toast({title: "Trip Deleted (Placeholder)", description: `Trip to ${trip.store} removed.`})
                            }
                          }} 
                          onShareTrip={() => console.log("Share trip:", trip.id)} 
                          onEditTrip={() => console.log("Edit trip:", trip.id)}
                        />
                      </motion.div>
                    );
                  })}
              </div>
            </section>
          )}
          
          {/* Nearby Stores - if enabled */}
          {/* <NearbyStores /> */}

          <section>
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-[clamp(1.6rem,3.2vw,2rem)] font-bold flex items-center">
                <UserIcon className="h-7 w-7 mr-2.5 text-green-500" />
                My Tasks
              </h2>
              <Button 
                size="default" 
                onClick={() => {
                  setTaskToEdit(null);
                  setIsEditingTask(false);
                  setTaskModalOpen(true)
                }}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New Task
              </Button>
            </div>
            
            <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-4 premium-card">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="mine">Mine</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <AnimatePresence>
                  {contextTasks.filter(task => !task.completed).length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
                    >
                      {contextTasks
                        .filter(task => !task.completed)
                        .sort((a, b) => {
                          try { return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime(); } catch { return 0; }
                        })
                        .map(renderTaskCard)}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 bg-background/50 dark:bg-background/30 rounded-lg border border-dashed border-border">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">All tasks cleared!</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Add a new task or enjoy your free time.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="today">
                <AnimatePresence>
                  {contextTasks.filter(task => !task.completed && task.dueDate && isToday(parseISO(task.dueDate))).length > 0 ? (
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                      {contextTasks
                        .filter(task => !task.completed && task.dueDate && isToday(parseISO(task.dueDate)))
                        .sort((a, b) => {
                          try { return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime(); } catch { return 0; }
                        })
                        .map(renderTaskCard)}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 bg-background/50 dark:bg-background/30 rounded-lg border border-dashed border-border">
                       <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No tasks for today!</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Relax or plan for tomorrow.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
              
              <TabsContent value="upcoming">
                <AnimatePresence>
                  {contextTasks.filter(task => !task.completed && task.dueDate && (isTomorrow(parseISO(task.dueDate)) || (!isToday(parseISO(task.dueDate)) && !isPast(parseISO(task.dueDate))))).length > 0 ? (
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                      {contextTasks
                        .filter(task => !task.completed && task.dueDate && (isTomorrow(parseISO(task.dueDate)) || (!isToday(parseISO(task.dueDate)) && !isPast(parseISO(task.dueDate)))))
                        .sort((a, b) => {
                          try { return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime(); } catch { return 0; }
                        })
                        .map(renderTaskCard)}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 bg-background/50 dark:bg-background/30 rounded-lg border border-dashed border-border">
                       <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No upcoming tasks.</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Plan ahead or enjoy the quiet.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="mine">
                <AnimatePresence>
                  {contextTasks.filter(task => !task.completed && task.assignees && task.assignees.some(a => a && a.name === 'You')).length > 0 ? (
                     <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                      {contextTasks
                        .filter(task => !task.completed && task.assignees && task.assignees.some(a => a && a.name === 'You'))
                        .sort((a, b) => {
                          try { return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime(); } catch { return 0; }
                        })
                        .map(renderTaskCard)}
                    </motion.div>
                  ) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 bg-background/50 dark:bg-background/30 rounded-lg border border-dashed border-border">
                      <UserIcon className="h-12 w-12 text-indigo-500 mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">Nothing assigned to you.</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Check other tabs or wait for new assignments.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="completed">
                <AnimatePresence>
                  {contextTasks.filter(task => task.completed).length > 0 ? (
                    <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                      {contextTasks
                        .filter(task => task.completed)
                        .sort((a, b) => {
                          try { return parseISO(b.dueDate).getTime() - parseISO(a.dueDate).getTime(); } catch { return 0; }
                        })
                        .map(renderTaskCard)}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 bg-background/50 dark:bg-background/30 rounded-lg border border-dashed border-border">
                      <Info className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No completed tasks yet.</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Get to work and see your accomplishments here!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </section>
        </main>
      )}
      
      {!authIsLoading && user && <NavBar />}
      
      <CreateTripModal 
        isOpen={isTripModalOpen} 
        onClose={() => setTripModalOpen(false)}
        onSubmit={handleCreateTrip}
      />
      
      <CreateTaskModal
        isOpen={isTaskModalOpen || isEditingTask}
        onClose={() => {
          setTaskModalOpen(false);
          setIsEditingTask(false);
          setTaskToEdit(null);
        }}
        onSubmit={taskToEdit ? handleTaskUpdate : handleCreateTask}
        taskToEdit={taskToEdit}
        isEditing={isEditingTask}
      />

      {selectedTripForDetail && (
        <TripDetailModal
          isOpen={isTripDetailModalOpen}
          onClose={() => {
            setIsTripDetailModalOpen(false);
            setSelectedTripForDetail(null);
          }}
          trip={selectedTripForDetail ? { 
              ...selectedTripForDetail, 
              shopper: selectedTripForDetail.shopper || { name: "Unknown Shopper", avatar: "" } 
            } : null
          }
          onAddItem={handleAddItemToContextTrip}
          onRemoveItem={(tripId: string, itemId: string) => {
            handleDeleteTripItemContext(tripId, itemId);
            const updatedTripFromContext = contextTrips.find(t => t.id === tripId);
            if (updatedTripFromContext) {
              setSelectedTripForDetail(updatedTripFromContext);
            }
          }}
          onToggleItemCheck={(tripId: string, itemId: string) => {
            const currentTrip = contextTrips.find(t => t.id === tripId);
            const item = currentTrip?.items.find(i => i.id === itemId);
            if (item && currentTrip) {
              handleUpdateTripItemContext(tripId, itemId, { checked: !item.checked });
              const updatedTripFromContext = contextTrips.find(t => t.id === tripId);
              if (updatedTripFromContext) {
                setSelectedTripForDetail(updatedTripFromContext);
              }
            }
          }}
          onUpdateItemPrice={(tripId: string, itemId: string, price: number) => {
            handleUpdateTripItemContext(tripId, itemId, { price });
            const updatedTripFromContext = contextTrips.find(t => t.id === tripId);
            if (updatedTripFromContext) {
              setSelectedTripForDetail(updatedTripFromContext);
            }
          }}
          onUpdateItemUnit={(tripId: string, itemId: string, unit: string, newQuantity?: number) => {
            const currentContextTrip = contextTrips.find(t => t.id === tripId);
            const itemToUpdate = currentContextTrip?.items.find(i => i.id === itemId);
            const updates = { unit, quantity: newQuantity !== undefined ? newQuantity : itemToUpdate?.quantity };

            handleUpdateTripItemContext(tripId, itemId, updates);
            const updatedTripFromContext = contextTrips.find(t => t.id === tripId);
            if (updatedTripFromContext) {
              setSelectedTripForDetail(updatedTripFromContext);
            }
          }}
          onInviteParticipant={(tripId: string) => console.log("Invite participant to trip", tripId)}
          onCompleteTrip={(tripId: string) => updateContextTrip(tripId, { status: 'completed' })}
          onReactivateTrip={(tripId: string) => updateContextTrip(tripId, { status: 'open' })}
          onSettleUp={(amount: number, toUserId: string, fromUserId: string) => console.log("Settle up:", { amount, toUserId, fromUserId })}
        />
      )}
    </div>
  );
};

export default HomePage;
