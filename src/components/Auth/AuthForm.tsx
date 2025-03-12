
import React from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import { InvitationData } from './types';

type AuthFormProps = {
  type: 'login' | 'register' | 'forgotPassword';
  invitationData?: InvitationData;
};

const AuthForm: React.FC<AuthFormProps> = ({ type, invitationData }) => {
  if (type === 'login') {
    return <LoginForm />;
  } else if (type === 'register') {
    return <RegisterForm invitationData={invitationData} />;
  } else {
    return <ForgotPasswordForm />;
  }
};

export default AuthForm;
