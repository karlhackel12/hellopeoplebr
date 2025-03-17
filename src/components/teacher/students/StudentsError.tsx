
import React from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';

const StudentsError: React.FC = () => {
  return (
    <TeacherLayout>
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Gerenciamento de Alunos</h1>
        <div className="bg-destructive/10 text-destructive rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Falha ao carregar alunos</h2>
          <p>Por favor, tente atualizar a página ou entre em contato com o suporte se o problema persistir.</p>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default StudentsError;
