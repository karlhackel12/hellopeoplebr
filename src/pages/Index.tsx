
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useUserTypeRouter, UserType } from '@/hooks/useUserTypeRouter';
import { usePostHog } from '@/providers/PostHogProvider';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { getUserType, navigateToUserLanding } = useUserTypeRouter();
  const { posthogLoaded } = usePostHog();
  
  useEffect(() => {
    // First check if PostHog is loaded to ensure analytics are ready
    if (posthogLoaded) {
      // Then navigate to the appropriate landing page
      navigateToUserLanding();
    }
  }, [navigate, navigateToUserLanding, posthogLoaded]);
  
  // This is just a loading state while the routing happens
  return (
    <>
      <Helmet>
        <title>HelloPeople - Redirecting...</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <h1 className="text-2xl font-semibold mb-4">Redirecting you to the right place...</h1>
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </>
  );
};

export default Index;
