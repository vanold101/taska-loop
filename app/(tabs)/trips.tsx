import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { googlePlacesMobileService, PlaceResult, PlaceDetails } from '../../src/services/googlePlacesMobile';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import LocationAutocomplete from '../../src/components/LocationAutocomplete';
import TripsTutorial from '../../src/components/TripsTutorial';
// import * as Location from 'expo-location';

// Distance calculation utility function (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Polyline decoder utility function
const decodePolyline = (encoded: string) => {
  const poly = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    poly.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return poly;
};

export default function TripsPage() {


  const mapRef = useRef<any>(null);
  const { date } = useLocalSearchParams();
  const [trips, setTrips] = useState<any[]>([]);
  
  const [isAddTripModalVisible, setIsAddTripModalVisible] = useState(false);
  const [newTripStore, setNewTripStore] = useState('');
  const [newTripLocation, setNewTripLocation] = useState('');
  const [newTripBudget, setNewTripBudget] = useState('');
  const [newTripDate, setNewTripDate] = useState('');
  const [newTripItem, setNewTripItem] = useState('');
  const [tripItemInputs, setTripItemInputs] = useState<{ [key: string]: string }>({});
  
  // Location state
  const [selectedLocation, setSelectedLocation] = useState<PlaceDetails | null>(null);
  
  // Map state
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 40.1451, // Default to Powell, OH area
    longitude: -83.0753,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  
  // Route optimization state
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routePath, setRoutePath] = useState<any[]>([]);
  const [optimizedRouteList, setOptimizedRouteList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [includeTaskLocations, setIncludeTaskLocations] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    (date as string) || new Date().toISOString().split('T')[0]
  );
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [showTripDetail, setShowTripDetail] = useState(false);

  // Update selected date when the param changes
  useEffect(() => {
    if (date) {
      setSelectedDate(date as string);
    }
  }, [date]);

  // Track user location from the map
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);

  // Initialize with a reasonable default region but no specific user location
  useEffect(() => {
    loadTaskBasedTrips();
  }, []);

  // Load trips based on actual tasks with locations
  const loadTaskBasedTrips = () => {
    // This would normally come from a shared state or context
    // For now, only create trips if user manually adds them
  };

  const addTrip = () => {
    try {

      
      if (!newTripStore.trim()) {
        Alert.alert('Error', 'Please enter a store name.');
        return;
      }

      // Validate coordinates if we have a selected location
      let coordinates = undefined;
      if (selectedLocation) {
        
        if (selectedLocation.geometry && 
            selectedLocation.geometry.location &&
            typeof selectedLocation.geometry.location.lat === 'number' && 
            typeof selectedLocation.geometry.location.lng === 'number') {
          coordinates = selectedLocation.geometry.location;
        } else {
          coordinates = undefined;
        }
      }

      const newTrip = {
        id: Date.now().toString(),
        store: newTripStore.trim(),
        status: 'active' as 'active' | 'started' | 'completed',
        date: newTripDate || new Date().toISOString().split('T')[0],
        budget: newTripBudget.trim() ? parseFloat(newTripBudget) : 0,
        items: [] as string[],
        location: selectedLocation ? selectedLocation.formatted_address : (newTripLocation.trim() || 'No location specified'),
        coordinates: coordinates // Only set if valid
      };



      setTrips([...trips, newTrip]);
      setNewTripStore('');
      setNewTripLocation('');
      setNewTripBudget('');
      setNewTripDate('');
      setNewTripItem('');
      setSelectedLocation(null);
      setIsAddTripModalVisible(false);
      
      // Trip added successfully - no popup needed
    } catch (error) {
      console.error('❌ Error adding trip:', error);
      Alert.alert('Error', 'Failed to add trip. Please try again.');
    }
  };

  // Get user location from the map when it's available
  const handleUserLocationChange = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setUserLocation(coordinate);
  };

  // Completely rewritten route optimization function
  const optimizeRoute = async () => {
    try {
      // Get eligible trips
      let eligibleTrips = trips.filter(trip => 
        trip && 
        trip.coordinates &&
        trip.coordinates.lat && 
        trip.coordinates.lng &&
        typeof trip.coordinates.lat === 'number' &&
        typeof trip.coordinates.lng === 'number' &&
        !isNaN(trip.coordinates.lat) &&
        !isNaN(trip.coordinates.lng) &&
        (trip.status === 'started' || (trip.status === 'active' && trip.date === selectedDate))
      );
      
      // If toggle is on, include task locations (for now, just add them without coordinates)
      if (includeTaskLocations) {
        // Add simple task locations for demonstration
        const simpleTaskLocations = [
          { id: 'task1', store: 'Buy groceries', location: 'Walmart Supercenter', coordinates: { lat: 40.1451, lng: -83.0753 }, status: 'active', budget: 0, items: [], distanceFromUser: 0 },
          { id: 'task2', store: 'Pick up dry cleaning', location: 'Dry Clean Pro', coordinates: { lat: 40.1455, lng: -83.0758 }, status: 'active', budget: 0, items: [], distanceFromUser: 0 },
          { id: 'task3', store: 'Get gas', location: 'Shell Station', coordinates: { lat: 40.1448, lng: -83.0750 }, status: 'active', budget: 0, items: [], distanceFromUser: 0 }
        ];
        
        // Combine trips and task locations
        eligibleTrips = [...eligibleTrips, ...simpleTaskLocations];
      }
      

      
      if (eligibleTrips.length < 1) {
        Alert.alert('Route Optimization', 'Need at least 1 trip with a valid location to optimize a route.');
        return;
      }

      // Limit the number of trips to prevent API limits and performance issues
      const maxTrips = 24; // Google Maps allows 23 waypoints + origin + destination = 25 total
      if (eligibleTrips.length > maxTrips) {
        Alert.alert(
          'Too Many Destinations', 
          `You have ${eligibleTrips.length} trips, but we can only optimize routes for up to ${maxTrips} destinations at once. The ${maxTrips} closest trips will be optimized.`,
          [{ text: 'OK' }]
        );
      }

      // Check if we have user location
      if (!userLocation) {
        Alert.alert(
          'Location Required', 
          'Please allow location access. The map needs to detect your current location to create an optimized route.',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsOptimizing(true);
      
      // Calculate distances from user location to each trip
      const tripsWithDistance = eligibleTrips.map(trip => {
        try {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            trip.coordinates!.lat,
            trip.coordinates!.lng
          );
          return {
            ...trip,
            distanceFromUser: isNaN(distance) ? 999999 : distance // Put invalid distances at the end
          };
        } catch (error) {
          console.error('Error calculating distance for trip:', trip.id, error);
          return {
            ...trip,
            distanceFromUser: 999999 // Put error trips at the end
          };
        }
      });



      // Sort by distance (closest first) and limit to maxTrips
      const sortedTrips = tripsWithDistance
        .sort((a, b) => a.distanceFromUser - b.distanceFromUser)
        .slice(0, maxTrips); // Limit to maximum allowed trips
      


      // Store the optimized route list for the route display
      setOptimizedRouteList(sortedTrips);

      // MapViewDirections will handle the actual routing, we just need to fit the map
      try {
        const allLocations = [
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          ...sortedTrips.map(trip => ({ 
            latitude: trip.coordinates!.lat, 
            longitude: trip.coordinates!.lng 
          })).filter(location => 
            typeof location.latitude === 'number' &&
            typeof location.longitude === 'number' &&
            !isNaN(location.latitude) &&
            !isNaN(location.longitude)
          )
        ];

        // Fit map to show all locations (with safety checks)
        if (mapRef.current && allLocations.length > 1) {
          try {
            mapRef.current.fitToCoordinates(allLocations, {
              edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
              animated: true,
            });
          } catch (mapError) {
            console.error('Error fitting map to coordinates:', mapError);
            // Continue without fitting the map
          }
        }
      } catch (locationError) {
        console.error('Error preparing locations for map:', locationError);
        // Continue with the route optimization
      }

      // Calculate total estimated distance (safely)
      const totalDistance = sortedTrips.reduce((sum, trip) => {
        const distance = trip.distanceFromUser || 0;
        return sum + (isNaN(distance) ? 0 : distance);
      }, 0);

      // Create route description with error handling
      const routeDescription = sortedTrips.map((trip, index) => {
        try {
          const distance = trip.distanceFromUser || 0;
          const distanceStr = isNaN(distance) ? 'unknown' : distance.toFixed(1);
          const storeName = trip.store || 'Unknown Store';
          return `${index + 1}. ${storeName} (${distanceStr} km away)`;
        } catch (error) {
          console.error('Error formatting trip in route description:', error);
          return `${index + 1}. ${trip.store || 'Unknown'} (distance error)`;
        }
      }).join('\n');

      Alert.alert(
        'Route Optimized!',
        `Route created starting from your current location:\n\n` +
        `Total Estimated Distance: ${isNaN(totalDistance) ? 'unknown' : totalDistance.toFixed(1)} km\n\n` +
        `Route Order (closest first):\n${routeDescription}` +
        (sortedTrips.length < eligibleTrips.length ? 
          `\n\nNote: Showing ${sortedTrips.length} of ${eligibleTrips.length} destinations (API limit).` : ''),
        [
          { text: 'Close', style: 'cancel' },
          { 
            text: 'View Route', 
            onPress: () => {
              if (mapRef.current && routePath.length > 0) {
                mapRef.current.fitToCoordinates(routePath, {
                  edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
                  animated: true,
                });
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Route optimization error:', error);
      Alert.alert('Error', 'Failed to optimize route. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Location handling for the autocomplete component
  const handleLocationSelectFromAutocomplete = async (location: any) => {
    try {
      
      if (!location || !location.place_id) {
        console.warn('⚠️ Invalid location object or missing place_id');
        setNewTripLocation(location?.description || 'Unknown location');
        return;
      }

      const placeDetails = await googlePlacesMobileService.getPlaceDetails(location.place_id);
      
      if (placeDetails) {
        // Validate the place details structure
        if (placeDetails.geometry && 
            placeDetails.geometry.location &&
            typeof placeDetails.geometry.location.lat === 'number' && 
            typeof placeDetails.geometry.location.lng === 'number') {
          setSelectedLocation(placeDetails);
          setNewTripLocation(location.description);
        } else {
          setSelectedLocation(null);
          setNewTripLocation(location.description);
        }
      } else {
        setSelectedLocation(null);
        setNewTripLocation(location.description);
      }
    } catch (error) {
      console.error('❌ Error getting place details:', error);
      // Fallback: just use the description
      setSelectedLocation(null);
      setNewTripLocation(location?.description || 'Error loading location');
      Alert.alert('Location Error', 'Could not load location details. Using location name only.');
    }
  };

  // Open optimized route in Google Maps
  const openInGoogleMaps = () => {
    try {
      
      if (!userLocation) {
        Alert.alert('Error', 'Your current location is required to open the route in Google Maps.');
        return;
      }

      if (optimizedRouteList.length === 0) {
        Alert.alert('Error', 'No destinations available to open in Google Maps.');
        return;
      }

      // Validate that all trips have valid coordinates
      const validTrips = optimizedRouteList.filter(trip => 
        trip.coordinates && 
        typeof trip.coordinates.lat === 'number' && 
        typeof trip.coordinates.lng === 'number'
      );

      if (validTrips.length === 0) {
        Alert.alert('Error', 'No valid coordinates found for the route destinations.');
        return;
      }



      // Create waypoints string for Google Maps (excluding the last destination)
      const waypoints = validTrips.slice(0, -1).map(trip => 
        `${trip.coordinates.lat},${trip.coordinates.lng}`
      ).join('|');

      const destination = validTrips[validTrips.length - 1];

      // Create Google Maps URL with user location as origin
      let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.coordinates.lat},${destination.coordinates.lng}&travelmode=driving`;
      
      // Add waypoints if we have any
      if (waypoints) {
        googleMapsUrl += `&waypoints=${waypoints}`;
      }

      Linking.openURL(googleMapsUrl);
    } catch (error) {
      console.error('❌ Error opening Google Maps:', error);
      Alert.alert('Error', 'Failed to open Google Maps. Please try again.');
    }
  };

  // Handle trip selection for detail view
  const handleTripSelect = (trip: any) => {
    try {
      if (!trip || !trip.id) {
        console.error('Invalid trip object');
        Alert.alert('Error', 'Invalid trip selected.');
        return;
      }
      
      // Handle tasks and trips the same way - show detail modal for both
      setSelectedTrip(trip);
      setShowTripDetail(true);
    } catch (error) {
      console.error('❌ Error selecting trip:', error);
      Alert.alert('Error', 'Failed to open trip details.');
    }
  };

  // Handle trip deletion from detail modal
  const handleDeleteTripFromDetail = () => {
    try {
      if (!selectedTrip || !selectedTrip.id) {
        Alert.alert('Error', 'No trip selected for deletion.');
        return;
      }

      Alert.alert(
        `Delete ${selectedTrip.isTask ? 'Task' : 'Trip'}`,
        `Are you sure you want to delete the ${selectedTrip.isTask ? 'task' : 'trip'} to ${selectedTrip.store}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              try {

                setTrips(trips.filter(trip => trip.id !== selectedTrip.id));
                setShowTripDetail(false);
                setSelectedTrip(null);
                Alert.alert('Success', 'Trip deleted successfully.');
              } catch (error) {
                console.error('❌ Error deleting trip:', error);
                Alert.alert('Error', 'Failed to delete trip.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error in trip deletion handler:', error);
      Alert.alert('Error', 'Failed to delete trip.');
    }
  };

  const addItemToTrip = (tripId: string) => {
    try {

      const itemText = tripItemInputs[tripId] || '';
      
      if (!itemText.trim()) {
        Alert.alert('Error', 'Please enter an item name.');
        return;
      }

      if (!tripId) {
        Alert.alert('Error', 'Invalid trip selected.');
        return;
      }

      setTrips(trips.map(trip => 
        trip.id === tripId 
          ? { ...trip, items: [...trip.items, itemText.trim()] }
          : trip
      ));
      setTripItemInputs(prev => ({ ...prev, [tripId]: '' }));

      Alert.alert('Item Added', `"${itemText.trim()}" added to your trip!`);
    } catch (error) {
      console.error('❌ Error adding item to trip:', error);
      Alert.alert('Error', 'Failed to add item to trip.');
    }
  };

  const removeItemFromTrip = (tripId: string, itemIndex: number) => {
    try {

      
      if (!tripId) {
        Alert.alert('Error', 'Invalid trip selected.');
        return;
      }

      if (typeof itemIndex !== 'number' || itemIndex < 0) {
        Alert.alert('Error', 'Invalid item selected for removal.');
        return;
      }

      setTrips(trips.map(trip => 
        trip.id === tripId 
          ? { ...trip, items: trip.items.filter((_: any, index: number) => index !== itemIndex) }
          : trip
      ));

    } catch (error) {
      console.error('❌ Error removing item from trip:', error);
      Alert.alert('Error', 'Failed to remove item from trip.');
    }
  };

  const startTrip = (tripId: string) => {
    try {

      
      if (!tripId) {
        Alert.alert('Error', 'Invalid trip selected.');
        return;
      }

      setTrips(trips.map(trip => 
        trip.id === tripId 
          ? { 
              ...trip, 
              status: 'started' as const,
              date: new Date().toISOString().split('T')[0]
            }
          : trip
      ));

      Alert.alert('Trip Started', 'Your trip has been started and added to today\'s routes!');
    } catch (error) {
      console.error('❌ Error starting trip:', error);
      Alert.alert('Error', 'Failed to start trip.');
    }
  };

  const completeTrip = (tripId: string) => {
    try {

      
      if (!tripId) {
        Alert.alert('Error', 'Invalid trip selected.');
        return;
      }

      setTrips(trips.map(trip => 
        trip.id === tripId ? { ...trip, status: 'completed' } : trip
      ));

      Alert.alert('Trip Completed', 'Great job! Your trip has been marked as completed.');
    } catch (error) {
      console.error('❌ Error completing trip:', error);
      Alert.alert('Error', 'Failed to complete trip.');
    }
  };

  const deleteTrip = (tripId: string) => {
    try {

      
      if (!tripId) {
        Alert.alert('Error', 'Invalid trip selected.');
        return;
      }

      Alert.alert(
        'Delete Trip',
        'Are you sure you want to delete this trip?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              try {
                setTrips(trips.filter(trip => trip.id !== tripId));
                
                Alert.alert('Success', 'Trip deleted successfully.');
              } catch (error) {
                console.error('❌ Error deleting trip:', error);
                Alert.alert('Error', 'Failed to delete trip.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error in trip deletion handler:', error);
      Alert.alert('Error', 'Failed to delete trip.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'started': return '#9C27B0';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'play-circle';
      case 'started': return 'navigate-circle';
      case 'completed': return 'checkmark-circle';
      case 'cancelled': return 'close-circle';
      default: return 'time';
    }
  };

  const activeTrips = trips.filter(trip => trip.status === 'active' || trip.status === 'started');
  const completedTrips = trips.filter(trip => trip.status === 'completed');
  
  // Filter trips by selected date
  const selectedDateTrips = trips.filter(trip => trip.date === selectedDate);
  const selectedDateActiveTrips = selectedDateTrips.filter(trip => trip.status === 'active' || trip.status === 'started');
  
  // Simple task locations for demonstration
  const taskLocations = [
    { id: 'task1', store: 'Buy groceries', location: 'Walmart Supercenter', isTask: true, status: 'pending', budget: '0', items: [], date: new Date().toISOString().split('T')[0] },
    { id: 'task2', store: 'Pick up dry cleaning', location: 'Dry Clean Pro', isTask: true, status: 'pending', budget: '0', items: [], date: new Date().toISOString().split('T')[0] },
    { id: 'task3', store: 'Get gas', location: 'Shell Station', isTask: true, status: 'pending', budget: '0', items: [], date: new Date().toISOString().split('T')[0] }
  ];
  
  // Combine trips and task locations when toggle is on
  const todayItems = includeTaskLocations 
    ? [...selectedDateActiveTrips, ...taskLocations]
    : selectedDateActiveTrips;
    
  // Combine all trips and task locations when toggle is on
  const allItems = includeTaskLocations 
    ? [...activeTrips, ...taskLocations]
    : activeTrips;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
                      <Text style={styles.title}>Trips</Text>
        <Text style={styles.subtitle}>Plan and manage your trips</Text>
            </View>
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => setShowTutorial(true)}
            >
              <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Trip Button */}
        <View style={styles.addTripContainer}>
          <TouchableOpacity 
            style={styles.addTripButton}
            onPress={() => setIsAddTripModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addTripText}>Add New Trip</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'today' && styles.activeTabButton]}
            onPress={() => setActiveTab('today')}
          >
            <Ionicons 
              name="today" 
              size={20} 
              color={activeTab === 'today' ? '#007AFF' : '#666'} 
            />
            <Text style={[styles.tabButtonText, activeTab === 'today' && styles.activeTabButtonText]}>
              Today's Routes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'all' && styles.activeTabButton]}
            onPress={() => setActiveTab('all')}
          >
            <Ionicons 
              name="list" 
              size={20} 
              color={activeTab === 'all' ? '#007AFF' : '#666'} 
            />
            <Text style={[styles.tabButtonText, activeTab === 'all' && styles.activeTabButtonText]}>
              All Routes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Include Task Locations Toggle */}
        <View style={styles.taskLocationsToggle}>
          <Text style={styles.taskLocationsLabel}>Include task locations in routes</Text>
          <TouchableOpacity 
            style={[styles.toggleSwitch, includeTaskLocations && styles.toggleSwitchActive]}
            onPress={() => {
              const newValue = !includeTaskLocations;
              console.log('Toggle pressed, new value:', newValue);
              setIncludeTaskLocations(newValue);
            }}
          >
            <View style={[styles.toggleKnob, includeTaskLocations && styles.toggleKnobActive]} />
          </TouchableOpacity>
        </View>

        {/* Today's Routes */}
        {activeTab === 'today' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedDate === new Date().toISOString().split('T')[0] ? "Today's" : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Routes ({todayItems.length})
              {includeTaskLocations && ` - Including ${taskLocations.length} task locations`}
            </Text>
            
            {todayItems.length > 0 ? (
              todayItems.map(trip => (
                <TouchableOpacity 
                  key={trip.id} 
                  style={styles.tripCard}
                  onPress={() => handleTripSelect(trip)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tripHeader}>
                    <View style={styles.tripInfo}>
                      <Text style={styles.tripTitle}>{trip.store}</Text>
                      <Text style={styles.tripLocation}>
                        <Ionicons name="location" size={14} color="#666" />
                        {' '}{trip.location}
                      </Text>
                      <Text style={styles.tripDate}>
                        {trip.status === 'started' ? 'Started today' : `Planned for: ${trip.date}`}
                      </Text>
                    </View>
                    <View style={styles.tripActions}>
                      <Ionicons 
                        name={getStatusIcon(trip.status)} 
                        size={20} 
                        color={getStatusColor(trip.status)} 
                      />
                      <Ionicons name="chevron-forward" size={16} color="#B3B3B3" style={{ marginLeft: 8 }} />
                    </View>
                  </View>
                  
                  {!trip.isTask ? (
                    <>
                      <View style={styles.tripDetails}>
                        <Text style={styles.tripBudget}>Budget: ${trip.budget}</Text>
                        <Text style={styles.tripItems}>
                          Items: {trip.items.length > 0 ? trip.items.join(', ') : 'No items added'}
                        </Text>
                      </View>
                      
                      {/* Add Item Input */}
                      <View style={styles.addItemRow}>
                        <TextInput
                          style={[styles.addItemInput, { flex: 1, marginRight: 8 }]}
                          placeholder="Add item..."
                          placeholderTextColor="#666"
                          value={tripItemInputs[trip.id] || ''}
                          onChangeText={(text) => setTripItemInputs(prev => ({ ...prev, [trip.id]: text }))}
                          onFocus={(e) => e.stopPropagation()}
                        />
                        <TouchableOpacity 
                          style={styles.addItemButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            addItemToTrip(trip.id);
                          }}
                        >
                          <Ionicons name="add" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <View style={styles.tripDetails}>
                      <Text style={styles.tripItems}>Task Location</Text>
                    </View>
                  )}

                  {!trip.isTask ? (
                    <View style={styles.tripActions}>
                      <TouchableOpacity 
                        style={styles.startButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          startTrip(trip.id);
                        }}
                      >
                        <Ionicons name="play" size={16} color="white" />
                        <Text style={styles.startButtonText}>Start Trip</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.completeButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          completeTrip(trip.id);
                        }}
                      >
                        <Ionicons name="checkmark" size={16} color="white" />
                        <Text style={styles.completeButtonText}>Complete</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteTrip(trip.id);
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.tripActions}>
                      <TouchableOpacity 
                        style={styles.completeButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          // For tasks, we could mark them as completed
                          console.log('Task completed:', trip.title);
                        }}
                      >
                        <Ionicons name="checkmark" size={16} color="white" />
                        <Text style={styles.completeButtonText}>Complete Task</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noTripsText}>No routes planned for {selectedDate === new Date().toISOString().split('T')[0] ? 'today' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            )}
          </View>
        )}

        {/* All Active Trips */}
        {activeTab === 'all' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Active Trips ({allItems.length})</Text>
            
            {allItems.length > 0 ? (
              allItems.map(trip => (
                <TouchableOpacity 
                  key={trip.id} 
                  style={styles.tripCard}
                  onPress={() => handleTripSelect(trip)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tripHeader}>
                    <View style={styles.tripInfo}>
                      <Text style={styles.tripTitle}>{trip.store}</Text>
                      <Text style={styles.tripLocation}>
                        <Ionicons name="location" size={14} color="#666" />
                        {' '}{trip.location}
                      </Text>
                      <Text style={styles.tripDate}>
                        {trip.status === 'started' ? 'Started today' : `Planned for: ${trip.date}`}
                      </Text>
                    </View>
                    <View style={styles.tripActions}>
                      <Ionicons 
                        name={getStatusIcon(trip.status)} 
                        size={20} 
                        color={getStatusColor(trip.status)} 
                      />
                      <Ionicons name="chevron-forward" size={16} color="#B3B3B3" style={{ marginLeft: 8 }} />
                    </View>
                  </View>
                  
                  {!trip.isTask ? (
                    <>
                      <View style={styles.tripDetails}>
                        <Text style={styles.tripBudget}>Budget: ${trip.budget}</Text>
                        
                        {/* Shopping List */}
                        <View style={styles.shoppingListSection}>
                          <Text style={styles.shoppingListTitle}>Shopping List ({trip.items.length} items):</Text>
                          {trip.items.length > 0 ? (
                            trip.items.map((item: any, index: number) => (
                              <View key={index} style={styles.shoppingListItem}>
                                <Text style={styles.shoppingItemText}>{item}</Text>
                                <TouchableOpacity 
                                  style={styles.removeItemButton}
                                  onPress={() => removeItemFromTrip(trip.id, index)}
                                >
                                  <Ionicons name="close-circle" size={16} color="#F44336" />
                                </TouchableOpacity>
                              </View>
                            ))
                          ) : (
                            <Text style={styles.noItemsText}>No items added yet</Text>
                          )}
                          
                          {/* Add Item Input */}
                          <View style={styles.addItemRow}>
                            <TextInput
                              style={styles.addItemInput}
                              placeholder="Add item..."
                              placeholderTextColor="#666"
                              value={tripItemInputs[trip.id] || ''}
                              onChangeText={(text) => setTripItemInputs(prev => ({ ...prev, [trip.id]: text }))}
                            />
                            <TouchableOpacity 
                              style={styles.addItemButton}
                              onPress={() => addItemToTrip(trip.id)}
                            >
                              <Ionicons name="add" size={20} color="white" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </>
                  ) : (
                    <View style={styles.tripDetails}>
                      <Text style={styles.tripItems}>Task Location</Text>
                    </View>
                  )}

                  {!trip.isTask ? (
                    <View style={styles.tripActions}>
                      <TouchableOpacity 
                        style={styles.startButton}
                        onPress={() => startTrip(trip.id)}
                      >
                        <Ionicons name="play" size={16} color="white" />
                        <Text style={styles.startButtonText}>Start Trip</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.completeButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          completeTrip(trip.id);
                        }}
                      >
                        <Ionicons name="checkmark" size={16} color="white" />
                        <Text style={styles.completeButtonText}>Complete</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteTrip(trip.id);
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.tripActions}>
                      <TouchableOpacity 
                        style={styles.completeButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          // For tasks, we could mark them as completed
                          console.log('Task completed:', trip.title);
                        }}
                      >
                        <Ionicons name="checkmark" size={16} color="white" />
                        <Text style={styles.completeButtonText}>Complete Task</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noTripsText}>No active trips planned</Text>
            )}
          </View>
        )}

        {/* Map View Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Map & Route Optimization</Text>
          
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={currentLocation}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              showsScale={true}
              onUserLocationChange={handleUserLocationChange}
            >
              {/* User location is shown by showsUserLocation={true} */}
              
              {/* Trip markers with numbers based on route optimization */}
              {optimizedRouteList.length > 0 ? (
                optimizedRouteList.map((trip, index) => {
                  // Safety checks for each marker
                  if (!trip || !trip.coordinates || !trip.id) {
                    console.warn('Invalid trip data for marker:', trip);
                    return null;
                  }
                  
                  const lat = trip.coordinates.lat;
                  const lng = trip.coordinates.lng;
                  
                  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
                    console.warn('Invalid coordinates for trip:', trip.id);
                    return null;
                  }

                  try {
                    const distance = trip.distanceFromUser || 0;
                    const distanceStr = isNaN(distance) ? 'unknown' : distance.toFixed(1);
                    
                    return (
                      <Marker
                        key={trip.id}
                        coordinate={{
                          latitude: lat,
                          longitude: lng,
                        }}
                        title={`${index + 1}. ${trip.store || 'Unknown Store'}`}
                        description={`${trip.status || 'unknown'} • $${trip.budget || '0'} • ${distanceStr} km away`}
                      >
                        <View style={styles.numberMarker}>
                          <Text style={styles.numberMarkerText}>{index + 1}</Text>
                        </View>
                      </Marker>
                    );
                  } catch (error) {
                    console.error('Error rendering numbered marker for trip:', trip.id, error);
                    return null;
                  }
                }).filter(marker => marker !== null) // Remove null markers
              ) : (
                selectedDateTrips.filter(trip => trip.coordinates && trip.date === selectedDate).map(trip => (
                  <Marker
                    key={trip.id}
                    coordinate={{
                      latitude: trip.coordinates.lat,
                      longitude: trip.coordinates.lng,
                    }}
                    title={trip.store}
                    description={`${trip.status} • $${trip.budget}`}
                    pinColor={trip.status === 'active' ? '#4CAF50' : trip.status === 'started' ? '#9C27B0' : '#FF9800'}
                  />
                ))
              )}
              
              {/* MapViewDirections for road-based routing */}
              {userLocation && optimizedRouteList.length > 0 && (() => {
                // Get API key from environment (hardcoded for Expo since env vars don't load properly in dev)
                const envApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
                const apiKey = envApiKey || 'AIzaSyAB-h4_VucPyVktYcdIW5At9edXaQXRL10'; // Fallback from .env file
                

                
                // Validate that all routes have proper coordinates
                const validRoutes = optimizedRouteList.filter(trip => 
                  trip.coordinates && 
                  typeof trip.coordinates.lat === 'number' && 
                  typeof trip.coordinates.lng === 'number'
                );
                
                if (validRoutes.length === 0) {
                  console.warn('No valid routes with coordinates found');
                  return null;
                }
                
                // Google Maps API has a limit of 23 waypoints (plus origin and destination)
                // So we can handle up to 25 total locations
                const maxLocations = 25;
                const limitedRoutes = validRoutes.slice(0, maxLocations);
                
                if (limitedRoutes.length === 0) {
                  console.warn('No routes after limiting');
                  return null;
                }
                
                const destination = limitedRoutes[limitedRoutes.length - 1];
                const waypoints = limitedRoutes.length > 1 ? limitedRoutes.slice(0, -1) : [];
                
                // Additional safety check
                if (!destination || !destination.coordinates) {
                  console.warn('Invalid destination coordinates');
                  return null;
                }
                
                try {
                  return (
                    <MapViewDirections
                      origin={{
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                      }}
                      destination={{
                        latitude: destination.coordinates.lat,
                        longitude: destination.coordinates.lng,
                      }}
                      waypoints={waypoints.length > 0 ? waypoints.map(trip => ({
                        latitude: trip.coordinates.lat,
                        longitude: trip.coordinates.lng,
                      })).filter(point => 
                        typeof point.latitude === 'number' && 
                        typeof point.longitude === 'number' &&
                        !isNaN(point.latitude) && 
                        !isNaN(point.longitude)
                      ) : undefined}
                      apikey={apiKey}
                      strokeWidth={4}
                      strokeColor="#2E8BFF"
                      optimizeWaypoints={true}
                      onReady={(result) => {
                  
                        // Store the optimized route coordinates for future use
                        setRoutePath(result.coordinates);
                      }}
                      onError={(errorMessage) => {
                        console.error('❌ MapViewDirections ERROR:', errorMessage);
                  
                        // Fallback to straight lines
                        const fallbackRoute = [
                          { latitude: userLocation.latitude, longitude: userLocation.longitude },
                          ...validRoutes.map(trip => ({ 
                            latitude: trip.coordinates.lat, 
                            longitude: trip.coordinates.lng 
                          }))
                        ];
                        setRoutePath(fallbackRoute);
                      }}
                    />
                  );
                } catch (error) {
                  console.error('MapViewDirections render error:', error);
                  return null;
                }
              })()}
              
              {/* Fallback Polyline if MapViewDirections fails or no API key */}
              {routePath.length > 1 && (
                <Polyline
                  coordinates={routePath}
                  strokeColor="#2E8BFF"
                  strokeWidth={4}
                />
              )}
            </MapView>
          </View>

          <View style={styles.mapActions}>
            <TouchableOpacity 
              style={[styles.mapActionButton, isOptimizing && styles.disabledButton]} 
              onPress={optimizeRoute}
              disabled={isOptimizing}
            >
              {isOptimizing ? (
                <>
                  <Ionicons name="hourglass" size={20} color="#999" />
                  <Text style={[styles.mapActionText, { color: '#999' }]}>Optimizing...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="analytics" size={20} color="#FF9800" />
                  <Text style={styles.mapActionText}>Optimize Route</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Optimized Route List */}
        {optimizedRouteList.length > 0 && userLocation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Optimized Route</Text>
            <View style={styles.routeListContainer}>
              
              {/* Starting Point */}
              <View style={styles.routeItem}>
                <View style={styles.routeNumber}>
                  <Text style={styles.routeNumberText}>START</Text>
                </View>
                <View style={styles.routeItemContent}>
                  <Text style={styles.routeItemTitle}>Your Current Location</Text>
                  <Text style={styles.routeItemSubtitle}>Starting point</Text>
                </View>
                <Ionicons name="location" size={20} color="#2E8BFF" />
              </View>

              {/* Route Destinations */}
              {optimizedRouteList.map((trip, index) => {
                // Safety checks for route list item
                if (!trip || !trip.id) {
                  console.warn('Invalid trip in route list:', trip);
                  return null;
                }

                try {
                  const distance = trip.distanceFromUser || 0;
                  const distanceStr = isNaN(distance) ? 'unknown' : distance.toFixed(1);
                  const storeName = trip.store || 'Unknown Store';
                  const location = trip.location || 'Location not specified';

                  // Check if this is a task or trip
                  const isTask = trip.id && trip.id.startsWith('task');
                  const iconName = isTask ? 'checkmark-circle' : 'storefront';
                  const iconColor = isTask ? '#4CAF50' : '#FF9800';
                  const typeLabel = isTask ? 'Task' : 'Trip';
                  
                  return (
                    <View key={trip.id} style={styles.routeItem}>
                      <View style={styles.routeNumber}>
                        <Text style={styles.routeNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.routeItemContent}>
                        <Text style={styles.routeItemTitle}>{storeName}</Text>
                        <Text style={styles.routeItemSubtitle}>
                          {typeLabel} • {distanceStr} km from you • {location}
                        </Text>
                      </View>
                      <Ionicons name={iconName} size={20} color={iconColor} />
                    </View>
                  );
                } catch (error) {
                  console.error('Error rendering route list item:', error);
                  return null;
                }
              }).filter(item => item !== null)}

              {/* Google Maps Button */}
              <TouchableOpacity style={styles.googleMapsButton} onPress={openInGoogleMaps}>
                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                <Text style={styles.googleMapsButtonText}>Open in Google Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Optimized Route Display */}
        {optimizedRoute && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Optimized Route</Text>
            <View style={styles.routeContainer}>
              <View style={styles.routeHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.routeTitle}>Route Optimized Successfully!</Text>
              </View>
              
              <View style={styles.routeDetails}>
                {optimizedRoute.legs.map((leg: any, index: number) => (
                  <View key={index} style={styles.routeLeg}>
                    <View style={styles.routeStep}>
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                      <Text style={styles.stepLocation}>{leg.end_address || `Location ${index + 1}`}</Text>
                    </View>
                    <View style={styles.routeMetrics}>
                      <Text style={styles.routeDistance}>{leg.distance?.text || 'N/A'}</Text>
                      <Text style={styles.routeDuration}>{leg.duration?.text || 'N/A'}</Text>
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={styles.routeButtons}>
                <TouchableOpacity 
                  style={styles.googleMapsButton}
                  onPress={() => {
                    if (optimizedRoute && routePath.length > 1) {
                      const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
                      const destination = `${routePath[1].latitude},${routePath[1].longitude}`;
                      const waypoints = routePath.slice(2).map(point => `${point.latitude},${point.longitude}`).join('|');
                      
                      let googleMapsUrl;
                      if (waypoints.length > 0) {
                        googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}/${waypoints}`;
                      } else {
                        googleMapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
                      }
                      
                      Linking.openURL(googleMapsUrl);
                    }
                  }}
                >
                  <Ionicons name="map" size={20} color="white" />
                  <Text style={styles.googleMapsButtonText}>Show in Google Maps</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.clearRouteButton}
                  onPress={() => {
                    setOptimizedRoute(null);
                    setRoutePath([]);
                  }}
                >
                  <Text style={styles.clearRouteButtonText}>Clear Route</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Trip Detail Modal */}
      <Modal
        visible={showTripDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTripDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tripDetailModal}>
            {selectedTrip && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>{selectedTrip.store || 'Task'}</Text>
                    <Text style={styles.modalSubtitle}>{selectedTrip.location || 'No location'}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowTripDetail(false)}
                  >
                    <Ionicons name="close" size={24} color="#B3B3B3" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                  {/* Trip/Task Info */}
                  <View style={styles.tripDetailSection}>
                    <Text style={styles.tripDetailLabel}>{selectedTrip.isTask ? 'Task' : 'Trip'} Information</Text>
                    
                    <View style={styles.tripDetailRow}>
                      <Ionicons name="calendar" size={16} color="#2E8BFF" />
                      <Text style={styles.tripDetailText}>
                        Date: {selectedTrip.date ? new Date(selectedTrip.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Not set'}
                      </Text>
                    </View>

                    <View style={styles.tripDetailRow}>
                      <Ionicons name="card" size={16} color="#2E8BFF" />
                      <Text style={styles.tripDetailText}>Budget: ${selectedTrip.budget || '0'}</Text>
                    </View>

                    <View style={styles.tripDetailRow}>
                      <Ionicons 
                        name={getStatusIcon(selectedTrip.status || 'pending')} 
                        size={16} 
                        color={getStatusColor(selectedTrip.status || 'pending')} 
                      />
                      <Text style={[styles.tripDetailText, { color: getStatusColor(selectedTrip.status || 'pending') }]}>
                        Status: {selectedTrip.status ? selectedTrip.status.charAt(0).toUpperCase() + selectedTrip.status.slice(1) : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  {/* Shopping List */}
                  <View style={styles.tripDetailSection}>
                    <Text style={styles.tripDetailLabel}>Shopping List ({(selectedTrip.items || []).length} items)</Text>
                    
                    {(selectedTrip.items || []).length > 0 ? (
                      (selectedTrip.items || []).map((item: string, index: number) => (
                        <View key={index} style={styles.tripDetailItem}>
                          <View style={styles.tripDetailItemContent}>
                            <Ionicons name="basket" size={16} color="#FF9800" />
                            <Text style={styles.tripDetailItemText}>{item}</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.removeItemFromDetailButton}
                            onPress={() => {
                              const updatedTrip = {
                                ...selectedTrip,
                                items: (selectedTrip.items || []).filter((_: any, i: number) => i !== index)
                              };
                              setTrips(trips.map(t => t.id === selectedTrip.id ? updatedTrip : t));
                              setSelectedTrip(updatedTrip);
                            }}
                          >
                            <Ionicons name="close-circle" size={18} color="#F44336" />
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyListText}>No items in shopping list</Text>
                    )}
                  </View>

                  {/* Trip Actions */}
                  <View style={styles.tripDetailActions}>
                    {!selectedTrip.isTask && selectedTrip.status === 'planned' && (
                      <TouchableOpacity 
                        style={styles.modalActionButton}
                        onPress={() => {
                          startTrip(selectedTrip.id);
                          setShowTripDetail(false);
                        }}
                      >
                        <Ionicons name="play" size={18} color="#FFFFFF" />
                        <Text style={styles.modalActionButtonText}>Start Trip</Text>
                      </TouchableOpacity>
                    )}

                    {!selectedTrip.isTask && selectedTrip.status !== 'completed' && (
                      <TouchableOpacity 
                        style={[styles.modalActionButton, styles.completeActionButton]}
                        onPress={() => {
                          completeTrip(selectedTrip.id);
                          setShowTripDetail(false);
                        }}
                      >
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                        <Text style={styles.modalActionButtonText}>Mark Complete</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                      style={[styles.modalActionButton, styles.deleteActionButton]}
                      onPress={handleDeleteTripFromDetail}
                    >
                      <Ionicons name="trash" size={18} color="#FFFFFF" />
                      <Text style={styles.modalActionButtonText}>Delete {selectedTrip.isTask ? 'Task' : 'Trip'}</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Trip Modal */}
      <Modal
        visible={isAddTripModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddTripModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addTripModalContent}>
            <Text style={styles.addTripModalTitle}>Plan New Trip</Text>
            
            <TextInput
              style={styles.tripInput}
              placeholder="Store name (required)..."
              placeholderTextColor="#666"
              value={newTripStore}
              onChangeText={setNewTripStore}
              autoFocus
            />

            <LocationAutocomplete
              placeholder="Search for store location..."
              value={newTripLocation}
              onChangeText={setNewTripLocation}
              onLocationSelect={handleLocationSelectFromAutocomplete}
            />

            {selectedLocation && (
              <View style={styles.selectedLocationInfo}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.selectedLocationText}>{selectedLocation.formatted_address}</Text>
                <TouchableOpacity 
                  style={styles.clearLocationButton}
                  onPress={() => {
                    setSelectedLocation(null);
                    setNewTripLocation('');
                  }}
                >
                  <Ionicons name="close-circle" size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            )}

            <TextInput
              style={styles.tripInput}
              placeholder="Budget amount (optional)..."
              placeholderTextColor="#666"
              value={newTripBudget}
              onChangeText={setNewTripBudget}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.tripInput}
              placeholder="Date (optional) - YYYY-MM-DD..."
              placeholderTextColor="#666"
              value={newTripDate}
              onChangeText={setNewTripDate}
            />

            <View style={styles.shoppingListContainer}>
              <Text style={styles.shoppingListLabel}>Shopping List:</Text>
              <View style={styles.addItemRow}>
                <TextInput
                  style={[styles.tripInput, { flex: 1, marginRight: 8 }]}
                  placeholder="Add item to list..."
                  placeholderTextColor="#666"
                  value={newTripItem}
                  onChangeText={setNewTripItem}
                />
                <TouchableOpacity 
                  style={styles.addItemButton}
                  onPress={() => {
                    if (newTripItem.trim()) {
                      // For now, just clear the input
                      setNewTripItem('');
                      Alert.alert('Item Added', `"${newTripItem.trim()}" added to your trip!`);
                    }
                  }}
                >
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsAddTripModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addTrip}
              >
                <Text style={styles.saveButtonText}>Create Trip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tutorial */}
      <TripsTutorial 
        isVisible={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  helpButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#2E8BFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#B3B3B3',
    fontWeight: '400',
  },
  addTripContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addTripButton: {
    backgroundColor: '#2E8BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  addTripText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#2E8BFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B3B3B3',
    marginLeft: 6,
  },
  activeTabButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  section: {
    padding: 20,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tripCard: {
    backgroundColor: '#121212',
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  tripLocation: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 4,
    fontWeight: '500',
  },
  tripDate: {
    fontSize: 13,
    color: '#B3B3B3',
    fontWeight: '400',
  },
  tripStatus: {
    marginLeft: 12,
  },
  tripDetails: {
    marginBottom: 12,
  },
  tripBudget: {
    fontSize: 17,
    fontWeight: '700',
    color: '#28A745',
    marginBottom: 6,
  },
  tripItems: {
    fontSize: 14,
    color: '#0068F0',
    fontWeight: '500',
  },
  tripActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
    flexWrap: 'wrap',
    gap: 8,
  },
  startButton: {
    backgroundColor: '#2E8BFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 90,
    justifyContent: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  completeButton: {
    backgroundColor: '#2E8BFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 90,
    justifyContent: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
  },
  noTripsText: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addItemInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#000000',
  },
  addItemButton: {
    backgroundColor: '#2E8BFF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  shoppingListSection: {
    marginTop: 12,
  },
  shoppingListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  shoppingListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  shoppingItemText: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  removeItemButton: {
    padding: 4,
  },
  noItemsText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  numberMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2E8BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  numberMarkerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  mapActionText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
  routeContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 12,
  },
  routeDetails: {
    marginBottom: 16,
  },
  routeLeg: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    backgroundColor: '#2E8BFF',
    color: 'white',
    borderRadius: 12,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
  },
  stepLocation: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  routeMetrics: {
    alignItems: 'flex-end',
  },
  routeDistance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  routeDuration: {
    fontSize: 14,
    color: '#666',
  },
  routeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  clearRouteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearRouteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTripModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  addTripModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  tripInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    color: '#000000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#2E8BFF',
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  // Location autocomplete styles
  locationContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadingText: {
    color: 'white',
    fontSize: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  suggestionMainText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionSecondaryText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectedLocationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    padding: 8,
    borderRadius: 6,
    marginBottom: 16,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 8,
  },
  clearLocationButton: {
    padding: 4,
  },
  // Shopping list styles
  shoppingListContainer: {
    marginBottom: 16,
  },
  shoppingListLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 10,
  },
  // Route list styles
  routeListContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  routeNumber: {
    width: 50,
    height: 30,
    backgroundColor: '#2E8BFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  routeItemContent: {
    flex: 1,
    marginRight: 8,
  },
  routeItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  routeItemSubtitle: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  googleMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E8BFF',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  googleMapsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Trip detail modal styles
  tripDetailModal: {
    backgroundColor: '#121212',
    borderRadius: 20,
    padding: 0,
    margin: 20,
    marginTop: 80,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#B3B3B3',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  tripDetailSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  tripDetailLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tripDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripDetailText: {
    fontSize: 16,
    color: '#B3B3B3',
    marginLeft: 12,
  },
  tripDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  tripDetailItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripDetailItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  removeItemFromDetailButton: {
    padding: 4,
  },
  emptyListText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  tripDetailActions: {
    padding: 20,
    gap: 12,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E8BFF',
    borderRadius: 8,
    padding: 14,
  },
  completeActionButton: {
    backgroundColor: '#4CAF50',
  },
  deleteActionButton: {
    backgroundColor: '#F44336',
  },
  modalActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Task locations toggle styles
  taskLocationsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1E1E1E',
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  taskLocationsLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    backgroundColor: '#2C2C2C',
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#2E8BFF',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
});
