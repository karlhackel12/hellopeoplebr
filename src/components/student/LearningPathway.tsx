import React from 'react';
import { CheckCircle, Lock, Star, BookOpen, HelpCircle, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LessonUnit {
  id: string;
  title: string;
  type: 'lesson' | 'quiz';
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  progress?: number;
  isQuizSuccessful?: boolean;
}

interface LessonSection {
  id: string;
  title: string;
  units: LessonUnit[];
  completed: boolean;
}

interface LearningPathwayProps {
  sections: LessonSection[];
  currentUnitId?: string;
}

const UnitIcon = ({ unit }: { unit: LessonUnit }) => {
  if (unit.status === 'locked') return <Lock className="h-5 w-5" />;
  if (unit.status === 'completed') {
    if (unit.type === 'quiz' && unit.isQuizSuccessful) {
      return <Star className="h-5 w-5 text-yellow-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  }
  
  return unit.type === 'lesson' 
    ? <BookOpen className="h-5 w-5" /> 
    : <HelpCircle className="h-5 w-5" />;
};

const LearningPathwayUnit = ({ unit, isCurrent }: { unit: LessonUnit; isCurrent: boolean }) => {
  const navigate = useNavigate();
  
  const handleUnitClick = () => {
    if (unit.status === 'locked') return;
    
    if (unit.type === 'lesson') {
      navigate(`/student/lessons/view/${unit.id}`);
    } else {
      navigate(`/student/quizzes/view/${unit.id}`);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "relative rounded-xl overflow-hidden cursor-pointer transition-all",
              unit.status === 'locked' ? "bg-muted cursor-not-allowed" : "bg-white",
              isCurrent ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-md",
              "w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center"
            )}
            onClick={handleUnitClick}
          >
            <div className={cn(
              "text-center",
              unit.status === 'locked' ? "text-muted-foreground" : "",
              unit.status === 'completed' ? "text-primary" : ""
            )}>
              <UnitIcon unit={unit} />
              <div className="text-xs mt-1 line-clamp-1 px-1">
                {unit.type === 'lesson' ? 'Lição' : 'Quiz'}
              </div>
            </div>
            
            {unit.status === 'in_progress' && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${unit.progress || 0}%` }}
                ></div>
              </div>
            )}
            
            {isCurrent && (
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0 text-[10px] bg-primary">
                Atual
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{unit.title}</p>
          <p className="text-xs text-muted-foreground">
            {unit.status === 'locked' && "Bloqueado - Complete as lições anteriores"}
            {unit.status === 'available' && "Disponível para começar"}
            {unit.status === 'in_progress' && `Em progresso - ${unit.progress}% completo`}
            {unit.status === 'completed' && "Concluído"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const LearningPathway: React.FC<LearningPathwayProps> = ({ sections, currentUnitId }) => {
  return (
    <div className="space-y-10 px-4 py-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
      {sections.map((section, sectionIndex) => (
        <div key={section.id} className="relative">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              {section.completed ? (
                <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
              ) : (
                <Zap className="h-5 w-5 text-primary mr-2" />
              )}
              {section.title}
            </h3>
            {section.completed && (
              <Badge variant="outline" className="ml-2 border-green-200 bg-green-50 text-green-700">
                Concluído
              </Badge>
            )}
          </div>
          
          <div className="relative">
            {/* Path line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 flex justify-start items-center space-x-4 overflow-x-auto pb-4">
              {section.units.map((unit, unitIndex) => (
                <LearningPathwayUnit
                  key={unit.id}
                  unit={unit}
                  isCurrent={unit.id === currentUnitId}
                />
              ))}
            </div>
          </div>
          
          {sectionIndex < sections.length - 1 && (
            <div className="w-0.5 h-8 bg-muted mx-auto mt-2"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LearningPathway; 