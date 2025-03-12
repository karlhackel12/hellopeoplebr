
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { useLessonForm } from './lesson-editor/useLessonForm';
import LessonEditorLayout from './lesson-editor/LessonEditorLayout';

const LessonEditor: React.FC = () => {
  const navigate = useNavigate();
  const { form, onSubmit, loading, saving, isEditMode, id } = useLessonForm();

  const handleBack = () => {
    navigate('/teacher/lessons');
  };

  return (
    <TeacherLayout>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <LessonEditorLayout
            form={form}
            isEditMode={isEditMode}
            loading={loading}
            saving={saving}
            onBack={handleBack}
          />
        </form>
      </Form>
    </TeacherLayout>
  );
};

export default LessonEditor;
