import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash, CheckCircle, XCircle } from 'lucide-react';
import { Question } from './types';

interface QuestionFormProps {
  currentQuestion: Question | null;
  saving: boolean;
  onQuestionChange: (field: string, value: any) => void;
  onOptionChange: (index: number, field: string, value: any) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onCancel: () => void;
  onSave: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  currentQuestion,
  saving,
  onQuestionChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onCancel,
  onSave,
}) => {
  if (!currentQuestion) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          {currentQuestion.id ? 'Editar Pergunta' : 'Adicionar Nova Pergunta'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label htmlFor="question-text">Texto da Pergunta</Label>
            <Textarea
              id="question-text"
              value={currentQuestion.question_text}
              onChange={(e) => onQuestionChange('question_text', e.target.value)}
              placeholder="Digite sua pergunta"
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="question-type">Tipo de Pergunta</Label>
              <Select
                value={currentQuestion.question_type}
                onValueChange={(value) => onQuestionChange('question_type', value)}
              >
                <SelectTrigger id="question-type" className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de pergunta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                  <SelectItem value="true_false">Verdadeiro/Falso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="points">Pontos</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={currentQuestion.points}
                onChange={(e) => onQuestionChange('points', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Opções de Resposta</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddOption}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Adicionar Opção
              </Button>
            </div>
            
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2 mb-3">
                <div className="flex-grow">
                  <Input
                    value={option.option_text}
                    onChange={(e) => onOptionChange(index, 'option_text', e.target.value)}
                    placeholder={`Opção ${index + 1}`}
                  />
                </div>
                <Button
                  type="button"
                  variant={option.is_correct ? "default" : "outline"}
                  size="sm"
                  onClick={() => onOptionChange(index, 'is_correct', !option.is_correct)}
                  className="gap-1 min-w-24"
                >
                  {option.is_correct ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Correta
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Incorreta
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveOption(index)}
                  className="text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <div className="flex justify-end gap-2 p-6 pt-0">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          disabled={
            saving ||
            !currentQuestion.question_text ||
            !currentQuestion.options?.some(o => o.option_text.trim() !== '')
          }
        >
          {saving ? 'Salvando...' : 'Salvar Pergunta'}
        </Button>
      </div>
    </Card>
  );
};

export default QuestionForm;
