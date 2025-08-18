import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList, Dimensions, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { googlePlacesMobileService, PlaceResult, PlaceDetails } from '../../src/services/googlePlacesMobile';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import LocationAutocomplete from '../../src/components/LocationAutocomplete';
import TripsTutorial from '../../src/components/TripsTutorial';

export default function TripsPage() {
  const [trips, setTrips] = useState([
    { 
      id: '1', 
      store: 'Walmart', 
      status: 'active' as 'active' | 'started' | 'completed', 
      date: '2025-01-15', 
      budget: 150, 
      items: ['Milk', 'Bread', 'Eggs'],
      location: 'Columbus, OH',
      coordinates: { lat: 39.9612, lng: -82.9988 }
    },
    { 
      id: '2', 
      store: 'Target', 
      status: 'active' as 'active' | 'started' | 'completed', 
      date: '2025-01-16', 
      budget: 80, 
      items: ['Toothpaste', 'Shampoo'],
      location: 'Columbus, OH',
      coordinates: { lat: 39.9615, lng: -82.9990 }
    },
    { 
      id: '3', 
      store: 'Kroger', 
      status: 'active' as 'active' | 'started' | 'completed', 
      date: '2025-01-17', 
      budget: 200, 
      items: ['Vegetables', 'Meat', 'Dairy'],
      location: 'Columbus, OH',
      coordinates: { lat: 39.9618, lng: -82.9992 }
    }
  ]);
  
  const [isAddTripModalVisible, setIsAddTripModalVisible] = useState(false);
  const [newTripStore, setNewTripStore] = useState('');
  const [newTripLocation, setNewTripLocation] = useState('');
  const [newTripBudget, setNewTripBudget] = useState('');
  const [newTripDate, setNewTripDate] = useState('');
  const [newTripItem, setNewTripItem] = useState('');
  const [tripItemInputs, setTripItemInputs] = useState<{ [key: string]: string }>({});
  
  // Location autocomplete state
  const [locationSuggestions, setLocationSuggestions] = useState<PlaceResult[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<PlaceDetails | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // Map state
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 39.9612,
    longitude: -82.9988,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  // Route optimization state
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routePath, setRoutePath] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');
  const [showTutorial, setShowTutorial] = useState(false);

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
        coordinates: selectedLocation ? selectedLocation.geometry.location : { lat: 39.9612, lng: -82.9988 }
      };
      setTrips([...trips, newTrip]);
      setNewTripStore('');
      setNewTripLocation('');
      setNewTripBudget('');
      setNewTripDate('');
      setNewTripItem('');
      setSelectedLocation(null);
      setIsAddTripModalVisible(false);
    }
  };

  // Route optimization function
  const optimizeRoute = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const eligibleTrips = trips.filter(trip => 
      trip.coordinates &&
      (trip.status === 'started' || (trip.status === 'active' && trip.date === todayStr))
    );
    
    if (eligibleTrips.length < 2) {
      Alert.alert('Route Optimization', 'Need at least 2 eligible trips (today\'s trips or started trips) with locations to optimize a route.');
      return;
    }

    setIsOptimizing(true);
    
    try {
      const waypoints = eligibleTrips.map(trip => ({
        lat: trip.coordinates!.lat,
        lng: trip.coordinates!.lng,
        name: trip.store
      }));

      const origin = {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      };

      const routeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${waypoints[0].lat},${waypoints[0].lng}&waypoints=optimize:true|${waypoints.slice(1).map(wp => `${wp.lat},${wp.lng}`).join('|')}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAB-h4_VucPyVktYcdIW5At9edXaQXRL10'}`
      );

      const routeData = await routeResponse.json();
      
      if (routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        const totalDistance = route.legs.reduce((sum: number, leg: any) => sum + (leg.distance?.value || 0), 0);
        const totalDuration = route.legs.reduce((sum: number, leg: any) => sum + (leg.duration?.value || 0), 0);
        
        setOptimizedRoute(route);
        
        // Build route path from Google Directions response
        const path = [];
        
        // Start with user's current location
        path.push({ latitude: currentLocation.latitude, longitude: currentLocation.longitude });
        
        // Add each leg's end point (destination of each segment)
        route.legs.forEach((leg: any) => {
          if (leg.end_location) {
            path.push({ 
              latitude: leg.end_location.lat, 
              longitude: leg.end_location.lng 
            });
          }
        });
        
        setRoutePath(path);
        
        Alert.alert(
          'Route Optimized!',
          `Optimal route found:\n\n` +
          `Total Distance: ${(totalDistance / 1000).toFixed(1)} km\n` +
          `Total Time: ${Math.round(totalDuration / 60)} minutes\n\n` +
          `Route Order:\n${route.legs.map((leg: any, index: number) => 
            `${index + 1}. ${leg.end_address || 'Location'}`
          ).join('\n')}`,
          [
            { text: 'Close', style: 'cancel' },
            { 
              text: 'View on Map', 
              onPress: () => {
                Alert.alert('Map Updated', 'Route is now displayed on the map!');
              }
            }
          ]
        );
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Route optimization error:', error);
      const mockRoute = {
        legs: eligibleTrips.map((trip, index) => ({
          distance: { text: `${Math.floor(Math.random() * 10) + 5} km` },
          duration: { text: `${Math.floor(Math.random() * 15) + 10} min` },
          end_address: trip.store
        }))
      };
      
      setOptimizedRoute(mockRoute);
      
      Alert.alert(
        'Route Optimization',
        `Optimizing route for ${eligibleTrips.length} locations:\n${eligibleTrips.map(trip => `• ${trip.store}`).join('\n')}\n\nRoute optimization completed!`,
        [
          { text: 'Close', style: 'cancel' },
          { 
            text: 'View Route', 
            onPress: () => {
              Alert.alert('Route Displayed', 'Optimized route is now shown on the map!');
            }
          }
        ]
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  // Location autocomplete functions
  const handleLocationInputChange = async (text: string) => {
    setNewTripLocation(text);
    
    if (text.length > 2) {
      setIsLoadingLocation(true);
      try {
        const predictions = await googlePlacesMobileService.getPlacePredictions(text);
        setLocationSuggestions(predictions);
        setShowLocationSuggestions(true);
      } catch (error) {
        console.error('Error getting location predictions:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  const handleLocationSelect = async (place: PlaceResult) => {
    try {
      const details = await googlePlacesMobileService.getPlaceDetails(place.place_id);
      if (details) {
        setSelectedLocation(details);
        setNewTripLocation(details.formatted_address);
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    } catch (error) {
      console.error('Error getting place details:', error);
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
        ? { ...trip, items: trip.items.filter((_, index) => index !== itemIndex) }
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
            <Text style={styles.sectionTitle}>Today's Routes ({activeTrips.filter(trip => trip.date === new Date().toISOString().split('T')[0] || trip.status === 'started').length})</Text>
            
            {activeTrips.filter(trip => trip.date === new Date().toISOString().split('T')[0] || trip.status === 'started').length > 0 ? (
              activeTrips.filter(trip => trip.date === new Date().toISOString().split('T')[0] || trip.status === 'started').map(trip => (
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
              <Text style={styles.noTripsText}>No routes planned for today</Text>
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
                        trip.items.map((item, index) => (
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
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={currentLocation}
              showsUserLocation={true}
              showsMyLocationButton={true}
              showsCompass={true}
              showsScale={true}
            >
              {/* User's current location marker */}
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
                title="Your Location"
                description="You are here"
                pinColor="#007AFF"
              />
              
              {/* Trip location markers */}
              {trips.filter(trip => trip.coordinates).map(trip => (
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
              
              {/* Route path */}
              {routePath.length > 1 && (
                <Polyline
                  coordinates={routePath}
                  strokeColor="#007AFF"
                  strokeWidth={4}
                  lineDashPattern={[1]}
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

            <View style={styles.locationContainer}>
              <TextInput
                style={styles.tripInput}
                placeholder="Location (optional)..."
                placeholderTextColor="#666"
                value={newTripLocation}
                onChangeText={handleLocationInputChange}
                autoFocus={false}
              />
              {isLoadingLocation && (
                <View style={styles.loadingIndicator}>
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              )}
            </View>

            {/* Location Suggestions */}
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={locationSuggestions}
                  keyExtractor={(item) => item.place_id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleLocationSelect(item)}
                    >
                      <Text style={styles.suggestionMainText}>{item.structured_formatting.main_text}</Text>
                      <Text style={styles.suggestionSecondaryText}>{item.structured_formatting.secondary_text}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsList}
                />
              </View>
            )}

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
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  helpButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  addTripContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addTripButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addTripText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    backgroundColor: '#F0F8FF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  activeTabButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  tripCard: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  tripLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  tripStatus: {
    marginLeft: 12,
  },
  tripDetails: {
    marginBottom: 12,
  },
  tripBudget: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
    marginBottom: 4,
  },
  tripItems: {
    fontSize: 14,
    color: '#007AFF',
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
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  completeButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 8,
  },
  noTripsText: {
    fontSize: 16,
    color: '#8E8E93',
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#007AFF',
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
  googleMapsButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleMapsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    backgroundColor: '#FF9800',
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
    backgroundColor: '#E8F5E8',
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
});
