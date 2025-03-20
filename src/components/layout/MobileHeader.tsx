
import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle, pageTitle }) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-40 px-4 relative">
      {/* Cloud Background Effect (more subtle for mobile) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[10%] w-40 h-12 bg-[#D3E4FD]/30 rounded-full blur-2xl"></div>
        <div className="absolute top-3 right-[20%] w-28 h-10 bg-[#0EA5E9]/20 rounded-full blur-2xl"></div>
      </div>
      
      <div className="flex items-center justify-between h-full relative z-10">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="mr-3 -ml-2">
            <Menu className="h-5 w-5" />
          </Button>
          {pageTitle ? (
            <h1 className="text-xl font-semibold truncate max-w-[200px]">{pageTitle}</h1>
          ) : (
            <Logo size="sm" />
          )}
        </div>
        <Button variant="ghost" size="icon" className="-mr-2">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;
