import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarDays,
  Check,
  ChevronRight,
  ListTodo,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Split,
  Store,
  Tag,
  Users,
  Calculator,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useMemo } from "react"
import { AppLayout } from "@/components/AppLayout"
import TripCalendarView from "@/components/TripCalendarView"
import BudgetAdjustmentDialog from "@/components/BudgetAdjustmentDialog"
import { useTaskContext } from "@/context/TaskContext"
import NewTripDialog from "@/components/NewTripDialog"
import { AddTripDialog } from "@/components/AddTripDialog"
import TripDetailModal, { TripData } from "@/components/TripDetailModal"
import { usePantry, PantryItem } from "@/context/PantryContext"

// Add these helper functions at the top level
async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

async function findNearbyStores(location: { lat: number; lng: number }): Promise<Array<{ name: string; distance: number; location: { lat: number; lng: number } }>> {
  // In a real app, you would use a Places API call here
  // For now, we'll simulate some nearby stores with calculated distances
  const stores = [
    { name: "Whole Foods Market", location: { lat: location.lat + 0.01, lng: location.lng + 0.01 } },
    { name: "Trader Joe's", location: { lat: location.lat - 0.01, lng: location.lng + 0.02 } },
    { name: "Costco", location: { lat: location.lat + 0.02, lng: location.lng - 0.01 } }
  ];

  return stores.map(store => ({
    ...store,
    distance: calculateDistance(location, store.location)
  })).sort((a, b) => a.distance - b.distance);
}

function calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const lat1 = point1.lat * Math.PI / 180;
  const lat2 = point2.lat * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}

