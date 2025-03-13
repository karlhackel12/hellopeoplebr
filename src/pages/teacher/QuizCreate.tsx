
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import LessonSelect from '@/components/teacher/quiz/LessonSelect';
import { useQuizHandler } from '@/components/teacher/hooks/useQuizHandler';
import { useQuizGenerationState } from '@/components/teacher/hooks/quiz/useQuizGenerationState';
import { useQuizGenerationWorkflow } from '@/components/teacher/hooks/quiz/useQuizGenerationWorkflow';
import QuizGenerationProgress from '@/components/teacher/lesson/quiz/components/QuizGenerationProgress';

const QuizCreate: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const navigate = useNavigate();

  const { 
    fetchLessonContent,
    generateSmartQuiz,
    loading: quizHandlerLoading,
    isRetrying: quizHandlerRetrying,
  } = useQuizHandler(selectedLessonId || '');

  // Generation state
  const {
    numQuestions,
    setNumQuestions,
    clearErrors,
    isRetrying,
    contentLoadingMessage,
    setContentLoading,
    currentPhase,
    setGenerationPhase,
    setError
  } = useQuizGenerationState();

  // Fix for the type mismatch - create a wrapper function that returns boolean
  const generateQuizWrapper = async (numQuestions: number): Promise<boolean> => {
    const result = await generateSmartQuiz(numQuestions);
    return result !== null && Array.isArray(result) && result.length > 0;
  };

  // Quiz generation workflow
  const { generateQuiz } = useQuizGenerationWorkflow(
    fetchLessonContent,
    generateQuizWrapper,
    async () => [], // We don't need to preview questions here
    () => {}, // We don't need to set existing quiz
    () => {}, // We don't need to set published status
    currentPhase,
    setGenerationPhase,
    setError,
    clearErrors,
    setContentLoading
  );

  const handleSelectLesson = (lessonId: string | null) => {
    setSelectedLessonId(lessonId);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Error', {
        description: 'Title is required',
      });
      return;
    }

    try {
      setSaving(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error('Error', {
          description: 'You must be logged in to create a quiz',
        });
        navigate('/login');
        return;
      }

      // Create a quiz, optionally with lesson_id
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title,
          description,
          created_by: user.user.id,
          pass_percent: 70,
          is_published: false,
          lesson_id: selectedLessonId || null
        })
        .select();

      if (error) throw error;

      toast.success('Quiz created', {
        description: 'Your quiz has been created successfully',
      });

      setQuizId(data[0].id);
      navigate(`/teacher/quiz/${data[0].id}/edit`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Error', {
        description: 'Failed to create quiz',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAndSave = async () => {
    if (!title.trim()) {
      toast.error('Error', {
        description: 'Title is required',
      });
      return;
    }

    if (!selectedLessonId) {
      toast.error('Error', {
        description: 'Lesson selection is required for AI generation',
      });
      return;
    }

    try {
      setSaving(true);
      
      // First save the quiz
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error('Error', {
          description: 'You must be logged in to create a quiz',
        });
        navigate('/login');
        return;
      }

      // Create the quiz with lesson_id
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title,
          description,
          created_by: user.user.id,
          pass_percent: 70,
          is_published: false,
          lesson_id: selectedLessonId
        })
        .select();

      if (error) throw error;
      
      setQuizId(data[0].id);

      // Generate questions
      const success = await generateQuiz(numQuestions);
      
      if (success) {
        toast.success('Quiz created with AI questions', {
          description: 'Your quiz has been created with AI-generated questions',
        });
        navigate(`/teacher/quiz/${data[0].id}/edit`);
      } else {
        toast.error('Error', {
          description: 'Quiz created but question generation failed',
        });
        navigate(`/teacher/quiz/${data[0].id}/edit`);
      }
    } catch (error) {
      console.error('Error creating quiz with AI:', error);
      toast.error('Error', {
        description: 'Failed to create quiz with AI questions',
      });
      
      // If we have a quiz ID, navigate to edit it anyway
      if (quizId) {
        navigate(`/teacher/quiz/${quizId}/edit`);
      }
    } finally {
      setSaving(false);
    }
  };

  const isProcessing = saving || currentPhase !== 'idle';

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/teacher/quiz')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
            <h1 className="text-3xl font-bold">Create New Quiz</h1>
          </div>
          <div className="flex gap-2">
            {selectedLessonId && (
              <Button 
                onClick={handleGenerateAndSave} 
                disabled={isProcessing || !title.trim()}
                className="gap-2"
                variant="default"
              >
                <Sparkles className="h-4 w-4" />
                {saving ? 'Processing...' : 'Generate & Save'}
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={isProcessing || !title.trim()}
              className="gap-2"
              variant={selectedLessonId ? "outline" : "default"}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Quiz'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                className="mt-1"
              />
            </div>
            
            <LessonSelect 
              selectedLessonId={selectedLessonId}
              onSelectLesson={handleSelectLesson}
            />
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description"
                className="mt-1"
              />
            </div>
            
            {currentPhase !== 'idle' && (
              <div className="p-4 bg-muted/50 rounded-md">
                <QuizGenerationProgress 
                  currentPhase={currentPhase}
                  isRetrying={isRetrying}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            {selectedLessonId 
              ? "Save with 'Generate & Save' to automatically create questions based on the lesson content"
              : "After creating the quiz, you can add questions on the edit page"}
          </p>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default QuizCreate;
