import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MapPin, Route, Navigation, Trash2, Plus, Search, ShoppingCart, X, SlidersHorizontal, Calendar, Store } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { useTaskContext } from "../context/TaskContext";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AppLayout } from "../components/AppLayout";
import { calculateOptimalRoute } from '../utils/routeOptimization';
import { RoutePreferences, StopTimeWindow, OptimizedRoute } from '../types/routing';
import MapComponent from "../components/MapComponent";

export default function MapPage() {
  const { toast } = useToast();
  const { tasks, trips } = useTaskContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(2);
  const [showRoutePreferences, setShowRoutePreferences] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all", "tasks", "trips"
  const [routePreferences, setRoutePreferences] = useState<RoutePreferences>({
    avoidHighways: false,
    avoidTolls: false,
    transportMode: 'DRIVING',
    returnToStart: true,
    considerTraffic: true,
    maxStops: undefined
  });

  // Filter tasks and trips based on search
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    task.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTrips = trips.filter(trip => 
    trip.store.toLowerCase().includes(searchQuery.toLowerCase()) &&
    trip.status !== 'completed' && trip.status !== 'cancelled'
  );

  // Combine tasks and trips for display
  const allLocations = [
    ...filteredTasks.map(task => ({ ...task, type: 'task' as const })),
    ...filteredTrips.map(trip => ({ ...trip, type: 'trip' as const, title: `Trip to ${trip.store}`, location: trip.store }))
  ];

  const displayItems = activeTab === 'tasks' ? filteredTasks.map(task => ({ ...task, type: 'task' as const })) :
                      activeTab === 'trips' ? filteredTrips.map(trip => ({ ...trip, type: 'trip' as const, title: `Trip to ${trip.store}`, location: trip.store })) :
                      allLocations;

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Map</h1>
            <p className="text-slate-500">Find and optimize your route for tasks and shopping trips</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with locations */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Locations</CardTitle>
                </div>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>
                {/* Filter tabs */}
                <div className="flex gap-1 mt-2">
                  <Button
                    variant={activeTab === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("all")}
                    className="text-xs h-7"
                  >
                    All ({allLocations.length})
                  </Button>
                  <Button
                    variant={activeTab === "tasks" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("tasks")}
                    className="text-xs h-7"
                  >
                    Tasks ({filteredTasks.length})
                  </Button>
                  <Button
                    variant={activeTab === "trips" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("trips")}
                    className="text-xs h-7"
                  >
                    Trips ({filteredTrips.length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  {displayItems.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {displayItems.map((item, index) => (
                        <div key={`${item.type}-${item.id}`} className="p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                              {item.type === 'task' ? (
                                <div className="flex justify-center items-center w-full h-full font-medium text-slate-700">{index + 1}</div>
                              ) : (
                                <ShoppingCart className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-slate-800 truncate">{item.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  item.type === 'task' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {item.type === 'task' ? 'Task' : 'Trip'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate mt-1">{item.location}</p>
                              <div className="flex items-center justify-between mt-2">
                                {item.type === 'task' ? (
                                  <span className="text-xs font-medium text-teal-600">
                                    {(item as any).priority}
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-blue-600">
                                    {(item as any).items?.length || 0} items
                                  </span>
                                )}
                                {item.type === 'task' && (item as any).dueDate && (
                                  <span className="text-xs text-slate-400">
                                    {format(new Date((item as any).dueDate), 'MMM d')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No locations found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search or create new tasks/trips</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Map component */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-none shadow-sm overflow-hidden">
              <div className="relative w-full h-[calc(100vh-200px)]">
                <MapComponent />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 