
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, MinusCircle, Trash, Save, Plus, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizEditorProps {
  lessonId: string;
}

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  pass_percent: number;
};

type Question = {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'matching' | 'fill_in_blank' | 'audio_response';
  points: number;
  order_index: number;
  options?: QuestionOption[];
};

type QuestionOption = {
  id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
};

const QuizEditor: React.FC<QuizEditorProps> = ({ lessonId }) => {
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
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizData();
  }, [lessonId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz for this lesson
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .single();
      
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
      toast('Error', {
        description: 'Failed to load quiz data',
        variant: 'destructive',
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
        
        toast('Quiz updated', {
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
        
        toast('Quiz created', {
          description: 'Your quiz has been successfully created',
        });
      }
      
      fetchQuizData(); // Reload quiz data
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast('Error', {
        description: 'Failed to save quiz',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    setCurrentQuestion({
      id: '',
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      order_index: questions.length,
      options: [
        { id: '', option_text: '', is_correct: true, order_index: 0 },
        { id: '', option_text: '', is_correct: false, order_index: 1 },
      ],
    });
    setAddingQuestion(true);
    setEditingQuestionId(null);
  };

  const editQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setEditingQuestionId(question.id);
    setAddingQuestion(true);
  };

  const cancelQuestionEdit = () => {
    setCurrentQuestion(null);
    setAddingQuestion(false);
    setEditingQuestionId(null);
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
      toast('Error', {
        description: 'A question must have at least 2 options',
        variant: 'destructive',
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
      setSaving(true);
      
      if (editingQuestionId) {
        // Update existing question
        const { error: questionError } = await supabase
          .from('quiz_questions')
          .update({
            question_text: currentQuestion.question_text,
            question_type: currentQuestion.question_type,
            points: currentQuestion.points,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingQuestionId);
        
        if (questionError) throw questionError;
        
        // Handle options: delete existing options and add new ones
        if (currentQuestion.options && currentQuestion.options.length > 0) {
          // Delete existing options
          const { error: deleteError } = await supabase
            .from('quiz_question_options')
            .delete()
            .eq('question_id', editingQuestionId);
          
          if (deleteError) throw deleteError;
          
          // Add new options
          const optionsToInsert = currentQuestion.options.map((option, index) => ({
            question_id: editingQuestionId,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: index,
          }));
          
          const { error: insertError } = await supabase
            .from('quiz_question_options')
            .insert(optionsToInsert);
          
          if (insertError) throw insertError;
        }
        
        toast('Question updated', {
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
        
        toast('Question added', {
          description: 'Your question has been successfully added to the quiz',
        });
      }
      
      // Reset and reload data
      setCurrentQuestion(null);
      setAddingQuestion(false);
      setEditingQuestionId(null);
      fetchQuizData();
      
    } catch (error) {
      console.error('Error saving question:', error);
      toast('Error', {
        description: 'Failed to save question',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
        
        toast('Question deleted', {
          description: 'The question has been successfully deleted',
        });
        
        fetchQuizData();
      } catch (error) {
        console.error('Error deleting question:', error);
        toast('Error', {
          description: 'Failed to delete question',
          variant: 'destructive',
        });
      }
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
      <div className="bg-muted p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Quiz Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="quiz-title">Quiz Title</Label>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pass-percent">Passing Percentage</Label>
            <Input
              id="pass-percent"
              type="number"
              min="1"
              max="100"
              value={passPercent}
              onChange={(e) => setPassPercent(parseInt(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
        <div className="mb-6">
          <Label htmlFor="quiz-description">Description (Optional)</Label>
          <Textarea
            id="quiz-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter quiz description"
            className="mt-1"
          />
        </div>
        <div className="flex items-center space-x-2 mb-6">
          <Switch
            id="published"
            checked={isPublished}
            onCheckedChange={setIsPublished}
          />
          <Label htmlFor="published">Publish Quiz</Label>
        </div>
        <Button onClick={saveQuiz} disabled={saving || !title} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Quiz Settings'}
        </Button>
      </div>

      {quiz ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Questions</h2>
            {!addingQuestion && (
              <Button onClick={addQuestion} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Question
              </Button>
            )}
          </div>

          {addingQuestion ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>
                  {editingQuestionId ? 'Edit Question' : 'Add New Question'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="question-text">Question Text</Label>
                    <Textarea
                      id="question-text"
                      value={currentQuestion?.question_text || ''}
                      onChange={(e) => handleQuestionChange('question_text', e.target.value)}
                      placeholder="Enter your question"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="question-type">Question Type</Label>
                      <Select
                        value={currentQuestion?.question_type || 'multiple_choice'}
                        onValueChange={(value) => handleQuestionChange('question_type', value)}
                      >
                        <SelectTrigger id="question-type" className="mt-1">
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="true_false">True/False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        min="1"
                        value={currentQuestion?.points || 1}
                        onChange={(e) => handleQuestionChange('points', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Answer Options</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Option
                      </Button>
                    </div>
                    
                    {currentQuestion?.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2 mb-3">
                        <div className="flex-grow">
                          <Input
                            value={option.option_text}
                            onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                            placeholder={`Option ${index + 1}`}
                          />
                        </div>
                        <Button
                          type="button"
                          variant={option.is_correct ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleOptionChange(index, 'is_correct', !option.is_correct)}
                          className="gap-1 min-w-24"
                        >
                          {option.is_correct ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Correct
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              Incorrect
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
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
                <Button variant="outline" onClick={cancelQuestionEdit}>
                  Cancel
                </Button>
                <Button
                  onClick={saveQuestion}
                  disabled={
                    saving ||
                    !currentQuestion?.question_text ||
                    !currentQuestion.options?.some(o => o.option_text.trim() !== '')
                  }
                >
                  {saving ? 'Saving...' : 'Save Question'}
                </Button>
              </div>
            </Card>
          ) : null}

          {questions.length === 0 ? (
            <div className="text-center py-12 border rounded-md bg-muted">
              <p className="text-muted-foreground">No questions added yet</p>
              <Button variant="outline" onClick={addQuestion} className="mt-4">
                Add your first question
              </Button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="mb-8">
              {questions.map((question, index) => (
                <AccordionItem key={question.id} value={question.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">Q{index + 1}.</span>
                      <span>{question.question_text}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-6 pr-2 pb-2">
                      <div className="mb-2">
                        <span className="text-sm font-medium">Type:</span>{' '}
                        <span className="text-sm capitalize">{question.question_type.replace('_', ' ')}</span>
                      </div>
                      <div className="mb-4">
                        <span className="text-sm font-medium">Points:</span>{' '}
                        <span className="text-sm">{question.points}</span>
                      </div>
                      
                      <div className="mb-4">
                        <span className="text-sm font-medium">Options:</span>
                        <ul className="mt-2 space-y-2">
                          {question.options?.map((option) => (
                            <li key={option.id} className="flex items-center">
                              <div className={`w-4 h-4 rounded-full mr-2 ${option.is_correct ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <span>{option.option_text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => editQuestion(question)} className="gap-1">
                          <PlusCircle className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestion(question.id)}
                          className="text-destructive gap-1"
                        >
                          <MinusCircle className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
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
