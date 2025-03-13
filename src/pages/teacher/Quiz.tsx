
import React from 'react';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TeacherQuiz: React.FC = () => {
  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Quizzes</h1>
            <p className="text-muted-foreground mt-1">Manage your quizzes and assessments</p>
          </div>
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Quiz
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Library</CardTitle>
              <CardDescription>
                Create and manage quizzes to assess student understanding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No quizzes created yet</h3>
                <p className="text-muted-foreground mb-6">Get started by creating your first quiz</p>
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create New Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherQuiz;
