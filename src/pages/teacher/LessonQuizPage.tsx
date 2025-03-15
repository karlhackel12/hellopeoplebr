
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import QuizEditor from '@/components/teacher/QuizEditor';

const LessonQuizPage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/teacher/lessons/preview/${lessonId}`);
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lesson
          </Button>
          <h1 className="text-2xl font-semibold">Lesson Quiz</h1>
        </div>

        {lessonId && <QuizEditor lessonId={lessonId} />}
      </div>
    </TeacherLayout>
  );
};

export default LessonQuizPage;
