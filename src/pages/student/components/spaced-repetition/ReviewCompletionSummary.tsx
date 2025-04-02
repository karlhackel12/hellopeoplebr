
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Trophy, Brain, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ReviewCompletionSummaryProps {
  correctCount: number;
  totalReviewed: number;
  totalPointsEarned: number;
  onBack: () => void;
}

const ReviewCompletionSummary: React.FC<ReviewCompletionSummaryProps> = ({
  correctCount,
  totalReviewed,
  totalPointsEarned,
  onBack
}) => {
  const percentCorrect = totalReviewed > 0 
    ? Math.round((correctCount / totalReviewed) * 100) 
    : 0;

  return (
    <Card className="max-w-lg mx-auto overflow-hidden">
      <CardContent className="p-6 text-center">
        <div className="mb-6">
          <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Revisão Concluída!</h2>
          <p className="text-muted-foreground">
            Você completou suas revisões agendadas para hoje
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg">{totalReviewed}</h3>
            <p className="text-xs text-muted-foreground">Total Revisado</p>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg">{correctCount}</h3>
            <p className="text-xs text-muted-foreground">Respostas Corretas</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg flex items-center justify-center">
              <Trophy className="h-4 w-4 text-[#9b87f5] mr-1" />
              {totalPointsEarned}
            </h3>
            <p className="text-xs text-muted-foreground">Pontos Ganhos</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Taxa de Precisão</span>
            <span>{percentCorrect}%</span>
          </div>
          <Progress value={percentCorrect} className="h-2" indicatorClassName="bg-[#9b87f5]" />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg text-left mb-6">
          <div className="flex">
            <div className="bg-blue-100 rounded-full p-2 h-10 w-10 flex items-center justify-center mr-3">
              <Brain className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800">Dica de Estudo</h4>
              <p className="text-sm text-blue-700">
                Revisões consistentes são a chave para a memória de longo prazo. Volte amanhã para suas próximas revisões agendadas.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-slate-50 border-t p-4">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="flex items-center w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para o Painel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReviewCompletionSummary;
