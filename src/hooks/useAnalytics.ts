
import posthog from 'posthog-js';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePostHog } from '@/providers/PostHogProvider';

// Event category constants to maintain consistency
export const ANALYTICS_EVENTS = {
  // Auth events
  AUTH: {
    SIGNED_IN: 'user_signed_in',
    SIGNED_UP: 'user_signed_up',
    SIGNED_OUT: 'user_signed_out',
    PASSWORD_RESET: 'password_reset_requested',
  },
  // Teacher events
  TEACHER: {
    LESSON_CREATED: 'teacher_lesson_created',
    LESSON_UPDATED: 'teacher_lesson_updated',
    LESSON_PUBLISHED: 'teacher_lesson_published',
    LESSON_DELETED: 'teacher_lesson_deleted',
    QUIZ_CREATED: 'teacher_quiz_created',
    QUIZ_UPDATED: 'teacher_quiz_updated',
    QUIZ_PUBLISHED: 'teacher_quiz_published',
    STUDENT_INVITED: 'teacher_student_invited',
    ASSIGNMENT_CREATED: 'teacher_assignment_created',
    DASHBOARD_VIEWED: 'teacher_dashboard_viewed',
  },
  // Student events
  STUDENT: {
    LESSON_STARTED: 'student_lesson_started',
    LESSON_COMPLETED: 'student_lesson_completed',
    QUIZ_STARTED: 'student_quiz_started',
    QUIZ_COMPLETED: 'student_quiz_completed',
    VOICE_PRACTICE_STARTED: 'student_voice_practice_started',
    VOICE_PRACTICE_COMPLETED: 'student_voice_practice_completed',
    VOCABULARY_REVIEWED: 'student_vocabulary_reviewed',
    DASHBOARD_VIEWED: 'student_dashboard_viewed',
  },
  // Feature usage events
  FEATURE: {
    SPACED_REPETITION_USED: 'feature_spaced_repetition_used',
    VOICE_PRACTICE_USED: 'feature_voice_practice_used',
    AI_GENERATED_CONTENT_VIEWED: 'feature_ai_content_viewed',
  },
  // UI interaction events
  UI: {
    NAVIGATION: 'ui_navigation',
    BUTTON_CLICKED: 'ui_button_clicked',
    FORM_SUBMITTED: 'ui_form_submitted',
  },
};

export function useAnalytics() {
  const { posthogLoaded } = usePostHog();

  /**
   * Track an event with PostHog
   */
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (posthogLoaded && posthog.config?.token) {
      posthog.capture(eventName, properties);
    } else {
      console.debug('PostHog not loaded yet. Event queued:', eventName);
    }
  }, [posthogLoaded]);

  /**
   * Identify a user with PostHog
   */
  const identifyUser = useCallback(async () => {
    if (!posthogLoaded) {
      console.debug('PostHog not loaded yet. User identification delayed.');
      return false;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && posthog.config?.token) {
        // Identify the user in PostHog
        posthog.identify(user.id, {
          email: user.email,
          // Add any other user properties you want to track
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error identifying user:', error);
      return false;
    }
  }, [posthogLoaded]);

  /**
   * Reset user identity (on logout)
   */
  const resetIdentity = useCallback(() => {
    if (posthogLoaded && posthog.config?.token) {
      posthog.reset();
    }
  }, [posthogLoaded]);

  return {
    trackEvent,
    identifyUser,
    resetIdentity,
    EVENTS: ANALYTICS_EVENTS,
  };
}
