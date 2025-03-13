
import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';

interface ViewModeToggleProps {
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ 
  viewMode, 
  setViewMode 
}) => {
  return (
    <div className="flex space-x-2">
      <Button
        size="sm"
        variant={viewMode === 'desktop' ? 'default' : 'outline'}
        onClick={() => setViewMode('desktop')}
      >
        <Monitor className="h-4 w-4 mr-1" /> Desktop
      </Button>
      <Button
        size="sm"
        variant={viewMode === 'mobile' ? 'default' : 'outline'}
        onClick={() => setViewMode('mobile')}
      >
        <Smartphone className="h-4 w-4 mr-1" /> Mobile
      </Button>
    </div>
  );
};

export default ViewModeToggle;
