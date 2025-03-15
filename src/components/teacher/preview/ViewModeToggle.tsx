
import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ViewModeToggleProps {
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ 
  viewMode, 
  setViewMode 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex space-x-2">
      <Button
        size={isMobile ? "sm" : "sm"}
        variant={viewMode === 'desktop' ? 'default' : 'outline'}
        onClick={() => setViewMode('desktop')}
        className={isMobile ? "px-2 py-1 h-8" : ""}
      >
        <Monitor className="h-4 w-4 mr-1" /> Desktop
      </Button>
      <Button
        size={isMobile ? "sm" : "sm"}
        variant={viewMode === 'mobile' ? 'default' : 'outline'}
        onClick={() => setViewMode('mobile')}
        className={isMobile ? "px-2 py-1 h-8" : ""}
      >
        <Smartphone className="h-4 w-4 mr-1" /> Mobile
      </Button>
    </div>
  );
};

export default ViewModeToggle;
