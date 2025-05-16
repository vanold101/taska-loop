import { useState } from "react";
import NavBar from "../components/NavBar";
import { useTaskContext, Trip, TripItem, TripParticipant } from "../context/TaskContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { Calendar as CalendarIcon, ArrowLeft, FilterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripDetailModal from "@/components/TripDetailModal";
import { motion } from "framer-motion";
import ExportButton from "@/components/ExportButton";

const ShoppingHistoryPage = () => {
  const { trips: contextTrips, updateTrip: updateContextTrip } = useTaskContext();
  const { user, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for TripDetailModal
  const [selectedTripForDetail, setSelectedTripForDetail] = useState<Trip | null>(null);
  const [isTripDetailModalOpen, setIsTripDetailModalOpen] = useState(false);
  
  // Redirect to login if not authenticated and not loading
  if (!authIsLoading && !user) {
    navigate('/login');
    return null;
  }
  
  // Handler to view a trip's details
  const handleViewTrip = (tripId: string) => {
    const tripFromContext = contextTrips.find(t => t.id === tripId);
    if (tripFromContext) {
      setSelectedTripForDetail(tripFromContext);
      setIsTripDetailModalOpen(true);
    } else {
      toast({ title: "Error", description: "Trip not found.", variant: "destructive" });
    }
  };
  
  // Handler to delete a trip
  const handleDeleteTrip = (tripId: string) => {
    if (window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      // Here you would call your deleteTrip method from the context
      toast({ title: "Trip Deleted", description: "The shopping trip has been removed." });
    }
  };
  
  // Filter for completed trips
  const completedTrips = contextTrips.filter(trip => trip.status === 'completed');
  
  // Handlers for trip detail modal
  const handleCloseTripDetailModal = () => {
    setIsTripDetailModalOpen(false);
    setSelectedTripForDetail(null);
  };
  
  // Main handlers for trip items in the detail modal
  const handleAddItemToTripInModal = (tripId: string, itemData: Omit<TripItem, 'id'>) => {
    const trip = contextTrips.find(t => t.id === tripId);
    if (trip) {
      const newItemWithId: TripItem = {
        ...itemData,
        id: Date.now().toString(),
      };
      const updatedItems = [...trip.items, newItemWithId];
      const updatedTrip = { ...trip, items: updatedItems };
      updateContextTrip(tripId, { items: updatedItems });
      setSelectedTripForDetail(updatedTrip);
    }
  };
  
  const handleRemoveItemFromTripInModal = (tripId: string, itemId: string) => {
    const trip = contextTrips.find(t => t.id === tripId);
    if (trip) {
      const updatedItems = trip.items.filter(item => item.id !== itemId);
      const updatedTrip = { ...trip, items: updatedItems };
      updateContextTrip(tripId, { items: updatedItems });
      setSelectedTripForDetail(updatedTrip);
    }
  };
  
  const handleToggleItemCheckInModal = (tripId: string, itemId: string) => {
    const trip = contextTrips.find(t => t.id === tripId);
    if (trip) {
      const updatedItems = trip.items.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      const updatedTrip = { ...trip, items: updatedItems };
      updateContextTrip(tripId, { items: updatedItems });
      setSelectedTripForDetail(updatedTrip);
    }
  };
  
  const handleUpdateItemPriceInModal = (tripId: string, itemId: string, price: number) => {
    const trip = contextTrips.find(t => t.id === tripId);
    if (trip) {
      const updatedItems = trip.items.map(item =>
        item.id === itemId ? { ...item, price: price } : item
      );
      const updatedTrip = { ...trip, items: updatedItems };
      updateContextTrip(tripId, { items: updatedItems });
      setSelectedTripForDetail(updatedTrip);
    }
  };
  
  const handleUpdateItemUnitInModal = (tripId: string, itemId: string, unit: string, newQuantity?: number) => {
    const trip = contextTrips.find(t => t.id === tripId);
    if (trip) {
      const updatedItems = trip.items.map(item =>
        item.id === itemId ? { 
          ...item, 
          unit: unit, 
          quantity: newQuantity !== undefined ? newQuantity : item.quantity 
        } : item
      );
      const updatedTrip = { ...trip, items: updatedItems };
      updateContextTrip(tripId, { items: updatedItems });
      setSelectedTripForDetail(updatedTrip);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow px-[5vw] md:px-[8vw] lg:px-[10vw] py-6 md:py-8 space-y-6 md:space-y-8 pb-20 md:pb-24">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2 text-blue-500" />
              Shopping History
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <ExportButton 
              trips={completedTrips}
              includeHistory={true}
              size="sm"
              label="Export"
            />
          </div>
        </div>
        
        {/* Custom history view */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-4">
            {/* Here's where we would use our ShoppingHistoryView component */}
            {/* For now, we'll render a simple list of completed trips */}
            {completedTrips.length > 0 ? (
              completedTrips.map((trip) => (
                <div 
                  key={trip.id} 
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                  onClick={() => handleViewTrip(trip.id)}
                >
                  <h3 className="font-medium text-lg">{trip.store}</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Date: {new Date(trip.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Items: {trip.items.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total: ${trip.items.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No shopping history yet.</p>
                <p className="text-sm mt-2">Complete shopping trips to see them here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
      
      <NavBar />
      
      {/* Trip Detail Modal */}
      {isTripDetailModalOpen && selectedTripForDetail && (
        <TripDetailModal
          key={`trip-modal-${selectedTripForDetail.id}-${JSON.stringify(selectedTripForDetail.items)}`}
          isOpen={isTripDetailModalOpen}
          onClose={handleCloseTripDetailModal}
          trip={selectedTripForDetail}
          onAddItem={handleAddItemToTripInModal}
          onRemoveItem={handleRemoveItemFromTripInModal}
          onToggleItemCheck={handleToggleItemCheckInModal}
          onUpdateItemPrice={handleUpdateItemPriceInModal}
          onUpdateItemUnit={handleUpdateItemUnitInModal}
          onInviteParticipant={(tripId: string) => console.log("Invite participant to trip", tripId)}
          onCompleteTrip={(tripId: string) => updateContextTrip(tripId, { status: 'completed' })}
          onReactivateTrip={(tripId: string) => updateContextTrip(tripId, { status: 'open' })}
          onSettleUp={(amount: number, toUserId: string, fromUserId: string) => console.log("Settle up:", { amount, toUserId, fromUserId })}
        />
      )}
    </div>
  );
};

export default ShoppingHistoryPage; 