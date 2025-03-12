
import React from 'react';
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

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, handleSubmit } = useAuthSubmit();
  
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

        <SubmitButton isLoading={isLoading} type="login" />
        <FormFooter type="login" />
      </form>
    </Form>
  );
};

export default LoginForm;
