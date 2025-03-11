
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import StudentInviteForm from '@/components/teacher/StudentInviteForm';
import InvitationsList from '@/components/teacher/InvitationsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Invitations = () => {
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load invitations', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-6">Student Management</h1>
        
        <Tabs defaultValue="invite" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="invite">Invite Students</TabsTrigger>
            <TabsTrigger value="pending">Pending Invitations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="invite" className="space-y-4">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Invite a New Student</h2>
              <StudentInviteForm onSuccess={fetchInvitations} />
            </div>
          </TabsContent>
          
          <TabsContent value="pending">
            <InvitationsList 
              invitations={invitations} 
              loading={loading} 
              onUpdate={fetchInvitations} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </TeacherLayout>
  );
};

export default Invitations;
