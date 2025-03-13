
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTeacher } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherSidebar from './TeacherSidebar';
import { Loader2 } from 'lucide-react';

interface TeacherLayoutProps {
  children: ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if on mobile and collapse sidebar by default
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        setAuthError(null);
        
        const userIsTeacher = await isTeacher();
        
        if (!userIsTeacher) {
          console.log("User is not a teacher, redirecting to login");
          setAuthError("Only teachers can access this page");
          toast.error('Access Denied', {
            description: 'Only teachers can access this page',
          });
          navigate('/login');
          return;
        }
        
        setAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthError("Authentication error. Please log in again.");
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying your access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    if (authError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="glass rounded-md p-6 text-center">
            <p className="text-destructive mb-4">{authError}</p>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen flex bg-background">
      <TeacherSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
      />
      
      <main 
        className={`flex-grow transition-all duration-300 pt-16 md:pt-6 px-4 md:px-6 lg:px-8 pb-16 md:pb-10 overflow-x-hidden ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
};

export default TeacherLayout;
