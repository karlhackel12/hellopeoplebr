
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StudentSidebar from './StudentSidebar';

interface StudentLayoutProps {
  children: ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
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
    const checkStudentRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('Please log in to access student pages');
          navigate('/login');
          return;
        }
        
        // Check if user is a student
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (profile?.role !== 'student') {
          toast.error('Access Denied', {
            description: 'Only students can access this page',
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

    checkStudentRole();
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
      <StudentSidebar 
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

export default StudentLayout;
