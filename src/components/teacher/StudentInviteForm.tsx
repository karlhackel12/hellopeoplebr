
import React from 'react';
import InvitationFormContainer from './invitations/InvitationFormContainer';

interface StudentInviteFormProps {
  onSuccess: () => void;
}

const StudentInviteForm: React.FC<StudentInviteFormProps> = ({ onSuccess }) => {
  return <InvitationFormContainer onSuccess={onSuccess} />;
};

export default StudentInviteForm;
