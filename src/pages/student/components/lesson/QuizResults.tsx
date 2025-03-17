
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Award } from 'lucide-react';

interface QuizResultsProps {
  score: number | null;
  passPercent: number;
  onTryAgain: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ 
  score, 
  passPercent, 
  onTryAgain 
}) => {
  const hasPassed = score !== null && score >= passPercent;
  
  return (
    <div className="text-center space-y-6">
      {hasPassed ? (
        <>
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-2" />
          <h3 className="text-2xl font-semibold">Parabéns!</h3>
          <p className="text-lg">Você passou no quiz com uma pontuação de {score}%</p>
          <div className="w-1/2 mx-auto my-6">
            <Progress value={score || 0} className="h-3" indicatorClassName="bg-green-500" />
          </div>
          <Award className="h-12 w-12 mx-auto text-amber-500 mb-2" />
        </>
      ) : (
        <>
          <XCircle className="h-16 w-16 mx-auto text-red-500 mb-2" />
          <h3 className="text-2xl font-semibold">Quiz não concluído</h3>
          <p className="text-lg">
            Você obteve {score}%, que está abaixo da pontuação de aprovação de {passPercent}%
          </p>
          <div className="w-1/2 mx-auto my-6">
            <Progress value={score || 0} className="h-3" indicatorClassName="bg-red-500" />
          </div>
          <p>Não se preocupe! Você pode tentar novamente.</p>
        </>
      )}
      
      <Button 
        variant="outline" 
        onClick={onTryAgain} 
        className="mt-4"
      >
        Tentar Novamente
      </Button>
    </div>
  );
};

export default QuizResults;
