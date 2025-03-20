
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LandscapeFooterProps {
  className?: string;
}

const LandscapeFooter: React.FC<LandscapeFooterProps> = ({ className }) => {
  const isMobile = useIsMobile();
  
  return (
    <footer className={`w-full relative ${isMobile ? 'z-[60]' : ''} ${className}`}>
      <div className="w-full relative">
        <img 
          src="/lovable-uploads/a1e35609-ee80-4df4-812b-fa009b5fc788.png" 
          alt="Footer with green hills and orange flowers"
          className="w-full h-auto object-cover" 
        />
      </div>
    </footer>
  );
};

export default LandscapeFooter;
