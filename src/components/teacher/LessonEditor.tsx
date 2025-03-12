import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import TeacherLayout from '@/components/layout/TeacherLayout';
import LessonTypeSelector from './LessonTypeSelector';
import { useLessonForm } from './lesson-editor/useLessonForm';
import LessonFormHeader from './lesson-editor/LessonFormHeader';
import LessonFormBasicFields from './lesson-editor/LessonFormBasicFields';
import LessonContentTabs from './lesson-editor/LessonContentTabs';
import LessonSaveButton from './lesson-editor/LessonSaveButton';
import { Button } from '@/components/ui/button';
import { BookQuestion } from 'lucide-react';

const LessonEditor: React.FC = () => {
  const navigate = useNavigate();
  const { form, onSubmit, loading, saving, isEditMode, id } = useLessonForm();
  const [lessonType, setLessonType] = useState<'manual' | 'ai'>('manual');

  useEffect(() => {
    const contentSource = form.watch('contentSource');
    if (contentSource === 'ai_generated' || contentSource === 'mixed') {
      setLessonType('ai');
    } else {
      setLessonType('manual');
    }
  }, [form.watch('contentSource')]);

  const handleLessonTypeChange = (type: 'manual' | 'ai') => {
    setLessonType(type);
    
    if (type === 'manual') {
      form.setValue('contentSource', 'manual');
    }
  };

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
              <BookQuestion className="h-4 w-4" />
              Quiz
            </Button>
          )}
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <LessonFormBasicFields form={form} />
            
            {!isEditMode && (
              <div className="mt-6">
                <h2 className="text-lg font-medium mb-4">How would you like to create this lesson?</h2>
                <LessonTypeSelector 
                  selectedType={lessonType} 
                  onSelectType={handleLessonTypeChange} 
                />
              </div>
            )}
              
            <LessonContentTabs 
              form={form}
              lessonId={id}
              isEditMode={isEditMode}
              lessonType={lessonType}
            />
              
            <LessonSaveButton saving={saving} />
          </form>
        </Form>
      </div>
    </TeacherLayout>
  );
};

export default LessonEditor;
