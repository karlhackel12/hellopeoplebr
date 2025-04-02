
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Trophy, Home, RotateCcw } from 'lucide-react';

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
  const percentage = totalReviewed > 0 ? Math.round((correctCount / totalReviewed) * 100) : 0;
  
  return (
    <Card className="overflow-hidden max-w-xl mx-auto my-8 bg-white shadow-lg border-[#9b87f5]/20">
      <CardHeader className="bg-gradient-to-r from-[#9b87f5] to-[#a794f6] text-white text-center py-8">
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 rounded-full p-4">
            <Trophy className="h-10 w-10" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold mb-2">Revisão Concluída!</CardTitle>
        <p className="opacity-90">Você completou todas as revisões programadas para hoje.</p>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 border rounded-lg bg-purple-50 border-purple-100">
            <div className="text-2xl font-bold text-purple-800 mb-1">{totalReviewed}</div>
            <div className="text-xs text-muted-foreground">Itens Revisados</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg bg-green-50 border-green-100">
            <div className="text-2xl font-bold text-green-700 mb-1">{correctCount}</div>
            <div className="text-xs text-muted-foreground">Respostas Corretas</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg bg-amber-50 border-amber-100">
            <div className="text-2xl font-bold text-amber-700 mb-1">{totalPointsEarned}</div>
            <div className="text-xs text-muted-foreground">Pontos Ganhos</div>
          </div>
        </div>
        
        <div className="text-center bg-gray-50 p-6 rounded-lg">
          <div className="text-4xl font-bold mb-1 text-[#9b87f5]">{percentage}%</div>
          <div className="text-sm text-muted-foreground">Taxa de Acerto</div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3 p-6 bg-gray-50 border-t">
        <Button 
          onClick={onBack} 
          className="w-full bg-gradient-to-r from-[#9b87f5] to-[#a794f6] hover:from-[#8b77e5] hover:to-[#9784e6]"
        >
          <Home className="mr-2 h-4 w-4" /> Voltar para o Painel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReviewCompletionSummary;
