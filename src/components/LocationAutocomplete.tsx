import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { googlePlacesMobileService, PlaceResult } from '../services/googlePlacesMobile';

interface LocationSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface LocationAutocompleteProps {
  placeholder: string;
  onLocationSelect: (location: LocationSuggestion) => void;
  value?: string;
  onChangeText?: (text: string) => void;
}

export default function LocationAutocomplete({
  placeholder,
  onLocationSelect,
  value = '',
  onChangeText,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use the mobile-compatible googlePlacesMobileService
      const predictions = await googlePlacesMobileService.getPlacePredictions(query);
      
      if (predictions && predictions.length > 0) {
        const formattedSuggestions = predictions.map((pred: PlaceResult) => ({
          place_id: pred.place_id,
          description: pred.description,
          main_text: pred.structured_formatting?.main_text || pred.description,
          secondary_text: pred.structured_formatting?.secondary_text || '',
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      // Fallback to mock data
      const mockSuggestions: LocationSuggestion[] = [
        {
          place_id: '1',
          description: 'Walmart Supercenter, Columbus, OH',
          main_text: 'Walmart Supercenter',
          secondary_text: 'Columbus, OH',
        },
        {
          place_id: '2',
          description: 'Target, Columbus, OH',
          main_text: 'Target',
          secondary_text: 'Columbus, OH',
        },
        {
          place_id: '3',
          description: 'Kroger, Columbus, OH',
          main_text: 'Kroger',
          secondary_text: 'Columbus, OH',
        },
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    onLocationSelect(location);
    setShowSuggestions(false);
    if (onChangeText) {
      onChangeText(location.description);
    }
  };

  const handleInputChange = (text: string) => {
    if (onChangeText) {
      onChangeText(text);
    }
    searchLocations(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="location" size={20} color="#B3B3B3" style={styles.locationIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#757575"
          value={value}
          onChangeText={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
        />
        {isLoading && <ActivityIndicator size="small" color="#2E8BFF" />}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleLocationSelect(item)}
              >
                <Ionicons name="location" size={16} color="#2E8BFF" style={styles.suggestionIcon} />
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionMainText}>{item.main_text}</Text>
                  {item.secondary_text && (
                    <Text style={styles.suggestionSecondaryText}>
                      {item.secondary_text}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color="#757575" />
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10000,
    marginBottom: 20,
    elevation: 10000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  locationIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    elevation: 15000,
    zIndex: 15000,
    maxHeight: 200,
  },
  suggestionsList: {
    maxHeight: 200,
    borderRadius: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
    backgroundColor: '#1E1E1E',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
    marginRight: 8,
  },
  suggestionMainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  suggestionSecondaryText: {
    fontSize: 14,
    color: '#B3B3B3',
  },
});
