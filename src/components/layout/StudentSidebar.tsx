
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Brain,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SidebarLinkProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  active?: boolean;
  collapsed?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  href, 
  icon: Icon, 
  children, 
  active,
  collapsed
}) => {
  return (
    <Link to={href} className="block w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 px-3 py-2 mb-1 transition-all duration-200",
          active ? "bg-primary/15 text-primary hover:bg-primary/20" : "hover:bg-secondary",
          collapsed ? "justify-center px-2" : ""
        )}
      >
        <Icon className="h-5 w-5" />
        {!collapsed && <span className="font-medium truncate">{children}</span>}
      </Button>
    </Link>
  );
};

interface StudentSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobileView?: boolean;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ 
  collapsed = false, 
  onToggle,
  isOpen = false,
  onClose,
  isMobileView = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const navigationLinks = [
    { 
      name: 'Dashboard', 
      href: '/student/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'My Lessons', 
      href: '/student/lessons', 
      icon: BookOpen 
    },
    { 
      name: 'Spaced Repetition', 
      href: '/student/spaced-repetition', 
      icon: Brain 
    },
    { 
      name: 'Voice Practice', 
      href: '/student/voice-practice', 
      icon: Mic 
    },
    { 
      name: 'Settings', 
      href: '/student/settings', 
      icon: Settings 
    }
  ];

  const isRouteActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const sidebarClasses = cn(
    "h-screen border-r border-sidebar-border transition-all duration-300 shadow-md",
    isMobileView ? "w-full" : (collapsed ? "w-20" : "w-64"),
    !isMobileView && "fixed top-0 left-0 z-40"
  );

  const sidebarStyles = {
    backgroundColor: "var(--sidebar-background)",
    backdropFilter: "blur(8px)"
  };

  return (
    <aside className={sidebarClasses} style={sidebarStyles}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
          <div className={cn("transition-opacity", collapsed ? "opacity-0 hidden" : "opacity-100")}>
            <Logo size="sm" />
          </div>
          {collapsed ? (
            <div className="mx-auto">
              <Logo iconOnly size="sm" />
            </div>
          ) : null}
          
          {isMobileView ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="ml-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="hidden md:flex"
            >
              <ChevronLeft
                className={cn("h-5 w-5 transition-transform", 
                  collapsed ? "rotate-180" : ""
                )}
              />
            </Button>
          )}
        </div>
        
        <nav className="flex-grow p-3 overflow-y-auto">
          <div className="space-y-1">
            {navigationLinks.map((link) => (
              <SidebarLink
                key={link.name}
                href={link.href}
                icon={link.icon}
                active={isRouteActive(link.href)}
                collapsed={collapsed}
              >
                {link.name}
              </SidebarLink>
            ))}
          </div>
        </nav>
        
        <div className="p-3 border-t border-sidebar-border">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full text-destructive hover:text-destructive hover:bg-destructive/10", 
              collapsed ? "justify-center" : "justify-start gap-3"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;
