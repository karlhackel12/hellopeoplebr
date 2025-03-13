
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  BookOpen,
  Users,
  Mail,
  ClipboardList,
  Settings,
  Home,
  Menu,
  FileQuestion,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const TeacherSidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  
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
          <Menu className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        <nav>
          <NavLink to="/teacher/dashboard" className={({ isActive }) => 
            cn("flex items-center p-2", isActive && "bg-muted")
          }>
            <Home className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Home</span>}
          </NavLink>
          <NavLink to="/teacher/lessons" className={({ isActive }) => 
            cn("flex items-center p-2", isActive && "bg-muted")
          }>
            <BookOpen className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Lessons</span>}
          </NavLink>
          <NavLink to="/teacher/quizzes" className={({ isActive }) => 
            cn("flex items-center p-2", isActive && "bg-muted")
          }>
            <FileQuestion className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Quizzes</span>}
          </NavLink>
          <NavLink to="/teacher/students" className={({ isActive }) => 
            cn("flex items-center p-2", isActive && "bg-muted")
          }>
            <Users className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Students</span>}
          </NavLink>
          <NavLink to="/teacher/messages" className={({ isActive }) => 
            cn("flex items-center p-2", isActive && "bg-muted")
          }>
            <Mail className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Messages</span>}
          </NavLink>
          <NavLink to="/teacher/settings" className={({ isActive }) => 
            cn("flex items-center p-2", isActive && "bg-muted")
          }>
            <Settings className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Settings</span>}
          </NavLink>
        </nav>
      </div>
      
      <div className="p-4 border-t flex items-center justify-between">
        <ThemeSwitcher />
        {!collapsed && <span className="text-sm text-muted-foreground">Theme</span>}
      </div>
    </div>
  );
};

export default TeacherSidebar;
