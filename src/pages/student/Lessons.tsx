
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Play, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LessonsList: React.FC = () => {
  // Mock lesson data for demonstration
  const mockLessons = [
    {
      id: '1',
      title: 'Present Simple Tense',
      description: 'Learn the basics of present simple tense in English',
      status: 'available' as const,
      progress: 0
    },
    {
      id: '2', 
      title: 'Past Simple Tense',
      description: 'Understanding past simple tense and irregular verbs',
      status: 'locked' as const,
      progress: 0
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Minhas Lições</h1>
        <p className="text-muted-foreground">
          Complete as lições para progredir no seu aprendizado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockLessons.map((lesson) => (
          <Card key={lesson.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{lesson.title}</CardTitle>
                {lesson.status === 'locked' ? (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <BookOpen className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {lesson.description}
              </p>
              
              {lesson.progress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso</span>
                    <span>{lesson.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${lesson.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {lesson.status === 'available' ? (
                <Link to={`/student/lessons/view/${lesson.id}`}>
                  <Button className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    {lesson.progress > 0 ? 'Continuar' : 'Começar'}
                  </Button>
                </Link>
              ) : (
                <Button disabled className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  Bloqueado
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {mockLessons.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma lição disponível</h3>
            <p className="text-muted-foreground">
              Aguarde enquanto seu professor atribui lições para você.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LessonsList;
