
import React from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '@/components/Auth/AuthForm';
import Logo from '@/components/ui/Logo';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to login
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Reset your password</h1>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        
        <AuthForm type="forgotPassword" />
      </div>
    </div>
  );
};

export default ForgotPassword;
