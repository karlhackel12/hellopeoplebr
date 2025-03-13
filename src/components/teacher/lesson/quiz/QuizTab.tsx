
import React, { useState, useEffect } from 'react';
import QuizGenerationForm from './QuizGenerationForm';
import QuizPreviewContent from './QuizPreviewContent';
import QuizPlaceholder from './QuizPlaceholder';
import QuizActions from './QuizActions';
import QuizGenerationProgress from './components/QuizGenerationProgress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizTabProps {
  lessonId?: string;
  isEditMode?: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ lessonId, isEditMode = false }) => {
  const [stage, setStage] = useState<'initial' | 'generating' | 'preview' | 'edit'>('initial');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<any | null>(null);

  // Function to update generation progress
  const updateProgress = (value: number) => {
    setGenerationProgress(value);
  };

  // Fetch quiz data for this lesson
  const { data: quizData, isLoading: loadingQuiz, refetch: refetchQuiz } = useQuery({
    queryKey: ['lesson-quiz', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching quiz data:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!lessonId,
  });

  // Fetch lesson data (needed for AI quiz generation)
  const { data: lessonData, isLoading: loadingLesson } = useQuery({
    queryKey: ['lesson-for-quiz', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
        
      if (error) {
        console.error("Error fetching lesson data:", error);
        throw error;
      }
      
      return data;
    },
    enabled: !!lessonId && stage === 'initial',
  });

  // Fetch quiz questions when we have a quiz
  const { data: questionData, isLoading: loadingQuestions, refetch: refetchQuestions } = useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: async () => {
      if (!quizId) return [];
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });
        
      if (error) {
        console.error("Error fetching quiz questions:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!quizId,
  });

  // Set up initial state based on fetched data
  useEffect(() => {
    if (quizData) {
      setQuizId(quizData.id);
      setQuizTitle(quizData.title || '');
      setIsPublished(quizData.is_published || false);
      setStage(isEditMode ? 'edit' : 'preview');
    } else if (!loadingQuiz && isEditMode) {
      setStage('initial');
    }
  }, [quizData, loadingQuiz, isEditMode]);

  // Update questions when they change
  useEffect(() => {
    if (questionData) {
      setQuestions(questionData);
    }
  }, [questionData]);

  // Update lesson data when it's loaded
  useEffect(() => {
    if (lessonData) {
      setLesson(lessonData);
    }
  }, [lessonData]);

  // Handle starting quiz generation
  const handleStartGeneration = async (numQuestionsStr: string) => {
    if (!lessonId || !lesson?.content) {
      toast.error("Cannot generate quiz", { 
        description: "Lesson content is missing"
      });
      return;
    }
    
    const numQs = parseInt(numQuestionsStr, 10);
    setNumQuestions(numQs);
    setStage('generating');
    setGenerationProgress(5);
    setError(null);
    
    try {
      // Create a new quiz record first
      const quizTitle = `Quiz: ${lesson.title}`;
      setQuizTitle(quizTitle);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error("Authentication required");
      }
      
      // Create quiz in database
      const { data: quizRecord, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: quizTitle,
          lesson_id: lessonId,
          created_by: user.user.id,
          is_published: false,
        })
        .select()
        .single();
      
      if (quizError) throw quizError;
      setQuizId(quizRecord.id);
      
      updateProgress(10);
      
      // Call Edge Function to generate questions
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: {
          lessonContent: lesson.content,
          numQuestions: numQs,
          quizId: quizRecord.id,
        },
      });
      
      if (error) throw error;
      
      updateProgress(90);
      
      // Refetch questions after generation is complete
      await refetchQuestions();
      await refetchQuiz();
      
      updateProgress(100);
      setStage('preview');
      toast.success("Quiz generated successfully");
      
    } catch (err: any) {
      console.error("Error generating quiz:", err);
      setError(err.message || "Failed to generate quiz");
      setStage('initial');
      toast.error("Quiz generation failed", {
        description: err.message
      });
    }
  };

  // Handle manual quiz creation (not using AI)
  const handleManualCreate = async () => {
    if (!lessonId) {
      toast.error("Cannot create quiz", { 
        description: "Lesson ID is missing"
      });
      return;
    }
    
    try {
      // Get lesson title for the quiz
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('title')
        .eq('id', lessonId)
        .single();
        
      if (lessonError) throw lessonError;
      
      const quizTitle = `Quiz: ${lessonData.title}`;
      setQuizTitle(quizTitle);

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error("Authentication required");
      }
      
      // Create empty quiz in database
      const { data: quizRecord, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: quizTitle,
          lesson_id: lessonId,
          created_by: user.user.id,
          is_published: false,
        })
        .select()
        .single();
      
      if (quizError) throw quizError;
      setQuizId(quizRecord.id);
      
      // Set to edit mode with empty questions
      setQuestions([]);
      setStage('edit');
      toast.success("Empty quiz created");
      
    } catch (err: any) {
      console.error("Error creating empty quiz:", err);
      toast.error("Failed to create quiz", {
        description: err.message
      });
    }
  };

  // Handle publishing the quiz
  const handlePublishChange = async (publish: boolean) => {
    if (!quizId) return;
    
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_published: publish })
        .eq('id', quizId);
        
      if (error) throw error;
      
      setIsPublished(publish);
      toast.success(publish ? "Quiz published" : "Quiz unpublished");
      
    } catch (err: any) {
      console.error("Error updating quiz publish status:", err);
      toast.error("Failed to update publish status", {
        description: err.message
      });
    }
  };

  // Handle quiz title update
  const handleTitleUpdate = async (newTitle: string) => {
    if (!quizId) return;
    
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ title: newTitle })
        .eq('id', quizId);
        
      if (error) throw error;
      
      setQuizTitle(newTitle);
      toast.success("Quiz title updated");
      
    } catch (err: any) {
      console.error("Error updating quiz title:", err);
      toast.error("Failed to update quiz title", {
        description: err.message
      });
    }
  };

  // Handle switching to edit mode
  const handleEditQuiz = () => {
    setStage('edit');
  };

  // Handle switching back to preview mode
  const handlePreviewQuiz = async () => {
    await refetchQuestions();
    setStage('preview');
  };

  // Handle adding a new question manually
  const handleAddQuestion = async () => {
    if (!quizId) return;
    
    try {
      // Get the current highest order index
      const highestOrder = questions.length > 0 
        ? Math.max(...questions.map(q => q.order_index || 0)) 
        : -1;
        
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert({
          quiz_id: quizId,
          question_text: 'New question',
          order_index: highestOrder + 1,
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correct_option: 0,
        })
        .select();
        
      if (error) throw error;
      
      await refetchQuestions();
      toast.success("Question added");
      
    } catch (err: any) {
      console.error("Error adding question:", err);
      toast.error("Failed to add question", {
        description: err.message
      });
    }
  };

  // Handle updating a question
  const handleUpdateQuestion = async (questionId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .update(updates)
        .eq('id', questionId);
        
      if (error) throw error;
      
      // Update local state
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      ));
      
    } catch (err: any) {
      console.error("Error updating question:", err);
      toast.error("Failed to update question", {
        description: err.message
      });
    }
  };

  // Handle deleting a question
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);
        
      if (error) throw error;
      
      // Update local state
      setQuestions(questions.filter(q => q.id !== questionId));
      toast.success("Question deleted");
      
    } catch (err: any) {
      console.error("Error deleting question:", err);
      toast.error("Failed to delete question", {
        description: err.message
      });
    }
  };

  // Handle deleting the entire quiz
  const handleDeleteQuiz = async () => {
    if (!quizId) return;
    
    try {
      // Delete all questions first (cascade should do this, but just to be safe)
      await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId);
        
      // Then delete the quiz
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);
        
      if (error) throw error;
      
      // Reset state
      setQuizId(null);
      setQuizTitle('');
      setQuestions([]);
      setStage('initial');
      setIsPublished(false);
      
      toast.success("Quiz deleted");
      
    } catch (err: any) {
      console.error("Error deleting quiz:", err);
      toast.error("Failed to delete quiz", {
        description: err.message
      });
    }
  };

  // Render the appropriate content based on stage
  const renderContent = () => {
    if (loadingQuiz || loadingLesson) {
      return <div className="p-8 text-center">Loading quiz data...</div>;
    }

    if (error) {
      return (
        <div className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            className="px-4 py-2 bg-primary text-white rounded"
            onClick={() => setStage('initial')}
          >
            Try Again
          </button>
        </div>
      );
    }

    switch (stage) {
      case 'initial':
        return (
          <QuizPlaceholder 
            onStartGeneration={handleStartGeneration}
            onManualCreate={handleManualCreate}
          />
        );
        
      case 'generating':
        return (
          <QuizGenerationProgress 
            progress={generationProgress} 
            numQuestions={numQuestions}
          />
        );
        
      case 'preview':
      case 'edit':
        return (
          <div className="space-y-6">
            <QuizActions 
              quizId={quizId}
              quizTitle={quizTitle}
              isEditMode={stage === 'edit'}
              isPublished={isPublished}
              onPublishChange={handlePublishChange}
              onEditQuiz={handleEditQuiz}
              onPreviewQuiz={handlePreviewQuiz}
              onTitleUpdate={handleTitleUpdate}
              onDeleteQuiz={handleDeleteQuiz}
              onAddQuestion={handleAddQuestion}
            />
            
            <QuizPreviewContent 
              questions={questions}
              isLoading={loadingQuestions}
              isEditMode={stage === 'edit'}
              onUpdateQuestion={handleUpdateQuestion}
              onDeleteQuestion={handleDeleteQuestion}
            />
          </div>
        );
        
      default:
        return <div>Something went wrong</div>;
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default QuizTab;
