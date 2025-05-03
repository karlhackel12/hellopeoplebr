import React from 'react';
import InvitationRow, { StudentInvitation } from './InvitationRow';

interface InvitationsTableProps {
  invitations: StudentInvitation[];
  deletingInvitations: Record<string, boolean>;
  resendingInvitations: Record<string, boolean>;
  onResendInvitation: (id: string, email: string, invitationCode: string) => void;
  onDeleteInvitation: (id: string, email: string) => void;
}

const InvitationsTable: React.FC<InvitationsTableProps> = ({
  invitations,
  deletingInvitations,
  resendingInvitations,
  onResendInvitation,
  onDeleteInvitation
}) => {
  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Código de Convite</th>
              <th className="px-4 py-3 text-left">Criado em</th>
              <th className="px-4 py-3 text-left">Expira em</th>
              <th className="px-4 py-3 text-left">Utilizado por</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invitations.map((invitation) => (
              <InvitationRow
                key={invitation.id}
                invitation={invitation}
                onResend={onResendInvitation}
                onDelete={onDeleteInvitation}
                isResending={resendingInvitations[invitation.id] || false}
                isDeleting={deletingInvitations[invitation.id] || false}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvitationsTable;
