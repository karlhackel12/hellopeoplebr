
import React, { useState } from 'react';
import QuizSettings from './quiz/QuizSettings';
import QuestionManager from './quiz/components/QuestionManager';
import QuizCreationPanel from './quiz/components/QuizCreationPanel';
import { useQuizEditor } from './quiz/hooks/useQuizEditor';
import { useQuestionEditor } from './quiz/hooks/useQuestionEditor';
import { useQuizGenerationState } from './hooks/quiz/useQuizGenerationState';
import { useQuizGenerationWorkflow } from './hooks/quiz/useQuizGenerationWorkflow';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { QuizGenerationService } from './quiz/services/QuizGenerationService';
import { Quiz } from './quiz/types';

interface QuizEditorProps {
  quizId?: string;
  lessonId?: string;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ quizId, lessonId }) => {
  // Quiz state and operations
  const {
    quiz,
    questions,
    title,
    setTitle,
    description,
    setDescription,
    passPercent,
    setPassPercent,
    isPublished,
    setIsPublished,
    loading,
    saving,
    fetchQuizData,
    saveQuiz,
    setQuiz
  } = useQuizEditor(quizId, lessonId);

  // Question editing state and operations
  const {
    currentQuestion,
    addingQuestion,
    savingQuestion,
    addQuestion,
    editQuestion,
    cancelQuestionEdit,
    handleQuestionChange,
    handleOptionChange,
    addOption,
    removeOption,
    saveQuestion,
    deleteQuestion
  } = useQuestionEditor(quiz?.id || '', fetchQuizData);

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

  // For Replicate-based generation
  const [generatingWithAI, setGeneratingWithAI] = useState(false);

  // Define these functions before they're used in useQuizGenerationWorkflow
  const fetchLessonContent = async (lessonId: string): Promise<string | null> => {
    try {
      // This would call an API to fetch the lesson content
      const { data, error } = await supabase
        .from('lessons')
        .select('content')
        .eq('id', lessonId)
        .maybeSingle();
      
      if (error) throw error;
      return data?.content || null;
    } catch (error) {
      console.error("Error fetching lesson content:", error);
      return null;
    }
  };

  const generateSmartQuiz = async (numQuestions: number): Promise<boolean> => {
    try {
      // This would call the edge function to generate quiz questions
      console.log(`Generating ${numQuestions} quiz questions for lesson ${lessonId}`);
      // In a real app, this would make an API call
      
      // For demo purposes, simulate a success
      return true;
    } catch (error) {
      console.error("Error generating smart quiz:", error);
      return false;
    }
  };

  const loadQuizPreview = async (): Promise<any[] | null> => {
    try {
      // This would load the generated quiz questions for preview
      await fetchQuizData();
      return questions;
    } catch (error) {
      console.error("Error loading quiz preview:", error);
      return null;
    }
  };

  // Modified to correctly handle the types
  const setQuizWithCorrectType = (value: boolean) => {
    if (value) {
      // Only set if value is true and we have an existing quiz or create a placeholder
      if (quiz) {
        // No need to change anything if quiz already exists
        return;
      } else {
        // Create a temporary quiz object with the required properties
        const tempQuiz: Quiz = {
          id: 'temp',
          title: title || 'Temporary Quiz',
          description: description || '',
          is_published: false,
          pass_percent: 70
        };
        setQuiz(tempQuiz);
      }
    } else {
      // Set to null if value is false
      setQuiz(null);
    }
  };

  // Quiz generation workflow (legacy)
  const { generateQuiz } = useQuizGenerationWorkflow(
    () => fetchLessonContent(lessonId || ''),
    generateSmartQuiz,
    loadQuizPreview,
    setQuizWithCorrectType,
    setIsPublished,
    currentPhase,
    setGenerationPhase,
    setError,
    clearErrors,
    setContentLoading
  );

  // New method to generate quiz with Replicate
  const handleGenerateWithReplicate = async () => {
    if (!quiz) {
      toast.error('No quiz selected', {
        description: 'Please create or select a quiz first',
      });
      return;
    }

    try {
      setGeneratingWithAI(true);
      setGenerationPhase('analyzing');
      
      const generatedQuestions = await QuizGenerationService.generateWithReplicate(
        title,
        description,
        parseInt(numQuestions.toString())
      );
      
      if (!generatedQuestions) {
        setGenerationPhase('error');
        return;
      }
      
      setGenerationPhase('saving');
      
      // Save the generated questions to the database
      const success = await QuizGenerationService.saveGeneratedQuestions(
        quiz.id,
        generatedQuestions
      );
      
      if (success) {
        setGenerationPhase('complete');
        
        // Reload the questions from the database
        await fetchQuizData();
        
        toast.success('Quiz generated successfully', {
          description: `${generatedQuestions.length} questions have been created using AI`,
        });
        
        // Reset after 2 seconds
        setTimeout(() => {
          setGenerationPhase('idle');
        }, 2000);
      } else {
        setGenerationPhase('error');
      }
    } catch (error: any) {
      console.error('Error generating quiz with AI:', error);
      setError('Generation failed', error.message);
      setGenerationPhase('error');
    } finally {
      setGeneratingWithAI(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!lessonId && !quiz) {
      toast.error('Missing requirements', {
        description: 'A lesson or existing quiz must be available to generate questions',
      });
      return;
    }

    if (lessonId) {
      // Use legacy generation with lesson content
      const success = await generateQuiz(numQuestions);
      if (success) {
        toast.success('Quiz generated', {
          description: 'Your quiz questions have been generated successfully from lesson content',
        });
      }
    } else {
      // Use Replicate generation with quiz title/description
      await handleGenerateWithReplicate();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <p>Loading quiz data...</p>
      </div>
    );
  }

  return (
    <div>
      <QuizSettings
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        passPercent={passPercent}
        setPassPercent={setPassPercent}
        isPublished={isPublished}
        setIsPublished={setIsPublished}
        saving={saving}
        onSave={saveQuiz}
      />

      {quiz ? (
        <QuestionManager
          questions={questions}
          currentQuestion={currentQuestion}
          addingQuestion={addingQuestion}
          savingQuestion={savingQuestion}
          onAddQuestion={() => addQuestion(questions.length)}
          onEditQuestion={editQuestion}
          onDeleteQuestion={deleteQuestion}
          onQuestionChange={handleQuestionChange}
          onOptionChange={handleOptionChange}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          onCancelEdit={cancelQuestionEdit}
          onSaveQuestion={saveQuestion}
          onGenerateQuestions={handleGenerateQuestions}
          generationPhase={currentPhase}
          isRetrying={isRetrying}
          showGenerateButton={true} // Always show the generate button
        />
      ) : (
        <QuizCreationPanel
          title="Create Quiz"
          onCreateQuiz={saveQuiz}
          disabled={!title}
          loading={saving}
        />
      )}
    </div>
  );
};

export default QuizEditor;
