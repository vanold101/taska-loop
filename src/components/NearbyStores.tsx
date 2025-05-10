import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ChevronRight, Loader2, Filter, Map } from "lucide-react";
import { getNearbyStores, getStoresByCategory } from "@/data/stores";
import { Store } from "@/data/stores";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface NearbyStoresProps {
  maxStores?: number;
}

const NearbyStores = ({ maxStores = 3 }: NearbyStoresProps) => {
  const [nearbyStores, setNearbyStores] = useState<(Store & { distance: number })[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeCategory, setActiveCategory] = useState<Store['category'] | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const categories: Array<{value: Store['category'] | 'all', label: string}> = [
    { value: 'all', label: 'All' },
    { value: 'grocery', label: 'Grocery' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'other', label: 'Other' }
  ];
  
  useEffect(() => {
    let isMounted = true;
    
    // Function to calculate distance between two points using Haversine formula
    const calculateDistance = (
      lat1: number,
      lng1: number,
      lat2: number,
      lng2: number
    ): number => {
      const R = 3958.8; // Earth radius in miles
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    
    // Default location (Columbus, OH)
    const defaultLocation = { lat: 39.9622, lng: -83.0007 };
    
    // Set a timeout for geolocation
    const locationTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Location request timed out, using default location");
        if (!userLocation) {
          setUserLocation(defaultLocation);
          fetchNearbyStores(defaultLocation);
        }
      }
    }, 5000);
    
    // Function to fetch nearby stores
    const fetchNearbyStores = (location: { lat: number; lng: number }) => {
      try {
        // Get all nearby stores or filter by category
        let stores;
        if (activeCategory === 'all') {
          stores = getNearbyStores(location.lat, location.lng, 5);
        } else {
          // Get stores by category first, then filter by distance
          const categoryStores = getStoresByCategory(activeCategory);
          stores = categoryStores.filter(store => {
            const distance = calculateDistance(
              location.lat,
              location.lng,
              store.lat,
              store.lng
            );
            return distance <= 5; // 5 mile radius
          });
        }
        
        // Sort by distance and add distance information
        const storesWithDistance = stores.map(store => {
          const distance = calculateDistance(
            location.lat,
            location.lng,
            store.lat,
            store.lng
          );
          return { ...store, distance };
        });
        
        storesWithDistance.sort((a, b) => a.distance - b.distance);
        setNearbyStores(storesWithDistance.slice(0, maxStores));
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching nearby stores:", err);
        setError("Failed to load nearby stores");
        setIsLoading(false);
      }
    };
    
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;
          clearTimeout(locationTimeout);
          
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log("Successfully got user location for stores:", userLoc);
          setUserLocation(userLoc);
          fetchNearbyStores(userLoc);
        },
        (error) => {
          if (!isMounted) return;
          clearTimeout(locationTimeout);
          
          console.error("Geolocation error:", error);
          setUserLocation(defaultLocation);
          fetchNearbyStores(defaultLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      // Geolocation not supported
      if (isMounted) {
        clearTimeout(locationTimeout);
        setUserLocation(defaultLocation);
        fetchNearbyStores(defaultLocation);
      }
    }
    
    return () => {
      isMounted = false;
      clearTimeout(locationTimeout);
    };
  }, [maxStores, activeCategory]);
  
  // Format distance to show one decimal place
  const formatDistance = (distance: number): string => {
    return distance.toFixed(1);
  };
  
  const handleCategoryChange = (category: Store['category'] | 'all') => {
    setActiveCategory(category);
    setIsLoading(true);
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-gloop-primary" />
        <span className="ml-2">Finding stores near you...</span>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gloop-text-muted dark:text-gloop-dark-text-muted">
          {nearbyStores.length === 0 ? "No stores found" : `${nearbyStores.length} stores nearby`}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-gloop-text-muted dark:text-gloop-dark-text-muted"
          onClick={toggleFilters}
        >
          <Filter className="h-3.5 w-3.5" />
          Filter
        </Button>
      </div>
      
      {showFilters && (
        <div className="mb-3 flex flex-wrap gap-1">
          {categories.map(category => (
            <Badge 
              key={category.value}
              variant={activeCategory === category.value ? "default" : "outline"}
              className={`cursor-pointer ${activeCategory === category.value ? 'bg-gloop-primary' : ''}`}
              onClick={() => handleCategoryChange(category.value)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
      )}
      
      {error ? (
        <div className="text-center p-4 text-gloop-text-muted dark:text-gloop-dark-text-muted">
          {error}
        </div>
      ) : nearbyStores.length === 0 ? (
        <div className="text-center p-4 text-gloop-text-muted dark:text-gloop-dark-text-muted">
          No stores found nearby.
          {activeCategory !== 'all' && (
            <Button 
              variant="link" 
              className="block mx-auto mt-1 text-gloop-primary p-0"
              onClick={() => handleCategoryChange('all')}
            >
              View all store types
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {nearbyStores.map((store) => (
              <Link to={`/map?storeId=${store.id}`} key={store.id} className="block">
                <Card className="premium-card hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{store.name}</div>
                      <div className="text-sm text-gloop-text-muted dark:text-gloop-dark-text-muted">
                        {formatDistance(store.distance)} miles away
                        {store.hours && <span> • {store.hours}</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gloop-text-muted dark:text-gloop-dark-text-muted" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          <Link to="/map" className="block mt-3">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 premium-card"
            >
              <Map className="h-4 w-4" />
              View All on Map
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default NearbyStores; 