
import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

type InvitationCodeFieldProps = {
  code: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  isCheckingCode: boolean;
  invitationStatus: {
    valid: boolean;
    message: string;
    teacherName?: string;
  } | null;
  readOnly?: boolean;
};

const InvitationCodeField: React.FC<InvitationCodeFieldProps> = ({
  code,
  onChange,
  isLoading,
  isCheckingCode,
  invitationStatus,
  readOnly = false
}) => {
  return (
    <div className="space-y-2">
      <FormLabel htmlFor="invitationCode">Código de Convite</FormLabel>
      {readOnly ? (
        <div className="flex items-center h-11 px-4 rounded-md border bg-muted/50">
          <span className="text-muted-foreground">{code}</span>
        </div>
      ) : (
        <Input
          id="invitationCode"
          value={code}
          onChange={onChange}
          placeholder="Digite o código de 8 caracteres"
          className="h-11 uppercase"
          maxLength={8}
          disabled={isLoading || isCheckingCode}
        />
      )}
      
      {isCheckingCode && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Verificando código...</span>
        </div>
      )}
      
      {invitationStatus && (
        <Alert className={`py-2 ${invitationStatus.valid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <AlertDescription>
            {invitationStatus.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default InvitationCodeField;
