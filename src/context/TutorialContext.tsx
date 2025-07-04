import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  startTutorial: () => void;
  completeTutorial: () => void;
  progress: number;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

interface TutorialProviderProps {
  children: React.ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 7;

  // Check if user should see tutorial (for all accounts, not just admin)
  useEffect(() => {
    if (user) {
      const tutorialCompleted = localStorage.getItem(`tutorial_completed_${user.id}`);
      if (!tutorialCompleted) {
        // Auto-start tutorial for new users
        setTimeout(() => {
          setIsActive(true);
        }, 1000);
      }
    }
  }, [user]);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    if (user) {
      localStorage.setItem(`tutorial_completed_${user.id}`, 'true');
    }
  };

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const completeTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    if (user) {
      localStorage.setItem(`tutorial_completed_${user.id}`, 'true');
    }
  };

  const progress = (currentStep / (totalSteps - 1)) * 100;

  return (
    <TutorialContext.Provider value={{
      isActive,
      currentStep,
      totalSteps,
      nextStep,
      prevStep,
      skipTutorial,
      startTutorial,
      completeTutorial,
      progress
    }}>
      {children}
    </TutorialContext.Provider>
  );
}; 