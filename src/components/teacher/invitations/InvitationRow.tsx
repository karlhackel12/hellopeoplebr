import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Copy, Loader2, RotateCw, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export type StudentInvitation = {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired' | 'rejected';
  invitation_code: string;
  created_at: string;
  expires_at: string;
  used_by_name?: string | null;
  invited_by?: { first_name: string; last_name: string };
};

interface InvitationRowProps {
  invitation: StudentInvitation;
  onResend: (id: string, email: string, invitationCode: string) => void;
  onDelete: (id: string, email: string) => void;
  isResending: boolean;
  isDeleting: boolean;
}

const InvitationRow: React.FC<InvitationRowProps> = ({
  invitation,
  onResend,
  onDelete,
  isResending,
  isDeleting
}) => {
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(invitation.invitation_code);
      toast.success('Código copiado para a área de transferência');
    } catch (err) {
      console.error('Failed to copy code:', err);
      toast.error('Falha ao copiar o código');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aceito</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expirado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <tr className="bg-card hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">{invitation.email || '—'}</td>
      <td className="px-4 py-3">{getStatusBadge(invitation.status)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
            {invitation.invitation_code}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyCode}
            className="h-8 w-8"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {format(new Date(invitation.created_at), 'MMM d, yyyy')}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
      </td>
      <td className="px-4 py-3 text-sm">
        {invitation.used_by_name || '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {invitation.status === 'pending' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onResend(invitation.id, invitation.email, invitation.invitation_code)}
              disabled={isResending}
              className="h-8 w-8"
            >
              {isResending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCw className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(invitation.id, invitation.email)}
            disabled={isDeleting}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default InvitationRow;
