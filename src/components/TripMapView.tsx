import React, { useState, useEffect, useRef } from 'react';
import { Map, MapPin, X, Search, Filter, Navigation, Store as StoreIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TripData } from './TripDetailModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { stores, Store, findStoreByName, getStoresByCategory } from '@/data/stores';

interface TripMapViewProps {
  trips: TripData[];
  onTripClick: (trip: TripData) => void;
  onClose: () => void;
}

// Declare global Google Maps types
declare global {
  interface Window {
    initTripMap: () => void;
    google: any;
  }
}

const TripMapView: React.FC<TripMapViewProps> = ({ trips, onTripClick, onClose }) => {
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 37.78, lng: -122.41 });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [tripsWithStores, setTripsWithStores] = useState<(TripData & { lat: number, lng: number })[]>([]);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

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

  // Load Google Maps
  useEffect(() => {
    // Connect trips with store coordinates
    const tripsWithCoords = trips.map(trip => {
      const storeInfo = findStoreByName(trip.store);
      return {
        ...trip,
        lat: storeInfo?.lat || userLocation.lat + (Math.random() * 0.01 - 0.005),
        lng: storeInfo?.lng || userLocation.lng + (Math.random() * 0.01 - 0.005)
      };
    });
    setTripsWithStores(tripsWithCoords);

    // Load Google Maps script
    const loadGoogleMapsScript = () => {
      // Check if script is already loaded
      if (window.google && window.google.maps) {
        initTripMap();
        return () => {};
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCC9n6z-koJp5qiyOOPRRag3qudrcfOeK8&libraries=places,geometry&callback=initTripMap&loading=async&v=weekly&csp_nonce=cascade-nonce`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    // Initialize map when script is loaded
    window.initTripMap = () => {
      if (mapRef.current && !googleMapRef.current) {
        const mapOptions = {
          center: userLocation,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true
        };
        
        googleMapRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
        infoWindowRef.current = new window.google.maps.InfoWindow();
        
        // Add markers for all trips
        addTripMarkers(tripsWithCoords);
      }
    };

    const cleanup = loadGoogleMapsScript();
    return cleanup;
  }, [trips, userLocation]);

  // Add markers for all trips
  const addTripMarkers = (tripsWithCoords: (TripData & { lat: number, lng: number })[]) => {
    if (!googleMapRef.current || !window.google) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
    
    const bounds = new window.google.maps.LatLngBounds();
    
    // Check if AdvancedMarkerElement is available (newer API)
    const useAdvancedMarker = window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement;
    
    tripsWithCoords.forEach((trip) => {
      if (useAdvancedMarker) {
        // Create advanced marker (recommended by Google)
        const markerElement = document.createElement('div');
        markerElement.className = 'marker-container';
        markerElement.innerHTML = `
          <div style="
            width: 30px; 
            height: 30px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            background-color: ${getMarkerColor(trip.status)};
            color: white;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 2px solid white;
          ">
            ${trip.items.length}
          </div>
        `;
        
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: trip.lat, lng: trip.lng },
          map: googleMapRef.current,
          title: trip.store,
          content: markerElement
        });
        
        // Add click listener to marker
        marker.addListener('click', () => {
          handleTripMarkerClick(trip, marker);
        });
        
        markersRef.current.push(marker);
      } else {
        // Fallback to legacy marker if AdvancedMarkerElement is not available
        const marker = new window.google.maps.Marker({
          position: { lat: trip.lat, lng: trip.lng },
          map: googleMapRef.current,
          title: trip.store,
          label: {
            text: trip.items.length.toString(),
            color: '#FFFFFF'
          },
          icon: {
            path: 'M10 27c-.2 0-.2 0-.5-1-.3-.8-.7-2-1.6-3.5-1-1.5-2-2.7-3-3.8-2.2-2.8-3.9-5-3.9-8.8C1 4.9 5 1 10 1s9 4 9 8.9c0 3.9-1.8 6-4 8.8-1 1.2-1.9 2.4-2.8 3.8-.3 1-.4 1-.6 1Z',
            fillColor: getMarkerColor(trip.status),
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#FFFFFF',
            anchor: new window.google.maps.Point(15, 29),
            scale: 1.2,
            labelOrigin: new window.google.maps.Point(10, 9),
          }
        });
        
        // Add click listener to marker
        marker.addListener('click', () => {
          handleTripMarkerClick(trip, marker);
        });
        
        markersRef.current.push(marker);
      }
      
      bounds.extend({ lat: trip.lat, lng: trip.lng });
    });
    
    // Add user location marker
    const userMarker = new window.google.maps.Marker({
      position: userLocation,
      map: googleMapRef.current,
      title: "Your Location",
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
    bounds.extend(userLocation);
    
    // Fit map to show all markers
    if (tripsWithCoords.length > 0) {
      googleMapRef.current.fitBounds(bounds);
      
      // If only one marker, zoom out a bit
      if (tripsWithCoords.length === 1) {
        googleMapRef.current.setZoom(14);
      }
    }
  };

  // Get marker color based on trip status
  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#4CAF50'; // Green
      case 'shopping':
        return '#2196F3'; // Blue
      case 'completed':
        return '#9E9E9E'; // Gray
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#FF9800'; // Orange
    }
  };

  // Handle trip marker click
  const handleTripMarkerClick = (trip: TripData, marker: any) => {
    setSelectedTrip(trip);
    
    if (infoWindowRef.current) {
      const contentString = `
        <div style="padding: 8px; max-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 16px;">${trip.store}</h3>
          <p style="margin: 0 0 4px; font-size: 14px;">${trip.items.length} items</p>
          <p style="margin: 0; font-size: 14px;">Status: ${trip.status}</p>
          <div style="margin-top: 8px;">
            <button id="view-trip-btn" style="
              background-color: #1a73e8;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">View Trip</button>
          </div>
        </div>
      `;
      
      infoWindowRef.current.setContent(contentString);
      infoWindowRef.current.open(googleMapRef.current, marker);
      
      // Add event listener to the view trip button
      setTimeout(() => {
        const viewTripBtn = document.getElementById('view-trip-btn');
        if (viewTripBtn) {
          viewTripBtn.addEventListener('click', () => {
            onTripClick(trip);
          });
        }
      }, 100);
    }
  };

  // Calculate distance between two coordinates in miles
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  // Filter trips by search query
  const filteredTrips = searchQuery.trim() === '' 
    ? tripsWithStores 
    : tripsWithStores.filter(trip => 
        trip.store.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-white dark:bg-gloop-dark-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="p-4 flex-1 flex flex-col"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Trips Map</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="Search trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gloop-text-muted dark:text-gloop-dark-text-muted" />
        </div>

        <div className="flex-1 relative rounded-lg overflow-hidden">
          {isLoadingLocation ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gloop-primary mx-auto mb-2"></div>
                <p>Getting your location...</p>
              </div>
            </div>
          ) : (
            <>
              <div 
                ref={mapRef} 
                className="h-full w-full"
              >
                {/* Google Map will be rendered here */}
              </div>
              
              {locationError && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900 p-2 rounded-md text-sm text-red-700 dark:text-red-200">
                  {locationError}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-4 flex justify-between">
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs">Open</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-xs">Shopping</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-gray-500 mr-1"></div>
              <span className="text-xs">Completed</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
              <span className="text-xs">Cancelled</span>
            </div>
          </div>
          <div className="text-xs text-gloop-text-muted dark:text-gloop-dark-text-muted">
            {filteredTrips.length} trips shown
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TripMapView;
