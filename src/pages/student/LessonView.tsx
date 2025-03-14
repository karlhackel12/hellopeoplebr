
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import LessonContentTab from '@/components/teacher/preview/LessonContentTab';
import { useLessonData } from './hooks/useLessonData';
import { useLessonProgress } from './hooks/useLessonProgress';
import { useAssignmentData } from './hooks/useAssignmentData';
import LessonHeader from './components/LessonHeader';
import LessonAssignmentCard from './components/LessonAssignmentCard';
import LessonCardTransition from '@/components/student/LessonCardTransition';
import ProgressTracker from '@/components/teacher/preview/ProgressTracker';

const LessonView: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { lesson, lessonLoading, quiz, quizQuestions } = useLessonData(lessonId);
  const { lessonProgress, updateProgress } = useLessonProgress(lessonId);
  const { assignment, updateAssignmentStatus } = useAssignmentData(lessonId);

  // Calculate number of sections for the progress tracker
  const calculateTotalSections = () => {
    if (!lesson?.content) return 0;
    
    // Count level 2 headings (## Text) as they represent sections
    const matches = lesson.content.match(/^## .+$/gm);
    return matches ? matches.length : 0;
  };

  useEffect(() => {
    if (lessonProgress?.completed_sections) {
      setCompletedSections(lessonProgress.completed_sections);
    } else {
      setCompletedSections([]);
    }
  }, [lessonProgress]);

  useEffect(() => {
    if (assignment && assignment.status === 'not_started') {
      updateAssignmentStatus(assignment.id, 'in_progress', false);
    }
  }, [assignment]);

  const handleSectionComplete = async (sectionId: string) => {
    let newCompletedSections: string[];
    
    if (completedSections.includes(sectionId)) {
      newCompletedSections = completedSections.filter(id => id !== sectionId);
    } else {
      newCompletedSections = [...completedSections, sectionId];
    }
    
    setCompletedSections(newCompletedSections);
    
    try {
      setIsUpdating(true);
      await updateProgress({ completed: false, sections: newCompletedSections });
    } catch (error) {
      console.error('Error updating section completion:', error);
      toast.error('Failed to update progress');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleMarkComplete = async () => {
    try {
      setIsUpdating(true);
      await updateProgress({ completed: true, sections: completedSections });
      
      if (assignment) {
        await updateAssignmentStatus(assignment.id, 'completed', true);
      }
      
      toast.success('Lesson marked as complete!');
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
      toast.error('Failed to mark lesson as complete');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBack = () => {
    navigate('/student/lessons');
  };
  
  if (lessonLoading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
        </div>
      </StudentLayout>
    );
  }
  
  if (!lesson) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <p className="text-muted-foreground mb-4">
            The lesson you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </StudentLayout>
    );
  }

  const totalSections = calculateTotalSections();

  return (
    <StudentLayout>
      <LessonCardTransition
        lessonId={lessonId || ''}
        title={lesson.title}
        isCard={false}
        className="space-y-6"
      >
        <div className="space-y-6">
          <LessonHeader 
            title={lesson.title}
            isCompleted={!!lessonProgress?.completed}
            onMarkComplete={handleMarkComplete}
            onBack={handleBack}
            isUpdating={isUpdating}
          />
          
          {assignment && (
            <LessonAssignmentCard 
              title={assignment.title}
              description={assignment.description}
              dueDate={assignment.due_date}
            />
          )}

          {totalSections > 0 && (
            <ProgressTracker 
              completedSections={completedSections} 
              totalSections={totalSections}
            />
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="content">
                <BookOpen className="h-4 w-4 mr-1" /> Lesson Content
              </TabsTrigger>
              <TabsTrigger value="quiz" disabled={!quiz || !quiz.is_published}>
                Quiz {!quiz && '(Not Available)'}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4">
              <LessonContentTab 
                content={lesson.content || 'No content available.'} 
                completedSections={completedSections}
                toggleSectionCompletion={handleSectionComplete}
              />
            </TabsContent>
            
            <TabsContent value="quiz" className="mt-4">
              {quiz ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                    {quiz.description && (
                      <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {quizQuestions && quizQuestions.length > 0 ? (
                      <div className="space-y-4">
                        <p>This quiz has {quizQuestions.length} questions</p>
                        <p>Passing score: {quiz.pass_percent}%</p>
                      </div>
                    ) : (
                      <p>No questions available for this quiz.</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No quiz available for this lesson.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </LessonCardTransition>
    </StudentLayout>
  );
};

export default LessonView;
