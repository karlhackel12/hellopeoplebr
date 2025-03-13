
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTeacher } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherSidebar from './TeacherSidebar';

interface TeacherLayoutProps {
  children: ReactNode;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        const userIsTeacher = await isTeacher();
        if (!userIsTeacher) {
          toast.error('Access Denied', {
            description: 'Only teachers can access this page',
          });
          navigate('/');
          return;
        }
        setAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
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
        <div className="glass animate-pulse-light rounded-md p-6">
          <div className="h-8 w-32 bg-muted/50 rounded-md mb-4"></div>
          <div className="h-24 w-64 bg-muted/50 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!authorized) {
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
