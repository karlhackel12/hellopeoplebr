
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

          // If user registered through invitation, update invitation status
          if (invitationData?.isInvited && invitationData.code) {
            await updateInvitationStatus(invitationData.code, data.user.id);
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
                    disabled={isLoading || (type === 'register' && !!invitationData?.email)}
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

          {/* Role selection (only for register) */}
          {type === 'register' && !invitationData?.isInvited && (
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

          {/* Show readonly role for invited users */}
          {type === 'register' && invitationData?.isInvited && (
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
