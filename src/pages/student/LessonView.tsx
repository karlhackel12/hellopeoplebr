
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CheckCircle, ArrowLeft, Clock, ChevronDown, ChevronUp, CheckIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import LessonContentTab from '@/components/teacher/preview/LessonContentTab';

const LessonView: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('content');
  
  // Track sections that have been read
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  
  // Function to extract headers from the lesson content
  const extractSections = (content: string) => {
    const headers: { id: string; text: string; level: number }[] = [];
    const regex = /^(#{1,3})\s+(.+)$/gm;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/[^\w]+/g, '-');
      headers.push({ id, text, level });
    }
    
    return headers.filter(header => header.level === 2); // Only return H2 sections
  };

  // Fetch lesson data
  const { data: lesson, isLoading: lessonLoading } = useQuery({
    queryKey: ['student-lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId
  });
  
  // Fetch quiz for the lesson
  const { data: quiz } = useQuery({
    queryKey: ['student-lesson-quiz', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id, 
          title, 
          description,
          pass_percent,
          is_published
        `)
        .eq('lesson_id', lessonId)
        .eq('is_published', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data;
    },
    enabled: !!lessonId
  });
  
  // Fetch quiz questions if a quiz exists
  const { data: quizQuestions } = useQuery({
    queryKey: ['student-quiz-questions', quiz?.id],
    queryFn: async () => {
      if (!quiz?.id) throw new Error('Quiz ID is required');
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select(`
          id,
          question_text,
          question_type,
          points,
          options:quiz_question_options (
            id,
            option_text
          )
        `)
        .eq('quiz_id', quiz.id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!quiz?.id
  });
  
  // Fetch user's progress for this lesson
  const { data: lessonProgress } = useQuery({
    queryKey: ['student-lesson-progress', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!lessonId
  });
  
  // Get assignment related to this lesson
  const { data: assignment } = useQuery({
    queryKey: ['student-lesson-assignment', lessonId],
    queryFn: async () => {
      if (!lessonId) throw new Error('Lesson ID is required');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('student_assignments')
        .select('id, status, title, description, due_date')
        .eq('lesson_id', lessonId)
        .eq('student_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!lessonId
  });
  
  // Update lesson progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ completed }: { completed: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      if (lessonProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('user_lesson_progress')
          .update({
            completed,
            completed_at: completed ? new Date().toISOString() : null,
            last_accessed_at: new Date().toISOString()
          })
          .eq('id', lessonProgress.id);
        
        if (error) throw error;
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_lesson_progress')
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            completed,
            completed_at: completed ? new Date().toISOString() : null
          });
        
        if (error) throw error;
      }
      
      // Update assignment status if it exists
      if (assignment) {
        const { error } = await supabase
          .from('student_assignments')
          .update({
            status: completed ? 'completed' : 'in_progress',
            completed_at: completed ? new Date().toISOString() : null,
            started_at: new Date().toISOString()
          })
          .eq('id', assignment.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-lesson-progress'] });
      queryClient.invalidateQueries({ queryKey: ['student-lesson-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
    }
  });
  
  // Mark lesson as started when viewing it
  useEffect(() => {
    const markAsStarted = async () => {
      // Only update if the lesson is not completed and there's an assignment
      if (assignment && assignment.status === 'not_started') {
        try {
          await supabase
            .from('student_assignments')
            .update({
              status: 'in_progress',
              started_at: new Date().toISOString()
            })
            .eq('id', assignment.id);
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['student-lesson-assignment'] });
          queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
        } catch (error) {
          console.error('Error marking lesson as started:', error);
        }
      }
    };
    
    if (assignment) {
      markAsStarted();
    }
  }, [assignment, queryClient]);
  
  useEffect(() => {
    // Initialize completed sections from saved progress if available
    if (lessonProgress?.completed_sections && Array.isArray(lessonProgress.completed_sections)) {
      setCompletedSections(lessonProgress.completed_sections);
    }
  }, [lessonProgress]);

  const sections = lesson?.content ? extractSections(lesson.content) : [];
  
  const handleSectionComplete = (sectionId: string) => {
    let newCompletedSections: string[];
    
    if (completedSections.includes(sectionId)) {
      newCompletedSections = completedSections.filter(id => id !== sectionId);
    } else {
      newCompletedSections = [...completedSections, sectionId];
    }
    
    setCompletedSections(newCompletedSections);
    
    // Save progress to database
    if (lessonProgress) {
      supabase
        .from('user_lesson_progress')
        .update({
          completed_sections: newCompletedSections,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', lessonProgress.id)
        .then(({ error }) => {
          if (error) console.error('Error saving section progress:', error);
        });
    }
    
    // If all sections are complete, mark lesson as complete
    if (sections.length > 0 && newCompletedSections.length === sections.length) {
      handleMarkComplete();
    }
  };
  
  const handleMarkComplete = () => {
    try {
      updateProgressMutation.mutate({ completed: true });
      toast.success('Lesson marked as complete!');
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
      toast.error('Failed to mark lesson as complete');
    }
  };
  
  if (lessonLoading) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          </div>
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
          <Button onClick={() => navigate('/student/lessons')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lessons
          </Button>
        </div>
      </StudentLayout>
    );
  }
  
  const lessonCompletionPercentage = sections.length > 0 
    ? Math.round((completedSections.length / sections.length) * 100) 
    : 0;
  
  const isLessonCompleted = lessonProgress?.completed;
  
  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/student/lessons')}
              className="mb-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Lessons
            </Button>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {isLessonCompleted ? (
              <div className="flex items-center text-green-600 px-3 py-1 rounded-md bg-green-50">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Completed</span>
              </div>
            ) : (
              <Button 
                onClick={handleMarkComplete}
                disabled={updateProgressMutation.isPending}
              >
                Mark as Complete
              </Button>
            )}
          </div>
        </div>
        
        {assignment && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{assignment.title}</h3>
                  {assignment.description && (
                    <p className="text-sm text-muted-foreground">{assignment.description}</p>
                  )}
                </div>
                
                {assignment.due_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {sections.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Progress</CardTitle>
                <div className="text-sm font-medium">
                  {completedSections.length} of {sections.length} sections
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress 
                  value={lessonCompletionPercentage} 
                  className="h-2" 
                  indicatorClassName={
                    lessonCompletionPercentage < 30 ? "bg-red-500" :
                    lessonCompletionPercentage < 70 ? "bg-amber-500" : 
                    "bg-green-500"
                  }
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {sections.map((section) => (
                    <Button 
                      key={section.id}
                      variant={completedSections.includes(section.text) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        document.getElementById(section.id)?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }}
                      className={completedSections.includes(section.text) ? "bg-primary" : ""}
                    >
                      {completedSections.includes(section.text) && (
                        <CheckIcon className="mr-1 h-3 w-3" />
                      )}
                      <span className="truncate max-w-[150px]">{section.text}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
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
                      <Button onClick={() => navigate(`/student/quizzes/take/${quiz.id}`)}>
                        Start Quiz
                      </Button>
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
    </StudentLayout>
  );
};

export default LessonView;
