
import React, { useEffect } from 'react';
import posthog from 'posthog-js';
import { useLocation } from 'react-router-dom';

interface PostHogProviderProps {
  children: React.ReactNode;
}

export const PostHogProvider: React.FC<PostHogProviderProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Initialize PostHog
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
    const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    if (apiKey) {
      posthog.init(apiKey, {
        api_host: apiHost,
        capture_pageview: false, // We'll handle pageviews manually
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            // In development, you can enable debug mode
            posthog.debug();
          }
        },
      });
    } else {
      console.warn('PostHog API key not found. Analytics will not be tracked.');
    }

    return () => {
      // Cleanup if necessary
    };
  }, []);

  // Track page views
  useEffect(() => {
    if (posthog.config?.token) {
      // Capture page view
      posthog.capture('$pageview', {
        current_url: window.location.href,
        path: location.pathname,
      });
    }
  }, [location]);

  return <>{children}</>;
};
