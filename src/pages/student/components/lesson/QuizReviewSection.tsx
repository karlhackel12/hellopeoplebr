
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Question } from '@/components/teacher/quiz/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QuizReviewSectionProps {
  questions: Question[];
  title: string;
  passPercent: number;
  userAnswers?: Record<string, string>;
  finalScore?: number;
}

const QuizReviewSection: React.FC<QuizReviewSectionProps> = ({
  questions,
  title,
  passPercent,
  userAnswers = {},
  finalScore
}) => {
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Info className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma questão disponível</h3>
          <p className="text-muted-foreground">
            Este quiz não possui questões para revisar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getCorrectAnswer = (question: Question) => {
    return question.options?.find(option => option.is_correct)?.option_text || '';
  };

  const getUserAnswerText = (question: Question, userAnswerId: string) => {
    return question.options?.find(option => option.id === userAnswerId)?.option_text || 'Não respondido';
  };

  const isAnswerCorrect = (question: Question, userAnswerId: string) => {
    const selectedOption = question.options?.find(option => option.id === userAnswerId);
    return selectedOption?.is_correct || false;
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{title} - Revisão</CardTitle>
            <div className="flex items-center gap-2">
              {finalScore !== undefined && (
                <Badge 
                  variant={finalScore >= passPercent ? "default" : "destructive"}
                  className="text-sm px-3 py-1"
                >
                  Pontuação: {finalScore}%
                </Badge>
              )}
              <Badge variant="outline">
                Aprovação: {passPercent}%
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Review Mode Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Modo de Revisão</AlertTitle>
        <AlertDescription>
          Esta é uma visualização somente leitura do quiz completado. 
          As respostas corretas estão destacadas em verde.
        </AlertDescription>
      </Alert>

      {/* Questions Review */}
      <div className="space-y-4">
        {questions.map((question, index) => {
          const userAnswerId = userAnswers[question.id] || '';
          const userAnswerText = getUserAnswerText(question, userAnswerId);
          const correctAnswer = getCorrectAnswer(question);
          const isCorrect = isAnswerCorrect(question, userAnswerId);

          return (
            <Card key={question.id} className="border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-medium">
                    Questão {index + 1}: {question.question_text}
                  </CardTitle>
                  {userAnswerId && (
                    isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* User's Answer */}
                  {userAnswerId && (
                    <div className={`p-3 rounded-md border ${
                      isCorrect 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="text-sm font-medium mb-1">Sua resposta:</div>
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>{userAnswerText}</span>
                      </div>
                    </div>
                  )}

                  {/* Correct Answer (if user got it wrong or didn't answer) */}
                  {(!userAnswerId || !isCorrect) && (
                    <div className="p-3 rounded-md border border-green-200 bg-green-50">
                      <div className="text-sm font-medium mb-1">Resposta correta:</div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{correctAnswer}</span>
                      </div>
                    </div>
                  )}

                  {/* All Options for Reference */}
                  <div className="border-t pt-3">
                    <div className="text-sm font-medium mb-2">Todas as opções:</div>
                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => (
                        <div 
                          key={option.id} 
                          className={`p-2 rounded-md text-sm ${
                            option.is_correct 
                              ? 'bg-green-100 border border-green-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span>{option.option_text}</span>
                            {option.is_correct && (
                              <Badge variant="outline" className="ml-auto text-xs">
                                Correta
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuizReviewSection;
