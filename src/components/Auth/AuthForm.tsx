
import React from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { InvitationData } from './types';

type AuthFormProps = {
  type: 'login' | 'register' | 'forgotPassword';
  invitationData?: InvitationData;
  selectedRole?: 'student' | 'teacher';
  selectedPlan?: string | null;
};

const AuthForm: React.FC<AuthFormProps> = ({ 
  type, 
  invitationData,
  selectedRole,
  selectedPlan
}) => {
  if (type === 'login') {
    return <LoginForm />;
  } else if (type === 'register') {
    return <RegisterForm 
      invitationData={invitationData} 
      selectedRole={selectedRole}
      selectedPlan={selectedPlan}
    />;
  } else {
    return <ForgotPasswordForm />;
  }
};

export default AuthForm;
