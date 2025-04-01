
import React, { useEffect, useState, createContext, useContext } from 'react';
import posthog from 'posthog-js';
import { useLocation } from 'react-router-dom';

interface PostHogContextType {
  posthogLoaded: boolean;
}

const PostHogContext = createContext<PostHogContextType>({ posthogLoaded: false });

export const usePostHog = () => useContext(PostHogContext);

interface PostHogProviderProps {
  children: React.ReactNode;
}

export const PostHogProvider: React.FC<PostHogProviderProps> = ({ children }) => {
  const [posthogLoaded, setPosthogLoaded] = useState(false);

  useEffect(() => {
    // Initialize PostHog
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
    const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

    if (apiKey) {
      posthog.init(apiKey, {
        api_host: apiHost,
        capture_pageview: true, // Changed to true to handle pageviews automatically
        loaded: (posthogInstance) => {
          if (import.meta.env.DEV) {
            // In development, you can enable debug mode
            posthogInstance.debug();
          }
          console.log('PostHog initialized successfully');
          setPosthogLoaded(true);
        },
      });
    } else {
      console.warn('PostHog API key not found. Analytics will not be tracked.');
    }

    return () => {
      // Cleanup if necessary
    };
  }, []);

  return (
    <PostHogContext.Provider value={{ posthogLoaded }}>
      {children}
    </PostHogContext.Provider>
  );
};
