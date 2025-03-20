
import React from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SessionHeaderProps {
  sessionDetails: any;
  activeTab: string;
  isComplete: boolean;
  hasMessages: boolean;
  onBackClick: () => void;
  onToggleLesson: () => void;
  onEndPractice: () => void;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  sessionDetails,
  activeTab,
  isComplete,
  hasMessages,
  onBackClick,
  onToggleLesson,
  onEndPractice,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Button 
        variant="ghost" 
        className="gap-1" 
        onClick={onBackClick}
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para Central de Prática
      </Button>
      
      <div className="flex gap-2">
        {sessionDetails?.lesson && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onToggleLesson}
            className={cn("flex items-center gap-1.5", activeTab === 'lesson' ? "bg-orange-100" : "")}
          >
            <BookOpen className="h-4 w-4 text-orange-500" />
            {activeTab === 'lesson' ? 'Ocultar Aula' : 'Mostrar Aula'}
          </Button>
        )}
        
        {!isComplete && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEndPractice}
            disabled={!hasMessages}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>
            Finalizar Prática
          </Button>
        )}
      </div>
    </div>
  );
};

export default SessionHeader;
