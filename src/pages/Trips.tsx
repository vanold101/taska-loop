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
  
  // Transform context trips to TripData format
  useEffect(() => {
    if (contextTrips) {
      const transformedTrips = contextTrips.map(trip => ({
        id: trip.id,
        store: trip.store,
        shopper: trip.shopper || {
          name: "You",
          avatar: "https://example.com/you.jpg"
        },
        eta: trip.eta,
        status: trip.status,
        items: trip.items,
        participants: trip.participants,
        itemCount: trip.items.length,
        date: trip.date ? new Date(trip.date).toISOString() : new Date().toISOString() // Ensure date is always set
      }));
      
      // Split into active and past trips
      const active = transformedTrips.filter(trip => trip.status !== 'completed' && trip.status !== 'cancelled');
      const past = transformedTrips.filter(trip => trip.status === 'completed' || trip.status === 'cancelled');
      
      setTrips(active);
      setPastTrips(past);
    }
  }, [contextTrips]);
  
  // Create a new trip
  const handleCreateTrip = (data: { store: string; eta: string; date: string }) => {
    // Create a new trip with default values
    const newTrip: Omit<ContextTrip, 'id' | 'createdAt'> = {
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
      },
      date: new Date(data.date).toISOString() // Ensure date is in ISO format
    };
    
    // Add trip to context
    addContextTrip(newTrip);
    
    // Close the modal
    setTripModalOpen(false);
    
    // Show success toast
    toast({
      title: "Trip Created",
      description: `Your trip to ${data.store} is scheduled for ${new Date(data.date).toLocaleDateString()}`
    });
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
    
    // Create updated items array
    const updatedItems = [...trip.items, newItem];
    
    // Update the trip with the new item
    updateContextTrip(tripId, {
      items: updatedItems
    });
    
    // Update the selectedTrip immediately
    if (selectedTrip && selectedTrip.id === tripId) {
      const updatedTrip = {
        ...selectedTrip,
        items: updatedItems
      };
      setSelectedTrip(updatedTrip);
    }
    
    // Update the trips state to reflect changes immediately
    setTrips(prevTrips => 
      prevTrips.map(t => 
        t.id === tripId 
          ? { ...t, items: updatedItems }
          : t
      )
    );
    
    // Show success toast
    toast({
      title: "Item Added",
      description: `${item.name} has been added to your trip.`
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
            split.totalAmount,
            true              // Mark as a split expense (50/50 or configured split)
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
    <div className="flex flex-col min-h-screen">
      <NavBar />
      
      <main className="flex-grow w-full px-[5vw] md:px-[8vw] lg:px-[10vw] py-6 md:py-8 pb-20 md:pb-24">
        {/* Header with search and view toggles */}
        <header className="mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-[clamp(1.875rem,4vw,2.5rem)] font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400">
              Shopping Trips
            </h1>
            
            <div className="flex items-center gap-2">
              {showSearch ? (
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Search trips..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 md:w-60 mr-1"
                  />
                  <Button variant="ghost" size="icon" onClick={toggleSearch}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="icon" onClick={toggleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleFilterTrips}>
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCalendarView}>
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleMapView}>
                    <Map className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Quick trip buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <Button 
              onClick={() => {
                console.log("New Trip button clicked");
                setTripModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shrink-0"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Trip
            </Button>
            <QuickTripButton store="Kroger" onClick={() => {
              console.log("Kroger quick trip clicked");
              handleCreateTrip({ store: "Kroger", eta: "20", date: new Date().toISOString().split('T')[0] });
            }} />
            <QuickTripButton store="Target" onClick={() => {
              console.log("Target quick trip clicked");
              handleCreateTrip({ store: "Target", eta: "25", date: new Date().toISOString().split('T')[0] });
            }} />
            <QuickTripButton store="Walmart" onClick={() => {
              console.log("Walmart quick trip clicked");
              handleCreateTrip({ store: "Walmart", eta: "15", date: new Date().toISOString().split('T')[0] });
            }} />
            <QuickTripButton store="Costco" onClick={() => {
              console.log("Costco quick trip clicked");
              handleCreateTrip({ store: "Costco", eta: "30", date: new Date().toISOString().split('T')[0] });
            }} />
            <QuickTripButton store="Whole Foods" onClick={() => {
              console.log("Whole Foods quick trip clicked");
              handleCreateTrip({ store: "Whole Foods", eta: "20", date: new Date().toISOString().split('T')[0] });
            }} />
          </div>
        </header>
        
        {showCalendarView ? (
          <TripCalendarView 
            trips={[...trips, ...pastTrips]} 
            onClose={() => setShowCalendarView(false)}
            onTripClick={handleTripClick}
          />
        ) : showMapView ? (
          <TripMapView 
            trips={[...trips, ...pastTrips]} 
            onClose={() => setShowMapView(false)}
            onTripClick={handleTripClick}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-100/50 dark:bg-gray-800/50 p-1 mb-4">
              <TabsTrigger value="active" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                Active Trips
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                Past Trips
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-0">
              <AnimatePresence>
                {filteredActiveTrips.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  >
                    {filteredActiveTrips.map(trip => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        onTripClick={() => handleTripClick(trip)}
                        onAddItem={(item) => handleAddItem(trip.id, item)}
                        onEditTrip={() => handleEditTrip(trip)}
                        onCompleteTrip={() => handleCompleteTrip(trip.id)}
                        onShareTrip={() => handleShareTrip(trip.id)}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No active trips</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Create a new shopping trip to get started</p>
                    <Button 
                      onClick={() => setTripModalOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      New Trip
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
            
            <TabsContent value="past" className="mt-0">
              <AnimatePresence>
                {filteredPastTrips.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                  >
                    {filteredPastTrips.map(trip => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        onTripClick={() => handleTripClick(trip)}
                        onReactivateTrip={() => handleReactivateTrip(trip.id)}
                        onDeleteTrip={() => handleDeleteTrip(trip.id)}
                        isPast
                      />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No past trips</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Your completed trips will appear here</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      {/* Trip creation modal */}
      <CreateTripModal 
        isOpen={isTripModalOpen} 
        onClose={() => setTripModalOpen(false)}
        onSubmit={handleCreateTrip}
      />
      
      {/* Trip detail modal */}
      {selectedTrip && (
        <TripDetailModal
          isOpen={isTripDetailModalOpen}
          onClose={() => setTripDetailModalOpen(false)}
          trip={selectedTrip}
          onAddItem={handleAddItem}
          onRemoveItem={(itemId) => selectedTrip && handleRemoveItem(selectedTrip.id, itemId)}
          onToggleItemCheck={(itemId) => selectedTrip && handleToggleItemCheck(selectedTrip.id, itemId)}
          onUpdateItemPrice={(itemId, price) => selectedTrip && handleUpdateItemPrice(selectedTrip.id, itemId, parseInt(price))}
          onInviteParticipant={(tripId) => handleInviteParticipant(tripId)}
          onCompleteTrip={(tripId) => handleCompleteTrip(tripId)}
          onReactivateTrip={(tripId) => handleReactivateTrip(tripId)}
          onSettleUp={(amount, toUserId, fromUserId) => handleSettleUp(amount, toUserId, fromUserId)}
          onUpdateItemUnit={(tripId, itemId, unit, newQuantity) => handleItemUnitChange(tripId, itemId, unit, newQuantity)}
        />
      )}
      
      {/* Trip edit modal */}
      {selectedTrip && (
        <EditTripModal
          isOpen={isEditTripModalOpen}
          onClose={() => setEditTripModalOpen(false)}
          trip={selectedTrip}
          onUpdateTrip={(tripId, data) => {
            handleUpdateTrip(tripId, data);
            setEditTripModalOpen(false);
          }}
        />
      )}
      
      <FloatingActionButton 
        onClick={() => {
          console.log("Floating action button clicked");
          setTripModalOpen(true);
        }}
        icon={<ShoppingCart className="h-5 w-5" />}
      />
    </div>
  );
};

export default TripsPage;
