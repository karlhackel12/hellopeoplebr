
import React from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '@/components/Auth/AuthForm';
import Logo from '@/components/ui/Logo';
import { CheckCircle2 } from 'lucide-react';

const Register: React.FC = () => {
  const benefits = [
    "Access to AI-powered conversation practice",
    "Personalized learning path based on your goals",
    "Progress tracking and performance insights",
    "5 free lessons per week on the free plan",
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Auth form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:px-12 lg:px-16 relative">
        <div className="absolute top-8 left-8">
          <Logo />
        </div>
        
        <div className="w-full max-w-md mx-auto mt-16 md:mt-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3">Create your account</h1>
            <p className="text-muted-foreground">
              Join thousands of language learners achieving fluency faster
            </p>
          </div>
          
          <AuthForm type="register" />
        </div>
      </div>
      
      {/* Right side - Benefits (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/5 to-background relative">
        <div className="absolute inset-0 flex flex-col justify-center items-center p-12">
          <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-8 max-w-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Start your fluency journey today</h2>
            
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm">
                "Our AI technology adapts to your learning style and pace, providing a truly personalized experience that helps you learn up to 3x faster than traditional methods."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
