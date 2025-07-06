import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, MapPin, ShoppingCart, Route } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { AppLayout } from '../components/AppLayout';
import MapComponent from '../components/MapComponent';
import { CreateTaskModal } from '../components/CreateTaskModal';
import CreateTripModal from '../components/CreateTripModal';

export default function MapPage() {
  const { tasks, trips, addTask, addTrip } = useTaskContext();
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false);

  // Count items with coordinates
  const tasksWithCoordinates = tasks.filter(task => task.coordinates).length;
  const tripsWithCoordinates = trips.filter(trip => trip.coordinates && trip.status !== 'completed' && trip.status !== 'cancelled').length;
  const totalLocations = tasksWithCoordinates + tripsWithCoordinates + 1; // +1 for user location

  const handleCreateTask = (taskData: any) => {
    addTask(taskData);
    console.log("Task created:", taskData);
    setIsCreateTaskModalOpen(false);
  };

  const handleCreateTrip = (tripData: { store: string; eta: string; date: string; coordinates: { lat: number; lng: number } }) => {
    addTrip({
      store: tripData.store,
      location: tripData.store,
      coordinates: tripData.coordinates,
      eta: tripData.eta,
      date: tripData.date,
      participants: [],
      shopper: { name: "You", avatar: "https://example.com/avatar.jpg" },
      items: []
    });
    console.log("Trip created:", tripData);
    setIsCreateTripModalOpen(false);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Map & Routes
            </h1>
            <p className="text-slate-500">
              View your tasks and trips on the map, and optimize your routes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setIsCreateTripModalOpen(true)}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              New Trip
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsCreateTaskModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total Locations</p>
                  <p className="text-2xl font-bold">{totalLocations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Route className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tasks</p>
                  <p className="text-2xl font-bold">{tasksWithCoordinates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Trips</p>
                  <p className="text-2xl font-bold">{tripsWithCoordinates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {totalLocations === 0 ? (
          /* Empty state */
          <Card className="border-none shadow-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No locations to display</h3>
                <p className="text-slate-500 mb-6">
                  Add tasks with locations or create shopping trips to see them on the map
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={() => setIsCreateTaskModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                  <Button onClick={() => setIsCreateTripModalOpen(true)}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Create Trip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Main map display - MapComponent already has the locations sidebar */
          <div className="w-full h-[600px]">
            <MapComponent />
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={isCreateTripModalOpen}
        onClose={() => setIsCreateTripModalOpen(false)}
        onSubmit={handleCreateTrip}
      />
    </AppLayout>
  );
} 