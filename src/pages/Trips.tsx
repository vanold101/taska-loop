import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TripCard from "@/components/TripCard";
import { useToast } from "@/hooks/use-toast";
import FloatingActionButton from "@/components/FloatingActionButton";
import CreateTripModal from "@/components/CreateTripModal";
import { Button } from "@/components/ui/button";
import { Search, Filter, Clock, CheckCircle, Store as StoreIcon, ShoppingCart, Map, Calendar, Settings, X, Sparkles, ScanLine, DollarSign, Plus, MapPin } from "lucide-react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { createSettlementTransaction, createPaymentTransaction, confirmPayment } from "@/services/LedgerService";
import { calculateSplitAmounts, loadSplitConfig } from "@/services/CostSplitService";
import ExportButton from "@/components/ExportButton";
import SmartListParser from "@/components/SmartListParser";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import TripBarcodeAdder from "@/components/TripBarcodeAdder";
import { AllItemsView } from '@/components/AllItemsView';
import { ScheduleTripModal } from "@/components/ScheduleTripModal";
import { BudgetAdjustModal } from "@/components/BudgetAdjustModal";
import { NearbyStoresModal } from "@/components/NearbyStoresModal";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { format } from "date-fns";
import { haptics } from "@/lib/haptics";
import type { Store as StoreType } from "@/types/store";
import { ActiveTripAnimation } from "@/components/ActiveTripAnimation";

