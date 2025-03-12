
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

// Define interface for invitation data
interface InvitationData {
  email: string | null;
  code: string | null;
  isInvited: boolean;
}

// Define the form schemas
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

  // Select the appropriate schema based on form type
  const schema = 
    type === 'login' ? loginSchema : 
    type === 'register' ? registerSchema : 
    forgotPasswordSchema;

  // Initialize the form with the correct default values based on form type
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

  // Update form values if invitation data changes
  useEffect(() => {
    if (type === 'register' && invitationData?.email) {
      form.setValue('email', invitationData.email);
      
      // If coming from invitation, set role to student
      if (invitationData.isInvited) {
        form.setValue('role', 'student');
        form.setValue('invitationCode', invitationData.code || '');
        setHasInvitation(true);
        
        // Validate the invitation code if it exists
        if (invitationData.code) {
          validateInvitationCode(invitationData.code);
        }
      }
    }
  }, [invitationData, form, type]);

  // Create user onboarding record
  const createOnboardingRecord = async (userId: string) => {
    try {
      // Create onboarding record with first step completed
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

  // Update invitation status
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

  // Validate invitation code
  const validateInvitationCode = async (code: string) => {
    if (!code) return;
    
    setIsCheckingCode(true);
    setInvitationStatus(null);
    
    try {
      // Check if the invitation code exists, is valid and not expired
      const { data: invitation, error } = await supabase
        .from('student_invitations')
        .select(`
          *,
          invited_by:profiles(first_name, last_name)
        `)
        .eq('invitation_code', code.toUpperCase())
        .eq('status', 'pending')
        .single();
      
      if (error || !invitation) {
        setInvitationStatus({ 
          valid: false, 
          message: 'Invalid or expired invitation code' 
        });
        return false;
      }
      
      // Check if invitation has expired
      const expiresAt = new Date(invitation.expires_at);
      if (expiresAt < new Date()) {
        setInvitationStatus({ 
          valid: false, 
          message: 'This invitation has expired' 
        });
        return false;
      }
      
      // Format teacher name
      const teacherName = invitation.invited_by 
        ? `${invitation.invited_by.first_name || ''} ${invitation.invited_by.last_name || ''}`.trim() 
        : 'your teacher';
      
      // Update form with the email from the invitation
      form.setValue('email', invitation.email);
      
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

  // Handle invitation code change
  const handleInvitationCodeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const code = event.target.value;
    form.setValue('invitationCode', code);
    
    if (code.length === 8) {
      await validateInvitationCode(code);
    } else {
      setInvitationStatus(null);
    }
  };

  // Toggle having an invitation
  const toggleHasInvitation = () => {
    setHasInvitation(!hasInvitation);
    if (!hasInvitation) {
      // Reset the invitation status when turning on the option
      setInvitationStatus(null);
    }
  };

  // Handle form submission
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
        
        // If the user has indicated they have an invitation code, validate it first
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
        
        // Split the name into first and last name
        const nameParts = registerValues.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        // Register with Supabase
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
          // Create onboarding record for the new user
          await createOnboardingRecord(data.user.id);

          // If user registered with an invitation code, update invitation status
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
        
        // Redirect to the appropriate dashboard based on role
        if (registerValues.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/dashboard');
        }

        // Clear invitation data from session storage
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

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Name field (only for registration) */}
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

          {/* Email field (for all form types) */}
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

          {/* Password field (for login and register) */}
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

          {/* Invitation code field (only for register) */}
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
                    value={form.getValues().invitationCode || ''}
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

          {/* Show readonly invitation info for invited users */}
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

          {/* Role selection (only for register) */}
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

          {/* Show readonly role for invited users or those with a valid invitation code */}
          {type === 'register' && (invitationData?.isInvited || (hasInvitation && invitationStatus?.valid)) && (
            <div className="space-y-3">
              <FormLabel>Role</FormLabel>
              <div className="flex items-center h-11 px-4 rounded-md border bg-muted/50">
                <span className="text-muted-foreground">Student (Invited)</span>
              </div>
            </div>
          )}

          {/* Login-specific actions */}
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

          {/* Submit button */}
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

          {/* Form type switcher links */}
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
