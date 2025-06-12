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
  const { tasks } = useTaskContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(2);
  const [showRoutePreferences, setShowRoutePreferences] = useState(false);
  const [routePreferences, setRoutePreferences] = useState<RoutePreferences>({
    avoidHighways: false,
    avoidTolls: false,
    transportMode: 'DRIVING',
    returnToStart: true,
    considerTraffic: true,
    maxStops: undefined
  });

  return (
    <AppLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Map</h1>
            <p className="text-slate-500">Find and optimize your route for tasks</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with locations */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Nearby Tasks</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  {tasks.filter(task => 
                    task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    task.location.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {tasks.filter(task => 
                        task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        task.location.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((task, index) => (
                        <div key={task.id} className="p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <div className="flex justify-center items-center w-full h-full font-medium text-slate-700">{index + 1}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-slate-800 truncate">{task.title}</h3>
                              </div>
                              <p className="text-xs text-slate-500 truncate mt-1">{task.location}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-medium text-teal-600">
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No tasks found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search</p>
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