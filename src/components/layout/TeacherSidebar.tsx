
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  BookCheck,
  FileQuestion,
  Users,
  Mail,
  Settings,
  ListTodo,
  Home,
  GraduationCap,
  BookText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
}

const TeacherSidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/teacher/dashboard' },
    { icon: BookOpen, label: 'Lessons', href: '/teacher/lessons' },
    { icon: FileQuestion, label: 'Quizzes', href: '/teacher/quizzes' },
    { icon: BookCheck, label: 'Assignments', href: '/teacher/assignments' },
    { icon: GraduationCap, label: 'Students', href: '/teacher/students' },
    { icon: Mail, label: 'Invitations', href: '/teacher/invitations' },
    { icon: Settings, label: 'Settings', href: '/teacher/settings' },
  ];
  
  // Group for quick actions
  const quickActions = [
    { icon: BookOpen, label: 'Create Lesson', href: '/teacher/lessons/create' },
    { icon: FileQuestion, label: 'Assign Quizzes', href: '/teacher/quizzes/assign' },
  ];

  const closeMobileMenu = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
        />
      )}
      
      {/* Sidebar container */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 border-r bg-card transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="px-6 py-5 flex items-center">
            <Logo />
          </div>
          
          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto py-4 px-4">
            {/* Teacher type label */}
            <div className="mb-2 px-2">
              <p className="text-xs font-medium text-muted-foreground tracking-wider">
                TEACHER DASHBOARD
              </p>
            </div>
            
            {/* Main navigation */}
            <nav className="space-y-1 mb-6">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`
                  }
                  onClick={closeMobileMenu}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            
            {/* Quick actions section */}
            <div className="mb-2 px-2 mt-8">
              <p className="text-xs font-medium text-muted-foreground tracking-wider">
                QUICK ACTIONS
              </p>
            </div>
            
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.href}
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    window.location.href = action.href;
                    closeMobileMenu();
                  }}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherSidebar;
