
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Brain, Mic, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavigationItem {
  icon: React.ElementType;
  label: string;
  path: string;
  activeColor: string;
}

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  const navigationItems: NavigationItem[] = [
    { 
      icon: LayoutDashboard, 
      label: 'Início', 
      path: '/student/dashboard',
      activeColor: 'text-[#1EAEDB]' 
    },
    { 
      icon: BookOpen, 
      label: 'Aulas', 
      path: '/student/lessons',
      activeColor: 'text-[#36B37E]' 
    },
    { 
      icon: Brain, 
      label: 'Prática', 
      path: '/student/spaced-repetition',
      activeColor: 'text-[#F97316]' 
    },
    { 
      icon: Mic, 
      label: 'Voz', 
      path: '/student/voice-practice',
      activeColor: 'text-[#0EA5E9]' 
    },
    { 
      icon: User, 
      label: 'Perfil', 
      path: '/student/settings',
      activeColor: 'text-primary' 
    },
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
                ? item.activeColor
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
