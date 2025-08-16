import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'plan',
    title: 'Plan Your Trip',
    description: 'Tap the orange button to create a new shopping trip with store, location, and budget.',
    icon: 'add-circle',
    color: '#FF9800'
  },
  {
    id: 'start',
    title: 'Start Your Trip',
    description: 'Click the green play button to begin your trip. It will be added to today\'s routes.',
    icon: 'play-circle',
    color: '#4CAF50'
  },
  {
    id: 'optimize',
    title: 'Optimize Route',
    description: 'Use the purple optimize button to find the best route between multiple destinations.',
    icon: 'navigate-circle',
    color: '#9C27B0'
  },
  {
    id: 'map',
    title: 'View on Map',
    description: 'See your route on the interactive map with turn-by-turn directions.',
    icon: 'map',
    color: '#2196F3'
  },
  {
    id: 'complete',
    title: 'Complete Trip',
    description: 'Mark trips as complete when you finish shopping to track your progress.',
    icon: 'checkmark-circle',
    color: '#2196F3'
  }
];

interface TripsTutorialProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function TripsTutorial({ isVisible, onClose }: TripsTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    onClose();
  };

  if (!isVisible) return null;

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <Animated.View 
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.tutorialContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome to Trips!</Text>
          <TouchableOpacity onPress={skipTutorial} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {tutorialSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index === currentStep && styles.activeStepDot
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={currentTutorial.icon as any} 
              size={80} 
              color={currentTutorial.color} 
            />
          </View>
          
          <Text style={styles.stepTitle}>{currentTutorial.title}</Text>
          <Text style={styles.stepDescription}>{currentTutorial.description}</Text>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentStep > 0 && (
            <TouchableOpacity onPress={prevStep} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color="#007AFF" />
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={nextStep} 
            style={[styles.navButton, styles.primaryNavButton]}
          >
            <Text style={styles.primaryNavButtonText}>
              {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            {currentStep < tutorialSteps.length - 1 && (
              <Ionicons name="chevron-forward" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  tutorialContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: Dimensions.get('window').width - 40,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: '#007AFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  primaryNavButton: {
    backgroundColor: '#007AFF',
    flex: 1,
    justifyContent: 'center',
    marginLeft: 20,
  },
  navButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  primaryNavButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
});
