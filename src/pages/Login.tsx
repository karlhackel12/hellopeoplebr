
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthForm from '@/components/Auth/AuthForm';
import Logo from '@/components/ui/Logo';
import { H1 } from '@/components/ui/typography';
import { useAnalytics } from '@/hooks/useAnalytics';
import { FormProvider, useForm } from 'react-hook-form';

const Login: React.FC = () => {
  const { trackEvent } = useAnalytics();
  const methods = useForm();
  
  useEffect(() => {
    // Track page view
    trackEvent('login_page_viewed');
  }, [trackEvent]);

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side - Auth form */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12 md:px-8 lg:px-16 relative">
          <div className="absolute top-4 sm:top-8 left-4 sm:left-8">
            <Logo />
          </div>
          
          <div className="w-full max-w-md mx-auto mt-14 sm:mt-16 md:mt-0">
            <div className="text-center mb-6 sm:mb-8">
              <H1 className="text-2xl sm:text-3xl mb-2 sm:mb-3">Bem-vindo de volta</H1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Faça login na sua conta para continuar sua jornada de aprendizado de idiomas
              </p>
            </div>
            
            <AuthForm type="login" />
          </div>
        </div>
        
        {/* Right side - Image/Illustration (hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/5 to-background relative">
          <div className="absolute inset-0 flex flex-col justify-center items-center p-6 lg:p-12">
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-6 lg:p-8 max-w-lg shadow-sm">
              <blockquote className="text-base lg:text-lg italic text-foreground/80 mb-4 lg:mb-6">"HelloPeople é o aplicativo que eu estava precisando para conseguir estudar entre minhas aulas, agora me sinto mais motivado por consigo sentir uma evolução"</blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm lg:text-base">
                  JD
                </div>
                <div className="ml-3 lg:ml-4">
                  <p className="font-medium text-sm lg:text-base">João Silva</p>
                  <p className="text-xs lg:text-sm text-muted-foreground">Estudante de Inglês, 3 meses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default Login;
