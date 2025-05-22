
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RegisterFormProps {
  invitationData?: InvitationData;
  selectedRole?: 'student' | 'teacher';
  selectedPlan?: string | null;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  invitationData, 
  selectedRole = 'student',
  selectedPlan
}) => {
  // Se o usuário é estudante, sempre precisamos de um código de convite
  const [hasInvitation, setHasInvitation] = useState(
    !!invitationData?.isInvited || selectedRole === 'student'
  );
  const [hasReferral, setHasReferral] = useState(false);
  const [initialValidationDone, setInitialValidationDone] = useState(false);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: invitationData?.email || '',
      password: '',
      role: invitationData?.isInvited ? 'student' : selectedRole,
      invitationCode: invitationData?.code || '',
      referralCode: '',
      planId: selectedPlan || '',
    }
  });
  
  // Update role when selectedRole prop changes
  useEffect(() => {
    if (!invitationData?.isInvited) {
      form.setValue('role', selectedRole, { shouldValidate: false });
    }
  }, [selectedRole, form, invitationData]);

  // Update planId when selectedPlan prop changes
  useEffect(() => {
    if (selectedPlan) {
      form.setValue('planId', selectedPlan, { shouldValidate: false });
    }
  }, [selectedPlan, form]);
  
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

  const toggleHasReferral = useCallback(() => {
    setHasReferral(!hasReferral);
  }, [hasReferral]);

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
  const role = form.watch('role');

  // Determinar se o email pode ser editado
  // Para alunos com convite, só desabilitar se tiver email no convite
  const emailFieldDisabled = !!invitationData?.email && (invitationData?.email?.length || 0) > 0;

  // Modificado: ajustamos a condição de desabilitar o botão para professores
  const isSubmitDisabled = (role === 'student' && !invitationStatus?.valid) || 
                          (role === 'teacher' && !selectedPlan && !form.watch('planId'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <NameField form={form} isLoading={isLoading} />
        
        <EmailField 
          form={form} 
          isLoading={isLoading} 
          isDisabled={emailFieldDisabled}
        />
        
        <PasswordField form={form} isLoading={isLoading} isRegister={true} />

        {role === 'student' && (
          <>
            {!invitationData?.isInvited && (
              <Alert className="bg-primary/10 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  Estudantes precisam de um código de convite para se registrar.
                  Peça ao seu professor o código de convite.
                </AlertDescription>
              </Alert>
            )}
            
            <InvitationCodeField
              code={invitationData?.code || invitationCodeValue}
              onChange={handleInvitationCodeChange}
              isLoading={isLoading}
              isCheckingCode={isCheckingCode}
              invitationStatus={invitationStatus}
              readOnly={!!invitationData?.isInvited}
            />
          </>
        )}

        {!invitationData?.isInvited && (
          <RoleField form={form} />
        )}

        {role === 'teacher' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-amber-800">
                Plataforma Gratuita
              </p>
              <p className="text-amber-700 mt-1">
                Você terá acesso a todas as funcionalidades sem limitações.
              </p>
            </div>
          </div>
        )}

        {(invitationData?.isInvited || (hasInvitation && invitationStatus?.valid)) && (
          <div className="space-y-3">
            <FormLabel>Tipo de Conta</FormLabel>
            <div className="flex items-center h-11 px-4 rounded-md border bg-muted/50">
              <span className="text-muted-foreground">Estudante (Convidado)</span>
            </div>
          </div>
        )}

        {role === 'teacher' && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasReferral"
              checked={hasReferral}
              onChange={toggleHasReferral}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="hasReferral" className="text-sm cursor-pointer">
              Tenho um código de indicação
            </label>
          </div>
        )}

        {hasReferral && role === 'teacher' && (
          <div className="space-y-2">
            <FormLabel htmlFor="referralCode">Código de Indicação</FormLabel>
            <Input
              id="referralCode"
              {...form.register('referralCode')}
              placeholder="Digite o código de indicação"
              className="h-11"
              maxLength={10}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              O professor que te convidou poderá acompanhar seu progresso na plataforma.
            </p>
          </div>
        )}

        <SubmitButton 
          isLoading={isLoading} 
          type="register" 
          disabled={isSubmitDisabled}
        />
        <FormFooter type="register" />
      </form>
    </Form>
  );
};

export default RegisterForm;
