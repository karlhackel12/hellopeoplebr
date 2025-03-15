
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormLabel } from '@/components/ui/form';
import { registerSchema, RegisterFormValues, InvitationData } from './types';
import { useAuthSubmit } from './hooks/useAuthSubmit';
import { useInvitationCode } from './hooks/useInvitationCode';
import EmailField from './FormFields/EmailField';
import PasswordField from './FormFields/PasswordField';
import NameField from './FormFields/NameField';
import RoleField from './FormFields/RoleField';
import InvitationCodeField from './FormFields/InvitationCodeField';
import SubmitButton from './FormFields/SubmitButton';
import FormFooter from './FormFields/FormFooter';

interface RegisterFormProps {
  invitationData?: InvitationData;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ invitationData }) => {
  const [hasInvitation, setHasInvitation] = useState(!!invitationData?.isInvited);
  const [initialValidationDone, setInitialValidationDone] = useState(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: invitationData?.email || '',
      password: '',
      role: invitationData?.isInvited ? 'student' : 'student',
      invitationCode: invitationData?.code || '',
    }
  });
  
  const { isLoading, handleSubmit } = useAuthSubmit();
  const { 
    invitationStatus, 
    isCheckingCode, 
    validateInvitationCode, 
    handleInvitationCodeChange 
  } = useInvitationCode(form);

  // Perform initial validation only once
  useEffect(() => {
    if (!initialValidationDone && invitationData?.isInvited && invitationData.code) {
      validateInvitationCode(invitationData.code)
        .then(() => setInitialValidationDone(true));
    } else {
      setInitialValidationDone(true);
    }
  }, [invitationData, validateInvitationCode, initialValidationDone]);

  // Set form values from invitation data once
  useEffect(() => {
    if (invitationData?.email) {
      form.setValue('email', invitationData.email, { shouldValidate: false });
    }
    
    if (invitationData?.isInvited) {
      form.setValue('role', 'student', { shouldValidate: false });
      if (invitationData.code) {
        form.setValue('invitationCode', invitationData.code, { shouldValidate: false });
      }
    }
  }, [invitationData, form]);

  const toggleHasInvitation = useCallback(() => {
    setHasInvitation(!hasInvitation);
  }, [hasInvitation]);

  const onSubmit = async (values: RegisterFormValues) => {
    await handleSubmit(
      'register', 
      values, 
      validateInvitationCode, 
      hasInvitation, 
      invitationData
    );
  };

  const invitationCodeValue = form.watch('invitationCode') || '';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <NameField form={form} isLoading={isLoading} />
        
        <EmailField 
          form={form} 
          isLoading={isLoading} 
          isDisabled={!!invitationData?.email || (hasInvitation && invitationStatus?.valid)}
        />
        
        <PasswordField form={form} isLoading={isLoading} isRegister={true} />

        {!invitationData?.isInvited && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasInvitation"
              checked={hasInvitation}
              onChange={toggleHasInvitation}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="hasInvitation" className="text-sm cursor-pointer">
              I have an invitation code
            </label>
          </div>
        )}

        {hasInvitation && !invitationData?.isInvited && (
          <InvitationCodeField
            code={invitationCodeValue}
            onChange={handleInvitationCodeChange}
            isLoading={isLoading}
            isCheckingCode={isCheckingCode}
            invitationStatus={invitationStatus}
          />
        )}

        {invitationData?.isInvited && (
          <InvitationCodeField
            code={invitationData.code || ''}
            onChange={() => {}}
            isLoading={isLoading}
            isCheckingCode={isCheckingCode}
            invitationStatus={invitationStatus}
            readOnly={true}
          />
        )}

        {!invitationData?.isInvited && !hasInvitation && (
          <RoleField form={form} />
        )}

        {(invitationData?.isInvited || (hasInvitation && invitationStatus?.valid)) && (
          <div className="space-y-3">
            <FormLabel>Role</FormLabel>
            <div className="flex items-center h-11 px-4 rounded-md border bg-muted/50">
              <span className="text-muted-foreground">Student (Invited)</span>
            </div>
          </div>
        )}

        <SubmitButton isLoading={isLoading} type="register" />
        <FormFooter type="register" />
      </form>
    </Form>
  );
};

export default RegisterForm;
