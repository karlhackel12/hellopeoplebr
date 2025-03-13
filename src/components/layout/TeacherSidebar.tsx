
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  BookOpen,
  Users,
  Mail,
  ClipboardList,
  Settings,
  LayoutDashboard,
  Menu,
  FileQuestion,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const TeacherSidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
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
  
  return (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className={cn("text-lg font-bold", collapsed && "hidden")}>Teacher Dashboard</h1>
        <button onClick={onToggle} className="p-2">
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="px-2 space-y-1">
          <NavLink to="/teacher/dashboard" className={({ isActive }) => 
            cn("flex items-center p-2 rounded-md", 
               isActive ? "bg-primary/10 text-primary" : "hover:bg-muted transition-colors")
          }>
            <LayoutDashboard className="h-5 w-5" />
            {!collapsed && <span className="ml-3 font-medium">Dashboard</span>}
          </NavLink>
          
          <NavLink to="/teacher/lessons" className={({ isActive }) => 
            cn("flex items-center p-2 rounded-md", 
               isActive ? "bg-primary/10 text-primary" : "hover:bg-muted transition-colors")
          }>
            <BookOpen className="h-5 w-5" />
            {!collapsed && <span className="ml-3 font-medium">Lessons</span>}
          </NavLink>
          
          <NavLink to="/teacher/quizzes" className={({ isActive }) => 
            cn("flex items-center p-2 rounded-md", 
               isActive ? "bg-primary/10 text-primary" : "hover:bg-muted transition-colors")
          }>
            <FileQuestion className="h-5 w-5" />
            {!collapsed && <span className="ml-3 font-medium">Quizzes</span>}
          </NavLink>
          
          <NavLink to="/teacher/students" className={({ isActive }) => 
            cn("flex items-center p-2 rounded-md", 
               isActive ? "bg-primary/10 text-primary" : "hover:bg-muted transition-colors")
          }>
            <Users className="h-5 w-5" />
            {!collapsed && <span className="ml-3 font-medium">Students</span>}
          </NavLink>
          
          <NavLink to="/teacher/assignments" className={({ isActive }) => 
            cn("flex items-center p-2 rounded-md", 
               isActive ? "bg-primary/10 text-primary" : "hover:bg-muted transition-colors")
          }>
            <ClipboardList className="h-5 w-5" />
            {!collapsed && <span className="ml-3 font-medium">Assignments</span>}
          </NavLink>
          
          <NavLink to="/teacher/invitations" className={({ isActive }) => 
            cn("flex items-center p-2 rounded-md", 
               isActive ? "bg-primary/10 text-primary" : "hover:bg-muted transition-colors")
          }>
            <Mail className="h-5 w-5" />
            {!collapsed && <span className="ml-3 font-medium">Invitations</span>}
          </NavLink>
          
          <NavLink to="/teacher/settings" className={({ isActive }) => 
            cn("flex items-center p-2 rounded-md", 
               isActive ? "bg-primary/10 text-primary" : "hover:bg-muted transition-colors")
          }>
            <Settings className="h-5 w-5" />
            {!collapsed && <span className="ml-3 font-medium">Settings</span>}
          </NavLink>
        </nav>
      </div>
      
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
  );
};

export default TeacherSidebar;
