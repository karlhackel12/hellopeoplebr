
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
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
import { BookOpen, Check, Loader2 } from 'lucide-react';

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
  const navigate = useNavigate();
  
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      invitationCode: '',
    },
  });

  const onSubmit = async (values: InvitationFormValues) => {
    setIsLoading(true);
    
    try {
      // Verify invitation code
      const { data: invitation, error } = await supabase
        .from('student_invitations')
        .select('*, invited_by(first_name, last_name, email)')
        .eq('invitation_code', values.invitationCode.toUpperCase())
        .eq('status', 'pending')
        .single();
      
      if (error) {
        throw new Error('Invalid or expired invitation code');
      }
      
      if (!invitation) {
        throw new Error('Invitation not found or already accepted');
      }
      
      // Get teacher information
      const teacherProfile = invitation.invited_by;
      const teacherName = teacherProfile ? 
        `${teacherProfile.first_name || ''} ${teacherProfile.last_name || ''}`.trim() : 
        'Your teacher';
      
      setTeacherEmail(invitation.email);
      setInvitationVerified(true);
      
      toast.success('Invitation verified', {
        description: `You've been invited by ${teacherName}`,
      });
      
    } catch (error: any) {
      console.error('Error validating invitation:', error);
      toast.error('Invalid invitation', {
        description: error.message || 'Please check your invitation code and try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const proceedToRegister = () => {
    // Store invitation details in session storage to retrieve during registration
    if (teacherEmail) {
      sessionStorage.setItem('invitationCode', form.getValues().invitationCode);
      sessionStorage.setItem('invitedEmail', teacherEmail);
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
                <p className="text-sm mt-1">You're invited to join HelloPeople. Complete your registration to get started.</p>
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
