
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOnboardingData = (students: any[] = []) => {
  // Fetch onboarding data separately
  const { 
    data: onboardingData = [],
    isLoading: loadingOnboarding
  } = useQuery({
    queryKey: ['students-onboarding'],
    queryFn: async () => {
      if (students.length === 0) return [];
      
      const studentIds = students.map(student => student.id);
      
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('user_id, current_step_index, completed_steps')
        .in('user_id', studentIds);

      if (error) {
        console.error('Failed to load onboarding data:', error);
        return [];
      }

      return data || [];
    },
    enabled: students.length > 0
  });

  // Combine student profiles with their onboarding data
  const studentsWithOnboarding = React.useMemo(() => {
    return students.map(student => {
      const onboarding = onboardingData.find(
        item => item.user_id === student.id
      );
      
      return {
        ...student,
        user_onboarding: onboarding || null
      };
    });
  }, [students, onboardingData]);

  return {
    studentsWithOnboarding,
    loadingOnboarding
  };
};
