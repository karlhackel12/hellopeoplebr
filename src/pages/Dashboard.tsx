
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return profile;
    },
    retry: false,
  });

  useEffect(() => {
    if (error) {
      console.error('Error checking user role:', error);
      toast.error('Session expired', {
        description: 'Please log in again to continue'
      });
      navigate('/login');
      return;
    }

    if (data) {
      if (data.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (data.role === 'student') {
        navigate('/student/dashboard');
      } else {
        // If role is not set or is something else
        navigate('/');
      }
    }
  }, [data, error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg">Redirecting to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
