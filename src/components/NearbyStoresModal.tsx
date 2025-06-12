import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, MapPin, Navigation, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_MAPS_API_KEY } from '@/config/maps';

interface Store {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
}

interface NearbyStoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStore: (store: Store) => void;
}

interface GooglePlacesResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
  rating?: number;
}

interface GooglePlacesResponse {
  results: GooglePlacesResult[];
  status: string;
}

export const NearbyStoresModal: React.FC<NearbyStoresModalProps> = ({
  isOpen,
  onClose,
  onSelectStore,
}) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [searchRadius, setSearchRadius] = useState("5"); // in kilometers
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      getCurrentLocation();
    }
  }, [isOpen]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        await fetchNearbyStores(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Error",
          description: "Could not get your location. Please check your settings.",
          variant: "destructive",
        });
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const fetchNearbyStores = async (lat: number, lng: number) => {
    try {
      const radius = parseFloat(searchRadius) * 1000; // Convert to meters
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=store&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby stores');
      }
      
      const data = await response.json() as GooglePlacesResponse;
      const stores: Store[] = data.results.map((place) => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
        rating: place.rating || 0
      }));
      
      setStores(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast({
        title: "Error",
        description: "Could not fetch nearby stores. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return Math.round(d * 10) / 10;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  const handleRadiusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchRadius(e.target.value);
    if (location) {
      await fetchNearbyStores(location.lat, location.lng);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nearby Stores</DialogTitle>
          <DialogDescription>
            Find stores near your current location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="radius">Search Radius (km)</Label>
            <Input
              id="radius"
              type="number"
              min="1"
              max="50"
              value={searchRadius}
              onChange={handleRadiusChange}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => {
                    onSelectStore(store);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Store className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h3 className="font-medium">{store.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {store.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {store.distance.toFixed(1)} km
                      </span>
                      <Navigation className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}

              {stores.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No stores found within {searchRadius}km
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={loading}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Refresh Location
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 