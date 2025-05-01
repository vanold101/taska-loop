
import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TripCard from "@/components/TripCard";
import { useToast } from "@/hooks/use-toast";
import FloatingActionButton from "@/components/FloatingActionButton";
import CreateTripModal from "@/components/CreateTripModal";
import { Button } from "@/components/ui/button";
import { Search, Filter, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// Mock data for demo purposes
const mockActiveTrips = [
  {
    id: '1',
    store: "Trader Joe's",
    shopper: {
      name: "Rachel",
      avatar: ""
    },
    eta: "10 min",
    itemCount: 5,
    status: 'open' as const,
  },
  {
    id: '2',
    store: "Costco",
    shopper: {
      name: "Brian",
      avatar: ""
    },
    eta: "25 min",
    itemCount: 12,
    status: 'shopping' as const,
  }
];

const mockPastTrips = [
  {
    id: '3',
    store: "Target",
    shopper: {
      name: "Ella",
      avatar: ""
    },
    eta: "Yesterday",
    itemCount: 7,
    status: 'completed' as const,
  },
  {
    id: '4',
    store: "Walgreens",
    shopper: {
      name: "You",
      avatar: ""
    },
    eta: "2 days ago",
    itemCount: 3,
    status: 'completed' as const,
  },
  {
    id: '5',
    store: "Whole Foods",
    shopper: {
      name: "Rachel",
      avatar: ""
    },
    eta: "Last week",
    itemCount: 9,
    status: 'completed' as const,
  }
];

const TripsPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [isTripModalOpen, setTripModalOpen] = useState(false);
  const [trips, setTrips] = useState(mockActiveTrips);
  const [pastTrips, setPastTrips] = useState(mockPastTrips);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
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

  const handleCreateTrip = (data: { store: string; eta: string }) => {
    const newTrip = {
      id: Date.now().toString(),
      store: data.store,
      shopper: {
        name: "You", // In real app, this would be current user
        avatar: ""
      },
      eta: `${data.eta} min`,
      itemCount: 0,
      status: 'open' as const,
    };

    setTrips([newTrip, ...trips]);
    toast({
      title: "Trip broadcasted!",
      description: `Your trip to ${data.store} has been announced to your circle.`,
    });
    setTripModalOpen(false);
  };

  const handleAddItem = (tripId: string) => {
    // Find the trip
    const trip = trips.find(t => t.id === tripId);
    
    if (trip) {
      // Update the item count
      const updatedTrips = trips.map(t => {
        if (t.id === tripId) {
          return { ...t, itemCount: t.itemCount + 1 };
        }
        return t;
      });
      
      setTrips(updatedTrips);
      
      toast({
        title: "Item added",
        description: `Your item was added to the ${trip.store} shopping list.`,
      });
    }
  };

  const handleTripClick = (tripId: string) => {
    const trip = [...trips, ...pastTrips].find(t => t.id === tripId);
    
    if (trip) {
      toast({
        title: `${trip.store} trip details`,
        description: `Viewing shopping list with ${trip.itemCount} items.`,
      });
    }
  };
  
  const handleCompleteTrip = (tripId: string) => {
    // Find the trip to complete
    const tripToComplete = trips.find(t => t.id === tripId);
    
    if (tripToComplete) {
      // Remove from active trips
      const updatedTrips = trips.filter(t => t.id !== tripId);
      setTrips(updatedTrips);
      
      // Add to past trips with completed status
      const completedTrip = {
        ...tripToComplete,
        status: 'completed' as const,
        eta: 'Just now'
      };
      
      setPastTrips([completedTrip, ...pastTrips]);
      
      toast({
        title: "Trip completed!",
        description: `Your trip to ${tripToComplete.store} has been completed.`,
      });
    }
  };
  
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery("");
    }
  };

  return (
    <div className="pb-20 pt-6 px-4 max-w-md mx-auto">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Trips</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={showSearch ? "bg-gloop-primary text-white" : "premium-card"}
              onClick={toggleSearch}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="premium-card"
              onClick={() => setTripModalOpen(true)}
            >
              <Clock className="h-4 w-4 mr-1" />
              New Trip
            </Button>
          </div>
        </div>
        
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-4"
            >
              <Input
                placeholder="Search trips by store or shopper..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full premium-card"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 mb-4 premium-card">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="active">
              <div className="space-y-3">
                {filteredActiveTrips.length > 0 ? (
                  filteredActiveTrips.map((trip) => (
                    <motion.div 
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="premium-card rounded-lg overflow-hidden"
                    >
                      <TripCard
                        store={trip.store}
                        shopper={trip.shopper}
                        eta={trip.eta}
                        itemCount={trip.itemCount}
                        status={trip.status}
                        onAddItem={() => handleAddItem(trip.id)}
                        onClick={() => handleTripClick(trip.id)}
                      />
                      {trip.shopper.name === "You" && (
                        <div className="px-4 py-2 bg-white border-t flex justify-end">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-600 hover:bg-green-50 border-green-200"
                            onClick={() => handleCompleteTrip(trip.id)}
                          >
                            Mark as Complete
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-white">
                    <p className="text-gloop-text-muted">
                      {searchQuery ? "No matching trips found" : "No active trips"}
                    </p>
                    <p className="text-sm mt-2">Announce a trip to start shopping!</p>
                    <Button 
                      className="mt-2"
                      variant="outline"
                      onClick={() => setTripModalOpen(true)}
                    >
                      Create a Trip
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="past">
              <div className="space-y-3">
                {filteredPastTrips.length > 0 ? (
                  filteredPastTrips.map((trip) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="premium-card"
                    >
                      <TripCard
                        store={trip.store}
                        shopper={trip.shopper}
                        eta={trip.eta}
                        itemCount={trip.itemCount}
                        status={trip.status}
                        onClick={() => handleTripClick(trip.id)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-white">
                    <p className="text-gloop-text-muted">
                      {searchQuery ? "No matching past trips found" : "No past trips yet"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      <FloatingActionButton onClick={() => setTripModalOpen(true)} tripMode />
      
      <CreateTripModal
        isOpen={isTripModalOpen}
        onClose={() => setTripModalOpen(false)}
        onSubmit={handleCreateTrip}
      />

      <NavBar />
    </div>
  );
};

export default TripsPage;
