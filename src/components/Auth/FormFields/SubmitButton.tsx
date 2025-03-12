
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';

type SubmitButtonProps = {
  isLoading: boolean;
  type: 'login' | 'register' | 'forgotPassword';
};

const SubmitButton: React.FC<SubmitButtonProps> = ({ isLoading, type }) => {
  return (
    <Button
      type="submit"
      className="w-full h-11 font-medium"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {type === 'login' ? 'Entrando...' : 
            type === 'register' ? 'Criando conta...' : 
            'Enviando link...'}
        </>
      ) : (
        <>
          {type === 'login' ? 'Entrar' : 
            type === 'register' ? 'Criar conta' : 
            'Enviar link'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
};

export default SubmitButton;
