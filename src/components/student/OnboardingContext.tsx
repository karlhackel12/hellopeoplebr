
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  id: string;
  label: string;
  completed: boolean;
}

interface OnboardingContextType {
  steps: OnboardingStep[];
  currentStepIndex: number;
  completeStep: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  isOnboardingComplete: boolean;
  saveProgress: () => Promise<void>;
}

const defaultSteps: OnboardingStep[] = [
  { id: 'Create Account', label: 'Create Account', completed: false },
  { id: 'Complete Profile', label: 'Complete Profile', completed: false },
  { id: 'Connect with Teacher', label: 'Connect with Teacher', completed: false },
  { id: 'First Assignment', label: 'First Assignment', completed: false },
  { id: 'Take Orientation', label: 'Take Orientation', completed: false },
  { id: 'Set Learning Goals', label: 'Set Learning Goals', completed: false },
  { id: 'View Progress Dashboard', label: 'View Progress Dashboard', completed: false },
];

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Define type for user onboarding data
interface UserOnboardingData {
  id: string;
  user_id: string;
  completed_steps: string[];
  current_step_index: number;
  last_updated: string;
}

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Check for existing progress on component mount
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Complete the first step automatically if user is logged in
        const updatedSteps = [...steps];
        updatedSteps[0].completed = true;
        
        // Check for any saved progress
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('completed_steps, current_step_index')
          .eq('user_id', user.id)
          .single();
        
        if (data && !error) {
          // Update steps based on saved progress
          const completedStepIds = data.completed_steps || [];
          
          const newSteps = steps.map(step => ({
            ...step,
            completed: completedStepIds.includes(step.id)
          }));
          
          setSteps(newSteps);
          setCurrentStepIndex(data.current_step_index || 0);
        } else {
          setSteps(updatedSteps);
        }
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    }
  };

  const completeStep = (stepId: string) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
    }
  };

  const saveProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const completedStepIds = steps
          .filter(step => step.completed)
          .map(step => step.id);
        
        const { error } = await supabase
          .from('user_onboarding')
          .upsert({
            user_id: user.id,
            completed_steps: completedStepIds,
            current_step_index: currentStepIndex,
            last_updated: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };

  const isOnboardingComplete = steps.every(step => step.completed);

  return (
    <OnboardingContext.Provider
      value={{
        steps,
        currentStepIndex,
        completeStep,
        nextStep,
        previousStep,
        isOnboardingComplete,
        saveProgress
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
