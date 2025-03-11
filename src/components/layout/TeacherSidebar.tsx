
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ClipboardList, 
  Settings,
  LogOut
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
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  href, 
  icon: Icon, 
  children, 
  active 
}) => {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 px-4 py-2 mb-1",
          active ? "bg-primary/10 text-primary hover:bg-primary/15" : "hover:bg-secondary"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{children}</span>
      </Button>
    </Link>
  );
};

const TeacherSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = React.useState(true);

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
      name: 'Students', 
      href: '/teacher/invitations', 
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

  return (
    <aside className={cn(
      "h-screen fixed top-0 left-0 z-10 bg-sidebar-background border-r border-sidebar-border transition-all duration-300",
      isExpanded ? "w-64" : "w-20"
    )}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
          <div className={cn("transition-opacity", isExpanded ? "opacity-100" : "opacity-0")}>
            <Logo size="sm" />
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-2" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "←" : "→"}
          </Button>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-1">
            {navigationLinks.map((link) => (
              <SidebarLink
                key={link.name}
                href={link.href}
                icon={link.icon}
                active={location.pathname === link.href || location.pathname.startsWith(`${link.href}/`)}
              >
                {isExpanded ? link.name : ""}
              </SidebarLink>
            ))}
          </div>
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {isExpanded && <span className="font-medium">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
