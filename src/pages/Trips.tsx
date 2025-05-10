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
import { useNavigate } from "react-router-dom";
import { createSettlementTransaction, createPaymentTransaction, confirmPayment } from "@/services/LedgerService";
import { calculateSplitAmounts, loadSplitConfig } from "@/services/CostSplitService";

const TripsPage = () => {
  // Use the shared context for trips and tasks
  const { 
    trips: contextTrips, 
    addTrip: addContextTrip, 
    updateTrip: updateContextTrip, 
    deleteTrip: deleteContextTrip, 
    syncTasksWithTrips 
  } = useTaskContext();
  
  const navigate = useNavigate();
  
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
    
    // Update the selectedTrip if it's the same trip
    if (selectedTrip && selectedTrip.id === tripId) {
      setSelectedTrip({
        ...selectedTrip,
        items: [...selectedTrip.items, newItem]
      });
    }
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
    
    // Update the selectedTrip if it's the same trip
    if (selectedTrip && selectedTrip.id === tripId) {
      setSelectedTrip({
        ...selectedTrip,
        items: selectedTrip.items.filter(item => item.id !== itemId)
      });
    }
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
    
    // Update the selectedTrip if it's the same trip
    if (selectedTrip && selectedTrip.id === tripId) {
      setSelectedTrip({
        ...selectedTrip,
        items: selectedTrip.items.map(item => 
          item.id === itemId ? { ...item, checked: !item.checked } : item
        )
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
    
    // Calculate the total cost of the trip
    const totalCost = trip.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    
    // Calculate the split amounts based on configured item splits
    const splitSummary = calculateSplitAmounts(tripId, trip.items, trip.participants);
    
    // Get the current user's info
    const currentUser = trip.participants.find(p => p.name === "You");
    
    if (currentUser && totalCost > 0) {
      // Create ledger transactions for each participant who owes money
      splitSummary.forEach(split => {
        // Skip the current user (we don't create a transaction from self to self)
        if (split.userId === currentUser.id) return;
        
        // Only create transactions for amounts greater than zero
        if (split.totalAmount > 0) {
          // Create a settlement transaction in the ledger
          // This represents that the participant owes money to the shopper
          createSettlementTransaction(
            tripId,
            trip.store,
            split.userId,      // From: The participant who owes money
            split.userName,
            currentUser.id,    // To: The current user who paid
            currentUser.name,
            split.totalAmount
          );
          
          // Show a toast to let the user know expense was recorded
          toast({
            title: "Expense recorded",
            description: `${split.userName} owes you $${split.totalAmount.toFixed(2)} for items in this trip`
          });
        }
      });
    }
    
    // Update the trip status to completed
    updateContextTrip(tripId, {
      status: 'completed',
      eta: 'Completed'
    });
    
    // Close the detail modal if it's open
    setTripDetailModalOpen(false);
    
    // Note: We don't need to manually update the local state here
    // The useEffect that watches contextTrips will handle moving the trip
    // from active to past when the context is updated
  };
  
  // Reactivate a completed trip
  const handleReactivateTrip = (tripId: string) => {
    // Find the trip in context
    const trip = contextTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Update the trip status back to open
    updateContextTrip(tripId, {
      status: 'open',
      eta: 'Reactivated'
    });
    
    // Close the detail modal if it's open
    setTripDetailModalOpen(false);
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
  };
  
  // Invite a participant to a trip
  const handleInviteParticipant = (tripId: string) => {
    // This would open an invite dialog in a real app
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
    // In a real app, this would open a filter dialog
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
  };
  
  // View trip map
  const handleViewTripMap = () => {
    setShowMapView(true);
  };
  
  // Update an item's price
  const handleUpdateItemPrice = (tripId: string, itemId: string, price: number) => {
    // Find the trip in context
    const trip = contextTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Update the item's price
    updateContextTrip(tripId, {
      items: trip.items.map(item => 
        item.id === itemId ? { ...item, price: price } : item
      )
    });
    
    // Update the selectedTrip if it's the same trip
    if (selectedTrip && selectedTrip.id === tripId) {
      setSelectedTrip({
        ...selectedTrip,
        items: selectedTrip.items.map(item => 
          item.id === itemId ? { ...item, price: price } : item
        )
      });
    }
  };
  
  // Settle up with a participant
  const handleSettleUp = (amount: number, toUserId: string, fromUserId: string) => {
    // Find the participants
    const toParticipant = contextTrips.find(t => t.id === selectedTrip?.id)?.participants.find(p => p.id === toUserId);
    const fromParticipant = contextTrips.find(t => t.id === selectedTrip?.id)?.participants.find(p => p.id === fromUserId);
    
    if (!toParticipant || !fromParticipant) {
      console.error("Could not find participants for settlement");
      return;
    }
    
    // Create and immediately confirm a payment transaction
    const transaction = createPaymentTransaction(
      fromParticipant.name,  // From user making the payment
      fromParticipant.name,
      toParticipant.id,      // To user receiving the payment
      toParticipant.name,
      amount,
      `Payment for trip to ${selectedTrip?.store || 'store'}`
    );
    
    // Confirm the payment immediately
    confirmPayment(transaction.id);
    
    // Navigate to the ledger page to see the updated balances
    navigate('/ledger');
    
    // Show a toast notification
    toast({
      title: "Payment recorded",
      description: `Your payment of $${amount.toFixed(2)} to ${toParticipant.name} has been recorded in the ledger.`
    });
  };
  
  // Trip settings
  const handleTripSettings = () => {
    // In a real app, this would open a settings dialog
  };
  
  // Update an item's unit
  const handleItemUnitChange = (tripId: string, itemId: string, unit: string, newQuantity?: number) => {
    // Find the trip in context
    const trip = contextTrips.find(t => t.id === tripId);
    if (!trip) return;
    
    // Update the trip with the unit change
    updateContextTrip(tripId, {
      items: trip.items.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            unit,
            // If a new quantity is provided (from unit conversion), update it
            ...(newQuantity !== undefined ? { quantity: newQuantity } : {})
          };
        }
        return item;
      })
    });
    
    // Update the selectedTrip if it's the same trip
    if (selectedTrip && selectedTrip.id === tripId) {
      setSelectedTrip({
        ...selectedTrip,
        items: selectedTrip.items.map(item => {
          if (item.id === itemId) {
            return {
              ...item,
              unit,
              // If a new quantity is provided (from unit conversion), update it
              ...(newQuantity !== undefined ? { quantity: newQuantity } : {})
            };
          }
          return item;
        })
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 pb-20 pt-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gloop-premium-gradient-start to-gloop-premium-gradient-end">
          Shopping Trips
        </h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleSearch}
          >
            <Search className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleCalendarView}
          >
            <Calendar className="h-3.5 w-3.5" />
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
            className="mb-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trips..."
                className="pl-10 pr-10 h-9"
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
        <TabsList className="grid grid-cols-2 mb-4 w-full premium-card">
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
        
        <div className="px-4">
          {activeTab === "active" && (
            <div className="space-y-3">
              {filteredActiveTrips.length > 0 ? (
                filteredActiveTrips.map((trip) => (
                  <div
                    key={trip.id}
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
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border rounded-lg bg-white dark:bg-gloop-dark-surface premium-card">
                  <p className="text-gloop-text-muted dark:text-gloop-dark-text-muted">
                    {searchQuery ? "No matching trips found" : "No active trips"}
                  </p>
                  <p className="text-sm mt-2">Announce a trip to start shopping!</p>
                  <div className="flex flex-col gap-2 mt-2">
                    <Button 
                      className="premium-gradient-btn"
                      onClick={() => setTripModalOpen(true)}
                    >
                      Create a Trip
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === "past" && (
            <div className="space-y-3">
              {filteredPastTrips.length > 0 ? (
                filteredPastTrips.map((trip) => (
                  <div
                    key={trip.id}
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
                      onDelete={() => handleDeleteTrip(trip.id)}
                      onShare={() => handleShareTrip(trip.id)}
                      onReactivate={() => handleReactivateTrip(trip.id)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border rounded-lg bg-white dark:bg-gloop-dark-surface premium-card">
                  <p className="text-gloop-text-muted dark:text-gloop-dark-text-muted">
                    {searchQuery ? "No matching past trips found" : "No past trips yet"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
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
        onReactivateTrip={handleReactivateTrip}
        onUpdateItemPrice={handleUpdateItemPrice}
        onSettleUp={handleSettleUp}
        onUpdateItemUnit={handleItemUnitChange}
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
