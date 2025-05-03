import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useAuthSubmit } from './hooks/useAuthSubmit';
import { loginSchema, LoginFormValues } from './types';
import EmailField from './FormFields/EmailField';
import PasswordField from './FormFields/PasswordField';
import SubmitButton from './FormFields/SubmitButton';
import FormFooter from './FormFields/FormFooter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, handleSubmit } = useAuthSubmit();
  const [showRegisterInfo, setShowRegisterInfo] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    await handleSubmit('login', values);
  };

  const handleRegisterRedirect = () => {
    setShowRegisterInfo(true);
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <EmailField form={form} isLoading={isLoading} />
        <PasswordField form={form} isLoading={isLoading} isRegister={false} />
        
        <div className="flex justify-end">
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => navigate('/forgot-password')}
            type="button"
          >
            Esqueceu a senha?
          </Button>
        </div>

        {showRegisterInfo && (
          <Alert className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-sm">
              Para criar uma conta no HelloPeople, você precisa de um código de convite.
              Peça ao seu professor o código ou clique abaixo para ir para a página de registro.
            </AlertDescription>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full border-amber-300 bg-amber-100 hover:bg-amber-200"
              onClick={goToRegister}
              type="button"
            >
              Ir para página de registro
            </Button>
          </Alert>
        )}

        <SubmitButton isLoading={isLoading} type="login" />
        <FormFooter type="login" onRegisterClick={handleRegisterRedirect} />
      </form>
    </Form>
  );
};

export default LoginForm;
