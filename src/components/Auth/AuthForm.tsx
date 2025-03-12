
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface InvitationData {
  email: string | null;
  code: string | null;
  isInvited: boolean;
}

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['student', 'teacher'], {
    required_error: 'Please select a role',
  }),
  invitationCode: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

type FormValues = LoginFormValues | RegisterFormValues | ForgotPasswordFormValues;

type AuthFormProps = {
  type: 'login' | 'register' | 'forgotPassword';
  invitationData?: InvitationData;
};

const AuthForm: React.FC<AuthFormProps> = ({ type, invitationData }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInvitation, setHasInvitation] = useState(!!invitationData?.isInvited);
  const [invitationStatus, setInvitationStatus] = useState<{ valid: boolean; message: string; teacherName?: string } | null>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const navigate = useNavigate();

  const schema = 
    type === 'login' ? loginSchema : 
    type === 'register' ? registerSchema : 
    forgotPasswordSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: 
      type === 'login' ? { 
        email: '',
        password: '',
      } : 
      type === 'register' ? {
        name: '',
        email: invitationData?.email || '',
        password: '',
        role: invitationData?.isInvited ? 'student' : 'student',
        invitationCode: invitationData?.code || '',
      } : {
        email: '',
      },
  });

  useEffect(() => {
    if (type === 'register' && invitationData?.email) {
      form.setValue('email', invitationData.email);
      
      if (invitationData.isInvited) {
        form.setValue('role', 'student');
        form.setValue('invitationCode', invitationData.code || '');
        setHasInvitation(true);
        
        if (invitationData.code) {
          validateInvitationCode(invitationData.code);
        }
      }
    }
  }, [invitationData, form, type]);

  const createOnboardingRecord = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_onboarding')
        .insert({
          user_id: userId,
          completed_steps: ['Create Account'],
          current_step_index: 1
        });

      if (error) {
        console.error('Error creating onboarding record:', error);
      }
    } catch (error) {
      console.error('Error creating onboarding record:', error);
    }
  };

  const updateInvitationStatus = async (code: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('student_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('invitation_code', code);

      if (error) {
        console.error('Error updating invitation status:', error);
      }
    } catch (error) {
      console.error('Error updating invitation status:', error);
    }
  };

  const validateInvitationCode = async (code: string) => {
    if (!code) return;
    
    setIsCheckingCode(true);
    setInvitationStatus(null);
    
    try {
      console.log("Validating invitation code:", code);
      
      // First, try to get the invitation
      const { data: invitations, error } = await supabase
        .from('student_invitations')
        .select(`
          *,
          invited_by:profiles(first_name, last_name)
        `)
        .eq('invitation_code', code.toUpperCase())
        .eq('status', 'pending');
      
      console.log("Invitation query result:", { invitations, error });
      
      if (error) {
        console.error("Supabase error:", error);
        setInvitationStatus({ 
          valid: false, 
          message: 'Error validating code: ' + error.message 
        });
        return false;
      }
      
      if (!invitations || invitations.length === 0) {
        console.log("No invitation found with this code");
        setInvitationStatus({ 
          valid: false, 
          message: 'Invalid or expired invitation code' 
        });
        return false;
      }
      
      // Use the first invitation if multiple are found
      const invitation = invitations[0];
      
      // Check if the invitation has expired
      const expiresAt = new Date(invitation.expires_at);
      if (expiresAt < new Date()) {
        console.log("Invitation expired on:", expiresAt);
        setInvitationStatus({ 
          valid: false, 
          message: 'This invitation has expired' 
        });
        return false;
      }
      
      const teacherName = invitation.invited_by 
        ? `${invitation.invited_by.first_name || ''} ${invitation.invited_by.last_name || ''}`.trim() 
        : 'your teacher';
      
      form.setValue('email', invitation.email);
      
      console.log("Valid invitation from:", teacherName);
      setInvitationStatus({ 
        valid: true, 
        message: `Valid invitation from ${teacherName}`, 
        teacherName 
      });
      
      return true;
    } catch (error) {
      console.error('Error validating invitation code:', error);
      setInvitationStatus({ 
        valid: false, 
        message: 'Error validating code' 
      });
      return false;
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleInvitationCodeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const code = event.target.value;
    
    if (type === 'register') {
      if (form.getValues() && typeof form.getValues() === 'object') {
        (form.getValues() as RegisterFormValues).invitationCode = code;
      }
      
      if (code.length === 8) {
        await validateInvitationCode(code);
      } else {
        setInvitationStatus(null);
      }
    }
  };

  const toggleHasInvitation = () => {
    setHasInvitation(!hasInvitation);
    if (!hasInvitation) {
      setInvitationStatus(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      if (type === 'login') {
        const loginValues = values as LoginFormValues;
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginValues.email,
          password: loginValues.password,
        });

        if (error) throw error;

        toast.success("Login successful", {
          description: "Welcome back! Redirecting to your dashboard...",
        });
        navigate('/dashboard');
      } 
      else if (type === 'register') {
        const registerValues = values as RegisterFormValues;
        
        if (hasInvitation && registerValues.invitationCode) {
          const isValid = await validateInvitationCode(registerValues.invitationCode);
          if (!isValid) {
            toast.error("Invalid invitation", {
              description: invitationStatus?.message || "Please check your invitation code",
            });
            setIsLoading(false);
            return;
          }
        }
        
        const nameParts = registerValues.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        const { data, error } = await supabase.auth.signUp({
          email: registerValues.email,
          password: registerValues.password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: registerValues.role,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          await createOnboardingRecord(data.user.id);

          if ((hasInvitation && registerValues.invitationCode) || 
              (invitationData?.isInvited && invitationData.code)) {
            const code = registerValues.invitationCode || invitationData?.code;
            if (code) {
              await updateInvitationStatus(code, data.user.id);
            }
          }
        }

        toast.success("Registration successful", {
          description: "Your account has been created. Welcome to HelloPeople!",
        });
        
        if (registerValues.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/dashboard');
        }

        sessionStorage.removeItem('invitationCode');
        sessionStorage.removeItem('invitedEmail');
      } 
      else if (type === 'forgotPassword') {
        const forgotValues = values as ForgotPasswordFormValues;
        const { data, error } = await supabase.auth.resetPasswordForEmail(forgotValues.email);
        
        if (error) throw error;

        toast.success("Reset link sent", {
          description: "Check your email for password reset instructions.",
        });
        navigate('/login');
      }
    } catch (error: any) {
      toast.error("Authentication error", {
        description: error.message || "An error occurred during authentication. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {type === 'register' && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your name"
                      disabled={isLoading}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    disabled={isLoading || (type === 'register' && (!!invitationData?.email || (hasInvitation && invitationStatus?.valid)))}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {type !== 'forgotPassword' && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder={type === 'login' ? "Enter your password" : "Create a password"}
                        disabled={isLoading}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {type === 'register' && !invitationData?.isInvited && (
            <>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasInvitation"
                  checked={hasInvitation}
                  onChange={toggleHasInvitation}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="hasInvitation" className="text-sm cursor-pointer">
                  I have an invitation code
                </label>
              </div>

              {hasInvitation && (
                <div className="space-y-2">
                  <FormLabel htmlFor="invitationCode">Invitation Code</FormLabel>
                  <Input
                    id="invitationCode"
                    value={(form.getValues() as RegisterFormValues).invitationCode || ''}
                    onChange={handleInvitationCodeChange}
                    placeholder="Enter 8-character code"
                    className="h-11 uppercase"
                    maxLength={8}
                    disabled={isLoading || isCheckingCode}
                  />
                  
                  {isCheckingCode && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Verifying code...</span>
                    </div>
                  )}
                  
                  {invitationStatus && (
                    <Alert className={`py-2 ${invitationStatus.valid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                      <AlertDescription>
                        {invitationStatus.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </>
          )}

          {type === 'register' && invitationData?.isInvited && (
            <div className="space-y-2">
              <FormLabel>Invitation Code</FormLabel>
              <div className="flex items-center h-11 px-4 rounded-md border bg-muted/50">
                <span className="text-muted-foreground">{invitationData.code}</span>
              </div>
              
              {invitationStatus && (
                <Alert className={`py-2 ${invitationStatus.valid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                  <AlertDescription>
                    {invitationStatus.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {type === 'register' && !invitationData?.isInvited && !hasInvitation && (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>I am a</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <FormLabel htmlFor="student" className="cursor-pointer">Student</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="teacher" />
                        <FormLabel htmlFor="teacher" className="cursor-pointer">Teacher</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {type === 'register' && (invitationData?.isInvited || (hasInvitation && invitationStatus?.valid)) && (
            <div className="space-y-3">
              <FormLabel>Role</FormLabel>
              <div className="flex items-center h-11 px-4 rounded-md border bg-muted/50">
                <span className="text-muted-foreground">Student (Invited)</span>
              </div>
            </div>
          )}

          {type === 'login' && (
            <div className="flex justify-end">
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => navigate('/forgot-password')}
                type="button"
              >
                Forgot password?
              </Button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {type === 'login' ? 'Logging in...' : 
                 type === 'register' ? 'Creating account...' : 
                 'Sending reset link...'}
              </>
            ) : (
              <>
                {type === 'login' ? 'Log in' : 
                 type === 'register' ? 'Create account' : 
                 'Send reset link'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center text-sm">
            {type === 'login' ? (
              <p>
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium"
                  onClick={() => navigate('/register')}
                  type="button"
                >
                  Sign up
                </Button>
              </p>
            ) : type === 'register' ? (
              <p>
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium"
                  onClick={() => navigate('/login')}
                  type="button"
                >
                  Log in
                </Button>
              </p>
            ) : (
              <p>
                Remember your password?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium"
                  onClick={() => navigate('/login')}
                  type="button"
                >
                  Log in
                </Button>
              </p>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AuthForm;
