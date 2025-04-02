
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileHeaderProps {
  pageTitle?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ pageTitle }) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-40 px-4">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center">
          <Logo size="sm" />
        </div>
        <Button variant="ghost" size="icon" className="-mr-2">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;
