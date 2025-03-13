
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, ArrowRightCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TakeQuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<Date>(new Date());
  
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    if (!quizId) return;
    
    try {
      setLoading(true);
      
      // Fetch quiz info
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();
      
      if (quizError) throw quizError;
      
      setQuiz(quizData);
      
      // Fetch questions with options
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select(`
          id,
          question_text,
          question_type,
          points,
          options:quiz_question_options (
            id,
            option_text,
            is_correct,
            order_index
          )
        `)
        .eq('quiz_id', quizId)
        .order('order_index');
      
      if (questionsError) throw questionsError;
      
      // Sort options by order_index
      const processedQuestions = questionsData.map((q: any) => ({
        ...q,
        options: q.options.sort((a: any, b: any) => a.order_index - b.order_index)
      }));
      
      setQuestions(processedQuestions);
      setStartTime(new Date());
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/student/quizzes');
  };

  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quizId || !quiz) return;
    
    const confirm = window.confirm('Are you sure you want to submit your answers? You cannot change them after submission.');
    if (!confirm) return;
    
    try {
      setSubmitting(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      
      const userAnswers = [];
      
      for (const question of questions) {
        totalPoints += question.points;
        const selectedOptionId = answers[question.id];
        
        // Find if the selected option is correct
        const selectedOption = question.options.find((opt: any) => opt.id === selectedOptionId);
        const isCorrect = selectedOption?.is_correct || false;
        
        if (isCorrect) {
          correctAnswers += question.points;
        }
        
        userAnswers.push({
          question_id: question.id,
          selected_option_id: selectedOptionId,
          is_correct: isCorrect
        });
      }
      
      // Calculate final score as a percentage
      const finalScore = Math.round((correctAnswers / totalPoints) * 100);
      const hasPassed = finalScore >= quiz.pass_percent;
      
      setScore(finalScore);
      setPassed(hasPassed);
      
      // Create an attempt record
      const endTime = new Date();
      const timeSpentSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
      
      const { data: attemptData, error: attemptError } = await supabase
        .from('user_quiz_attempts')
        .insert({
          user_id: userData.user.id,
          quiz_id: quizId,
          score: finalScore,
          passed: hasPassed,
          started_at: startTime.toISOString(),
          completed_at: endTime.toISOString(),
          time_spent_seconds: timeSpentSeconds
        })
        .select('id')
        .single();
      
      if (attemptError) throw attemptError;
      
      // Record user answers
      if (attemptData) {
        const answersToInsert = userAnswers.map(answer => ({
          ...answer,
          attempt_id: attemptData.id
        }));
        
        const { error: answerError } = await supabase
          .from('user_quiz_answers')
          .insert(answersToInsert);
        
        if (answerError) throw answerError;
      }
      
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setStartTime(new Date());
  };

  const handleViewResults = () => {
    navigate('/student/quizzes');
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="container mx-auto p-4 md:p-8 space-y-6">
          <div className="text-center py-8">
            <p>Loading quiz...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <StudentLayout>
        <div className="container mx-auto p-4 md:p-8 space-y-6">
          <div className="text-center py-8">
            <h2 className="text-xl font-medium mb-4">Quiz not found</h2>
            <Button onClick={handleBack}>Back to Quizzes</Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptionId = answers[currentQuestion.id];
  const progress = (Object.keys(answers).length / questions.length) * 100;

  return (
    <StudentLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
          <h1 className="text-2xl font-semibold ml-4">{quiz.title}</h1>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Object.keys(answers).length} of {questions.length} questions answered</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardTitle>
              <Badge variant="outline">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-6">{currentQuestion.question_text}</p>
            
            <RadioGroup 
              value={selectedOptionId || ''} 
              onValueChange={(value) => handleSelectAnswer(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option: any) => (
                <div 
                  key={option.id} 
                  className="flex items-center space-x-2 p-3 rounded-md border mb-2 hover:bg-muted"
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label 
                    htmlFor={option.id} 
                    className="flex-grow cursor-pointer"
                  >
                    {option.option_text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <Button 
                onClick={handleNext}
                disabled={!selectedOptionId}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < questions.length || submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    Submit Quiz
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="flex flex-wrap gap-2">
          {questions.map((q, index) => (
            <Button
              key={q.id}
              variant={answers[q.id] ? "default" : "outline"}
              size="sm"
              className={`w-10 h-10 p-0 ${
                index === currentQuestionIndex ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>

        {/* Results Dialog */}
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                Quiz Results
              </DialogTitle>
              <DialogDescription className="text-center pt-4">
                {passed ? (
                  <div className="text-center mb-4">
                    <div className="inline-block p-4 bg-green-100 rounded-full mb-2">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-green-600">You Passed!</h2>
                    <p>Congratulations on passing the quiz.</p>
                  </div>
                ) : (
                  <div className="text-center mb-4">
                    <div className="inline-block p-4 bg-amber-100 rounded-full mb-2">
                      <AlertCircle className="h-8 w-8 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-bold text-amber-600">Not Passed</h2>
                    <p>You didn't meet the passing score this time.</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Your Score</p>
                    <p className="text-2xl font-bold">{score}%</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Passing Score</p>
                    <p className="text-2xl font-bold">{quiz.pass_percent}%</p>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center gap-2 flex flex-col sm:flex-row">
              <Button variant="outline" onClick={handleRetakeQuiz}>
                Retake Quiz
              </Button>
              <Button onClick={handleViewResults}>
                Return to Quizzes
                <ArrowRightCircle className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StudentLayout>
  );
};

export default TakeQuizPage;
