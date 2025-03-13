import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  GraduationCap, 
  Home, 
  Menu, 
  Settings, 
  X 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const sidebarItems = [
    {
      name: 'Dashboard',
      href: '/student/dashboard',
      icon: Home,
    },
    {
      name: 'Lessons',
      href: '/student/lessons',
      icon: BookOpen,
    },
    {
      name: 'My Courses',
      href: '/student/courses',
      icon: GraduationCap,
    },
    {
      name: 'Settings',
      href: '/student/settings',
      icon: Settings,
    },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-r-border transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isMobile ? '' : 'hidden'}`}
    >
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="font-bold text-2xl">
          LearnAI
        </Link>
        <button onClick={onClose} className="md:hidden">
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="py-6">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-secondary ${
                isActive ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground'
              }`}
              onClick={onClose}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default StudentSidebar;
