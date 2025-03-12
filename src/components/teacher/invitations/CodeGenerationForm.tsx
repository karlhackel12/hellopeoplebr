
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';

const generateCodeSchema = z.object({
  note: z.string().optional(),
});

type GenerateCodeFormValues = z.infer<typeof generateCodeSchema>;

interface CodeGenerationFormProps {
  onSuccess: () => void;
}

const CodeGenerationForm: React.FC<CodeGenerationFormProps> = ({ onSuccess }) => {
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<GenerateCodeFormValues>({
    resolver: zodResolver(generateCodeSchema),
    defaultValues: {
      note: '',
    },
  });

  const onSubmit = async (values: GenerateCodeFormValues) => {
    try {
      setIsGenerating(true);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Authentication error', {
          description: 'You must be logged in to generate invitation codes',
        });
        return;
      }

      // Set expiration date (30 days from now for codes)
      const expiresAt = addDays(new Date(), 30).toISOString();

      // Insert invitation without email
      const { data, error } = await supabase
        .from('student_invitations')
        .insert({
          invited_by: userData.user.id,
          expires_at: expiresAt,
          email: '', // Empty email for manual code sharing
          status: 'pending',
          invitation_code: 'PENDING' // This will be replaced by the trigger
        })
        .select();

      if (error) {
        console.error('Error generating invitation code:', error);
        if (error.code === 'PGRST301') {
          toast.error('Permission denied', {
            description: 'You do not have permission to generate invitation codes.',
          });
        } else {
          toast.error('Failed to generate invitation code', {
            description: error.message,
          });
        }
        return;
      }

      // Get the generated invitation code
      const invitation = data[0];
      setInvitationCode(invitation.invitation_code);
      
      toast.success('Invitation code generated', {
        description: 'Copy and share this code with your student',
      });
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('Error generating invitation code:', error);
      toast.error('Failed to generate invitation code', {
        description: error.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler for copying code to clipboard
  const handleCopyCode = async () => {
    if (invitationCode) {
      try {
        await navigator.clipboard.writeText(invitationCode);
        setCopySuccess(true);
        toast.success('Code copied to clipboard');
        
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
        toast.error('Failed to copy code');
      }
    }
  };

  // Reset the generated code and form
  const handleGenerateAnother = () => {
    setInvitationCode(null);
    form.reset();
  };

  if (invitationCode) {
    return (
      <div className="space-y-6">
        <div className="bg-muted p-6 rounded-lg text-center">
          <Badge className="mb-2">Invitation Code</Badge>
          <div className="text-2xl font-mono tracking-wider my-3">{invitationCode}</div>
          <div className="flex justify-center gap-2 mt-4">
            <Button 
              onClick={handleCopyCode} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              {copySuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
            <Button onClick={handleGenerateAnother} variant="secondary">Generate Another</Button>
          </div>
        </div>
        
        <Alert>
          <AlertDescription>
            <p>Share this code with your student. They'll enter it when creating their account.</p>
            <p className="mt-2 text-sm text-muted-foreground">This code will expire in 30 days if unused.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="For tracking purposes only" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Invitation Code'}
        </Button>
        
        <Alert>
          <AlertDescription>
            You'll need to manually share this code with your student. They will enter it during signup.
          </AlertDescription>
        </Alert>
      </form>
    </Form>
  );
};

export default CodeGenerationForm;
