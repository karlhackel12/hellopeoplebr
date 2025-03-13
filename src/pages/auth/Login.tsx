
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              className="w-full p-2 border rounded"
            />
          </div>
          
          <Button className="w-full">Sign In</Button>
        </form>
        
        <div className="flex justify-between text-sm">
          <Link to="/forgot-password" className="text-primary">
            Forgot password?
          </Link>
          <Link to="/register" className="text-primary">
            Create account
          </Link>
        </div>
        
        <div className="pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground mb-2">Demo shortcuts:</p>
          <div className="flex flex-col gap-2">
            <Link to="/teacher/dashboard">
              <Button variant="outline" className="w-full">
                Teacher Dashboard
              </Button>
            </Link>
            <Link to="/student/dashboard">
              <Button variant="outline" className="w-full">
                Student Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
