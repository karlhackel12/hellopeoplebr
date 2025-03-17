
import React from 'react';
import { MailIcon } from 'lucide-react';

const EmptyInvitations: React.FC = () => {
  return (
    <div className="bg-muted p-8 rounded-lg text-center">
      <MailIcon className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">Nenhum convite enviado</h3>
      <p className="text-muted-foreground mb-4">Quando você convidar alunos, eles aparecerão aqui.</p>
    </div>
  );
};

export default EmptyInvitations;
