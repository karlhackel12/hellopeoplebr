
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from './useAnalytics';

export function useAuthWithAnalytics() {
  const { trackEvent, identifyUser, resetIdentity } = useAnalytics();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_IN') {
        trackEvent('user_signed_in');
        identifyUser();
      } else if (event === 'SIGNED_UP') {
        trackEvent('user_signed_up');
        identifyUser();
      } else if (event === 'SIGNED_OUT') {
        trackEvent('user_signed_out');
        resetIdentity();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [trackEvent, identifyUser, resetIdentity]);

  return null;
}
