
import React from 'react';
import QuizEditor from '@/components/teacher/QuizEditor';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ lessonId, isEditMode }) => {
  const handleGenerateQuiz = async () => {
    if (!lessonId) return;
    
    try {
      // First, get the lesson content
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('content')
        .eq('id', lessonId)
        .single();
      
      if (lessonError || !lesson?.content) {
        throw new Error('Failed to fetch lesson content');
      }

      // Call the edge function to generate quiz questions
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { lessonContent: lesson.content }
      });

      if (error) throw error;

      // If successful, batch insert the questions and their options
      if (data?.questions) {
        // First, remove any existing questions for this quiz
        const { error: deleteError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', lessonId);

        if (deleteError) throw deleteError;

        // Insert new questions
        for (const [index, question] of data.questions.entries()) {
          // Insert question
          const { data: questionData, error: questionError } = await supabase
            .from('quiz_questions')
            .insert({
              quiz_id: lessonId,
              question_text: question.question_text,
              question_type: question.question_type,
              points: question.points,
              order_index: index
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Insert options for this question
          const optionsToInsert = question.options.map((option: any, optionIndex: number) => ({
            question_id: questionData.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: optionIndex
          }));

          const { error: optionsError } = await supabase
            .from('quiz_question_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }

        toast.success('Quiz generated', {
          description: 'AI has generated quiz questions based on the lesson content',
        });
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz', {
        description: error.message,
      });
    }
  };

  return (
    <>
      {isEditMode && lessonId ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <QuizEditor lessonId={lessonId} />
            <Button onClick={handleGenerateQuiz} variant="secondary">
              Generate Quiz with AI
            </Button>
          </div>
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
