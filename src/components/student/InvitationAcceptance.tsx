
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Check, Loader2, XCircle } from 'lucide-react';

const invitationSchema = z.object({
  invitationCode: z.string()
    .min(8, { message: 'Invitation code must be 8 characters' })
    .max(8, { message: 'Invitation code must be 8 characters' })
});

type InvitationFormValues = z.infer<typeof invitationSchema>;

const InvitationAcceptance: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitationVerified, setInvitationVerified] = useState(false);
  const [teacherEmail, setTeacherEmail] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { code } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const codeFromQuery = searchParams.get('code');
  
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      invitationCode: code || codeFromQuery || '',
    },
  });

  // Automatically verify code if provided in URL
  useEffect(() => {
    const initialCode = code || codeFromQuery;
    if (initialCode && initialCode.length === 8) {
      console.log('Verifying initial code:', initialCode);
      form.setValue('invitationCode', initialCode);
      verifyInvitation(initialCode);
    }
  }, [code, codeFromQuery]);

  const verifyInvitation = async (invitationCode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Verifying invitation code:", invitationCode);
      
      // Case-insensitive query for the invitation code
      const { data: invitation, error } = await supabase
        .from('student_invitations')
        .select(`
          *,
          invited_by:profiles(first_name, last_name)
        `)
        .ilike('invitation_code', invitationCode)
        .eq('status', 'pending')
        .maybeSingle();
      
      console.log("Invitation query result:", { invitation, error });
      
      if (error) {
        console.error("Supabase error:", error);
        throw new Error('Error validating code: ' + error.message);
      }
      
      if (!invitation) {
        throw new Error('This invitation code is invalid or has already been used');
      }
      
      // Check if the invitation has expired
      const expiresAt = new Date(invitation.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('This invitation has expired. Please contact your teacher for a new invitation.');
      }
      
      // Get teacher information - now correctly typed
      const formattedTeacherName = invitation.invited_by ? 
        `${invitation.invited_by.first_name || ''} ${invitation.invited_by.last_name || ''}`.trim() : 
        'Your teacher';
      
      setStudentEmail(invitation.email);
      setTeacherName(formattedTeacherName);
      setInvitationVerified(true);
      
      toast.success('Invitation verified', {
        description: `You've been invited by ${formattedTeacherName}`,
      });
      
    } catch (error: any) {
      console.error('Error validating invitation:', error);
      setError(error.message || 'Please check your invitation code and try again');
      toast.error('Invalid invitation', {
        description: error.message || 'Please check your invitation code and try again',
      });
      setInvitationVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: InvitationFormValues) => {
    await verifyInvitation(values.invitationCode.toUpperCase());
  };

  const proceedToRegister = () => {
    if (studentEmail) {
      sessionStorage.setItem('invitationCode', form.getValues().invitationCode.toUpperCase());
      sessionStorage.setItem('invitedEmail', studentEmail);
      navigate('/register');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle>Join HelloPeople</CardTitle>
        </div>
        <CardDescription>
          Enter your invitation code to get started with your language learning journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!invitationVerified ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="invitationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invitation Code</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter 8-character code" 
                        className="uppercase"
                        disabled={isLoading}
                        maxLength={8}
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-red-800 flex items-start">
                  <XCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Invitation'
                )}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-green-800 flex items-start">
              <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
              <div>
                <p className="font-medium">Invitation Verified!</p>
                <p className="text-sm mt-1">You're invited by {teacherName} to join HelloPeople as a student.</p>
                {studentEmail && (
                  <p className="text-sm mt-1">This invitation is for: <strong>{studentEmail}</strong></p>
                )}
              </div>
            </div>
            
            <Button 
              onClick={proceedToRegister}
              className="w-full"
            >
              Continue to Registration
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationAcceptance;
