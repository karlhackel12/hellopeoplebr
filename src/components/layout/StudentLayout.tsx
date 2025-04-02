
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StudentSidebar from './StudentSidebar';
import BottomNavigation from './BottomNavigation';
import MobileHeader from './MobileHeader';
import LandscapeFooter from './LandscapeFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthWithAnalytics } from '@/hooks/useAuthWithAnalytics';

interface StudentLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ 
  children, 
  pageTitle,
  mobileMenuOpen: externalMobileMenuOpen,
  onMobileMenuClose
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Set up analytics tracking for auth events
  useAuthWithAnalytics();
  
  const mobileMenuOpen = externalMobileMenuOpen !== undefined ? externalMobileMenuOpen : internalMobileMenuOpen;
  const setMobileMenuOpen = (state: boolean) => {
    if (externalMobileMenuOpen !== undefined && onMobileMenuClose) {
      if (!state) onMobileMenuClose();
    } else {
      setInternalMobileMenuOpen(state);
    }
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkStudentRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('Faça login para acessar as páginas de estudante');
          navigate('/login');
          return;
        }
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (profile?.role !== 'student') {
          toast.error('Acesso Negado', {
            description: 'Apenas estudantes podem acessar esta página',
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
        {!isMobile && (
          <StudentSidebar 
            collapsed={sidebarCollapsed} 
            onToggle={toggleSidebar}
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
        
        {!externalMobileMenuOpen && (
          <MobileHeader 
            onMenuToggle={toggleMobileMenu} 
            pageTitle={pageTitle} 
          />
        )}
        
        <main 
          className={`flex-grow transition-all duration-300 ${
            isMobile 
              ? 'pt-0 pb-28 px-4' 
              : `pt-6 pb-10 px-4 md:px-6 lg:px-8 ${
                  sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
                }`
          }`}
        >
          <div className="w-full">{children}</div>
        </main>
        
        {isMobile && mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div 
              className="absolute inset-y-0 left-0 w-64 bg-background border-r border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <StudentSidebar 
                collapsed={false} 
                onToggle={() => {}}
                isOpen={true}
                onClose={() => setMobileMenuOpen(false)}
                isMobileView
              />
            </div>
          </div>
        )}
        
        <BottomNavigation />
      </div>
      
      <div className={`${isMobile ? 'fixed bottom-16 left-0 right-0' : ''}`}>
        <LandscapeFooter />
      </div>
    </div>
  );
};

export default StudentLayout;
