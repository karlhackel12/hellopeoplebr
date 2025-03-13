
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import QuizSettings from '@/components/teacher/quiz/QuizSettings';
import QuestionList from '@/components/teacher/quiz/QuestionList';
import QuestionForm from '@/components/teacher/quiz/QuestionForm';
import { Question } from '@/components/teacher/quiz/types';

const QuizEditPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  
  // Quiz state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passPercent, setPassPercent] = useState(70);
  const [isPublished, setIsPublished] = useState(false);
  
  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      
      // Fetch quiz basic info
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();
      
      if (quizError) throw quizError;
      
      setTitle(quiz.title);
      setDescription(quiz.description || '');
      setPassPercent(quiz.pass_percent);
      setIsPublished(quiz.is_published);
      
      // Fetch questions
      const { data: questionData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          options:quiz_question_options(*)
        `)
        .eq('quiz_id', quizId)
        .order('order_index');
      
      if (questionsError) throw questionsError;
      
      setQuestions(questionData || []);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      toast.error('Failed to load quiz data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!quizId) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('quizzes')
        .update({
          title,
          description,
          pass_percent: passPercent,
          is_published: isPublished,
          updated_at: new Date().toISOString()
        })
        .eq('id', quizId);
      
      if (error) throw error;
      
      toast.success('Quiz saved successfully');
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast.error('Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    setCurrentQuestion({
      id: '',
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      order_index: questions.length,
      options: [
        { id: 'new-1', option_text: '', is_correct: false, order_index: 0 },
        { id: 'new-2', option_text: '', is_correct: false, order_index: 1 }
      ]
    });
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion({ ...question });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!quizId) return;
    
    const confirm = window.confirm('Are you sure you want to delete this question?');
    if (!confirm) return;
    
    try {
      // Delete the question options first (CASCADE constraints might handle this automatically)
      await supabase
        .from('quiz_question_options')
        .delete()
        .eq('question_id', questionId);
      
      // Delete the question
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', questionId);
      
      if (error) throw error;
      
      // Update local state
      setQuestions(questions.filter(q => q.id !== questionId));
      
      toast.success('Question deleted');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleQuestionChange = (field: string, value: any) => {
    if (!currentQuestion) return;
    setCurrentQuestion({ ...currentQuestion, [field]: value });
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    if (!currentQuestion || !currentQuestion.options) return;
    
    const newOptions = [...currentQuestion.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    // If making this option correct for multiple choice, make others incorrect
    if (field === 'is_correct' && value === true && currentQuestion.question_type === 'multiple_choice') {
      newOptions.forEach((option, idx) => {
        if (idx !== index) {
          newOptions[idx] = { ...option, is_correct: false };
        }
      });
    }
    
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleAddOption = () => {
    if (!currentQuestion || !currentQuestion.options) return;
    
    const newOptions = [...currentQuestion.options];
    newOptions.push({ 
      id: `new-${Date.now()}`, 
      option_text: '', 
      is_correct: false, 
      order_index: newOptions.length 
    });
    
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (!currentQuestion || !currentQuestion.options) return;
    if (currentQuestion.options.length <= 2) {
      toast.error('Questions must have at least two options');
      return;
    }
    
    const newOptions = [...currentQuestion.options];
    newOptions.splice(index, 1);
    
    // Renumber the order_index values
    newOptions.forEach((option, idx) => {
      newOptions[idx] = { ...option, order_index: idx };
    });
    
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleSaveQuestion = async () => {
    if (!quizId || !currentQuestion) return;
    
    try {
      setSaving(true);
      
      if (currentQuestion.id) {
        // Update existing question
        const { error } = await supabase
          .from('quiz_questions')
          .update({
            question_text: currentQuestion.question_text,
            question_type: currentQuestion.question_type,
            points: currentQuestion.points,
          })
          .eq('id', currentQuestion.id);
        
        if (error) throw error;
        
        // Update/delete/insert options
        if (currentQuestion.options) {
          // Delete existing options first
          await supabase
            .from('quiz_question_options')
            .delete()
            .eq('question_id', currentQuestion.id);
          
          // Insert new options
          const newOptions = currentQuestion.options.map((option, index) => ({
            question_id: currentQuestion.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: index,
          }));
          
          const { error: optionsError } = await supabase
            .from('quiz_question_options')
            .insert(newOptions);
          
          if (optionsError) throw optionsError;
        }
      } else {
        // Create new question
        const { data: newQuestion, error } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quizId,
            question_text: currentQuestion.question_text,
            question_type: currentQuestion.question_type,
            points: currentQuestion.points,
            order_index: questions.length,
          })
          .select('id')
          .single();
        
        if (error) throw error;
        
        // Insert options
        if (currentQuestion.options && newQuestion) {
          const newOptions = currentQuestion.options.map((option, index) => ({
            question_id: newQuestion.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: index,
          }));
          
          const { error: optionsError } = await supabase
            .from('quiz_question_options')
            .insert(newOptions);
          
          if (optionsError) throw optionsError;
        }
      }
      
      // Refresh questions
      fetchQuizData();
      setCurrentQuestion(null);
      toast.success('Question saved successfully');
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/teacher/quizzes');
  };

  const handleCancel = () => {
    setCurrentQuestion(null);
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="container mx-auto p-4 md:p-8 space-y-6">
          <div className="text-center py-8">
            <p>Loading quiz data...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
          <h1 className="text-2xl font-semibold">Edit Quiz</h1>
          <div className="ml-auto">
            <Button onClick={handleSaveQuiz} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Quiz'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-6 mt-6">
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
              onSave={handleSaveQuiz}
            />
          </TabsContent>
          
          <TabsContent value="questions" className="space-y-6 mt-6">
            {currentQuestion ? (
              <QuestionForm
                currentQuestion={currentQuestion}
                saving={saving}
                onQuestionChange={handleQuestionChange}
                onOptionChange={handleOptionChange}
                onAddOption={handleAddOption}
                onRemoveOption={handleRemoveOption}
                onCancel={handleCancel}
                onSave={handleSaveQuestion}
              />
            ) : (
              <div className="flex justify-end mb-4">
                <Button onClick={handleAddQuestion}>Add Question</Button>
              </div>
            )}
            
            {!currentQuestion && (
              <QuestionList
                questions={questions}
                onEditQuestion={handleEditQuestion}
                onDeleteQuestion={handleDeleteQuestion}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TeacherLayout>
  );
};

export default QuizEditPage;
