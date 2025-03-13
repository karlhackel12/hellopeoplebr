
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

interface StudentSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ 
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
      href: '/student/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'My Lessons', 
      href: '/student/lessons', 
      icon: BookOpen 
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
    "fixed top-0 left-0 z-40 h-screen border-r transition-all duration-300",
    collapsed ? "w-16" : "w-64",
    mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  );

  return (
    <>
      <button 
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-background border shadow-sm"
      >
        {mobileOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      />

      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full bg-background">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className={cn("text-lg font-bold", collapsed && "hidden")}>Student Portal</h1>
            <button onClick={onToggle} className="p-2 hidden md:block">
              {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto py-2 px-2">
            <div className="space-y-1">
              {navigationLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  className={({ isActive }) => cn(
                    "flex items-center p-2 rounded-md", 
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-muted transition-colors",
                    collapsed && "justify-center"
                  )}
                >
                  <link.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="ml-3 font-medium">{link.name}</span>}
                </NavLink>
              ))}
            </div>
          </nav>
          
          <div className="p-4 border-t flex flex-col gap-3">
            <button 
              onClick={handleLogout}
              className={cn(
                "flex items-center p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span className="ml-3 font-medium">Logout</span>}
            </button>
            
            <div className="flex items-center justify-between">
              <ThemeSwitcher />
              {!collapsed && <span className="text-sm text-muted-foreground">Theme</span>}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
