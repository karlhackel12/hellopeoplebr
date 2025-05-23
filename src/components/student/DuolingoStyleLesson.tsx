
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Heart, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'arrange' | 'listen';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
}

interface DuolingoStyleLessonProps {
  lessonTitle: string;
  questions: Question[];
  onComplete: () => void;
}

const DuolingoStyleLesson: React.FC<DuolingoStyleLessonProps> = ({
  lessonTitle,
  questions,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lives, setLives] = useState(3);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  
  console.log('DuolingoStyleLesson: Rendering with questions:', questions);
  
  // Early return for empty questions
  if (!questions || questions.length === 0) {
    console.warn('DuolingoStyleLesson: No questions provided');
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma Questão Disponível</h3>
          <p className="text-muted-foreground mb-4">
            Este quiz não possui questões configuradas.
          </p>
          <Button onClick={onComplete} variant="outline">
            Voltar
          </Button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  
  // Validate current question
  if (!currentQuestion) {
    console.error('DuolingoStyleLesson: Current question is undefined at index:', currentQuestionIndex);
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro na Questão</h3>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar a questão atual.
          </p>
          <Button onClick={onComplete} variant="outline">
            Voltar
          </Button>
        </div>
      </div>
    );
  }
  
  console.log('DuolingoStyleLesson: Current question:', currentQuestion);
  
  const checkAnswer = () => {
    let correct = false;
    
    if (Array.isArray(currentQuestion.correctAnswer)) {
      correct = JSON.stringify(selectedAnswer) === JSON.stringify(currentQuestion.correctAnswer);
    } else {
      correct = selectedAnswer === currentQuestion.correctAnswer;
    }
    
    console.log('DuolingoStyleLesson: Checking answer:', {
      selected: selectedAnswer,
      correct: currentQuestion.correctAnswer,
      isCorrect: correct
    });
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCorrectAnswers(correctAnswers + 1);
    } else {
      setLives(lives - 1);
    }
    
    setTimeout(() => {
      if (lives > 1 || correct) {
        goToNextQuestion();
      } else {
        // Game over, not enough lives
        onComplete();
      }
    }, 1500);
  };
  
  const goToNextQuestion = () => {
    setShowFeedback(false);
    setIsCorrect(null);
    setSelectedAnswer('');
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Lesson complete
      onComplete();
    }
  };
  
  const handleOptionClick = (option: string) => {
    if (showFeedback) return; // Prevent changing answer during feedback
    setSelectedAnswer(option);
  };
  
  const renderHearts = () => {
    return (
      <div className="flex">
        {[...Array(3)].map((_, i) => (
          <Heart 
            key={i} 
            className={cn(
              "h-5 w-5 mr-1", 
              i < lives ? "fill-red-500 text-red-500" : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };
  
  const renderMultipleChoice = () => {
    // Validate question data
    if (!currentQuestion.question) {
      console.error('DuolingoStyleLesson: Question text is missing:', currentQuestion);
      return (
        <div className="text-center py-8">
          <p className="text-red-500">Erro: Texto da questão não encontrado</p>
        </div>
      );
    }
    
    if (!currentQuestion.options || !Array.isArray(currentQuestion.options) || currentQuestion.options.length === 0) {
      console.error('DuolingoStyleLesson: Question options are invalid:', currentQuestion);
      return (
        <div className="text-center py-8">
          <p className="text-red-500">Erro: Opções da questão não encontradas</p>
        </div>
      );
    }
    
    return (
      <>
        <h3 className="text-lg font-medium mb-6">{currentQuestion.question}</h3>
        <div className="grid grid-cols-1 gap-3 w-full max-w-md mx-auto">
          {currentQuestion.options.map((option, index) => (
            <motion.button
              key={`${currentQuestionIndex}-${index}`}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                selectedAnswer === option ? "border-primary bg-primary/5" : "border-gray-200",
                showFeedback && selectedAnswer === option
                  ? isCorrect
                    ? "border-green-500 bg-green-100"
                    : "border-red-500 bg-red-100"
                  : "",
                showFeedback && option === currentQuestion.correctAnswer && !isCorrect
                  ? "border-green-500 bg-green-100" 
                  : ""
              )}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOptionClick(option)}
              disabled={showFeedback}
            >
              {option}
              {showFeedback && selectedAnswer === option && (
                <span className="float-right">
                  {isCorrect ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </span>
              )}
              {showFeedback && option === currentQuestion.correctAnswer && selectedAnswer !== option && (
                <span className="float-right">
                  <Check className="h-5 w-5 text-green-500" />
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </>
    );
  };
  
  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return renderMultipleChoice();
      // Outros tipos seriam implementados aqui
      default:
        return renderMultipleChoice();
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <Progress value={progress} className="w-1/2 h-2" />
        {renderHearts()}
      </div>
      
      {/* Question area */}
      <div className="py-8">
        {renderQuestion()}
      </div>
      
      {/* Footer */}
      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Questão {currentQuestionIndex + 1} de {questions.length}
        </div>
        <Button
          onClick={checkAnswer}
          disabled={!selectedAnswer || showFeedback}
          className="px-8 py-2 bg-primary"
        >
          Verificar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      {/* Feedback overlay */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "fixed bottom-0 left-0 right-0 p-4 text-white font-medium flex items-center justify-center",
            isCorrect ? "bg-green-500" : "bg-red-500"
          )}
        >
          <div className="flex items-center">
            {isCorrect ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Correto!
              </>
            ) : (
              <>
                <X className="h-5 w-5 mr-2" />
                Incorreto
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DuolingoStyleLesson;
