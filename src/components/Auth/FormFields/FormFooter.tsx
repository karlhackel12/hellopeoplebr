import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

type FormFooterProps = {
  type: 'login' | 'register' | 'forgotPassword';
  onRegisterClick?: () => void;
};

const FormFooter: React.FC<FormFooterProps> = ({ type, onRegisterClick }) => {
  const navigate = useNavigate();
  
  const handleRegisterClick = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      navigate('/register');
    }
  };
  
  return (
    <div className="text-center text-sm">
      {type === 'login' ? (
        <p>
          Não tem uma conta?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={handleRegisterClick}
            type="button"
          >
            Cadastre-se
          </Button>
        </p>
      ) : type === 'register' ? (
        <p>
          Já tem uma conta?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={() => navigate('/login')}
            type="button"
          >
            Entrar
          </Button>
        </p>
      ) : (
        <p>
          Lembrou sua senha?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={() => navigate('/login')}
            type="button"
          >
            Entrar
          </Button>
        </p>
      )}
    </div>
  );
};

export default FormFooter;
