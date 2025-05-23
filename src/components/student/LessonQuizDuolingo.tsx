import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, ChevronLeft, BookOpen, AlertCircle } from 'lucide-react';
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

interface Question {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'arrange' | 'listen';
  question: string;
  options: string[];
  correctAnswer: string;
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
  const [conversionError, setConversionError] = useState<string | null>(null);
  
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
    setConversionError(null);
  };
  
  // Fixed converter function with proper error handling and debugging
  const convertQuestions = (questions: any[] = []): Question[] => {
    console.log('LessonQuizDuolingo: Converting questions:', questions);
    setConversionError(null);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      console.warn('LessonQuizDuolingo: No questions provided or invalid format');
      setConversionError('Nenhuma questão disponível para este quiz.');
      return [];
    }
    
    try {
      const convertedQuestions = questions.map((q, index) => {
        console.log(`LessonQuizDuolingo: Converting question ${index}:`, q);
        
        // Validate question structure
        if (!q || typeof q !== 'object') {
          console.error(`LessonQuizDuolingo: Invalid question at index ${index}:`, q);
          throw new Error(`Questão ${index + 1} tem formato inválido`);
        }
        
        // Extract question text
        const questionText = q.question_text || q.question || '';
        if (!questionText) {
          console.error(`LessonQuizDuolingo: Missing question text at index ${index}:`, q);
          throw new Error(`Questão ${index + 1} não tem texto`);
        }
        
        // Extract and validate options
        const rawOptions = q.options || [];
        if (!Array.isArray(rawOptions) || rawOptions.length === 0) {
          console.error(`LessonQuizDuolingo: Invalid options at index ${index}:`, rawOptions);
          throw new Error(`Questão ${index + 1} não tem opções válidas`);
        }
        
        // Convert options to string array and find correct answer
        const optionsArray: string[] = [];
        let correctAnswer = '';
        
        rawOptions.forEach((option, optIndex) => {
          const optionText = option.option_text || option.text || option;
          if (typeof optionText === 'string' && optionText.trim()) {
            optionsArray.push(optionText);
            
            // Check if this is the correct answer
            if (option.is_correct === true) {
              correctAnswer = optionText;
            }
          } else {
            console.warn(`LessonQuizDuolingo: Invalid option at question ${index}, option ${optIndex}:`, option);
          }
        });
        
        // Fallback: if no correct answer found, use the first option
        if (!correctAnswer && optionsArray.length > 0) {
          correctAnswer = optionsArray[0];
          console.warn(`LessonQuizDuolingo: No correct answer found for question ${index}, using first option as fallback`);
        }
        
        if (optionsArray.length < 2) {
          throw new Error(`Questão ${index + 1} precisa ter pelo menos 2 opções`);
        }
        
        const convertedQuestion: Question = {
          id: q.id || `question-${index}`,
          type: 'multiple_choice',
          question: questionText,
          options: optionsArray,
          correctAnswer: correctAnswer
        };
        
        console.log(`LessonQuizDuolingo: Successfully converted question ${index}:`, convertedQuestion);
        return convertedQuestion;
      });
      
      console.log('LessonQuizDuolingo: All questions converted successfully:', convertedQuestions);
      return convertedQuestions;
      
    } catch (error) {
      console.error('LessonQuizDuolingo: Error converting questions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao converter questões';
      setConversionError(errorMessage);
      return [];
    }
  };
  
  // Error state component
  const QuizErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Erro no Quiz</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <div className="space-x-2">
          <Button onClick={onRetry} variant="outline">
            Tentar Novamente
          </Button>
          <Button onClick={handleBackToPathway} variant="default">
            Voltar ao Caminho
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  // Empty state component
  const QuizEmptyState = () => (
    <Card>
      <CardContent className="p-6 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma Questão Disponível</h3>
        <p className="text-muted-foreground mb-4">
          Este quiz ainda não possui questões configuradas.
        </p>
        <Button onClick={handleBackToPathway} variant="default">
          Voltar ao Caminho
        </Button>
      </CardContent>
    </Card>
  );
  
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
          
          {conversionError ? (
            <QuizErrorState 
              error={conversionError} 
              onRetry={() => {
                setConversionError(null);
                // Force re-conversion by updating the view
                setViewMode('pathway');
                setTimeout(() => setViewMode('lesson'), 100);
              }} 
            />
          ) : currentUnit ? (
            (() => {
              const convertedQuestions = convertQuestions(currentUnit.questions || []);
              
              if (convertedQuestions.length === 0 && !conversionError) {
                return <QuizEmptyState />;
              }
              
              return (
                <DuolingoStyleLesson
                  lessonTitle={currentUnit.title}
                  questions={convertedQuestions}
                  onComplete={() => handleLessonComplete(true)}
                />
              );
            })()
          ) : (
            <QuizEmptyState />
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
