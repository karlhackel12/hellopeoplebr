
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';

const DashboardHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 px-4 md:px-6">
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center">
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
