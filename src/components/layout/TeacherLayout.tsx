
import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookText, Users, Settings, Mail, LogOut, Clipboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/teacher/dashboard', 
      icon: <BookText className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Lessons', 
      path: '/teacher/lessons', 
      icon: <BookText className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Quizzes', 
      path: '/teacher/quizzes', 
      icon: <Clipboard className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Students', 
      path: '/teacher/students', 
      icon: <Users className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Settings', 
      path: '/teacher/settings', 
      icon: <Settings className="h-4 w-4 mr-2" /> 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center font-semibold text-lg">
            <Link to="/teacher/dashboard">TeachSmart</Link>
          </div>
          
          <nav className="ml-auto flex items-center space-x-1">
            {menuItems.map((item) => (
              <Button 
                key={item.name}
                variant="ghost" 
                asChild
              >
                <Link to={item.path} className="flex items-center">
                  {item.icon}
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              </Button>
            ))}
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 bg-muted/40 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      
      <footer className="border-t py-4 bg-background">
        <div className="container flex flex-col sm:flex-row items-center justify-between px-4">
          <p className="text-sm text-muted-foreground">
            © 2023 TeachSmart. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link to="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TeacherLayout;
