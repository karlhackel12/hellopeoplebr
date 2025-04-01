
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InvitationAcceptance from '@/components/student/InvitationAcceptance';
import { FormProvider, useForm } from 'react-hook-form';

const InvitationAcceptancePage: React.FC = () => {
  const methods = useForm();
  
  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary/5 to-background p-4">
        <InvitationAcceptance />
      </div>
    </FormProvider>
  );
};

export default InvitationAcceptancePage;
