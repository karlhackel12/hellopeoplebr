
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, CheckCircle, ArrowRight, AlertCircle, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Question } from '@/components/teacher/quiz/types';

interface QuizSectionProps {
  quizId?: string;
  title: string;
  description?: string;
  questions: Question[];
  isPublished: boolean;
  passPercent: number;
  progress?: {
    attempts?: number;
    bestScore?: number;
    isCompleted?: boolean;
    inProgress?: boolean;
  };
}

const QuizSection: React.FC<QuizSectionProps> = ({ 
  quizId,
  title,
  description,
  questions,
  isPublished,
  passPercent,
  progress
}) => {
  const navigate = useNavigate();
  
  if (!isPublished || !questions.length) {
    return null;
  }
  
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const estimatedTime = Math.max(5, Math.round(questions.length * 1.5)); // Rough estimate: 1.5 min per question
  const hasPreviouslyStarted = progress?.inProgress || progress?.isCompleted;
  const isPassed = (progress?.bestScore || 0) >= passPercent;
  
  const handleStartQuiz = () => {
    if (quizId) {
      navigate(`/student/quizzes/take/${quizId}`);
    }
  };
  
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 shadow-md">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-primary">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          
          {progress?.isCompleted && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              <CheckCircle className="mr-1 h-3 w-3" /> Completed
            </Badge>
          )}
          
          {progress?.inProgress && !progress?.isCompleted && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
              In Progress
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-3 items-center text-sm text-muted-foreground">
            <div className="flex items-center">
              <BookOpen className="mr-1 h-4 w-4" />
              {questions.length} questions
            </div>
            
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              ~{estimatedTime} minutes
            </div>
            
            <div className="flex items-center">
              <Award className="mr-1 h-4 w-4" />
              Pass: {passPercent}%
            </div>
            
            {progress?.attempts && progress.attempts > 0 && (
              <div>
                {progress.attempts} attempt{progress.attempts !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {progress?.bestScore !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Your best score</span>
                <span className={isPassed ? 'text-green-600 font-medium' : 'text-amber-600'}>
                  {progress.bestScore}%
                </span>
              </div>
              <Progress 
                value={progress.bestScore} 
                className="h-2" 
                indicatorClassName={isPassed ? 'bg-green-500' : 'bg-amber-500'} 
              />
            </div>
          )}
          
          {progress?.inProgress && !progress?.isCompleted && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                You have a quiz in progress. Continue where you left off.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4">
        <Button 
          onClick={handleStartQuiz} 
          className="w-full group"
          aria-label={hasPreviouslyStarted ? "Continue Quiz" : "Start Quiz"}
        >
          {progress?.isCompleted ? (
            <>Review Quiz Results</>
          ) : hasPreviouslyStarted ? (
            <>Continue Quiz</>
          ) : (
            <>Start Quiz</>
          )}
          <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizSection;
