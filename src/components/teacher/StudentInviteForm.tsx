
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addDays } from 'date-fns';

const inviteSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface StudentInviteFormProps {
  onSuccess: () => void;
}

const StudentInviteForm: React.FC<StudentInviteFormProps> = ({ onSuccess }) => {
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Authentication error', {
          description: 'You must be logged in to invite students',
        });
        return;
      }

      // Set expiration date (7 days from now)
      const expiresAt = addDays(new Date(), 7).toISOString();

      // Insert invitation
      const { data, error } = await supabase
        .from('student_invitations')
        .insert({
          email: values.email,
          invited_by: userData.user.id,
          expires_at: expiresAt,
        })
        .select();

      if (error) {
        if (error.code === '23505') {
          toast.error('Invitation already sent', {
            description: 'You have already invited this student',
          });
        } else {
          throw error;
        }
        return;
      }

      toast.success('Invitation sent', {
        description: `An invitation has been sent to ${values.email}`,
      });
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation', {
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student Email</FormLabel>
              <FormControl>
                <Input placeholder="student@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Sending...' : 'Send Invitation'}
        </Button>
      </form>
    </Form>
  );
};

export default StudentInviteForm;
