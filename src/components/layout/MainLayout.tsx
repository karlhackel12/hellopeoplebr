
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import LandscapeFooter from './LandscapeFooter';

interface MainLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideFooter = false }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <LandscapeFooter />}
    </div>
  );
};

export default MainLayout;
