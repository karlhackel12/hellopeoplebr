
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import LandscapeFooter from './LandscapeFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthWithAnalytics } from '@/hooks/useAuthWithAnalytics';

interface MainLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideFooter = false }) => {
  const isMobile = useIsMobile();
  
  // Set up analytics tracking for auth events
  useAuthWithAnalytics();
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && (
        <div className={isMobile ? 'fixed bottom-0 left-0 right-0 z-[60]' : ''}>
          <LandscapeFooter />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
