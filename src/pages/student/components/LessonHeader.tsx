
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface LessonHeaderProps {
  title: string;
  isCompleted: boolean;
  onMarkComplete: () => void;
  onBack: () => void;
  isUpdating: boolean;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({ 
  title,
  isCompleted,
  onMarkComplete,
  onBack,
  isUpdating
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mr-2 group transition-all hover:-translate-x-1"
        >
          <ArrowLeft className="h-4 w-4 mr-1 group-hover:scale-110" />
          Voltar
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        
        <div className="flex items-center">
          {isCompleted ? (
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Concluída
            </Badge>
          ) : (
            <Button 
              onClick={onMarkComplete} 
              disabled={isUpdating}
              className="transition-all hover:scale-105"
            >
              Marcar como Concluída
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonHeader;
