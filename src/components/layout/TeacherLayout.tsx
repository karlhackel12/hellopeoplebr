
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-light rounded-md bg-muted p-4">
          <p>Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen flex bg-background">
      <TeacherSidebar />
      <main className="flex-grow transition-all duration-300 ml-64 pt-6 px-8 pb-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};

export default TeacherLayout;
