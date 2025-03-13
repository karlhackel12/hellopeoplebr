
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  GraduationCap,
  LayoutDashboard,
  Settings,
  ClipboardList
} from 'lucide-react';

const TeacherLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
      href: '/teacher/dashboard',
      active: pathname === '/teacher/dashboard'
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Students',
      href: '/teacher/students',
      active: pathname.startsWith('/teacher/students')
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      label: 'Quizzes',
      href: '/teacher/quizzes',
      active: pathname.startsWith('/teacher/quizzes')
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: 'Assignments',
      href: '/teacher/assignments',
      active: pathname.startsWith('/teacher/assignments')
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      href: '/teacher/settings',
      active: pathname.startsWith('/teacher/settings')
    }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <div className="flex flex-col flex-grow border-r border-border bg-card overflow-y-auto">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-border">
            <h1 className="text-xl font-bold">Teacher Portal</h1>
          </div>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div
                    className={`mr-3 ${
                      item.active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  >
                    {item.icon}
                  </div>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-border p-4">
            <button
              onClick={signOut}
              className="flex-shrink-0 w-full group block text-sm text-muted-foreground hover:text-foreground"
            >
              <div className="flex items-center">
                <div>
                  <p className="font-medium">Sign out</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex items-center h-16 flex-shrink-0 px-4 border-b border-border fixed top-0 left-0 right-0 bg-background z-10">
        <h1 className="text-xl font-bold">Teacher Portal</h1>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden flex items-center h-16 flex-shrink-0 px-4 border-t border-border fixed bottom-0 left-0 right-0 bg-background z-10 justify-around">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex flex-col items-center justify-center ${
              item.active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div>{item.icon}</div>
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <main className="flex-1 pb-16 md:pb-0 pt-16 md:pt-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
