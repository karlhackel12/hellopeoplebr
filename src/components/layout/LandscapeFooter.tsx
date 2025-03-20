
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LandscapeFooterProps {
  className?: string;
}

const LandscapeFooter: React.FC<LandscapeFooterProps> = ({ className }) => {
  const isMobile = useIsMobile();
  
  return (
    <footer className={`w-full relative ${isMobile ? 'z-[60]' : ''} ${className}`}>
      <div className="w-full h-6 bg-gradient-to-r from-[#F2FCE2] to-[#E2F1C7]"></div>
    </footer>
  );
};

export default LandscapeFooter;
