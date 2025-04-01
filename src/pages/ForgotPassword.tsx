
import React from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '@/components/Auth/AuthForm';
import Logo from '@/components/ui/Logo';
import { ArrowLeft } from 'lucide-react';
import { H1 } from '@/components/ui/typography';
import { FormProvider, useForm } from 'react-hook-form';

const ForgotPassword: React.FC = () => {
  const methods = useForm();
  
  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex flex-col justify-center items-center p-6">
        <div className="absolute top-8 left-8">
          <Logo />
        </div>
        
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para login
          </Link>
          
          <div className="text-center mb-8">
            <H1 className="mb-3">Redefina sua senha</H1>
            <p className="text-muted-foreground">
              Digite seu e-mail e enviaremos um link para redefinir sua senha
            </p>
          </div>
          
          <AuthForm type="forgotPassword" />
        </div>
      </div>
    </FormProvider>
  );
};

export default ForgotPassword;
