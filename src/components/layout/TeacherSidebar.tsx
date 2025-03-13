
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ClipboardList, 
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  FileQuestion
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

interface TeacherSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ 
  collapsed = false, 
  onToggle 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
      href: '/teacher/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Lessons', 
      href: '/teacher/lessons', 
      icon: BookOpen 
    },
    { 
      name: 'Quizzes', 
      href: '/teacher/quiz', 
      icon: FileQuestion 
    },
    { 
      name: 'Students', 
      href: '/teacher/students', 
      icon: Users 
    },
    { 
      name: 'Assignments', 
      href: '/teacher/assignments', 
      icon: ClipboardList 
    },
    { 
      name: 'Settings', 
      href: '/teacher/settings', 
      icon: Settings 
    }
  ];

  const isRouteActive = (href: string) => {
    if (href === '/teacher/lessons') {
      return location.pathname === href || 
             location.pathname.startsWith('/teacher/lessons/create') || 
             location.pathname.startsWith('/teacher/lessons/edit/');
    }
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const sidebarClasses = cn(
    "fixed top-0 left-0 z-40 h-screen border-r border-sidebar-border transition-all duration-300 shadow-md",
    collapsed ? "w-20" : "w-64",
    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  );

  const sidebarStyles = {
    backgroundColor: "var(--sidebar-background)",
    backdropFilter: "blur(8px)"
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden shadow-md"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

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
      
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
};

export default TeacherSidebar;
