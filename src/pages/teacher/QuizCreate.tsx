
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';

const QuizCreate: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Error', {
        description: 'Title is required',
      });
      return;
    }

    try {
      setSaving(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error('Error', {
          description: 'You must be logged in to create a quiz',
        });
        navigate('/login');
        return;
      }

      // Create a quiz without lesson_id (standalone quiz)
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title,
          description,
          created_by: user.user.id,
          pass_percent: 70,
          is_published: false,
          lesson_id: null // Set as null for standalone quizzes
        })
        .select();

      if (error) throw error;

      toast.success('Quiz created', {
        description: 'Your quiz has been created successfully',
      });

      navigate(`/teacher/quiz/${data[0].id}/edit`);
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Error', {
        description: 'Failed to create quiz',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/teacher/quiz')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
            <h1 className="text-3xl font-bold">Create New Quiz</h1>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving || !title.trim()}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Quiz'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter quiz title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            After creating the quiz, you can add questions on the edit page.
          </p>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default QuizCreate;
