
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import TripCard from "@/components/TripCard";
import FloatingActionButton from "@/components/FloatingActionButton";
import CreateTripModal from "@/components/CreateTripModal";
import CreateTaskModal from "@/components/CreateTaskModal";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
      avatar: ""
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
  
  // State for data
  const [trips, setTrips] = useState(mockActiveTrips);
  const [tasks, setTasks] = useState(mockTasks);
  const [activeTab, setActiveTab] = useState("all");
  
  // Toast
  const { toast } = useToast();
  
  // Function to handle trip creation
  const handleCreateTrip = (data: { store: string; eta: string }) => {
    const newTrip = {
      id: Date.now().toString(),
      store: data.store,
      shopper: {
        name: "You",
        avatar: ""
      },
      eta: `${data.eta} min`,
      itemCount: 0,
      status: 'open' as const,
    };

    setTrips([newTrip, ...trips]);
    toast({
      title: "Trip broadcasted!",
      description: `Your trip to ${data.store} has been announced to your circle.`,
    });
    setTripModalOpen(false);
  };

  // Function to handle task creation
  const handleCreateTask = (data: { title: string; dueDate: string }) => {
    const newTask = {
      id: Date.now().toString(),
      title: data.title,
      assignees: [{ id: '1', name: 'You' }],
      dueDate: data.dueDate,
      isRotating: false,
      priority: 'medium' as 'low' | 'medium' | 'high',
      isCompleted: false,
      location: null,
    };

    setTasks([newTask, ...tasks]);
    toast({
      title: "Task created!",
      description: `Your task "${data.title}" has been added.`,
    });
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
          isCompleted: isCompleting,
        };
        
        // If the task is rotating and being completed, rotate the assignees
        if (task.isRotating && isCompleting && task.assignees.length > 1) {
          updatedTask.assignees = [task.assignees[1], task.assignees[0]];
        }
        
        return updatedTask;
      }
      return task;
    }));

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const isCompleting = !task.isCompleted;
      toast({
        title: isCompleting ? "Task completed!" : "Task marked incomplete",
        description: task.isRotating && isCompleting && task.assignees.length > 1
          ? `Next turn: ${task.assignees[1].name}` 
          : `"${task.title}" marked as ${isCompleting ? 'complete' : 'incomplete'}.`,
      });
    }
  };

  // Function to handle adding items to trips
  const handleAddItem = (tripId: string) => {
    toast({
      title: "Add item feature",
      description: "This feature will be implemented in the next version!",
    });
  };

  // Function to handle trip clicks
  const handleTripClick = (tripId: string) => {
    toast({
      title: "Trip details",
      description: "Trip details page will be available in the next version!",
    });
  };

  // Function to handle filter button click
  const handleFilterClick = () => {
    toast({
      title: "Filter options",
      description: "Advanced filtering options will be available soon!",
    });
  };

  // Filter tasks based on the active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    if (activeTab === "mine") return task.assignees.some(a => a.name === "You");
    if (activeTab === "today") {
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date(task.dueDate).toISOString().split('T')[0];
      return dueDate === today;
    }
    if (activeTab === "location") return task.location !== null;
    return true;
  });

  // Determine which modal to open when the FAB is clicked
  const handleFabClick = () => {
    setTaskModalOpen(true);
  };

  return (
    <div className="pb-20 pt-6 px-4 max-w-md mx-auto">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">TaskaLoop</h1>
          <Link to="/map">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              <span className="text-xs">Map</span>
            </Button>
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gloop-text-muted">Welcome back, Alex!</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleFilterClick}
          >
            <Filter className="h-4 w-4" />
            <span className="text-xs">Filter</span>
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="mine">Mine</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card 
                key={task.id} 
                className={`${task.isCompleted ? 'opacity-60' : ''} border-l-4 ${
                  task.priority === 'high' ? 'border-l-red-500' : 
                  task.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex gap-2 items-center">
                        <input 
                          type="checkbox"
                          checked={task.isCompleted}
                          onChange={() => handleCompleteTask(task.id)}
                          className="h-5 w-5 rounded border-gray-300 text-gloop-primary"
                        />
                        <h3 className={`font-medium ${task.isCompleted ? 'line-through text-gloop-text-muted' : ''}`}>
                          {task.title}
                        </h3>
                      </div>
                      <div className="ml-7 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gloop-text-muted">
                          <span>Assignees:</span>
                          <div className="flex -space-x-2">
                            {task.assignees.map((assignee, index) => (
                              <Avatar key={index} className="h-5 w-5 border-2 border-white">
                                <AvatarFallback className="text-xs bg-gloop-primary text-white">
                                  {assignee.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gloop-text-muted mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                          {task.location && ` • ${task.location}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {task.isRotating && (
                        <Badge variant="outline" className="bg-gloop-accent text-gloop-text-main border-none">
                          Rotating
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 border rounded-lg bg-white">
              <p className="text-gloop-text-muted">No tasks found</p>
              <Button 
                className="mt-2"
                variant="outline"
                onClick={() => setTaskModalOpen(true)}
              >
                Create a Task
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Active Trips</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setTripModalOpen(true)}
          >
            New Trip
          </Button>
        </div>
        <div className="space-y-3">
          {trips.length > 0 ? (
            trips.map((trip) => (
              <TripCard
                key={trip.id}
                store={trip.store}
                shopper={trip.shopper}
                eta={trip.eta}
                itemCount={trip.itemCount}
                status={trip.status}
                onAddItem={() => handleAddItem(trip.id)}
                onClick={() => handleTripClick(trip.id)}
              />
            ))
          ) : (
            <div className="text-center py-8 border rounded-lg bg-white">
              <p className="text-gloop-text-muted">No active trips</p>
              <p className="text-sm mt-2">Announce a trip to start shopping!</p>
              <Button 
                className="mt-2"
                variant="outline"
                onClick={() => setTripModalOpen(true)}
              >
                Create a Trip
              </Button>
            </div>
          )}
        </div>
      </section>

      <FloatingActionButton onClick={handleFabClick} />
      
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

      <NavBar />
    </div>
  );
};

export default HomePage;
