
import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, Save, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
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
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Question } from '@/components/teacher/quiz/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QuizTabProps {
  lessonId?: string;
  isEditMode: boolean;
}

const QuizTab: React.FC<QuizTabProps> = ({ lessonId, isEditMode }) => {
  const [numQuestions, setNumQuestions] = useState('5');
  const { generateQuiz, loading, fetchQuizQuestions } = useQuizHandler(lessonId || '');
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quizTitle, setQuizTitle] = useState('Lesson Quiz');
  const [existingQuiz, setExistingQuiz] = useState(false);

  // Check if quiz already exists
  useEffect(() => {
    if (lessonId) {
      const checkExistingQuiz = async () => {
        try {
          const { data, error } = await supabase
            .from('quizzes')
            .select('id, title')
            .eq('lesson_id', lessonId)
            .single();
          
          if (data) {
            setExistingQuiz(true);
            setQuizTitle(data.title);
            
            // Fetch existing questions
            const questions = await fetchQuizQuestions();
            if (questions) {
              setPreviewQuestions(questions);
              setShowPreview(true);
            }
          }
        } catch (error) {
          console.error("Error checking existing quiz:", error);
        }
      };
      
      checkExistingQuiz();
    }
  }, [lessonId]);

  const handleGenerateQuiz = async () => {
    try {
      setShowPreview(false);
      const result = await generateQuiz(parseInt(numQuestions));
      if (result) {
        // Fetch the newly generated questions
        const questions = await fetchQuizQuestions();
        if (questions) {
          setPreviewQuestions(questions);
          setShowPreview(true);
          toast.success('Quiz generated', {
            description: 'Your quiz questions have been generated. Review them below.',
          });
        }
      }
    } catch (error) {
      console.error("Error handling quiz generation:", error);
      toast.error('Generation failed', {
        description: 'Failed to generate quiz questions. Please try again.',
      });
    }
  };

  const saveQuiz = async () => {
    try {
      setSaving(true);
      
      // Create or update the quiz
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      if (existingQuiz) {
        // Update existing quiz title if changed
        const { error } = await supabase
          .from('quizzes')
          .update({ 
            title: quizTitle,
            updated_at: new Date().toISOString(),
          })
          .eq('lesson_id', lessonId);
          
        if (error) throw error;
        
        toast.success('Quiz updated', {
          description: 'Your quiz has been updated successfully',
        });
      } else {
        // Create new quiz
        const { error } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: lessonId,
            title: quizTitle,
            created_by: user.user.id,
            pass_percent: 70,
            is_published: false,
          });
          
        if (error) throw error;
        
        setExistingQuiz(true);
        toast.success('Quiz saved', {
          description: 'Your quiz has been saved successfully',
        });
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error('Save failed', {
        description: 'Failed to save quiz. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const discardQuiz = async () => {
    if (existingQuiz && window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        setSaving(true);
        
        // Delete the quiz questions first
        const { error: deleteQuestionsError } = await supabase
          .from('quiz_questions')
          .delete()
          .eq('quiz_id', lessonId);
          
        if (deleteQuestionsError) throw deleteQuestionsError;
        
        // Then delete the quiz
        const { error: deleteQuizError } = await supabase
          .from('quizzes')
          .delete()
          .eq('lesson_id', lessonId);
          
        if (deleteQuizError) throw deleteQuizError;
        
        setPreviewQuestions([]);
        setExistingQuiz(false);
        setShowPreview(false);
        
        toast.success('Quiz deleted', {
          description: 'Your quiz has been deleted successfully',
        });
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error('Delete failed', {
          description: 'Failed to delete quiz. Please try again.',
        });
      } finally {
        setSaving(false);
      }
    } else if (!existingQuiz) {
      // Just hide the preview for non-saved quizzes
      setShowPreview(false);
      setPreviewQuestions([]);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <>
      {isEditMode && lessonId ? (
        <div className="space-y-6">
          {/* AI Generation Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AI Quiz Generator</h3>
              <p className="text-sm text-muted-foreground">
                Create a quiz automatically by analyzing your lesson content using AI
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
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : existingQuiz ? (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Regenerate Quiz
                    </>
                  ) : (
                    'Generate Quiz'
                  )}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Quiz Preview Section */}
          {previewQuestions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Quiz Preview</CardTitle>
                    <CardDescription>
                      Review your AI-generated quiz before saving
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={togglePreview}
                    className="h-8 w-8 p-0"
                  >
                    {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              
              {showPreview && (
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {/* Quiz Title */}
                      <div>
                        <Label htmlFor="quiz-title">Quiz Title</Label>
                        <input
                          id="quiz-title"
                          className="w-full p-2 border rounded mt-1"
                          value={quizTitle}
                          onChange={(e) => setQuizTitle(e.target.value)}
                        />
                      </div>
                      
                      {/* Questions Preview */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Questions ({previewQuestions.length})</h4>
                        {previewQuestions.map((question, index) => (
                          <div key={question.id} className="border rounded-lg p-4">
                            <div className="flex justify-between">
                              <h5 className="font-medium">Question {index + 1}</h5>
                              <span className="text-sm text-muted-foreground">
                                {question.points} {question.points === 1 ? 'point' : 'points'}
                              </span>
                            </div>
                            <p className="my-2">{question.question_text}</p>
                            
                            {question.options && (
                              <ul className="space-y-2 mt-3">
                                {question.options.map((option) => (
                                  <li 
                                    key={option.id} 
                                    className={`p-2 rounded ${option.is_correct ? 'bg-green-50 border-green-200 border' : 'bg-gray-50 border-gray-200 border'}`}
                                  >
                                    {option.option_text}
                                    {option.is_correct && (
                                      <span className="ml-2 text-xs text-green-600 font-medium">✓ Correct</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={discardQuiz}
                        disabled={saving}
                      >
                        {existingQuiz ? 'Delete Quiz' : 'Discard'}
                      </Button>
                      <Button 
                        onClick={saveQuiz}
                        disabled={saving}
                        className="gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            {existingQuiz ? 'Update Quiz' : 'Save Quiz'} 
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
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
