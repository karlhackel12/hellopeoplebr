
import posthog from 'posthog-js';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAnalytics() {
  /**
   * Track an event with PostHog
   */
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (posthog.apiKey) {
      posthog.capture(eventName, properties);
    }
  }, []);

  /**
   * Identify a user with PostHog
   */
  const identifyUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && posthog.apiKey) {
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
  }, []);

  /**
   * Reset user identity (on logout)
   */
  const resetIdentity = useCallback(() => {
    if (posthog.apiKey) {
      posthog.reset();
    }
  }, []);

  return {
    trackEvent,
    identifyUser,
    resetIdentity,
  };
}
