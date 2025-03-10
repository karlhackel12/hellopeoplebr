
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

// Define the form schemas
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type AuthFormProps = {
  type: 'login' | 'register' | 'forgotPassword';
};

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Select the appropriate schema based on form type
  const schema = 
    type === 'login' ? loginSchema : 
    type === 'register' ? registerSchema : 
    forgotPasswordSchema;

  // Initialize the form
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof schema>) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      switch (type) {
        case 'login':
          toast({
            title: "Login successful",
            description: "Welcome back! Redirecting to your dashboard...",
          });
          navigate('/dashboard');
          break;

        case 'register':
          toast({
            title: "Registration successful",
            description: "Your account has been created. Welcome to HelloPeople!",
          });
          navigate('/dashboard');
          break;

        case 'forgotPassword':
          toast({
            title: "Reset link sent",
            description: "Check your email for password reset instructions.",
          });
          navigate('/login');
          break;
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "An error occurred during authentication. Please try again.",
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
                    disabled={isLoading}
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
