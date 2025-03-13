
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Zap } from 'lucide-react';
import QuizEditor from '@/components/teacher/QuizEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LessonSelect from '@/components/teacher/quiz/LessonSelect';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import { QuizGenerationService } from '@/components/teacher/quiz/services/QuizGenerationService';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const QuizEdit: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [isSavingLesson, setIsSavingLesson] = useState(false);

  const { generateQuiz } = useQuizHandler(lessonId || '');

  useEffect(() => {
    const fetchQuizInfo = async () => {
      if (!quizId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('quizzes')
          .select('title, description, lesson_id')
          .eq('id', quizId)
          .single();

        if (error) throw error;
        
        if (data) {
          setQuizTitle(data.title);
          setQuizDescription(data.description || '');
          setLessonId(data.lesson_id);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Error', {
          description: 'Failed to load quiz',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizInfo();
  }, [quizId]);

  const handleBack = () => {
    navigate('/teacher/quiz');
  };

  const handleSelectLesson = async (newLessonId: string | null) => {
    if (newLessonId === lessonId) return;
    
    try {
      setIsSavingLesson(true);
      
      const { error } = await supabase
        .from('quizzes')
        .update({ lesson_id: newLessonId })
        .eq('id', quizId);
        
      if (error) throw error;
      
      setLessonId(newLessonId);
      toast.success('Lesson association updated', {
        description: newLessonId 
          ? 'This quiz is now associated with the selected lesson' 
          : 'This quiz is now a standalone quiz'
      });
    } catch (error) {
      console.error('Error updating lesson association:', error);
      toast.error('Error', {
        description: 'Failed to update lesson association',
      });
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!lessonId) {
      toast.error('Error', {
        description: 'A lesson must be selected to generate questions',
      });
      return;
    }
    
    try {
      setGenerating(true);
      
      // First clear existing questions
      const { error: clearError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId);
      
      if (clearError) throw clearError;
      
      // Generate new questions
      await generateQuiz(5);
      
      toast.success('Questions generated', {
        description: 'New questions have been generated based on the lesson content',
      });
      
      // Refresh the page to show new questions
      window.location.reload();
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Error', {
        description: 'Failed to generate questions',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateWithReplicate = async () => {
    if (!quizId) return;
    
    try {
      setGenerating(true);
      
      // First clear existing questions
      const { error: clearError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId);
      
      if (clearError) throw clearError;
      
      // Generate with Replicate
      const generatedQuestions = await QuizGenerationService.generateWithReplicate(
        quizTitle,
        quizDescription,
        5 // Default to 5 questions
      );
      
      if (!generatedQuestions) {
        throw new Error('Failed to generate questions');
      }
      
      // Save the generated questions
      const success = await QuizGenerationService.saveGeneratedQuestions(
        quizId,
        generatedQuestions
      );
      
      if (success) {
        toast.success('Questions generated with AI', {
          description: `${generatedQuestions.length} questions have been created based on the quiz title and description`,
        });
        
        // Refresh the page to show new questions
        window.location.reload();
      } else {
        throw new Error('Failed to save generated questions');
      }
    } catch (error) {
      console.error('Error generating questions with Replicate:', error);
      toast.error('Error', {
        description: 'Failed to generate questions',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
            <h1 className="text-2xl font-semibold">
              {loading ? 'Loading Quiz...' : `Edit Quiz: ${quizTitle}`}
            </h1>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={generating}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {generating ? 'Generating...' : 'Generate Questions'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {lessonId && (
                <DropdownMenuItem onClick={handleGenerateQuestions}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  From Lesson Content
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleGenerateWithReplicate}>
                <Zap className="h-4 w-4 mr-2" />
                From Quiz Title & Description
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg">
          <LessonSelect 
            selectedLessonId={lessonId}
            onSelectLesson={handleSelectLesson}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p>Loading quiz data...</p>
          </div>
        ) : (
          <QuizEditor quizId={quizId} lessonId={lessonId} />
        )}
      </div>
    </TeacherLayout>
  );
};

export default QuizEdit;
