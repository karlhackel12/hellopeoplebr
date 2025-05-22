import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBugsterTracker } from '@/hooks/useBugsterTracker';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { logError, setUser } = useBugsterTracker();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        // Registra o usuário no Bugster para rastreamento
        setUser(user.id, {
          email: user.email,
          last_sign_in: user.last_sign_in_at
        });

        // Get user's profile to check their role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile?.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else if (profile?.role === 'student') {
          navigate('/student/dashboard');
        } else {
          // Default redirect if role is not set
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        // Registra o erro no Bugster
        logError(error, { 
          component: 'Dashboard', 
          action: 'checkUserRole' 
        });
        toast.error('Something went wrong. Please try again.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [navigate, logError, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <p className="text-lg">Redirecting to your dashboard...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
