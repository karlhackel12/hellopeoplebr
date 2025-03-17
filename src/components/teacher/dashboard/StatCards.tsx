
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, ClipboardList, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const StatCards: React.FC = () => {
  const navigate = useNavigate();
  
  const handleManageStudents = () => {
    navigate('/teacher/students');
  };
  
  const handleCreateLesson = () => {
    navigate('/teacher/lessons/create');
  };
  
  const handleManageAssignments = () => {
    navigate('/teacher/assignments');
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="font-semibold">Criar Lição</h3>
          <p className="text-sm text-muted-foreground text-center">
            Crie e gerencie suas lições para os alunos
          </p>
          <Button onClick={handleCreateLesson} className="w-full mt-2">
            Criar Nova Lição
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-full bg-accent/10 text-accent">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="font-semibold">Gerenciar Alunos</h3>
          <p className="text-sm text-muted-foreground text-center">
            Visualize e gerencie sua lista de alunos
          </p>
          <Button onClick={handleManageStudents} variant="outline" className="w-full mt-2">
            Ver Alunos
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h3 className="font-semibold">Tarefas</h3>
          <p className="text-sm text-muted-foreground text-center">
            Crie e acompanhe as tarefas dos alunos
          </p>
          <Button onClick={handleManageAssignments} variant="outline" className="w-full mt-2">
            Gerenciar Tarefas
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatCards;
