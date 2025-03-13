
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { useLessonForm } from './lesson-editor/useLessonForm';
import LessonFormHeader from './lesson-editor/LessonFormHeader';
import LessonFormBasicFields from './lesson-editor/LessonFormBasicFields';
import LessonContentTabs from './lesson-editor/LessonContentTabs';
import LessonSaveButton from './lesson-editor/LessonSaveButton';
import { Button } from '@/components/ui/button';
import { BookText } from 'lucide-react';

const LessonEditor: React.FC = () => {
  const navigate = useNavigate();
  const { form, onSubmit, loading, saving, isEditMode, id } = useLessonForm();

  const handleBack = () => {
    navigate('/teacher/lessons');
  };

  const handleQuizClick = () => {
    navigate(`/teacher/lessons/${id}/quiz`);
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="container mx-auto p-8 flex justify-center">
          <p>Loading lesson...</p>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <LessonFormHeader 
            isEditMode={isEditMode}
            saving={saving}
            onBackClick={handleBack}
          />
          {isEditMode && id && (
            <Button 
              onClick={handleQuizClick}
              className="gap-2"
            >
              <BookText className="h-4 w-4" />
              Quiz
            </Button>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <LessonFormBasicFields form={form} />
            
            <LessonContentTabs 
              form={form}
              lessonId={id}
              isEditMode={isEditMode}
            />
              
            <LessonSaveButton saving={saving} />
          </form>
        </Form>
      </div>
    </TeacherLayout>
  );
};

export default LessonEditor;
