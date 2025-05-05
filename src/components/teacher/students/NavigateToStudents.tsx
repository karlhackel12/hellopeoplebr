
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NavigateToStudents = () => {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate('/teacher/students')}
      className="mb-4"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      <span>Voltar para Alunos</span>
    </Button>
  );
};

export default NavigateToStudents;
