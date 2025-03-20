
import React from 'react';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuToggle }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 px-4 md:px-6">
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="mr-2 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Logo size="sm" />
        </div>

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
