
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  
  const handleCreateLesson = () => {
    navigate('/teacher/lessons/create');
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 className="text-3xl font-bold">Dashboard do Professor</h1>
      <Button onClick={handleCreateLesson} className="flex items-center gap-2">
        <PlusCircle className="h-4 w-4" />
        Criar Lição
      </Button>
    </div>
  );
};

export default DashboardHeader;
