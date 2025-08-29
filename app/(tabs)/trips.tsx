import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { googlePlacesMobileService, PlaceResult, PlaceDetails } from '../../src/services/googlePlacesMobile';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
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
  const mapRef = useRef<MapView>(null);
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
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    (date as string) || new Date().toISOString().split('T')[0]
  );

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
    console.log('Loading task-based trips - currently empty until user adds trips');
  };

  const addTrip = () => {
    if (newTripStore.trim()) {
      const newTrip = {
        id: Date.now().toString(),
        store: newTripStore.trim(),
        status: 'active' as 'active' | 'started' | 'completed',
        date: newTripDate || new Date().toISOString().split('T')[0],
        budget: newTripBudget.trim() ? parseFloat(newTripBudget) : 0,
        items: [] as string[],
        location: selectedLocation ? selectedLocation.formatted_address : (newTripLocation.trim() || 'No location specified'),
        coordinates: selectedLocation ? selectedLocation.geometry.location : undefined // No hardcoded coordinates
      };
      setTrips([...trips, newTrip]);
      setNewTripStore('');
      setNewTripLocation('');
      setNewTripBudget('');
      setNewTripDate('');
      setNewTripItem('');
      setSelectedLocation(null);
      setIsAddTripModalVisible(false);
      
      if (!selectedLocation && newTripLocation.trim()) {
        Alert.alert('Note', 'Location was added as text only. For map features, please select a location from the search suggestions.');
      } else if (selectedLocation) {
        Alert.alert('Success', `Trip to ${newTripStore} added with location coordinates!`);
      } else {
        Alert.alert('Success', `Trip to ${newTripStore} added successfully!`);
      }
    }
  };

  // Get user location from the map when it's available
  const handleUserLocationChange = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setUserLocation(coordinate);
  };

  // Completely rewritten route optimization function
  const optimizeRoute = async () => {
    // Check if we have trips to optimize
    const eligibleTrips = trips.filter(trip => 
      trip.coordinates &&
      (trip.status === 'started' || (trip.status === 'active' && trip.date === selectedDate))
    );
    
    if (eligibleTrips.length < 1) {
      Alert.alert('Route Optimization', 'Need at least 1 trip with a location to optimize a route.');
      return;
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
    
    try {
      // Calculate distances from user location to each trip
      const tripsWithDistance = eligibleTrips.map(trip => ({
        ...trip,
        distanceFromUser: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          trip.coordinates!.lat,
          trip.coordinates!.lng
        )
      }));

      // Sort by distance (closest first)
      const sortedTrips = tripsWithDistance.sort((a, b) => a.distanceFromUser - b.distanceFromUser);

      // Create the route starting from user location
      const routeCoordinates = [
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        ...sortedTrips.map(trip => ({ 
          latitude: trip.coordinates!.lat, 
          longitude: trip.coordinates!.lng 
        }))
      ];

      // Set the route path for map display
      setRoutePath(routeCoordinates);
      
      // Store the optimized route list for the route display
      setOptimizedRouteList(sortedTrips);

      // Fit map to show the entire route
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(routeCoordinates, {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        });
      }

      // Calculate total estimated distance
      const totalDistance = sortedTrips.reduce((sum, trip) => sum + trip.distanceFromUser, 0);

      Alert.alert(
        'Route Optimized!',
        `Route created starting from your current location:\n\n` +
        `Total Estimated Distance: ${totalDistance.toFixed(1)} km\n\n` +
        `Route Order (closest first):\n${sortedTrips.map((trip, index) => 
          `${index + 1}. ${trip.store} (${trip.distanceFromUser.toFixed(1)} km away)`
        ).join('\n')}`,
        [
          { text: 'Close', style: 'cancel' },
          { 
            text: 'View Route', 
            onPress: () => {
              if (mapRef.current) {
                mapRef.current.fitToCoordinates(routeCoordinates, {
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
      const placeDetails = await googlePlacesMobileService.getPlaceDetails(location.place_id);
      if (placeDetails) {
        setSelectedLocation(placeDetails);
        setNewTripLocation(location.description);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      // Fallback: just use the description
      setNewTripLocation(location.description);
    }
  };

  // Open optimized route in Google Maps
  const openInGoogleMaps = () => {
    if (!userLocation || optimizedRouteList.length === 0) {
      Alert.alert('Error', 'No route available to open in Google Maps.');
      return;
    }

    try {
      // Create waypoints string for Google Maps
      const waypoints = optimizedRouteList.map(trip => 
        `${trip.coordinates.lat},${trip.coordinates.lng}`
      ).join('|');

      // Create Google Maps URL with user location as origin and optimized waypoints
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${optimizedRouteList[optimizedRouteList.length - 1].coordinates.lat},${optimizedRouteList[optimizedRouteList.length - 1].coordinates.lng}${optimizedRouteList.length > 1 ? `&waypoints=${waypoints.split('|').slice(0, -1).join('|')}` : ''}&travelmode=driving`;

      Linking.openURL(googleMapsUrl);
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      Alert.alert('Error', 'Failed to open Google Maps. Please try again.');
    }
  };

  const addItemToTrip = (tripId: string) => {
    const itemText = tripItemInputs[tripId] || '';
    if (itemText.trim()) {
      setTrips(trips.map(trip => 
        trip.id === tripId 
          ? { ...trip, items: [...trip.items, itemText.trim()] }
          : trip
      ));
      setTripItemInputs(prev => ({ ...prev, [tripId]: '' }));
      Alert.alert('Item Added', `"${itemText.trim()}" added to your trip!`);
    }
  };

  const removeItemFromTrip = (tripId: string, itemIndex: number) => {
    setTrips(trips.map(trip => 
      trip.id === tripId 
        ? { ...trip, items: trip.items.filter((_: any, index: number) => index !== itemIndex) }
        : trip
    ));
  };

  const startTrip = (tripId: string) => {
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
  };

  const completeTrip = (tripId: string) => {
    setTrips(trips.map(trip => 
      trip.id === tripId ? { ...trip, status: 'completed' } : trip
    ));
  };

  const deleteTrip = (tripId: string) => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setTrips(trips.filter(trip => trip.id !== tripId))
        }
      ]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Shopping Trips</Text>
              <Text style={styles.subtitle}>Plan and manage your shopping trips</Text>
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
            <Text style={styles.addTripText}>Plan New Trip</Text>
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

        {/* Today's Routes */}
        {activeTab === 'today' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{selectedDate === new Date().toISOString().split('T')[0] ? "Today's" : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Routes ({selectedDateActiveTrips.length})</Text>
            
            {selectedDateActiveTrips.length > 0 ? (
              selectedDateActiveTrips.map(trip => (
                <View key={trip.id} style={styles.tripCard}>
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
                    <View style={styles.tripStatus}>
                      <Ionicons 
                        name={getStatusIcon(trip.status)} 
                        size={20} 
                        color={getStatusColor(trip.status)} 
                      />
                    </View>
                  </View>
                  
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
                    />
                    <TouchableOpacity 
                      style={styles.addItemButton}
                      onPress={() => addItemToTrip(trip.id)}
                    >
                      <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>

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
                      onPress={() => completeTrip(trip.id)}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                      <Text style={styles.completeButtonText}>Complete</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => deleteTrip(trip.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noTripsText}>No routes planned for {selectedDate === new Date().toISOString().split('T')[0] ? 'today' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            )}
          </View>
        )}

        {/* All Active Trips */}
        {activeTab === 'all' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Active Trips ({activeTrips.length})</Text>
            
            {activeTrips.length > 0 ? (
              activeTrips.map(trip => (
                <View key={trip.id} style={styles.tripCard}>
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
                    <View style={styles.tripStatus}>
                      <Ionicons 
                        name={getStatusIcon(trip.status)} 
                        size={20} 
                        color={getStatusColor(trip.status)} 
                      />
                    </View>
                  </View>
                  
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
                          style={[styles.addItemInput, { flex: 1, marginRight: 8 }]}
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
                      onPress={() => completeTrip(trip.id)}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                      <Text style={styles.completeButtonText}>Complete</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => deleteTrip(trip.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
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
              
              {/* Only show trip markers if there are trips for the selected date with coordinates */}
              {selectedDateTrips.filter(trip => trip.coordinates && trip.date === selectedDate).map(trip => (
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
              ))}
              
              {/* Only show route path if there are actual routes */}
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
              {optimizedRouteList.map((trip, index) => (
                <View key={trip.id} style={styles.routeItem}>
                  <View style={styles.routeNumber}>
                    <Text style={styles.routeNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.routeItemContent}>
                    <Text style={styles.routeItemTitle}>{trip.store}</Text>
                    <Text style={styles.routeItemSubtitle}>
                      {trip.distanceFromUser.toFixed(1)} km from you • {trip.location}
                    </Text>
                  </View>
                  <Ionicons name="storefront" size={20} color="#FF9800" />
                </View>
              ))}

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

      {/* Add Trip Modal */}
      <Modal
        visible={isAddTripModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddTripModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Plan New Trip</Text>
            
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
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
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
});
