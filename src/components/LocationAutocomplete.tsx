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
        <Ionicons name="location" size={20} color="#666" style={styles.locationIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
        />
        {isLoading && <ActivityIndicator size="small" color="#007AFF" />}
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
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionMainText}>{item.main_text}</Text>
                  {item.secondary_text && (
                    <Text style={styles.suggestionSecondaryText}>
                      {item.secondary_text}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 9999,
    marginBottom: 20,
    elevation: 9999,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  locationIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 9999,
    zIndex: 9999,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  suggestionSecondaryText: {
    fontSize: 14,
    color: '#666',
  },
});