function buildGoogleMapsUrl(userLocation: { lat: number; lng: number }, stores: Array<{ name: string; coordinates: { lat: number; lng: number } }>) {
  const origin = `${userLocation.lat},${userLocation.lng}`;
  const destinations = stores.map(store => `${store.coordinates.lat},${store.coordinates.lng}`).join('|');
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${stores[0].coordinates.lat},${stores[0].coordinates.lng}&waypoints=${destinations}`;
}

export default function TripsPage() {
  const navigate = useNavigate();
  const { trips: contextTrips } = useTaskContext();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedItems, setCheckedItems] = useState({
    item1: false,
    item2: false,
    item3: false,
    item4: false
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(500);
  const { updateBudget } = useTaskContext();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyStores, setNearbyStores] = useState<Array<{ 
    name: string; 
    distance: number; 
    coordinates: { lat: number; lng: number };
    tripId: string;
  }>>([]);
  const [isAddTripDialogOpen, setIsAddTripDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { pantryItems } = usePantry();

  // Filter trips based on status and search query
  const activeTrips = useMemo(() => 
    contextTrips.filter(trip => 
      trip.status !== 'completed' && trip.status !== 'cancelled' &&
      (searchQuery ? trip.store.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    ),
    [contextTrips, searchQuery]
  );

  const completedTrips = contextTrips.filter(trip => 
    (trip.status === 'completed' || trip.status === 'cancelled') &&
    (searchQuery ? trip.store.toLowerCase().includes(searchQuery.toLowerCase()) : true)
  );

  const getLocation = (highAccuracy = false) => {
    setIsLoadingLocation(true);
    setLocationError(null);

    const options = {
      enableHighAccuracy: highAccuracy,
      timeout: highAccuracy ? 15000 : 5000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        if (!highAccuracy) {
          // If low accuracy fails, try high accuracy
          getLocation(true);
          return;
        }

        let message = "Could not get your current location. Please enable location services in your browser settings.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access was denied. Please enable it in your browser settings to use location-based features.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your location information is currently unavailable. Please check your device's location services or try again.";
        } else if (error.code === error.TIMEOUT) {
          message = "Request for your location timed out. Please try again.";
        }
        
        console.error('Error getting location:', error);
        setLocationError(message);
        setIsLoadingLocation(false);
      },
      options
    );
  };

  // Get user location on mount
  useEffect(() => {
    getLocation();
  }, []);

  // Update nearby stores when location or trips change
  useEffect(() => {
    if (!userLocation) return;

    // Get unique stores from active trips
    const uniqueStores = activeTrips.reduce((acc, trip) => {
      if (trip.coordinates && !acc.some(s => s.name === trip.store)) {
        acc.push({
          name: trip.store,
          coordinates: trip.coordinates,
          tripId: trip.id,
          distance: calculateDistance(userLocation, trip.coordinates)
        });
      }
      return acc;
    }, [] as typeof nearbyStores);

    // Sort by distance
    const sortedStores = uniqueStores.sort((a, b) => a.distance - b.distance);
    setNearbyStores(sortedStores);
  }, [userLocation, activeTrips]);

  // Handle checkbox changes
  const handleCheckboxChange = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId as keyof typeof prev]
    }));
  };

  // Handler for "Schedule" button
  const handleSchedule = () => {
    setIsCalendarOpen(true);
  };

  // Handler for "New Trip" button
  const handleNewTrip = () => {
    setIsAddTripDialogOpen(true);
  };

  // Handler for "View Calendar" button
  const handleViewCalendar = () => {
    setIsCalendarOpen(true);
  };

  // Handler for "Adjust Budget" button
  const handleAdjustBudget = () => {
    setIsBudgetDialogOpen(true);
  };
  
  // Update the handleViewOnMap function
  const handleViewOnMap = () => {
    if (locationError) {
      return;
    }
    if (!userLocation || nearbyStores.length === 0) {
      return;
    }

    const mapsUrl = buildGoogleMapsUrl(userLocation, nearbyStores);
    window.open(mapsUrl, '_blank');
  };

  // Handler for search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handler for "View all items" button
  const handleViewAllItems = () => {
    // This would typically expand the list or navigate to a detailed view
    // Navigate to trips page with expanded view or open a dedicated items modal
    navigate("/trips?view=all-items");
  };

  // Handler for "Directions" button
  const handleGetDirections = () => {
    // This would typically open a map with directions
    navigate("/map");
  };

  // Handler for "Start Trip" button
  const handleStartTrip = (tripId?: string) => {
    if (tripId) {
      // Find the trip in context
      const trip = contextTrips.find(t => t.id === tripId);
      if (trip) {
        // Update the trip status to "shopping"
        const updatedTrip = {
          ...trip,
          status: 'shopping' as const
        };
        
        // Navigate to the trip detail page
        navigate(`/trip/${tripId}`);
      }
    }
  };

  // Handler for "View Details" button
  const handleViewDetails = (tripId: string) => {
    const trip = contextTrips.find(t => t.id === tripId);
    if (trip) {
      setSelectedTrip(trip as unknown as TripData);
      setIsDetailModalOpen(true);
    }
  };

  // Handler for "Load More" button
  const handleLoadMore = () => {
    // Implement pagination for completed trips
    const currentCount = completedTrips.length;
    const increment = 10; // Load 10 more trips at a time
    
    // In a real app, this would fetch more data from the server
    // For now, we'll just show a message since we're using static data
    
    // Future implementation would update state to show more trips
    // setDisplayLimit(prev => prev + increment);
  };

  // Handler for "Create New Trip" button in drafts tab
  const handleCreateNewTrip = () => {
    setIsAddTripDialogOpen(true);
  };

  // Handler for mobile nav buttons
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Add budget save handler
  const handleSaveBudget = (newBudget: number) => {
    setMonthlyBudget(newBudget);
    updateBudget(newBudget);
  };

  // Update the stores card to show actual distances
  const renderStoresList = () => (
    <div className="space-y-2">
      {isLoadingLocation ? (
        <div className="text-center py-3">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-xs text-slate-500 mt-1">Finding nearby stores...</p>
        </div>
      ) : !userLocation ? (
        <div className="text-center py-3">
          <p className="text-xs text-slate-500">Location services not available</p>
        </div>
      ) : nearbyStores.length > 0 ? (
        nearbyStores.slice(0, 3).map((store, index) => (
          <div key={store.tripId} className="flex justify-between items-center py-1 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
            <div className="flex items-center gap-1.5">
              <Store className="h-3 w-3 text-slate-500" />
              <span className="text-xs text-slate-700 truncate">{store.name}</span>
            </div>
            <span className="text-xs text-slate-500">
              {store.distance < 1 
                ? `${(store.distance * 1000).toFixed(0)}m` 
                : `${store.distance.toFixed(1)}km`}
            </span>
          </div>
        ))
      ) : (
        <div className="text-center py-3">
          <p className="text-xs text-slate-500">No stores in your trips</p>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="p-4 md:p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-slide-down">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Shopping Trips</h1>
              <p className="text-slate-500 dark:text-slate-400">Plan and manage your shopping trips</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-slate-200 dark:border-slate-600 dark:text-slate-300 hover:scale-105 transition-transform duration-200"
                onClick={handleSchedule}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Schedule
              </Button>
              <Button 
                className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 hover:scale-105 transition-transform duration-200"
                onClick={handleNewTrip}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Trip
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-slide-up">
            <Card className="border-none shadow-sm dark:bg-slate-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-base dark:text-slate-200">Upcoming Trips</CardTitle>
                <CardDescription className="text-sm dark:text-slate-400">You have {activeTrips.length} trips scheduled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm animate-fade-in">
                  <span className="text-slate-700 dark:text-slate-300">This week</span>
                  <span className="text-slate-500 dark:text-slate-400">{activeTrips.filter(trip => {
                    const tripDate = new Date(trip.date);
                    const today = new Date();
                    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return tripDate >= today && tripDate <= weekFromNow;
                  }).length} trips</span>
                </div>
                <div className="flex items-center justify-between text-sm animate-fade-in" style={{animationDelay: '100ms'}}>
                  <span className="text-slate-700 dark:text-slate-300">Next week</span>
                  <span className="text-slate-500 dark:text-slate-400">{activeTrips.filter(trip => {
                    const tripDate = new Date(trip.date);
                    const nextWeekStart = new Date();
                    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
                    const nextWeekEnd = new Date();
                    nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);
                    return tripDate >= nextWeekStart && tripDate <= nextWeekEnd;
                  }).length} trips</span>
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Button 
                  variant="outline" 
                  className="w-full border-slate-200 dark:border-slate-700 dark:text-slate-300 h-8 text-sm hover:scale-105 transition-transform duration-200" 
                  onClick={handleViewCalendar}
                >
                  <CalendarDays className="h-3 w-3 mr-2" />
                  View Calendar
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-none shadow-sm dark:bg-slate-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-base dark:text-slate-200">Budget Overview</CardTitle>
                <CardDescription className="text-sm dark:text-slate-400">May spending across all trips</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm animate-fade-in">
                  <span className="text-slate-700 dark:text-slate-300">Spent so far</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">$289.45</span>
                </div>
                <div className="flex items-center justify-between text-sm animate-fade-in" style={{animationDelay: '100ms'}}>
                  <span className="text-slate-700 dark:text-slate-300">Monthly budget</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">${monthlyBudget.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm animate-fade-in" style={{animationDelay: '200ms'}}>
                  <span className="text-slate-700 dark:text-slate-300">Remaining</span>
                  <span className="font-medium text-green-600 dark:text-green-400">${(monthlyBudget - 289.45).toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Button 
                  variant="outline" 
                  className="w-full border-slate-200 dark:border-slate-700 dark:text-slate-300 h-8 text-sm hover:scale-105 transition-transform duration-200" 
                  onClick={handleAdjustBudget}
                >
                  <Calculator className="h-3 w-3 mr-2" />
                  Adjust Budget
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-none shadow-sm dark:bg-slate-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="text-base dark:text-slate-200">Nearby Stores</CardTitle>
                <CardDescription className="text-sm dark:text-slate-400">Sorted by distance from your location</CardDescription>
              </CardHeader>
              <CardContent className="min-h-[80px]">
                {renderStoresList()}
              </CardContent>
              <CardFooter className="pt-3">
                <Button 
                  variant="outline" 
                  className="w-full border-slate-200 dark:border-slate-700 dark:text-slate-300 h-8 text-sm hover:scale-105 transition-transform duration-200" 
                  onClick={handleViewOnMap}
                  disabled={isLoadingLocation || !userLocation || nearbyStores.length === 0}
                >
                  <MapPin className="h-3 w-3 mr-2" />
                  {isLoadingLocation 
                    ? 'Getting Location...' 
                    : !userLocation 
                      ? 'Location Not Available'
                      : nearbyStores.length === 0
                        ? 'No Stores to Show'
                        : 'View on Map'}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Trips Tabs */}
          <Tabs defaultValue="active" className="w-full animate-fade-in" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
              <TabsList className="w-full md:w-auto dark:bg-slate-800">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input 
                  type="search" 
                  placeholder="Search trips..." 
                  className="pl-9 w-full md:w-[300px] dark:bg-slate-800 dark:border-slate-700" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <TabsContent value="active" className="space-y-4">
              {activeTrips.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {activeTrips.map((trip, index) => (
                    <Card key={trip.id} className="cursor-pointer hover:shadow-md transition-all duration-300 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 hover:scale-105 animate-slide-in" style={{animationDelay: `${index * 100}ms`}} onClick={() => handleViewDetails(trip.id)}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base font-semibold dark:text-slate-200">{trip.store}</CardTitle>
                            <CardDescription className="text-xs text-slate-600 dark:text-slate-400">{new Date(trip.date).toLocaleDateString()} at {trip.time}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={trip.status === 'shopping' ? "default" : "outline"} className="text-xs">{trip.status}</Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 hover:scale-110 transition-transform duration-200" 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleStartTrip(trip.id);
                              }}
                              title="Start shopping"
                            >
                              <ShoppingBag className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                <span>{(trip.participants || []).length}</span>
                              </div>
                              <div className="flex items-center">
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                <span>{trip.items.length}</span>
                              </div>
                              {trip.budget && (
                                <div className="flex items-center">
                                  <span className="text-green-600 dark:text-green-400">${trip.budget.toFixed(0)}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-green-600 font-medium dark:text-green-400">
                              {trip.items.filter(i => i.checked).length}/{trip.items.length}
                            </span>
                          </div>
                          
                          {/* Compact Progress bar */}
                          {trip.items.length > 0 && (
                            <Progress value={(trip.items.filter(i => i.checked).length / trip.items.length) * 100} className="h-1" />
                          )}

                          {/* Show first few items in a more compact way */}
                          {trip.items.length > 0 && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Items: </span>
                              {trip.items.slice(0, 3).map((item, index) => (
                                <span key={item.id} className={item.checked ? 'line-through text-gray-400 dark:text-gray-500' : ''}>
                                  {item.name}{index < Math.min(2, trip.items.length - 1) ? ', ' : ''}
                                </span>
                              ))}
                              {trip.items.length > 3 && <span className="text-gray-400 dark:text-gray-500"> +{trip.items.length - 3} more</span>}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center pt-1 pb-2">
                        <div className="flex -space-x-1">
                          {(trip.participants || []).slice(0, 2).map(p => (
                            <Avatar key={p.id} className="h-5 w-5 border border-background">
                              <AvatarImage src={p.avatar} />
                              <AvatarFallback className="text-xs">{p.name[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                          {(trip.participants || []).length > 2 && (
                            <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 border border-background flex items-center justify-center">
                              <span className="text-xs text-gray-600 dark:text-gray-400">+{(trip.participants || []).length - 2}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs hover:scale-105 transition-transform duration-200" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              navigate(`/trip/${trip.id}`);
                            }}
                          >
                            Open
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 px-2 text-xs hover:scale-105 transition-transform duration-200" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleGetDirections();
                            }}
                          >
                            Directions
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 animate-fade-in">
                  <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">No active trips</p>
                  <Button onClick={() => setIsAddTripDialogOpen(true)} className="h-8 text-sm hover:scale-105 transition-transform duration-200">
                    <Plus className="h-3 w-3 mr-2" />
                    Create New Trip
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedTrips.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {completedTrips.map((trip, index) => (
                    <Card key={trip.id} className="cursor-pointer hover:shadow-md transition-all duration-300 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 hover:scale-105 animate-slide-in" style={{animationDelay: `${index * 100}ms`}} onClick={() => handleViewDetails(trip.id)}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-base font-semibold dark:text-slate-200">{trip.store}</CardTitle>
                            <CardDescription className="text-xs text-slate-600 dark:text-slate-400">{new Date(trip.date).toLocaleDateString()} at {trip.time}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="text-xs">{trip.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                <span>{(trip.participants || []).length}</span>
                              </div>
                              <div className="flex items-center">
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                <span>{trip.items.length}</span>
                              </div>
                              {trip.actualSpent && (
                                <div className="flex items-center">
                                  <span className="text-green-600 font-medium dark:text-green-400">${trip.actualSpent.toFixed(0)}</span>
                                </div>
                              )}
                            </div>
                            <span className="text-green-600 font-medium dark:text-green-400">
                              {trip.items.filter(i => i.checked).length}/{trip.items.length} completed
                            </span>
                          </div>

                          {/* Show purchased items in a compact way */}
                          {trip.items.length > 0 && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Purchased: </span>
                              {trip.items.filter(i => i.checked).slice(0, 3).map((item, index, arr) => (
                                <span key={item.id}>
                                  {item.name}{item.price ? ` ($${item.price.toFixed(2)})` : ''}{index < arr.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                              {trip.items.filter(i => i.checked).length > 3 && (
                                <span className="text-gray-400 dark:text-gray-500"> +{trip.items.filter(i => i.checked).length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center pt-1 pb-2">
                        <div className="flex -space-x-1">
                          {(trip.participants || []).slice(0, 2).map(p => (
                            <Avatar key={p.id} className="h-5 w-5 border border-background">
                              <AvatarImage src={p.avatar} />
                              <AvatarFallback className="text-xs">{p.name[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                          {(trip.participants || []).length > 2 && (
                            <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 border border-background flex items-center justify-center">
                              <span className="text-xs text-gray-600 dark:text-gray-400">+{(trip.participants || []).length - 2}</span>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs hover:scale-105 transition-transform duration-200" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(`/trip/${trip.id}`);
                          }}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 animate-fade-in">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No completed trips</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <TripCalendarView 
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
        />
        
        <BudgetAdjustmentDialog
          isOpen={isBudgetDialogOpen}
          onClose={() => setIsBudgetDialogOpen(false)}
          currentBudget={monthlyBudget}
          onSave={handleSaveBudget}
        />

        <AddTripDialog
          open={isAddTripDialogOpen}
          onOpenChange={setIsAddTripDialogOpen}
        />

        {selectedTrip && (
          <TripDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            trip={selectedTrip}
            onAddItem={() => {}}
            onRemoveItem={() => {}}
            onToggleItemCheck={() => {}}
            onInviteParticipant={() => {}}
            onCompleteTrip={() => {}}
          />
        )}
      </div>
    </AppLayout>
  );
} 