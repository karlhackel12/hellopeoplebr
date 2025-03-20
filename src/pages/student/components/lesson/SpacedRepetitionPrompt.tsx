
import React from 'react';
import { Brain, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSpacedRepetition } from '../../hooks/useSpacedRepetition';
import { toast } from 'sonner';

interface SpacedRepetitionPromptProps {
  quizId: string;
  lessonId?: string;
  visible: boolean;
  onClose: () => void;
}

const SpacedRepetitionPrompt: React.FC<SpacedRepetitionPromptProps> = ({
  quizId,
  lessonId,
  visible,
  onClose
}) => {
  const { addQuestionsFromQuiz } = useSpacedRepetition();
  const [adding, setAdding] = React.useState(false);
  
  if (!visible) return null;
  
  const handleAddToReview = async () => {
    try {
      setAdding(true);
      await addQuestionsFromQuiz({ quizId, lessonId });
      toast.success("Questões adicionadas ao sistema de repetição espaçada!");
      onClose();
    } catch (error) {
      console.error('Failed to add questions to review:', error);
      toast.error('Falha ao adicionar questões ao sistema de repetição espaçada');
    } finally {
      setAdding(false);
    }
  };
  
  return (
    <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 mt-6 overflow-hidden shadow-md transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-200 p-2 rounded-full shadow-sm">
            <Brain className="h-5 w-5 text-indigo-600" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-indigo-800 mb-1">Melhore Sua Memória de Longo Prazo</h4>
            <p className="text-sm text-indigo-700 mb-3">
              Adicione estas questões do quiz ao seu sistema de repetição espaçada para melhorar
              a retenção e garantir que você se lembre deste material por anos.
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-sm"
                onClick={handleAddToReview}
                disabled={adding}
              >
                <Plus className="h-4 w-4 mr-1" />
                {adding ? "Adicionando..." : "Adicionar à Repetição Espaçada"}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50"
                onClick={onClose}
                disabled={adding}
              >
                Dispensar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpacedRepetitionPrompt;
