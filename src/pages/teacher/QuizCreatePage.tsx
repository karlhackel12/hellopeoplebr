
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import QuizGenerationForm from '@/components/teacher/quiz/QuizGenerationForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const QuizCreatePage: React.FC = () => {
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerateQuiz = async (formData: any) => {
    try {
      setGenerating(true);
      
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('Authentication error');
        return;
      }
      
      // Call the quiz generation edge function
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          topic: formData.topic,
          difficulty: formData.difficulty,
          numQuestions: formData.numQuestions,
          additionalInstructions: formData.instructions
        }
      });
      
      if (error) throw error;
      
      if (!data || !data.questions || data.questions.length === 0) {
        throw new Error('Failed to generate quiz questions');
      }
      
      // Create a new quiz record
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: formData.title,
          description: formData.description,
          pass_percent: formData.passPercent,
          created_by: userData.user.id,
          is_published: false,
        })
        .select('id')
        .single();
      
      if (quizError) throw quizError;
      
      // Add all the generated questions to the database
      const questionsWithQuizId = data.questions.map((question: any, index: number) => ({
        quiz_id: quiz.id,
        question_text: question.text,
        question_type: question.type || 'multiple_choice',
        points: question.points || 1,
        order_index: index,
      }));
      
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsWithQuizId)
        .select('id, order_index');
      
      if (questionsError) throw questionsError;
      
      // Now add all the options for each question
      const allOptions = [];
      
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        const questionDbId = questionsData[i].id;
        
        const optionsForQuestion = question.options.map((option: any, optIndex: number) => ({
          question_id: questionDbId,
          option_text: option.text,
          is_correct: option.isCorrect,
          order_index: optIndex,
        }));
        
        allOptions.push(...optionsForQuestion);
      }
      
      const { error: optionsError } = await supabase
        .from('quiz_question_options')
        .insert(allOptions);
      
      if (optionsError) throw optionsError;
      
      toast.success('Quiz generated', {
        description: 'Your quiz has been successfully created. You can now edit it or publish it.'
      });
      
      // Navigate to edit page
      navigate(`/teacher/quizzes/edit/${quiz.id}`);
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz', {
        description: 'Please try again or adjust your generation parameters'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleBack = () => {
    navigate('/teacher/quizzes');
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
          <h1 className="text-2xl font-semibold">Create New Quiz</h1>
        </div>

        <QuizGenerationForm 
          onSubmit={handleGenerateQuiz} 
          isGenerating={generating} 
        />
      </div>
    </TeacherLayout>
  );
};

export default QuizCreatePage;
