import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TripCard from "@/components/TripCard";
import { useToast } from "@/hooks/use-toast";
import FloatingActionButton from "@/components/FloatingActionButton";
import CreateTripModal from "@/components/CreateTripModal";
import { Button } from "@/components/ui/button";
import { Search, Filter, Clock, CheckCircle, Store, ShoppingCart, Map, Calendar, Settings, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import QuickTripButton from "@/components/QuickTripButton";
import TripDetailModal from "@/components/TripDetailModal";
import { TripData, TripItem } from "@/components/TripDetailModal";
import { Badge } from "@/components/ui/badge";
import EditTripModal from "@/components/EditTripModal";
import TripCalendarView from '@/components/TripCalendarView';
import TripMapView from '@/components/TripMapView';
import { useTaskContext, Trip as ContextTrip } from "@/context/TaskContext";

const TripsPage = () => {
  // Use the shared context for trips and tasks
  const { 
    trips: contextTrips, 
    addTrip: addContextTrip, 
    updateTrip: updateContextTrip, 
    deleteTrip: deleteContextTrip, 
    syncTasksWithTrips 
  } = useTaskContext();
  
  const [activeTab, setActiveTab] = useState("active");
  const [isTripModalOpen, setTripModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [isTripDetailModalOpen, setTripDetailModalOpen] = useState(false);
  const [isEditTripModalOpen, setEditTripModalOpen] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  
  // Split trips into active and past based on status
  const [trips, setTrips] = useState<TripData[]>([]);
  const [pastTrips, setPastTrips] = useState<TripData[]>([]);
  
  const { toast } = useToast();
  
  // Filter trips based on search query
  const filteredActiveTrips = searchQuery 
    ? trips.filter(trip => 
        trip.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.shopper.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : trips;
  
  const filteredPastTrips = searchQuery
    ? pastTrips.filter(trip => 
        trip.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.shopper.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pastTrips;

  // Sync trips and tasks once on mount
  useEffect(() => {
    // Make sure tasks and trips are in sync
    syncTasksWithTrips();
  }, []); // Empty dependency array = only run on mount
  
  // Update local state when contextTrips changes
  useEffect(() => {
    // Convert context trips to TripData format
    const convertedTrips = contextTrips.map(trip => {
      // Create TripData object from ContextTrip
      return {
        id: trip.id,
        store: trip.store,
        shopper: trip.shopper || {
          name: "You",
          avatar: "https://example.com/you.jpg"
        },
        eta: trip.eta,
        status: trip.status,
        items: trip.items,
        participants: trip.participants
      } as TripData;
    });
    
    // Split trips into active and past
    setTrips(convertedTrips.filter(trip => trip.status !== 'completed'));
    setPastTrips(convertedTrips.filter(trip => trip.status === 'completed'));
  }, [contextTrips]); // Only depend on contextTrips
  
  // Create a new trip
  const handleCreateTrip = (data: { store: string; eta: string }) => {
    // Create a new trip with default values
    const newTrip: Omit<ContextTrip, 'id'> = {
      store: data.store,
      location: data.store,
      coordinates: { lat: 39.9650, lng: -83.0200 }, // Default coordinates
      eta: data.eta,
      status: 'open',
      items: [],
      participants: [
        { id: '1', name: 'You', avatar: "https://example.com/you.jpg" }
      ],
      shopper: {
        name: "You",
        avatar: "https://example.com/you.jpg"
      }
    };
    
    // Add trip to context
    addContextTrip(newTrip);
    
    toast({
      title: "Trip created!",
      description: `Your trip to ${data.store} has been created.`,
    });
    
    setTripModalOpen(false);
  };
  
  // Add an item to a trip
  const handleAddItem = (tripId: string, item: Omit<TripItem, 'id'>) => {
    // Find the trip in context
    const trip = contextTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Create a new item with ID
    const newItem = {
      ...item,
      id: Date.now().toString()
    };
    
    // Update the trip with the new item
    updateContextTrip(tripId, {
      items: [...trip.items, newItem]
    });
    
    toast({
      title: "Item added",
      description: `${item.name} added to your trip to ${trip.store}.`,
    });
  };
  
  // Remove an item from a trip
  const handleRemoveItem = (tripId: string, itemId: string) => {
    // Find the trip in context
    const trip = contextTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Remove the item
    updateContextTrip(tripId, {
      items: trip.items.filter(item => item.id !== itemId)
    });
    
    toast({
      title: "Item removed",
      description: "The item has been removed from your trip.",
    });
  };
  
  // Toggle an item's checked status
  const handleToggleItemCheck = (tripId: string, itemId: string) => {
    // Find the trip in context
    const trip = contextTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Toggle the item's checked status
    updateContextTrip(tripId, {
      items: trip.items.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    });
    
    // Find the item to show appropriate toast
    const item = trip.items.find(i => i.id === itemId);
    if (item) {
      toast({
        title: item.checked ? "Item unchecked" : "Item checked",
        description: `${item.name} ${item.checked ? "unchecked" : "checked"}.`,
      });
    }
  };
  
  // Handle clicking on a trip to view details
  const handleTripClick = (trip: TripData) => {
    setSelectedTrip(trip);
    setTripDetailModalOpen(true);
  };
  
  // Handle editing a trip
  const handleEditTrip = (trip: TripData) => {
    setSelectedTrip(trip);
    setEditTripModalOpen(true);
  };
  
  // Update a trip
  const handleUpdateTrip = (tripId: string, data: { store: string; eta: string }) => {
    // Find the trip in context
    const trip = contextTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Update the trip
    updateContextTrip(tripId, {
      store: data.store,
      location: data.store,
      eta: data.eta
    });
    
    toast({
      title: "Trip updated",
      description: `Your trip to ${data.store} has been updated.`,
    });
    
    // Update the selected trip if it's open
    if (selectedTrip && selectedTrip.id === tripId) {
      setSelectedTrip({
        ...selectedTrip,
        store: data.store,
        eta: data.eta
      });
    }
    
    setEditTripModalOpen(false);
  };
  
  // Complete a trip
  const handleCompleteTrip = (tripId: string) => {
    // Find the trip in context
    const trip = contextTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Check if all items are checked
    const allItemsChecked = trip.items.every(item => item.checked);
    
    if (!allItemsChecked) {
      // Ask for confirmation
      if (!window.confirm("Not all items are checked. Complete trip anyway?")) {
        return;
      }
    }
    
    // Update the trip status to completed
    updateContextTrip(tripId, {
      status: 'completed',
      eta: 'Completed'
    });
    
    toast({
      title: "Trip completed",
      description: `Your trip to ${trip.store} has been marked as completed.`,
    });
    
    // Close the detail modal if it's open
    setTripDetailModalOpen(false);
    
    // Move the trip from active to past
    const updatedTrip = contextTrips.find(t => t.id === tripId);
    if (updatedTrip) {
      setTrips(trips.filter(t => t.id !== tripId));
      setPastTrips([...pastTrips, {
        ...updatedTrip,
        status: 'completed',
        eta: 'Completed'
      } as TripData]);
    }
  };
  
  // Delete a trip
  const handleDeleteTrip = (tripId: string) => {
    // Find the trip in context
    const trip = contextTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Ask for confirmation
    if (!window.confirm(`Are you sure you want to delete your trip to ${trip.store}?`)) {
      return;
    }
    
    // Delete the trip from context
    deleteContextTrip(tripId);
    
    toast({
      title: "Trip deleted",
      description: `Your trip to ${trip.store} has been deleted.`,
    });
    
    // Close any open modals
    setTripDetailModalOpen(false);
    setEditTripModalOpen(false);
  };
  
  // Share a trip
  const handleShareTrip = (tripId: string) => {
    // Find the trip in context
    const trip = contextTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // In a real app, this would open a share dialog
    // For now, just show a toast
    toast({
      title: "Share trip",
      description: `Sharing your trip to ${trip.store} (feature coming soon).`,
    });
  };
  
  // Invite a participant to a trip
  const handleInviteParticipant = (tripId: string) => {
    // This would open an invite dialog in a real app
    toast({
      title: "Invite participant",
      description: "This feature is coming soon!",
    });
  };
  
  // Toggle search bar
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery("");
    }
  };
  
  // Filter trips
  const handleFilterTrips = () => {
    toast({
      title: "Filter trips",
      description: "This feature is coming soon!",
    });
    
    // In a real app, this would open a filter dialog
    // For now, just show a toast
  };
  
  // Show calendar view
  const handleCalendarView = () => {
    setShowCalendarView(true);
    setShowMapView(false);
    
    // This would show a calendar view of trips
  };
  
  // Show map view
  const handleMapView = () => {
    setShowMapView(true);
    setShowCalendarView(false);
    
    // This would show a map view of trips
  };
  
  // View trip calendar
  const handleViewTripCalendar = () => {
    setShowCalendarView(true);
    setShowMapView(false);
  };
  
  // View trip map
  const handleViewTripMap = () => {
    setShowMapView(true);
    setShowCalendarView(false);
  };
  
  // Trip settings
  const handleTripSettings = () => {
    toast({
      title: "Trip settings",
      description: "This feature is coming soon!",
    });
  };
  
  return (
    <div className="pb-20">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">Trips</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSearch}
            className="rounded-full"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleFilterTrips}
            className="rounded-full"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCalendarView}
            className="rounded-full"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleMapView}
            className="rounded-full"
          >
            <Map className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {showSearch && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="px-4 mb-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trips..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full rounded-l-none"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
      
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <div className="px-4">
          <TabsList className="grid grid-cols-2 mb-4 w-full">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Active
              {trips.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {trips.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Past
              {pastTrips.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pastTrips.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === "active" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="active" className="px-4">
              <div className="space-y-3">
                {filteredActiveTrips.length > 0 ? (
                  filteredActiveTrips.map((trip) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="hover-lift"
                    >
                      <TripCard
                        trip={{
                          id: trip.id,
                          store: trip.store,
                          shopper: trip.shopper,
                          eta: trip.eta,
                          itemCount: trip.items.length,
                          status: trip.status
                        }}
                        onClick={() => handleTripClick(trip)}
                        onEdit={() => handleEditTrip(trip)}
                        onAddItem={() => handleTripClick(trip)}
                        onComplete={() => handleCompleteTrip(trip.id)}
                        onDelete={() => handleDeleteTrip(trip.id)}
                        onShare={() => handleShareTrip(trip.id)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-white dark:bg-gloop-dark-surface premium-card">
                    <p className="text-gloop-text-muted dark:text-gloop-dark-text-muted">
                      {searchQuery ? "No matching trips found" : "No active trips"}
                    </p>
                    <p className="text-sm mt-2">Announce a trip to start shopping!</p>
                    <Button 
                      className="mt-2 premium-gradient-btn"
                      onClick={() => setTripModalOpen(true)}
                    >
                      Create a Trip
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="past" className="px-4">
              <div className="space-y-3">
                {filteredPastTrips.length > 0 ? (
                  filteredPastTrips.map((trip) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="hover-lift"
                    >
                      <TripCard
                        trip={{
                          id: trip.id,
                          store: trip.store,
                          shopper: trip.shopper,
                          eta: trip.eta,
                          itemCount: trip.items.length,
                          status: trip.status
                        }}
                        onClick={() => handleTripClick(trip)}
                        onEdit={() => handleEditTrip(trip)}
                        onAddItem={() => handleTripClick(trip)}
                        onComplete={() => handleCompleteTrip(trip.id)}
                        onDelete={() => handleDeleteTrip(trip.id)}
                        onShare={() => handleShareTrip(trip.id)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-white dark:bg-gloop-dark-surface premium-card">
                    <p className="text-gloop-text-muted dark:text-gloop-dark-text-muted">
                      {searchQuery ? "No matching past trips found" : "No past trips yet"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      <QuickTripButton onCreateTrip={handleCreateTrip} />
      
      <CreateTripModal
        isOpen={isTripModalOpen}
        onClose={() => setTripModalOpen(false)}
        onSubmit={handleCreateTrip}
      />
      
      <TripDetailModal
        isOpen={isTripDetailModalOpen}
        onClose={() => setTripDetailModalOpen(false)}
        trip={selectedTrip}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onToggleItemCheck={handleToggleItemCheck}
        onInviteParticipant={handleInviteParticipant}
        onCompleteTrip={handleCompleteTrip}
      />
      
      <EditTripModal
        isOpen={isEditTripModalOpen}
        onClose={() => setEditTripModalOpen(false)}
        onSubmit={handleUpdateTrip}
        trip={selectedTrip}
      />
      
      <AnimatePresence>
        {showCalendarView && (
          <TripCalendarView
            trips={[...trips, ...pastTrips]}
            onTripClick={handleTripClick}
            onClose={() => setShowCalendarView(false)}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showMapView && !showCalendarView && (
          <TripMapView
            trips={[...trips, ...pastTrips]}
            onTripClick={handleTripClick}
            onClose={() => setShowMapView(false)}
          />
        )}
      </AnimatePresence>
      
      <Button 
        variant="outline" 
        size="icon"
        className="fixed bottom-24 left-6 h-12 w-12 rounded-full shadow-lg bg-white dark:bg-gloop-dark-surface"
        onClick={handleTripSettings}
      >
        <Settings className="h-5 w-5 text-gloop-primary" />
      </Button>

      <NavBar />
    </div>
  );
};

export default TripsPage;
