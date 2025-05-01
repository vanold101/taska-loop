
import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TripCard from "@/components/TripCard";
import { useToast } from "@/components/ui/use-toast";
import FloatingActionButton from "@/components/FloatingActionButton";
import CreateTripModal from "@/components/CreateTripModal";

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
  const { toast } = useToast();

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
  };

  const handleAddItem = (tripId: string) => {
    toast({
      title: "Add item feature",
      description: "This feature will be implemented in the next version!",
    });
  };

  const handleTripClick = (tripId: string) => {
    toast({
      title: "Trip details",
      description: "Trip details page will be available in the next version!",
    });
  };

  return (
    <div className="pb-20 pt-6 px-4 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Trips</h1>
      </header>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="space-y-3">
            {trips.length > 0 ? (
              trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  store={trip.store}
                  shopper={trip.shopper}
                  eta={trip.eta}
                  itemCount={trip.itemCount}
                  status={trip.status}
                  onAddItem={() => handleAddItem(trip.id)}
                  onClick={() => handleTripClick(trip.id)}
                />
              ))
            ) : (
              <div className="text-center py-8 border rounded-lg bg-white">
                <p className="text-gloop-text-muted">No active trips</p>
                <p className="text-sm mt-2">Announce a trip to start shopping!</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="past">
          <div className="space-y-3">
            {pastTrips.map((trip) => (
              <TripCard
                key={trip.id}
                store={trip.store}
                shopper={trip.shopper}
                eta={trip.eta}
                itemCount={trip.itemCount}
                status={trip.status}
                onClick={() => handleTripClick(trip.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <FloatingActionButton onClick={() => setTripModalOpen(true)} />
      
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
