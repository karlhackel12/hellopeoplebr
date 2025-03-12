
import React from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { MailIcon, RefreshCw, TrashIcon } from 'lucide-react';

interface InvitationsListProps {
  invitations: any[];
  loading: boolean;
  onUpdate: () => void;
}

const InvitationsList: React.FC<InvitationsListProps> = ({ 
  invitations, 
  loading, 
  onUpdate 
}) => {
  const resendInvitation = async (id: string, email: string, invitationCode: string) => {
    try {
      // Update the expiration date (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const { error } = await supabase
        .from('student_invitations')
        .update({
          expires_at: expiresAt.toISOString(),
          status: 'pending',
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Get user profile to get the teacher's name
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Authentication error', {
          description: 'You must be logged in to resend invitations',
        });
        return;
      }

      // Get teacher's profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userData.user.id)
        .single();

      // Format teacher name for the email
      const teacherName = profileData
        ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()
        : 'Your teacher';

      // Send the invitation email using our edge function
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: email,
          invitation_code: invitationCode,
          teacher_name: teacherName
        }
      });
      
      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        toast.warning('Invitation updated but email delivery failed', {
          description: 'The invitation was updated but we could not send the email. The student can still use the invitation code.',
        });
      } else {
        toast.success('Invitation resent', {
          description: `The invitation to ${email} has been resent`,
        });
      }
      
      onUpdate();
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation', {
        description: error.message,
      });
    }
  };
  
  const deleteInvitation = async (id: string, email: string) => {
    try {
      const { error } = await supabase
        .from('student_invitations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Invitation deleted', {
        description: `The invitation to ${email} has been deleted`,
      });
      
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting invitation:', error);
      toast.error('Failed to delete invitation', {
        description: error.message,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 border-yellow-200 text-yellow-800">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 border-green-200 text-green-800">Accepted</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 border-gray-200 text-gray-800">Expired</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 border-red-200 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <p>Loading invitations...</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="bg-muted p-8 rounded-lg text-center">
        <MailIcon className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">No invitations sent</h3>
        <p className="text-muted-foreground mb-4">When you invite students, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Invitation Code</th>
                <th className="px-4 py-3 text-left">Sent Date</th>
                <th className="px-4 py-3 text-left">Expires</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invitations.map((invitation) => (
                <tr key={invitation.id}>
                  <td className="px-4 py-3">{invitation.email}</td>
                  <td className="px-4 py-3">
                    {getStatusBadge(invitation.status)}
                  </td>
                  <td className="px-4 py-3">
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {invitation.invitation_code}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {format(new Date(invitation.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {format(new Date(invitation.expires_at), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => resendInvitation(invitation.id, invitation.email, invitation.invitation_code)}
                        title="Resend invitation"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteInvitation(invitation.id, invitation.email)}
                        title="Delete invitation"
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvitationsList;
