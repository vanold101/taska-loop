import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VoiceCommandButtonProps {
  onCommand: (command: string) => void;
  disabled?: boolean;
}

export default function VoiceCommandButton({ onCommand, disabled = false }: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false);

  const handleVoiceCommand = () => {
    if (disabled) return;
    
    setIsListening(true);
    
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      
      // For demo purposes, show a command selection dialog
      Alert.alert(
        'Voice Commands',
        'Select a command to execute:',
        [
          {
            text: 'Add Task',
            onPress: () => onCommand('add task')
          },
          {
            text: 'Add Item to Pantry',
            onPress: () => onCommand('add item')
          },
          {
            text: 'Plan Trip',
            onPress: () => onCommand('plan trip')
          },
          {
            text: 'Show Today\'s Tasks',
            onPress: () => onCommand('show tasks')
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }, 1000);
  };

  return (
    <TouchableOpacity
      style={[
        styles.voiceButton,
        isListening && styles.listening,
        disabled && styles.disabled
      ]}
      onPress={handleVoiceCommand}
      disabled={disabled}
    >
      <Ionicons 
        name={isListening ? "mic" : "mic-outline"} 
        size={24} 
        color={isListening ? "white" : "#007AFF"} 
      />
      {isListening && (
        <View style={styles.listeningIndicator}>
          <Text style={styles.listeningText}>Listening...</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  voiceButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listening: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.1 }],
  },
  disabled: {
    opacity: 0.5,
  },
  listeningIndicator: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  listeningText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
