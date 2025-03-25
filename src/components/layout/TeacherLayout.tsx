import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTeacher } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherSidebar from './TeacherSidebar';
import TeacherBottomNavigation from './TeacherBottomNavigation';
import MobileHeader from './MobileHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import LandscapeFooter from './LandscapeFooter';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuthWithAnalytics } from '@/hooks/useAuthWithAnalytics';

interface TeacherLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children, pageTitle }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { trackEvent } = useAnalytics();
  
  useAuthWithAnalytics();

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
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
        
        trackEvent('teacher_dashboard_accessed', { page_title: pageTitle });
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [navigate, pageTitle, trackEvent]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex flex-1">
        {isMobile && (
          <MobileHeader 
            onMenuToggle={toggleMobileMenu}
            pageTitle={pageTitle}
          />
        )}
        
        <TeacherSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        
        <main 
          className={`flex-grow transition-all duration-300 ${
            isMobile ? 'pt-16 pb-28 px-4' : 'pt-6 pb-10'
          } ${
            isMobile ? '' : sidebarCollapsed ? 'md:ml-20 md:px-6' : 'md:ml-64 md:px-8'
          } overflow-x-hidden`}
        >
          <div className="w-full">{children}</div>
        </main>
        
        <TeacherBottomNavigation />
      </div>
      
      <div className={`${isMobile ? 'fixed bottom-16 left-0 right-0' : ''}`}>
        <LandscapeFooter />
      </div>
    </div>
  );
};

export default TeacherLayout;
