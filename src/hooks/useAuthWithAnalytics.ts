
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics, ANALYTICS_EVENTS } from './useAnalytics';
import { usePostHog } from '@/providers/PostHogProvider';

export function useAuthWithAnalytics() {
  const { trackEvent, identifyUser, resetIdentity } = useAnalytics();
  const { posthogLoaded } = usePostHog();

  useEffect(() => {
    // Only set up the listener when PostHog is loaded
    if (!posthogLoaded) {
      return () => {}; // Return empty cleanup function when not initialized
    }
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_IN') {
        trackEvent(ANALYTICS_EVENTS.AUTH.SIGNED_IN);
        identifyUser();
      } else if (event === 'USER_UPDATED') {
        // Handle sign up event - In Supabase this is USER_UPDATED
        // Check if this is a new user (likely a sign-up)
        if (session?.user?.created_at === session?.user?.updated_at) {
          trackEvent(ANALYTICS_EVENTS.AUTH.SIGNED_UP);
        }
        identifyUser();
      } else if (event === 'SIGNED_OUT') {
        trackEvent(ANALYTICS_EVENTS.AUTH.SIGNED_OUT);
        resetIdentity();
      } else if (event === 'PASSWORD_RECOVERY') {
        trackEvent(ANALYTICS_EVENTS.AUTH.PASSWORD_RESET);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [trackEvent, identifyUser, resetIdentity, posthogLoaded]);

  return null;
}
