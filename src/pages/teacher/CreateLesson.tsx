
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CreateLesson: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleBack = () => {
    navigate('/teacher/lessons');
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
              Create a new English language lesson
            </p>
          </div>
        </div>
        
        <Card className="w-full border border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Lesson Creation</CardTitle>
            <CardDescription>
              Create new English lessons for your students
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Construction className="h-16 w-16 text-muted-foreground mb-6 opacity-70" />
              <h2 className="text-2xl font-bold mb-4">We're Building This Feature</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                The lesson creation feature is currently under development. Soon, you'll be able to create 
                engaging English lessons for your students here.
              </p>
              <Button onClick={handleBack}>
                Return to Lessons
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
};

export default CreateLesson;
