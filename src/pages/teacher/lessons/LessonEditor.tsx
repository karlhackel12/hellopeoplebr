
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import TeacherLayout from '@/components/layout/TeacherLayout';
import LessonTypeSelector from '@/components/teacher/lessons/LessonTypeSelector';
import { useLessonForm } from '@/components/teacher/lessons/useLessonForm';
import LessonFormHeader from '@/components/teacher/lessons/LessonFormHeader';
import LessonFormBasicFields from '@/components/teacher/lessons/LessonFormBasicFields';
import LessonContentTabs from '@/components/teacher/lessons/LessonContentTabs';
import LessonSaveButton from '@/components/teacher/lessons/LessonSaveButton';
import { Button } from '@/components/ui/button';
import { BookText } from 'lucide-react';

const LessonEditor: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const isEditMode = !!lessonId;
  const id = lessonId || '';
  
  const { form, onSubmit, loading, saving } = useLessonForm(id, isEditMode);
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
              <BookText className="h-4 w-4" />
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
