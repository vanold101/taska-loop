
import { useState } from "react";
import NavBar from "@/components/NavBar";
import FloatingActionButton from "@/components/FloatingActionButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, List, Navigation } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CreateTaskModal from "@/components/CreateTaskModal";

// Mock tasks with location data
const mockLocationTasks = [
  {
    id: '1',
    title: 'Pick up dry cleaning',
    dueDate: '2025-05-05',
    location: 'Downtown Cleaners',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Return library books',
    dueDate: '2025-05-08',
    location: 'Columbus Public Library',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Get groceries from Trader Joe\'s',
    dueDate: '2025-05-02',
    location: 'Trader Joe\'s',
    priority: 'high',
  }
];

const MapPage = () => {
  const [isCreateTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { toast } = useToast();

  const handleCreateTask = (data: { title: string; dueDate: string }) => {
    toast({
      title: "Task created!",
      description: `Your task "${data.title}" has been created.`,
    });
    setCreateTaskModalOpen(false);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'map' ? 'list' : 'map');
  };

  const handleShowRoute = () => {
    toast({
      title: "Generating optimal route",
      description: "Finding the best path for your tasks",
    });
  };

  return (
    <div className="pb-20 pt-6 px-4 max-w-md mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks Map</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
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
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleShowRoute}
        >
          <Navigation className="h-4 w-4" />
          <span>Show Optimal Route</span>
        </Button>
      </div>

      {viewMode === 'map' ? (
        <div className="bg-slate-200 rounded-lg h-96 flex items-center justify-center mb-4">
          <p className="text-slate-500">Map will be displayed here</p>
        </div>
      ) : null}

      <div className="space-y-3">
        {mockLocationTasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gloop-text-muted">
                    {task.location}
                  </p>
                  <p className="text-xs text-gloop-text-muted">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className={`h-3 w-3 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' : 
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
              </div>
            </CardContent>
          </Card>
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
