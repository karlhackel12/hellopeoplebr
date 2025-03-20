
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Brain, Mic, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavigationItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  const navigationItems: NavigationItem[] = [
    { icon: LayoutDashboard, label: 'Home', path: '/student/dashboard' },
    { icon: BookOpen, label: 'Lessons', path: '/student/lessons' },
    { icon: Brain, label: 'Practice', path: '/student/spaced-repetition' },
    { icon: Mic, label: 'Voice', path: '/student/voice-practice-construction' },
    { icon: User, label: 'Profile', path: '/student/settings' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-[70] px-2 py-1">
      <div className="flex justify-between items-center">
        {navigationItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors w-full",
              isActive(item.path) 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
