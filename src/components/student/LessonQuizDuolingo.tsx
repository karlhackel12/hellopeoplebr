import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, ChevronLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LearningPathway from './LearningPathway';
import DuolingoStyleLesson from './DuolingoStyleLesson';

// Tipos de dados necessários
interface LessonUnit {
  id: string;
  title: string;
  type: 'lesson' | 'quiz';
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  progress?: number;
  isQuizSuccessful?: boolean;
  content?: string;
  questions?: any[];
}

interface LessonSection {
  id: string;
  title: string;
  units: LessonUnit[];
  completed: boolean;
}

interface LessonQuizDuolingoProps {
  lessonId: string;
  lessonTitle: string;
  sections: LessonSection[];
  onComplete: (unitId: string, success: boolean) => void;
  onBack: () => void;
}

const LessonQuizDuolingo: React.FC<LessonQuizDuolingoProps> = ({
  lessonId,
  lessonTitle,
  sections,
  onComplete,
  onBack
}) => {
  const navigate = useNavigate();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [currentUnit, setCurrentUnit] = useState<LessonUnit | null>(null);
  const [viewMode, setViewMode] = useState<'pathway' | 'lesson'>('pathway');
  const [confetti, setConfetti] = useState(false);
  
  // Encontrar a unidade disponível baseada no ID ou a primeira disponível
  useEffect(() => {
    if (selectedUnitId) {
      // Encontrar a unidade selecionada em todas as seções
      const unit = sections.flatMap(s => s.units).find(u => u.id === selectedUnitId);
      if (unit) {
        setCurrentUnit(unit);
        setViewMode('lesson');
        return;
      }
    }
    
    // Nenhuma unidade selecionada, encontrar a primeira disponível
    const firstAvailableUnit = sections.flatMap(s => s.units)
      .find(u => u.status === 'available' || u.status === 'in_progress');
      
    if (firstAvailableUnit) {
      setCurrentUnit(firstAvailableUnit);
    }
  }, [selectedUnitId, sections]);
  
  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(unitId);
    setViewMode('lesson');
  };
  
  const handleLessonComplete = (success: boolean) => {
    if (currentUnit) {
      // Mostrar confetti em caso de sucesso
      if (success) {
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
      }
      
      // Informar ao componente pai sobre a conclusão
      onComplete(currentUnit.id, success);
      
      // Voltar para a visualização do caminho
      setViewMode('pathway');
    }
  };
  
  const handleBackToPathway = () => {
    setViewMode('pathway');
  };
  
  // Converter as questões do formato atual para o formato Duolingo
  const convertQuestions = (questions: any[] = []) => {
    return questions.map(q => ({
      id: q.id || Math.random().toString(),
      type: 'multiple_choice',
      question: q.question,
      options: q.options || q.answers || [],
      correctAnswer: q.correct_answer || q.correctAnswer
    }));
  };
  
  return (
    <div className="container max-w-4xl mx-auto">
      {viewMode === 'pathway' ? (
        // Visualização do caminho de aprendizado
        <Card>
          <CardHeader className="border-b bg-muted/50">
            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={onBack} className="mr-2">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <CardTitle>{lessonTitle}</CardTitle>
              <div className="w-[70px]"></div> {/* Espaçador para centralizar o título */}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Zap className="h-5 w-5 text-primary mr-2" />
                Caminho de Aprendizado
              </h2>
              <p className="text-muted-foreground">
                Complete as lições e quizzes para progredir no seu aprendizado.
                Cada unidade concluída desbloqueia a próxima etapa.
              </p>
            </div>
            
            <LearningPathway 
              sections={sections}
              currentUnitId={selectedUnitId || undefined}
            />
            
            {currentUnit && (
              <div className="mt-6 flex justify-center">
                <Button 
                  size="lg" 
                  onClick={() => setViewMode('lesson')}
                  className="group"
                >
                  <BookOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Iniciar {currentUnit.type === 'lesson' ? 'Lição' : 'Quiz'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Visualização da lição/quiz no estilo Duolingo
        <div className="space-y-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleBackToPathway} className="mr-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar ao Caminho
            </Button>
            <h2 className="text-xl font-semibold">{currentUnit?.title}</h2>
          </div>
          
          {currentUnit && (
            <DuolingoStyleLesson
              lessonTitle={currentUnit.title}
              questions={convertQuestions(currentUnit.questions || [])}
              onComplete={() => handleLessonComplete(true)}
            />
          )}
        </div>
      )}
      
      {/* Adicionar efeito de confete quando necessário */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Aqui você poderia adicionar um componente de confete real */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="h-20 w-20 text-yellow-500 animate-bounce" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonQuizDuolingo; 