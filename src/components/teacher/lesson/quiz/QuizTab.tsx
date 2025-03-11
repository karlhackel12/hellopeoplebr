
import React, { useState } from 'react';
import QuizEditor from '@/components/teacher/QuizEditor';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface QuizTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ lessonId, isEditMode }) => {
  const [numQuestions, setNumQuestions] = useState('5');
  const { generateQuiz, loading } = useQuizHandler(lessonId || '');

  const handleGenerateQuiz = async () => {
    await generateQuiz(parseInt(numQuestions));
  };

  return (
    <>
      {isEditMode && lessonId ? (
        <div className="space-y-8">
          {/* Quiz Editor Section */}
          <QuizEditor lessonId={lessonId} />
          
          {/* AI Generation Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AI Quiz Generation</h3>
              <p className="text-sm text-muted-foreground">
                Generate quiz questions automatically based on the lesson content
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="num-questions">Number of Questions:</Label>
                  <Select
                    value={numQuestions}
                    onValueChange={setNumQuestions}
                  >
                    <SelectTrigger id="num-questions" className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleGenerateQuiz} 
                  variant="secondary"
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Quiz with AI'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="p-8 text-center border rounded-md bg-muted flex flex-col items-center gap-2">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
          <p className="text-muted-foreground">Please save the lesson first before creating a quiz</p>
          <p className="text-xs text-muted-foreground">Quizzes can only be added to saved lessons</p>
        </div>
      )}
    </>
  );
};

export default QuizTab;
