import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  GraduationCap,
  ClipboardList,
  Mail,
  Settings,
} from 'lucide-react';

interface TeacherSidebarProps {
  className?: string;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ className }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const links = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/teacher/dashboard',
      active: isActive('/teacher/dashboard'),
    },
    {
      title: 'Lessons',
      icon: <BookOpen className="w-5 h-5" />,
      href: '/teacher/lessons',
      active: isActive('/teacher/lessons'),
    },
    {
      title: 'Quizzes',
      icon: <FileQuestion className="w-5 h-5" />,
      href: '/teacher/quiz',
      active: isActive('/teacher/quiz'),
    },
    {
      title: 'Students',
      icon: <GraduationCap className="w-5 h-5" />,
      href: '/teacher/students',
      active: isActive('/teacher/students'),
    },
    {
      title: 'Assignments',
      icon: <ClipboardList className="w-5 h-5" />,
      href: '/teacher/assignments',
      active: isActive('/teacher/assignments'),
    },
    {
      title: 'Invitations',
      icon: <Mail className="w-5 h-5" />,
      href: '/teacher/invitations',
      active: isActive('/teacher/invitations'),
    },
    {
      title: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      href: '/teacher/settings',
      active: isActive('/teacher/settings'),
    },
  ];

  return (
    <div className={cn("w-64 flex-shrink-0 border-r bg-secondary border-r-border flex flex-col", className)}>
      <div className="p-4">
        <h1 className="font-bold text-2xl">Teacher Panel</h1>
      </div>
      <nav className="flex-1 px-2 py-4">
        <ul>
          {links.map((link) => (
            <li key={link.title} className="mb-1">
              <Link
                to={link.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  link.active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                {link.icon}
                <span className="ml-2">{link.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TeacherSidebar;
