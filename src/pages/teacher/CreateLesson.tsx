
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LessonGenerator from '@/components/teacher/lesson/LessonGenerator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CreateLesson: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [lessonData, setLessonData] = useState<any>(null);
  
  const handleBack = () => {
    navigate('/teacher/lessons');
  };

  const handleSaveLesson = async (lessonData: {
    title: string;
    content: string;
    structured_content?: any;
    quiz_questions?: any[];
    publish?: boolean;
  }) => {
    try {
      setSaving(true);
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("Not authenticated");
      }

      // Insert lesson
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          title: lessonData.title,
          content: lessonData.content,
          structured_content: lessonData.structured_content || null,
          created_by: userData.user.id,
          is_published: lessonData.publish || false
        })
        .select()
        .single();

      if (lessonError) throw lessonError;
      
      // Create quiz if questions exist
      if (lessonData.quiz_questions && lessonData.quiz_questions.length > 0) {
        const { data: quiz, error: quizError } = await supabase
          .from('quizzes')
          .insert({
            lesson_id: lesson.id,
            title: `${lessonData.title} Quiz`,
            created_by: userData.user.id,
            is_published: lessonData.publish || false
          })
          .select()
          .single();
        
        if (quizError) throw quizError;
        
        // Insert quiz questions
        for (let i = 0; i < lessonData.quiz_questions.length; i++) {
          const question = lessonData.quiz_questions[i];
          
          // Insert question
          const { data: questionData, error: questionError } = await supabase
            .from('quiz_questions')
            .insert({
              quiz_id: quiz.id,
              question_text: question.question_text,
              question_type: 'multiple_choice',
              points: 1,
              order_index: i
            })
            .select()
            .single();
            
          if (questionError) throw questionError;
          
          // Insert options
          const optionsToInsert = question.options.map((option: any, index: number) => ({
            question_id: questionData.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: index
          }));
          
          const { error: optionsError } = await supabase
            .from('quiz_question_options')
            .insert(optionsToInsert);
            
          if (optionsError) throw optionsError;
        }
      }
      
      toast.success(lessonData.publish ? 'Lesson published successfully!' : 'Lesson created successfully!');
      navigate(`/teacher/lessons/preview/${lesson.id}`);
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast.error('Failed to save lesson', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={handleBack} className="mb-2 p-0 -ml-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to lessons
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">Create New Lesson</h1>
            <p className="text-muted-foreground mt-1">
              Create a new English language lesson with AI assistance
            </p>
          </div>
        </div>
        
        <Card className="w-full border border-border/40 shadow-sm">
          <CardContent className="p-6">
            <LessonGenerator onSave={handleSaveLesson} isSaving={saving} />
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
};

export default CreateLesson;
