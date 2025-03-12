
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { useInvitationVerification } from './invitation/useInvitationVerification';
import InvitationVerificationForm from './invitation/InvitationVerificationForm';
import InvitationSuccess from './invitation/InvitationSuccess';

const InvitationAcceptance: React.FC = () => {
  const {
    isLoading,
    invitationVerified,
    teacherName,
    studentEmail,
    error,
    form,
    onSubmit,
    proceedToRegister
  } = useInvitationVerification();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle>Junte-se ao HelloPeople</CardTitle>
        </div>
        <CardDescription>
          Digite seu código de convite para começar sua jornada de aprendizado de idiomas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!invitationVerified ? (
          <InvitationVerificationForm
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <InvitationSuccess
            teacherName={teacherName}
            studentEmail={studentEmail}
            onProceed={proceedToRegister}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationAcceptance;
