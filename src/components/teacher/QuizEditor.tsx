
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import QuizSettings from './quiz/QuizSettings';
import QuestionForm from './quiz/QuestionForm';
import QuestionList from './quiz/QuestionList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Quiz, Question } from './quiz/types';

interface QuizEditorProps {
  quizId?: string;
  lessonId?: string;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ quizId, lessonId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passPercent, setPassPercent] = useState(70);
  const [isPublished, setIsPublished] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      if (!quizId && !lessonId) {
        setLoading(false);
        return;
      }

      // Fetch quiz
      let quizQuery = supabase.from('quizzes').select('*');
      
      if (quizId) {
        quizQuery = quizQuery.eq('id', quizId);
      } else if (lessonId) {
        quizQuery = quizQuery.eq('lesson_id', lessonId);
      }
      
      const { data: quizData, error: quizError } = await quizQuery.single();
      
      if (quizError && quizError.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows returned"
        throw quizError;
      }
      
      if (quizData) {
        setQuiz(quizData);
        setTitle(quizData.title);
        setDescription(quizData.description || '');
        setPassPercent(quizData.pass_percent);
        setIsPublished(quizData.is_published);
        
        // Fetch questions for this quiz
        const { data: questionsData, error: questionsError } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('order_index', { ascending: true });
        
        if (questionsError) throw questionsError;
        
        if (questionsData) {
          // For each question, fetch its options
          const questionsWithOptions = await Promise.all(
            questionsData.map(async (question) => {
              const { data: optionsData, error: optionsError } = await supabase
                .from('quiz_question_options')
                .select('*')
                .eq('question_id', question.id)
                .order('order_index', { ascending: true });
              
              if (optionsError) throw optionsError;
              
              return {
                ...question,
                options: optionsData || [],
              };
            })
          );
          
          setQuestions(questionsWithOptions);
        }
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      toast.error('Error', {
        description: 'Failed to load quiz data',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    try {
      setSaving(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      if (quiz) {
        // Update existing quiz
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({
            title,
            description,
            pass_percent: passPercent,
            is_published: isPublished,
            updated_at: new Date().toISOString(),
          })
          .eq('id', quiz.id);
        
        if (updateError) throw updateError;
        
        toast.success('Quiz updated', {
          description: 'Your quiz has been successfully updated',
        });
      } else {
        // Create new quiz
        const { data: quizData, error: createError } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: lessonId,
            title,
            description,
            pass_percent: passPercent,
            is_published: isPublished,
            created_by: user.user.id,
          })
          .select();
        
        if (createError) throw createError;
        
        setQuiz(quizData[0]);
        
        toast.success('Quiz created', {
          description: 'Your quiz has been successfully created',
        });
      }
      
      await fetchQuizData(); // Reload quiz data
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Error', {
        description: 'Failed to save quiz',
      });
    } finally {
      setSaving(false);
    }
  };

  // Question management functions
  const addQuestion = (questionCount: number) => {
    setCurrentQuestion({
      id: '',
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      order_index: questionCount,
      options: [
        { id: '', option_text: '', is_correct: true, order_index: 0 },
        { id: '', option_text: '', is_correct: false, order_index: 1 },
      ],
    });
    setAddingQuestion(true);
  };

  const editQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setAddingQuestion(true);
  };

  const cancelQuestionEdit = () => {
    setCurrentQuestion(null);
    setAddingQuestion(false);
  };

  const handleQuestionChange = (field: string, value: any) => {
    if (!currentQuestion) return;
    
    setCurrentQuestion({
      ...currentQuestion,
      [field]: value,
    });
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    if (!currentQuestion || !currentQuestion.options) return;
    
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    };
    
    // If marking this option as correct in multiple choice, set others to false
    if (field === 'is_correct' && value === true && currentQuestion.question_type === 'multiple_choice') {
      updatedOptions.forEach((option, i) => {
        if (i !== index) {
          updatedOptions[i] = { ...option, is_correct: false };
        }
      });
    }
    
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  const addOption = () => {
    if (!currentQuestion || !currentQuestion.options) return;
    
    setCurrentQuestion({
      ...currentQuestion,
      options: [
        ...currentQuestion.options,
        {
          id: '',
          option_text: '',
          is_correct: false,
          order_index: currentQuestion.options.length,
        },
      ],
    });
  };

  const removeOption = (index: number) => {
    if (!currentQuestion || !currentQuestion.options) return;
    if (currentQuestion.options.length <= 2) {
      toast.error('Error', {
        description: 'A question must have at least 2 options',
      });
      return;
    }
    
    const updatedOptions = currentQuestion.options.filter((_, i) => i !== index)
      .map((option, i) => ({ ...option, order_index: i }));
    
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions,
    });
  };

  const saveQuestion = async () => {
    if (!currentQuestion || !quiz) return;
    
    try {
      setSavingQuestion(true);
      
      if (currentQuestion.id) {
        // Update existing question
        const { error: questionError } = await supabase
          .from('quiz_questions')
          .update({
            question_text: currentQuestion.question_text,
            question_type: currentQuestion.question_type,
            points: currentQuestion.points,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentQuestion.id);
        
        if (questionError) throw questionError;
        
        // Handle options: delete existing options and add new ones
        if (currentQuestion.options && currentQuestion.options.length > 0) {
          // Delete existing options
          const { error: deleteError } = await supabase
            .from('quiz_question_options')
            .delete()
            .eq('question_id', currentQuestion.id);
          
          if (deleteError) throw deleteError;
          
          // Add new options
          const optionsToInsert = currentQuestion.options.map((option, index) => ({
            question_id: currentQuestion.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: index,
          }));
          
          const { error: insertError } = await supabase
            .from('quiz_question_options')
            .insert(optionsToInsert);
          
          if (insertError) throw insertError;
        }
        
        toast.success('Question updated', {
          description: 'Your question has been successfully updated',
        });
      } else {
        // Create new question
        const { data: questionData, error: questionError } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quiz.id,
            question_text: currentQuestion.question_text,
            question_type: currentQuestion.question_type,
            points: currentQuestion.points,
            order_index: currentQuestion.order_index,
          })
          .select();
        
        if (questionError) throw questionError;
        
        const newQuestionId = questionData[0].id;
        
        // Add options
        if (currentQuestion.options && currentQuestion.options.length > 0) {
          const optionsToInsert = currentQuestion.options.map((option, index) => ({
            question_id: newQuestionId,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: index,
          }));
          
          const { error: insertError } = await supabase
            .from('quiz_question_options')
            .insert(optionsToInsert);
          
          if (insertError) throw insertError;
        }
        
        toast.success('Question added', {
          description: 'Your question has been successfully added to the quiz',
        });
      }
      
      // Reset and reload data
      setCurrentQuestion(null);
      setAddingQuestion(false);
      await fetchQuizData();
      
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Error', {
        description: 'Failed to save question',
      });
    } finally {
      setSavingQuestion(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    const confirm = window.confirm('Are you sure you want to delete this question? This action cannot be undone.');
    
    if (confirm) {
      try {
        // Delete options first (as they reference the question)
        const { error: optionsError } = await supabase
          .from('quiz_question_options')
          .delete()
          .eq('question_id', questionId);
        
        if (optionsError) throw optionsError;
        
        // Then delete the question
        const { error: questionError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('id', questionId);
        
        if (questionError) throw questionError;
        
        toast.success('Question deleted', {
          description: 'The question has been successfully deleted',
        });
        
        await fetchQuizData();
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Error', {
          description: 'Failed to delete question',
        });
      }
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [quizId, lessonId]);

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
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Questions</h2>
            {!addingQuestion && (
              <Button onClick={() => addQuestion(questions.length)} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Question
              </Button>
            )}
          </div>

          {addingQuestion ? (
            <QuestionForm
              currentQuestion={currentQuestion}
              saving={savingQuestion}
              onQuestionChange={handleQuestionChange}
              onOptionChange={handleOptionChange}
              onAddOption={addOption}
              onRemoveOption={removeOption}
              onCancel={cancelQuestionEdit}
              onSave={saveQuestion}
            />
          ) : null}

          <QuestionList
            questions={questions}
            onEditQuestion={editQuestion}
            onDeleteQuestion={deleteQuestion}
          />
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md bg-muted">
          <p className="mb-4">Create a quiz for this lesson</p>
          <Button onClick={saveQuiz} disabled={!title}>
            Create Quiz
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizEditor;
