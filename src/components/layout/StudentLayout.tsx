import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Settings, LogOut, Clipboard, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ThemeToggle';

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/student/dashboard', 
      icon: <LayoutDashboard className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Quizzes', 
      path: '/student/quizzes', 
      icon: <Clipboard className="h-4 w-4 mr-2" /> 
    },
    { 
      name: 'Settings', 
      path: '/student/settings', 
      icon: <Settings className="h-4 w-4 mr-2" /> 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center font-semibold text-lg">
            <Link to="/student/dashboard">LearnSmart</Link>
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
            
            <ThemeToggle />
            
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
      
      <main className="flex-1 bg-muted/40">
        <div className="container mx-auto py-6 px-4 sm:px-6">
          {children}
        </div>
      </main>
      
      <footer className="border-t py-4 bg-background">
        <div className="container flex flex-col sm:flex-row items-center justify-between px-4">
          <p className="text-sm text-muted-foreground">
            © 2023 LearnSmart. All rights reserved.
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

export default StudentLayout;
