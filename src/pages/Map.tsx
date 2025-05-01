
import { useState } from "react";
import NavBar from "@/components/NavBar";
import FloatingActionButton from "@/components/FloatingActionButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, List, Navigation, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreateTaskModal from "@/components/CreateTaskModal";
import { motion } from "framer-motion";

// Mock tasks with location data
const mockLocationTasks = [
  {
    id: '1',
    title: 'Pick up dry cleaning',
    dueDate: '2025-05-05',
    location: 'Downtown Cleaners',
    coordinates: { lat: 39.9622, lng: -83.0007 },
    priority: 'high',
  },
  {
    id: '2',
    title: 'Return library books',
    dueDate: '2025-05-08',
    location: 'Columbus Public Library',
    coordinates: { lat: 39.9611, lng: -83.0101 },
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Get groceries from Trader Joe\'s',
    dueDate: '2025-05-02',
    location: 'Trader Joe\'s',
    coordinates: { lat: 39.9702, lng: -83.0150 },
    priority: 'high',
  }
];

const MapPage = () => {
  const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [locationTasks, setLocationTasks] = useState(mockLocationTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isRoutePlanned, setIsRoutePlanned] = useState(false);
  const { toast } = useToast();

  const handleCreateTask = (data: { title: string; dueDate: string }) => {
    const newTask = {
      id: Date.now().toString(),
      title: data.title,
      dueDate: data.dueDate,
      location: 'New Location',
      coordinates: { lat: 39.9642, lng: -82.9950 }, // Default to Columbus
      priority: 'medium' as 'low' | 'medium' | 'high',
    };
    
    setLocationTasks([newTask, ...locationTasks]);
    
    toast({
      title: "Task created!",
      description: `Your task "${data.title}" has been created.`,
    });
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'map' ? 'list' : 'map');
    
    toast({
      title: `Switched to ${viewMode === 'map' ? 'list' : 'map'} view`,
      description: `Now showing tasks in ${viewMode === 'map' ? 'list' : 'map'} view.`,
    });
  };

  const handleShowRoute = () => {
    setIsRoutePlanned(!isRoutePlanned);
    
    toast({
      title: isRoutePlanned ? "Route removed" : "Generating optimal route",
      description: isRoutePlanned 
        ? "Route planning has been cancelled" 
        : "Finding the best path for your tasks",
    });
  };
  
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
    
    const task = locationTasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: "Task selected",
        description: `Viewing details for "${task.title}"`,
      });
    }
  };

  return (
    <div className="pb-20 pt-6 px-4 max-w-md mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks Map</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 premium-card hover:bg-slate-100"
          onClick={toggleViewMode}
        >
          {viewMode === 'map' ? (
            <>
              <List className="h-4 w-4" />
              <span>List View</span>
            </>
          ) : (
            <>
              <MapIcon className="h-4 w-4" />
              <span>Map View</span>
            </>
          )}
        </Button>
      </header>

      <div className="mb-4">
        <Button 
          variant={isRoutePlanned ? "default" : "outline"}
          className={`flex items-center gap-2 w-full ${isRoutePlanned ? "bg-gloop-primary" : "premium-card"}`}
          onClick={handleShowRoute}
        >
          <Navigation className="h-4 w-4" />
          <span>{isRoutePlanned ? "Hide Route" : "Show Optimal Route"}</span>
        </Button>
      </div>

      {viewMode === 'map' ? (
        <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center mb-4 relative overflow-hidden premium-card">
          {/* Map background with gradient */}
          <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-83.0007,39.9622,12,0/800x600?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjazB0NmhkdnIwMTVtM2hvMzFuczE3MzkifQ.krZHB6_U5gp7_VQJgUw3Kg')] bg-cover"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20"></div>
          
          {/* Sample markers to show positions */}
          {locationTasks.map((task, index) => (
            <motion.div 
              key={task.id}
              className={`absolute h-8 w-8 rounded-full flex items-center justify-center cursor-pointer
                ${task.priority === 'high' ? 'bg-red-500' : 
                task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}
                ${task.id === selectedTaskId ? 'ring-4 ring-white ring-opacity-70' : ''}
              `}
              style={{ 
                top: `${20 + (task.coordinates.lat - 39.95) * 1000}%`, 
                left: `${30 + (task.coordinates.lng + 83.02) * 1000}%` 
              }}
              onClick={() => handleTaskClick(task.id)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <MapPin className="h-4 w-4 text-white" />
            </motion.div>
          ))}
          
          {/* Route line */}
          {isRoutePlanned && locationTasks.length > 1 && (
            <svg className="absolute inset-0 h-full w-full pointer-events-none">
              <path 
                d={locationTasks.map((task, i) => {
                  const x = 30 + (task.coordinates.lng + 83.02) * 1000;
                  const y = 20 + (task.coordinates.lat - 39.95) * 1000;
                  return `${i === 0 ? 'M' : 'L'}${x}% ${y}%`;
                }).join(' ')}
                stroke="#4C6EF5"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5,5"
                className={isRoutePlanned ? "opacity-100" : "opacity-0"}
                style={{ transition: "opacity 0.5s ease" }}
              />
            </svg>
          )}
          
          {/* Selected task info */}
          {selectedTaskId && (
            <motion.div 
              className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
            >
              {(() => {
                const task = locationTasks.find(t => t.id === selectedTaskId);
                return task ? (
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gloop-text-muted">{task.location}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gloop-text-muted">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      <Button size="sm" variant="outline" className="text-xs">
                        Get Directions
                      </Button>
                    </div>
                  </div>
                ) : null;
              })()}
            </motion.div>
          )}
        </div>
      ) : null}

      <div className="space-y-3">
        {locationTasks.map((task) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card 
              className={`hover:shadow-md transition-shadow cursor-pointer premium-card border-l-4 ${
                task.priority === 'high' ? 'priority-high' : 
                task.priority === 'medium' ? 'priority-medium' : 'priority-low'
              }`}
              onClick={() => handleTaskClick(task.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-gloop-text-muted" />
                      <p className="text-sm text-gloop-text-muted">
                        {task.location}
                      </p>
                    </div>
                    <p className="text-xs text-gloop-text-muted mt-1">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task.id);
                    }}
                  >
                    <MapIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <FloatingActionButton onClick={() => setCreateTaskModalOpen(true)} />
      
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <NavBar />
    </div>
  );
};

export default MapPage;
