
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useAuthSubmit } from './hooks/useAuthSubmit';
import { forgotPasswordSchema, ForgotPasswordFormValues } from './types';
import EmailField from './FormFields/EmailField';
import SubmitButton from './FormFields/SubmitButton';
import FormFooter from './FormFields/FormFooter';

const ForgotPasswordForm: React.FC = () => {
  const { isLoading, handleSubmit } = useAuthSubmit();
  
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    await handleSubmit('forgotPassword', values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <EmailField form={form} isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} type="forgotPassword" />
        <FormFooter type="forgotPassword" />
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
