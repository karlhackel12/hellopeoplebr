
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

type FormFooterProps = {
  type: 'login' | 'register' | 'forgotPassword';
};

const FormFooter: React.FC<FormFooterProps> = ({ type }) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center text-sm">
      {type === 'login' ? (
        <p>
          Don't have an account?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={() => navigate('/register')}
            type="button"
          >
            Sign up
          </Button>
        </p>
      ) : type === 'register' ? (
        <p>
          Already have an account?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={() => navigate('/login')}
            type="button"
          >
            Log in
          </Button>
        </p>
      ) : (
        <p>
          Remember your password?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={() => navigate('/login')}
            type="button"
          >
            Log in
          </Button>
        </p>
      )}
    </div>
  );
};

export default FormFooter;