// New component for trip selection dialog
const TripSelectDialog = ({ 
  isOpen, 
  onClose, 
  trips, 
  onSelect,
  onCreateTrip
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  trips: TripData[]; 
  onSelect: (trip: TripData) => void;
  onCreateTrip: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Select a Trip
          </DialogTitle>
          <DialogDescription>
            Choose which trip to add your items to
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] mt-4">
          {trips.length > 0 ? (
            <div className="grid gap-2">
              {trips.map((trip) => (
                <div 
                  key={trip.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex justify-between items-center"
                  onClick={() => onSelect(trip)}
                >
                  <div className="flex items-center gap-2">
                    <StoreIcon className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{trip.store}</span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={trip.status === 'open' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"}
                  >
                    {trip.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No active trips available</p>
              <Button 
                onClick={() => {
                  onClose();
                  setTimeout(() => onCreateTrip(), 100);
                }}
              >
                Create New Trip
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
  const location = useLocation();
  
  // Check if we should show past trips based on URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('view') === 'past') {
      setActiveTab("past");
    }
  }, [location]);
  
  const [activeTab, setActiveTab] = useState("active");
  const [isTripModalOpen, setTripModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [isTripDetailModalOpen, setTripDetailModalOpen] = useState(false);
  const [isEditTripModalOpen, setEditTripModalOpen] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [showMapView, setShowMapView] = useState(false);
  const [expandedPastTripsSection, setExpandedPastTripsSection] = useState(false);
  const [showSmartParser, setShowSmartParser] = useState(false);
  const [showTripSelectDialog, setShowTripSelectDialog] = useState(false);
  const [parsedItemsForLaterAdd, setParsedItemsForLaterAdd] = useState<Omit<TripItem, 'id'>[]>([]);
  const [showAllItems, setShowAllItems] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showNearbyStoresModal, setShowNearbyStoresModal] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useLocalStorage("monthlyBudget", 500);
  
  // Split trips into active and past based on status
  const [trips, setTrips] = useState<TripData[]>([]);
  const [pastTrips, setPastTrips] = useState<TripData[]>([]);
  
  const { toast } = useToast();
  
  // Filter trips based on search query
  const filteredActiveTrips = searchQuery 
    ? trips.filter(trip => 
        trip.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trip.shopper && trip.shopper.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : trips;
  
  const filteredPastTrips = searchQuery
    ? pastTrips.filter(trip => 
        trip.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trip.shopper && trip.shopper.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
        shopper: {
          name: trip.shopper?.name || "You",
          avatar: trip.shopper?.avatar || "https://example.com/you.jpg"
        },
        eta: trip.eta || '',
        status: trip.status,
        items: trip.items.map(item => ({
          ...item,
          recurrenceFrequency: item.recurrenceFrequency || null,
          addedBy: {
            name: item.addedBy.name,
            avatar: item.addedBy.avatar || "https://example.com/default-avatar.jpg"
          }
        })),
        participants: trip.participants.map(p => ({
          ...p,
          avatar: p.avatar || `https://api.dicebear.com/7.x/avatars/svg?seed=${p.id}`
        })),
        date: trip.date ? new Date(trip.date).toISOString() : new Date().toISOString()
      }));
      
      // Split into active and past trips
      const active = transformedTrips.filter(trip => trip.status !== 'completed' && trip.status !== 'cancelled');
      const past = transformedTrips.filter(trip => trip.status === 'completed' || trip.status === 'cancelled');
      
      // Sort past trips by date (most recent first)
      past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTrips(active);
      setPastTrips(past);
    }
  }, [contextTrips]);
  
  // Toggle expanded past trips section
  const togglePastTripsSection = () => {
    setExpandedPastTripsSection(!expandedPastTripsSection);
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
  };
  
  // Show map view
  const handleMapView = () => {
    setShowMapView(true);
  };
  
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
    
    // Update the trip status to completed
    updateContextTrip(tripId, {
      status: 'completed',
      eta: 'Completed'
    });
    
    // Close the detail modal if it's open
    setTripDetailModalOpen(false);
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
    
    // Delete the trip from context
    deleteContextTrip(tripId);
    
    // Close any open modals
    setTripDetailModalOpen(false);
    setEditTripModalOpen(false);
  };
  
  // Share a trip
  const handleShareTrip = (tripId: string) => {
    // This would open a share dialog
  };
  
  // Invite a participant to a trip
  const handleInviteParticipant = (tripId: string) => {
    // This would open an invite dialog
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
    // Create a payment transaction
    console.log(`Payment of ${amount} from ${fromUserId} to ${toUserId}`);
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
              ...(newQuantity !== undefined ? { quantity: newQuantity } : {})
            };
          }
          return item;
        })
      });
    }
  };
  
  // Handle clicking the Smart Parser button
  const handleSmartParserButtonClick = () => {
    if (activeTab === "past") {
      // If viewing past trips, first let the user know
      toast({
        title: "Active trips only",
        description: "You can only add items to active trips. Please switch to the active tab.",
        variant: "destructive"
      });
      return;
    }
    
    // If no trip is selected, show trip selection dialog
    if (!selectedTrip && filteredActiveTrips.length > 0) {
      setShowTripSelectDialog(true);
    } else if (filteredActiveTrips.length === 0) {
      // No active trips available, prompt to create one
      toast({
        title: "No active trips",
        description: "Please create a trip first before adding items",
        variant: "destructive"
      });
    } else {
      // Trip is already selected, proceed with opening the parser
      setShowSmartParser(true);
    }
  };
  
  // Handle selecting a trip from the dialog
  const handleTripSelect = (trip: TripData) => {
    setSelectedTrip(trip);
    setShowTripSelectDialog(false);
    
    // If we have parsed items waiting, add them now
    if (parsedItemsForLaterAdd.length > 0) {
      // We'll add the items and then clear the waiting list
      handleAddItemsFromParser(parsedItemsForLaterAdd);
      setParsedItemsForLaterAdd([]);
    } else {
      // Otherwise, just open the parser
      setShowSmartParser(true);
    }
  };
  
  // Handle adding items from the smart parser
  const handleAddItemsFromParser = (items: Omit<TripItem, 'id'>[]) => {
    if (!selectedTrip) {
      // If no trip is selected, store the items and show the selection dialog
      setParsedItemsForLaterAdd(items);
      setShowTripSelectDialog(true);
      return;
    }
    
    let addedCount = 0;
    let skippedCount = 0;
    
    // Filter out duplicates
    const itemsToAdd = items.filter(item => {
      const isDuplicate = selectedTrip.items.some(
        existingItem => existingItem.name.toLowerCase() === item.name.toLowerCase()
      );
      
      if (isDuplicate) {
        skippedCount++;
        return false;
      } else {
        addedCount++;
        return true;
      }
    });
    
    // If there are items to add, batch add them in one operation
    if (itemsToAdd.length > 0) {
      // Find the trip in context
      const trip = contextTrips.find(t => t.id === selectedTrip.id);
      if (!trip) return;
      
      // Create new items with IDs
      const newItems = itemsToAdd.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substring(2)
      }));
      
      // Create updated items array including all new items
      const updatedItems = [...trip.items, ...newItems];
      
      // Update the trip with all new items at once
      updateContextTrip(selectedTrip.id, {
        items: updatedItems
      });
      
      // Update the selectedTrip immediately with all new items
      setSelectedTrip({
        ...selectedTrip,
        items: updatedItems
      });
    }
    
    toast({
      title: `${addedCount} items added`,
      description: skippedCount > 0 
        ? `Added ${addedCount} items. ${skippedCount} items were skipped because they already exist in the trip.` 
        : `Added ${addedCount} items to your trip.`
    });
  };

  const handleViewAllItems = () => {
    setShowAllItems(true);
  };

  const handleItemClick = (tripId: string, itemId: string) => {
    const trip = trips.find(t => t.id === tripId) || pastTrips.find(t => t.id === tripId);
    if (trip) {
      setSelectedTrip(trip);
      setTripDetailModalOpen(true);
      setShowAllItems(false);
    }
  };

  const handleScheduleTrip = (data: { store: string; date: Date; eta: string }) => {
    const newTrip: Omit<ContextTrip, "id"> = {
      store: data.store,
      date: data.date.toISOString(),
      eta: data.eta,
      status: "open",
      items: [],
      participants: [],
      shopper: {
        name: "You",
        avatar: "https://example.com/avatar.jpg"
      }
    };
    
    addContextTrip(newTrip);
    toast({
      title: "Trip Scheduled",
      description: `Trip to ${data.store} scheduled for ${format(data.date, "PPP")} at ${data.eta}`,
    });
  };

  const handleBudgetAdjust = (newBudget: number) => {
    setMonthlyBudget(newBudget);
  };

  const handleStoreSelect = (selectedStore: StoreType) => {
    setTripModalOpen(true);
    // Pre-fill the store name in the create trip modal
    // You'll need to modify your CreateTripModal to accept an initial store value
  };

  const handleStartTrip = async (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    // Update trip status
    await updateContextTrip(tripId, {
      status: "shopping",
      shopper: {
        name: trip.shopper.name,
        avatar: trip.shopper.avatar
      }
    });

    // Show active trip animation
    setActiveTrip(trip);

    // Notify participants
    if (trip.participants.length > 0) {
      // Here you would typically integrate with a notification service
      toast({
        title: "Trip Started",
        description: `Notified ${trip.participants.length} participants that shopping has begun.`,
      });

      // Send notifications to each participant
      trip.participants.forEach(participant => {
        // In a real app, you would use a proper notification service
        console.log(`Sending notification to ${participant.name}`);
      });
    }

    // Add haptic feedback
    haptics.heavy();
  };

  // Add state for active trip
  const [activeTrip, setActiveTrip] = useState<TripData | null>(null);

  return (
    <div className="min-h-screen bg-gloop-background dark:bg-gloop-dark-background">
      <NavBar />
      
      {/* Action buttons */}
      <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700">
        <h1 className="text-2xl font-semibold">Trips</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAllItems(true)}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            View All Items
          </Button>
          <Button variant="outline" onClick={handleCalendarView}>
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button variant="outline" onClick={handleMapView}>
            <Map className="h-4 w-4 mr-2" />
            Map
          </Button>
          <Button variant="outline" onClick={() => setShowBudgetModal(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Budget
          </Button>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex overflow-x-auto gap-2 p-4 hide-scrollbar">
        <Button
          variant="outline"
          className="whitespace-nowrap"
          onClick={() => setShowScheduleModal(true)}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Trip
        </Button>
        <Button
          variant="outline"
          className="whitespace-nowrap"
          onClick={() => setShowNearbyStoresModal(true)}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Find Stores
        </Button>
        <Button
          variant="outline"
          className="whitespace-nowrap"
          onClick={() => setTripModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Trip
        </Button>
      </div>

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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSmartParserButtonClick}
                    className="text-blue-500"
                    title="Smart List Parser"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Quick trip buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <Button 
              onClick={() => setTripModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shrink-0"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Trip
            </Button>
            <QuickTripButton store="Kroger" onClick={() => {
              handleCreateTrip({ 
                store: "Kroger", 
                eta: "20", 
                date: new Date().toISOString().split('T')[0] 
              });
            }} />
            <QuickTripButton store="Target" onClick={() => {
              handleCreateTrip({ 
                store: "Target", 
                eta: "25", 
                date: new Date().toISOString().split('T')[0] 
              });
            }} />
            <QuickTripButton store="Walmart" onClick={() => {
              handleCreateTrip({ 
                store: "Walmart", 
                eta: "15", 
                date: new Date().toISOString().split('T')[0]
              });
            }} />
            <QuickTripButton store="Costco" onClick={() => {
              handleCreateTrip({ 
                store: "Costco", 
                eta: "30", 
                date: new Date().toISOString().split('T')[0] 
              });
            }} />
          </div>
        </header>
        
        {/* Trip content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100/50 dark:bg-gray-800/50 p-1 mb-4">
            <TabsTrigger value="active" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
              <span>Active Trips</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
              <span>Past Trips</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab content */}
          <TabsContent value="active" className="mt-0">
            <AnimatePresence>
              {filteredActiveTrips.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                >
                  {filteredActiveTrips.map((trip) => {
                    const isActive = trip.status === 'shopping';
                    
                    // Ensure we provide the correct type for TripCard
                    const tripCardData = {
                      id: trip.id,
                      store: trip.store,
                      shopper: {
                        name: trip.shopper.name,
                        avatar: trip.shopper.avatar
                      },
                      eta: trip.eta || '',
                      status: trip.status as 'open' | 'shopping' | 'completed' | 'cancelled',
                      itemCount: trip.items.length
                    };
                    
                    return (
                      <div key={trip.id} className="relative">
                        <TripCard
                          trip={tripCardData}
                          onTripClick={() => handleTripClick(trip)}
                          onAddItem={(item) => handleAddItem(trip.id, item)}
                          onEditTrip={() => handleEditTrip(trip)}
                          onCompleteTrip={() => handleCompleteTrip(trip.id)}
                          onShareTrip={() => handleShareTrip(trip.id)}
                          onStartTrip={() => handleStartTrip(trip.id)}
                        />
                        {isActive && (
                          <ActiveTripAnimation shopper={trip.shopper} />
                        )}
                      </div>
                    );
                  })}
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Shopping History
              </h2>
              {pastTrips.length > 0 && (
                <ExportButton 
                  trips={pastTrips.map(trip => ({
                    ...trip,
                    items: trip.items.map(item => ({
                      ...item,
                      recurrenceFrequency: item.recurrenceFrequency || null,
                      addedBy: {
                        name: item.addedBy.name,
                        avatar: item.addedBy.avatar
                      }
                    }))
                  }))}
                  includeHistory={true}
                  size="sm"
                  label="Export History"
                />
              )}
            </div>
            
            <AnimatePresence>
              {filteredPastTrips.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPastTrips
                      .slice(0, expandedPastTripsSection ? undefined : 6)
                      .map((trip, index) => (
                        <motion.div
                          key={trip.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700 p-4"
                          onClick={() => handleTripClick(trip)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-lg flex items-center">
                              <StoreIcon className="h-4 w-4 mr-2 text-blue-500" />
                              {trip.store}
                            </h3>
                            <Badge variant={trip.status === 'completed' ? "outline" : "destructive"} 
                              className={trip.status === 'completed' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}>
                              {trip.status === 'completed' ? (
                                <span className="flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </span>
                              ) : 'Cancelled'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p className="flex items-center mb-1">
                              <Calendar className="h-3.5 w-3.5 mr-1.5" />
                              {new Date(trip.date).toLocaleDateString(undefined, {
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </p>
                            <p className="flex items-center mb-1">
                              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                              {trip.items.length} items
                            </p>
                            <p className="flex items-center font-medium">
                              Total: ${trip.items.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                  
                  {pastTrips.length > 6 && (
                    <div className="flex justify-center mt-4">
                      <Button 
                        variant="outline" 
                        onClick={togglePastTripsSection}
                      >
                        {expandedPastTripsSection ? "Show Less" : `View ${pastTrips.length - 6} More Trips`}
                      </Button>
                    </div>
                  )}
                </div>
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
      </main>
      
      {/* Modals */}
      {showCalendarView && (
        <TripCalendarView
          trips={[...trips, ...pastTrips]}
          onClose={() => setShowCalendarView(false)}
          onTripClick={handleTripClick}
        />
      )}

      {showMapView && (
        <TripMapView
          trips={[...trips, ...pastTrips]}
          onClose={() => setShowMapView(false)}
          onTripClick={handleTripClick}
        />
      )}

      {/* Other modals */}
      <SmartListParser 
        isOpen={showSmartParser}
        onClose={() => setShowSmartParser(false)}
        onAddItems={handleAddItemsFromParser}
      />

      <TripSelectDialog
        isOpen={showTripSelectDialog}
        onClose={() => setShowTripSelectDialog(false)}
        trips={filteredActiveTrips}
        onSelect={handleTripSelect}
        onCreateTrip={() => setTripModalOpen(true)}
      />
      
      {/* Create Trip FAB */}
      <FloatingActionButton 
        onClick={() => setTripModalOpen(true)} 
        tripMode={true}
        icon={<ShoppingCart className="h-6 w-6" />}
        label="New Trip"
      />
      
      {/* Create Trip Modal */}
      <CreateTripModal 
        isOpen={isTripModalOpen} 
        onClose={() => setTripModalOpen(false)} 
        onSubmit={handleCreateTrip} 
      />
      
      {/* Trip Detail Modal */}
      {selectedTrip && (
        <TripDetailModal
          isOpen={isTripDetailModalOpen}
          onClose={() => setTripDetailModalOpen(false)}
          trip={selectedTrip}
          onAddItem={handleAddItem}
          onRemoveItem={(tripId, itemId) => handleRemoveItem(tripId, itemId)}
          onToggleItemCheck={(tripId, itemId) => handleToggleItemCheck(tripId, itemId)}
          onUpdateItemPrice={(tripId, itemId, price) => handleUpdateItemPrice(tripId, itemId, price)}
          onInviteParticipant={(tripId) => handleInviteParticipant(tripId)}
          onCompleteTrip={(tripId) => handleCompleteTrip(tripId)}
          onReactivateTrip={(tripId) => handleReactivateTrip(tripId)}
          onSettleUp={(amount, toUserId, fromUserId) => handleSettleUp(amount, toUserId, fromUserId)}
          onUpdateItemUnit={(tripId, itemId, unit, newQuantity) => handleItemUnitChange(tripId, itemId, unit, newQuantity)}
        />
      )}
      
      {/* Trip Edit Modal */}
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

      {/* Add AllItemsView */}
      <AnimatePresence>
        {showAllItems && (
          <AllItemsView
            trips={[...trips, ...pastTrips]}
            onClose={() => setShowAllItems(false)}
            onItemClick={handleItemClick}
          />
        )}
      </AnimatePresence>

      <ScheduleTripModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleScheduleTrip}
      />

      <BudgetAdjustModal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        currentBudget={monthlyBudget}
        onAdjust={handleBudgetAdjust}
      />

      <NearbyStoresModal
        isOpen={showNearbyStoresModal}
        onClose={() => setShowNearbyStoresModal(false)}
        onSelectStore={handleStoreSelect}
      />
    </div>
  );
};

export default TripsPage;
