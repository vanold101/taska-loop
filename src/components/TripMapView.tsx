import React, { useState, useEffect, useRef } from 'react';
import { Map, MapPin, X, Search, Filter, Navigation, Store as StoreIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TripData } from './TripDetailModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { stores, Store, findStoreByName, getStoresByCategory } from '@/data/stores';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { initGoogleMapsDirections, initGoogleMapsGeometry } from '@/services/googlePlaces';

interface TripMapViewProps {
  trips: TripData[];
  onTripClick: (trip: TripData) => void;
  onClose: () => void;
}

const TripMapView: React.FC<TripMapViewProps> = ({ trips, onTripClick, onClose }) => {
  const { toast } = useToast();
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 37.78, lng: -122.41 });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [tripsWithStores, setTripsWithStores] = useState<(TripData & { lat: number, lng: number })[]>([]);
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<google.maps.DirectionsResult | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  // Get user's location on initial load
  useEffect(() => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Could not access your location. Using default location instead.");
          setIsLoadingLocation(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser. Using default location instead.");
      setIsLoadingLocation(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      if (mapRef.current && !googleMapRef.current) {
        try {
          await initGoogleMapsDirections();
          await initGoogleMapsGeometry();

          const mapOptions = {
            center: userLocation,
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          };
          
          const map = new window.google.maps.Map(mapRef.current, mapOptions);
          googleMapRef.current = map;
          infoWindowRef.current = new window.google.maps.InfoWindow();
          
          directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
            suppressMarkers: true,
            preserveViewport: false,
            polylineOptions: {
              strokeColor: '#4285F4',
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          });
          
          directionsRendererRef.current.setMap(map);

        } catch (error) {
          console.error("Failed to initialize Google Maps", error);
          toast({
            title: "Map Error",
            description: "Could not load the map. Please try again later.",
            variant: "destructive"
          });
        }
      }
    };
    
    if (!isLoadingLocation) {
      initializeMap();
    }
  }, [isLoadingLocation, userLocation, toast]);

  // Update markers when trips or map is ready
  useEffect(() => {
    if (googleMapRef.current && trips.length > 0) {
      const tripsWithCoords = trips.map(trip => {
        const storeInfo = findStoreByName(trip.store);
        return {
          ...trip,
          lat: storeInfo?.lat || userLocation.lat + (Math.random() * 0.01 - 0.005),
          lng: storeInfo?.lng || userLocation.lng + (Math.random() * 0.01 - 0.005)
        };
      });
      setTripsWithStores(tripsWithCoords);
      addTripMarkers(tripsWithCoords);
    }
  }, [trips, googleMapRef.current, userLocation]);

  // Add markers for all trips
  const addTripMarkers = (tripsWithStores: (TripData & { lat: number, lng: number })[]) => {
    if (!googleMapRef.current || !window.google) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
    
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(userLocation);
    
    // Add user location marker
    const userMarker = new window.google.maps.Marker({
      position: userLocation,
      map: googleMapRef.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        scale: 8
      }
    });
    markersRef.current.push(userMarker);
    
    tripsWithStores.forEach((trip) => {
      const marker = new window.google.maps.Marker({
        position: { lat: trip.lat, lng: trip.lng },
        map: googleMapRef.current,
        title: trip.store,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
      });
      
      marker.addListener('click', () => {
        handleTripMarkerClick(trip, marker);
      });
      
      markersRef.current.push(marker);
      bounds.extend({ lat: trip.lat, lng: trip.lng });
    });
    
    // Fit bounds with padding
    googleMapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  };

  const handleTripMarkerClick = (trip: TripData, marker: google.maps.Marker) => {
    if (!infoWindowRef.current || !googleMapRef.current) return;
    
    const contentString = `
      <div class="p-3">
        <h3 class="font-semibold mb-2">${trip.store}</h3>
        <p class="text-sm mb-1">${trip.items.length} items</p>
        <p class="text-sm mb-2">Status: ${trip.status}</p>
        <button
          id="view-trip-btn"
          class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          View Details
        </button>
      </div>
    `;
    
    infoWindowRef.current.setContent(contentString);
    infoWindowRef.current.open(googleMapRef.current, marker);
    
    // Add click listener to the view button
    setTimeout(() => {
      const viewBtn = document.getElementById('view-trip-btn');
      if (viewBtn) {
        viewBtn.addEventListener('click', () => {
          onTripClick(trip);
          infoWindowRef.current?.close();
        });
      }
    }, 0);
  };

  const optimizeRoute = async () => {
    if (!googleMapRef.current || !window.google || tripsWithStores.length === 0) {
      toast({
        title: "Cannot optimize route",
        description: "No trips available or map not initialized",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizingRoute(true);

    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      // Google Maps has a limit of 25 waypoints in the free tier
      if (tripsWithStores.length > 25) {
        toast({
          title: "Too many stops",
          description: "Route optimization is limited to 25 stops. Only the first 25 stops will be included.",
          variant: "default"
        });
      }

      // Take only the first 25 trips to stay within limits
      const tripsToOptimize = tripsWithStores.slice(0, 25);
      
      // Create waypoints from trips
      const waypoints = tripsToOptimize.map(trip => ({
        location: new window.google.maps.LatLng(trip.lat, trip.lng),
        stopover: true
      }));

      // Clear existing route if any
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          preserveViewport: false,
          polylineOptions: {
            strokeColor: '#4285F4',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });
        directionsRendererRef.current.setMap(googleMapRef.current);
      }

      const result = await directionsService.route({
        origin: userLocation,
        destination: userLocation, // Return to start
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
      });

      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(result);
      }

      setOptimizedRoute(result);

      // Calculate total distance and duration
      const route = result.routes[0];
      let totalDistance = 0;
      let totalDuration = 0;

      route.legs.forEach(leg => {
        totalDistance += leg.distance?.value || 0;
        totalDuration += leg.duration?.value || 0;
      });

      // Get the optimized order of stops
      const optimizedOrder = route.waypoint_order.map(index => tripsToOptimize[index].store);
      const optimizedOrderStr = optimizedOrder.join(' → ');

      // Update markers to show the optimized order
      markersRef.current.forEach(marker => {
        if (marker.getTitle() !== 'Your Location') {
          const stopIndex = optimizedOrder.indexOf(marker.getTitle() || '');
          if (stopIndex !== -1) {
            // Update marker label to show the order
            marker.setLabel({
              text: (stopIndex + 1).toString(),
              color: '#FFFFFF',
              fontWeight: 'bold'
            });
          }
        }
      });

      toast({
        title: "Route Optimized",
        description: `Total distance: ${(totalDistance / 1000).toFixed(1)}km, Duration: ${Math.round(totalDuration / 60)} mins\nOptimized route: ${optimizedOrderStr}`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast({
        title: "Route optimization failed",
        description: "Could not calculate the optimal route",
        variant: "destructive"
      });
    } finally {
      setIsOptimizingRoute(false);
    }
  };

  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: false,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      directionsRendererRef.current.setMap(googleMapRef.current);
    }
    setOptimizedRoute(null);

    // Reset marker labels
    markersRef.current.forEach(marker => {
      if (marker.getTitle() !== 'Your Location') {
        marker.setLabel(null);
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Trip Map View
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={optimizedRoute ? clearRoute : optimizeRoute}
                disabled={isOptimizingRoute || tripsWithStores.length === 0}
              >
                {isOptimizingRoute ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Navigation className="h-4 w-4 mr-2" />
                )}
                {optimizedRoute ? 'Clear Route' : 'Optimize Route'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            View and optimize your shopping trips
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 h-full min-h-[400px] mt-4">
          <div 
            ref={mapRef} 
            className="w-full h-full rounded-lg border shadow-sm"
            style={{ minHeight: '500px' }}
          />
        </div>

        {locationError && (
          <div className="mt-2 text-sm text-amber-600">
            {locationError}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TripMapView;
