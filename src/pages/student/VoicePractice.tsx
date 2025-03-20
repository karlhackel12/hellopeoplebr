
import React, { useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { useVoicePractice } from './hooks/useVoicePractice';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Mic, Play, History, Activity, Settings, Brain, Users, Timer, Volume2, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useStudentStreak } from './hooks/useStudentStreak';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useStudentAssignments } from './hooks/useStudentAssignments';

const VoicePractice: React.FC = () => {
  const navigate = useNavigate();
  const { 
    sessions, 
    stats, 
    requiredSessions,
    assignedLessonsWithoutSessions,
    isLoading, 
    createSession 
  } = useVoicePractice();
  
  const { dueAssignments, isLoading: isLoadingAssignments } = useStudentAssignments();
  const { streak } = useStudentStreak();
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState('General Conversation');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  const startQuickSession = async () => {
    try {
      setIsCreatingSession(true);
      const session = await createSession({
        topic: selectedTopic,
        difficultyLevel: selectedDifficulty
      });
      
      toast.success("Session created! Starting practice...");
      navigate(`/student/voice-practice/session/${session.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create practice session");
    } finally {
      setIsCreatingSession(false);
    }
  };
  
  const startAssignedSession = async (lessonId: string, title: string, assignmentId?: string) => {
    try {
      setIsCreatingSession(true);
      const session = await createSession({
        lessonId,
        topic: title,
        difficultyLevel: 1,
        assignmentId
      });
      
      toast.success("Session created! Starting practice...");
      navigate(`/student/voice-practice/session/${session.id}`);
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Failed to create practice session");
    } finally {
      setIsCreatingSession(false);
    }
  };
  
  const difficultyLabels = {
    1: 'Beginner',
    2: 'Intermediate',
    3: 'Advanced'
  };
  
  const topics = [
    'General Conversation',
    'Daily Life',
    'Work & Business',
    'Travel & Leisure',
    'Health & Wellness',
    'Technology',
    'Arts & Culture',
    'Education',
    'Current Events',
    'Environment'
  ];

  // Group sessions by lesson for better organization
  const sessionsByLesson = sessions?.reduce((acc: Record<string, any[]>, session) => {
    const lessonId = session.lesson_id || 'no-lesson';
    if (!acc[lessonId]) {
      acc[lessonId] = [];
    }
    acc[lessonId].push(session);
    return acc;
  }, {}) || {};

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Volume2 className="h-6 w-6 text-orange-500" /> Voice Practice
          </h1>
          {!isLoading && (
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1 text-sm">
              <Activity className="h-3.5 w-3.5 text-orange-500" />
              <span>{stats.completedSessions} completed sessions</span>
            </Badge>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-orange-200 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-400 text-white">
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" /> Quick Practice
              </CardTitle>
              <CardDescription className="text-white text-opacity-80">
                Start a conversation practice session right now
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Choose a topic:</h3>
                <select 
                  className="w-full p-2 border rounded-md bg-background" 
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                >
                  {topics.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Difficulty level:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(level => (
                    <Button
                      key={level}
                      variant={selectedDifficulty === level ? "default" : "outline"}
                      className={selectedDifficulty === level ? "bg-orange-500 hover:bg-orange-600" : ""}
                      onClick={() => setSelectedDifficulty(level)}
                    >
                      {difficultyLabels[level as keyof typeof difficultyLabels]}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t">
              <Button 
                onClick={startQuickSession}
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={isCreatingSession}
              >
                {isCreatingSession ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span> Creating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" /> Start Conversation
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-2 border-orange-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-400 text-white">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" /> Your Voice Stats
              </CardTitle>
              <CardDescription className="text-white text-opacity-80">
                Track your speaking practice progress
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                    <History className="h-5 w-5 text-orange-500 mb-1" />
                    <div className="text-lg font-bold">{sessions?.length || 0}</div>
                    <div className="text-xs text-muted-foreground text-center">Total Sessions</div>
                  </div>
                  
                  <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                    <Timer className="h-5 w-5 text-orange-500 mb-1" />
                    <div className="text-lg font-bold">
                      {stats.averageDuration ? Math.round(stats.averageDuration / 60) : 0}m
                    </div>
                    <div className="text-xs text-muted-foreground text-center">Avg Duration</div>
                  </div>
                  
                  <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                    <Brain className="h-5 w-5 text-orange-500 mb-1" />
                    <div className="text-lg font-bold">{stats.highestDifficulty}</div>
                    <div className="text-xs text-muted-foreground text-center">Highest Level</div>
                  </div>
                  
                  <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                    <Users className="h-5 w-5 text-orange-500 mb-1" />
                    <div className="text-lg font-bold">{streak?.streakCount || 0}</div>
                    <div className="text-xs text-muted-foreground text-center">Day Streak</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-4">
            <TabsTrigger value="assigned">Assigned Practice</TabsTrigger>
            <TabsTrigger value="lesson">Lesson Practice</TabsTrigger>
            <TabsTrigger value="history">Practice History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assigned" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : requiredSessions.length === 0 && assignedLessonsWithoutSessions.length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="flex flex-col items-center justify-center text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Assigned Practice</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    You don't have any assigned conversation practice sessions. 
                    Use the Quick Practice to start a conversation on any topic.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {requiredSessions.map(session => (
                  <Card key={session.id} className="overflow-hidden">
                    <div className="bg-orange-50 px-4 py-3 border-b flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-sm">Required Practice</span>
                      </div>
                      <Badge variant="outline" className="bg-orange-100">
                        In Progress
                      </Badge>
                    </div>
                    <CardContent className="py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{session.topic}</h4>
                          <p className="text-sm text-muted-foreground">
                            {session.lesson?.title || 'General conversation practice'}
                          </p>
                        </div>
                        <Button 
                          className="bg-orange-500 hover:bg-orange-600"
                          onClick={() => navigate(`/student/voice-practice/session/${session.id}`)}
                        >
                          <Play className="mr-2 h-4 w-4" /> Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {assignedLessonsWithoutSessions.map(assignment => (
                  <Card key={assignment.id} className="overflow-hidden">
                    <div className="bg-orange-50 px-4 py-3 border-b flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-sm">Required Practice</span>
                      </div>
                      <Badge variant="outline" className="bg-orange-100">
                        Not Started
                      </Badge>
                    </div>
                    <CardContent className="py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{assignment.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {assignment.lesson?.title || 'General conversation practice'}
                          </p>
                        </div>
                        <Button 
                          className="bg-orange-500 hover:bg-orange-600"
                          onClick={() => startAssignedSession(
                            assignment.lesson_id, 
                            assignment.lesson?.title || assignment.title,
                            assignment.id
                          )}
                          disabled={isCreatingSession}
                        >
                          {isCreatingSession ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" /> Start
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="lesson" className="space-y-4">
            {isLoadingAssignments ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : !dueAssignments || dueAssignments.length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="flex flex-col items-center justify-center text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Lessons Available</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    You don't have any lessons available for voice practice.
                    Ask your teacher to assign you some lessons.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {dueAssignments.map(assignment => (
                  assignment.lesson && (
                    <Card key={assignment.id} className="overflow-hidden">
                      <div className="bg-orange-50 px-4 py-3 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-orange-500" />
                          <span className="font-medium text-sm">Lesson Practice</span>
                        </div>
                        <Badge variant="outline" className="bg-orange-100">
                          {assignment.status === 'not_started' ? 'Not Started' : 'In Progress'}
                        </Badge>
                      </div>
                      <CardContent className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{assignment.lesson.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {assignment.description || 'Practice conversation based on this lesson'}
                            </p>
                          </div>
                          <Button 
                            className="bg-orange-500 hover:bg-orange-600"
                            onClick={() => startAssignedSession(
                              assignment.lesson_id, 
                              assignment.lesson.title,
                              assignment.id
                            )}
                            disabled={isCreatingSession}
                          >
                            {isCreatingSession ? (
                              <span className="animate-spin">⏳</span>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" /> Practice
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : sessions?.filter(s => s.completed_at).length === 0 ? (
              <Card className="border-dashed border-2 border-muted">
                <CardContent className="flex flex-col items-center justify-center text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Practice History</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    You haven't completed any conversation practice sessions yet. 
                    Start a session to begin building your practice history.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {Object.keys(sessionsByLesson).map(lessonId => {
                  const lessonSessions = sessionsByLesson[lessonId].filter(s => s.completed_at);
                  if (lessonSessions.length === 0) return null;
                  
                  const lesson = lessonSessions[0].lesson;
                  
                  return (
                    <div key={lessonId} className="space-y-2">
                      {lessonId !== 'no-lesson' && lesson && (
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                          <BookOpen className="h-4 w-4" /> {lesson.title}
                        </h3>
                      )}
                      
                      {lessonSessions.map(session => (
                        <Card key={session.id} className="overflow-hidden">
                          <div className="bg-orange-50 px-4 py-3 border-b flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Mic className="h-4 w-4 text-orange-500" />
                              <span className="font-medium text-sm">
                                {difficultyLabels[session.difficulty_level as keyof typeof difficultyLabels]} Level
                              </span>
                            </div>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          </div>
                          <CardContent className="py-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{session.topic}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(session.started_at).toLocaleDateString()} • 
                                  {session.duration_seconds 
                                    ? ` ${Math.round(session.duration_seconds / 60)} minutes` 
                                    : ' Duration not recorded'}
                                </p>
                              </div>
                              <Button 
                                variant="outline"
                                onClick={() => navigate(`/student/voice-practice/session/${session.id}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default VoicePractice;
