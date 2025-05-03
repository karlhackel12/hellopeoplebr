import React from 'react';
import CodeGenerationForm from './CodeGenerationForm';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface InvitationFormContainerProps {
  onSuccess: () => void;
}

const InvitationFormContainer: React.FC<InvitationFormContainerProps> = ({ onSuccess }) => {
  return (
    <div className="space-y-6">
      <Alert variant="default" className="bg-muted">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="text-base font-medium">Como funciona o convite por código?</AlertTitle>
        <AlertDescription className="text-sm mt-2">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Gere um código de convite clicando no botão abaixo</li>
            <li>Compartilhe o código com seu aluno através de WhatsApp, SMS ou pessoalmente</li>
            <li>O aluno deverá acessar a plataforma e criar uma conta utilizando o código fornecido</li>
            <li>Assim que o aluno se cadastrar usando o código, ele aparecerá automaticamente na sua lista de alunos ativos</li>
          </ol>
          <p className="mt-3">Os códigos são válidos por 30 dias e podem ser usados apenas uma vez.</p>
        </AlertDescription>
      </Alert>
      
      <CodeGenerationForm onSuccess={onSuccess} />
    </div>
  );
};

export default InvitationFormContainer;
