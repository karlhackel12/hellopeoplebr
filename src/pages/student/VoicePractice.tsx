
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, BookOpen, History, Plus } from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import VoicePracticeCard from './components/voice-practice/VoicePracticeCard';
import VoicePracticeAbout from './components/voice-practice/VoicePracticeAbout';
import RecentFeedback from './components/voice-practice/RecentFeedback';
import { useVoicePractice } from './hooks/useVoicePractice';
import { formatDistanceToNow } from 'date-fns';

const VoicePractice: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, recentFeedback, stats, isLoading } = useVoicePractice();
  const [activeTab, setActiveTab] = useState("due");
  
  const startNewPractice = () => {
    navigate('/student/voice-practice/session');
  };
  
  // Filter completed and pending sessions
  const completedSessions = sessions?.filter(session => session.completed_at) || [];
  const pendingSessions = sessions?.filter(session => !session.completed_at) || [];
  
  return (
    <StudentLayout>
      <Helmet>
        <title>Voice Practice | Teachly</title>
      </Helmet>
      
      <div className="container py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Voice Practice</h1>
            <p className="text-muted-foreground">
              Improve your speaking skills with AI-guided practice sessions
            </p>
          </div>
          <Button onClick={startNewPractice} className="flex gap-2">
            <Mic className="h-4 w-4" />
            New Practice Session
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <VoicePracticeCard 
              sessionCount={stats.totalSessions}
              completedSessions={stats.completedSessions}
              averageDuration={stats.averageDuration}
              highestDifficulty={stats.highestDifficulty}
              averageScores={stats.averageScores}
              loading={isLoading}
            />
          </div>
          <div>
            <VoicePracticeAbout />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs defaultValue="due" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="due" className="flex gap-2">
                  <Mic className="h-4 w-4" />
                  <span className="hidden sm:inline">Due Practice</span>
                  <span className="sm:hidden">Due</span>
                </TabsTrigger>
                <TabsTrigger value="lessons" className="flex gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">All Lessons</span>
                  <span className="sm:hidden">Lessons</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Practice History</span>
                  <span className="sm:hidden">History</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="due">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Mic className="h-5 w-5 text-blue-500" /> Due Practice Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-slate-200 rounded"></div>
                        <div className="h-20 bg-slate-200 rounded"></div>
                      </div>
                    ) : pendingSessions.length > 0 ? (
                      <div className="space-y-4">
                        {pendingSessions.map((session) => (
                          <div key={session.id} className="border rounded-lg p-4 flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{session.topic}</h3>
                              <p className="text-sm text-muted-foreground">
                                Created {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
                              </p>
                            </div>
                            <Button 
                              onClick={() => navigate(`/student/voice-practice/session/${session.id}`)}
                              size="sm"
                            >
                              Continue
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Mic className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No practice sessions due.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={startNewPractice}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Start New Practice
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="lessons">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-green-500" /> Practice from Lessons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-slate-200 rounded"></div>
                        <div className="h-20 bg-slate-200 rounded"></div>
                      </div>
                    ) : sessions?.some(session => session.lesson) ? (
                      <div className="space-y-4">
                        {sessions
                          .filter(session => session.lesson)
                          .slice(0, 5)
                          .map((session) => (
                            <div key={session.id} className="border rounded-lg p-4">
                              <h3 className="font-medium">{session.lesson?.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {session.completed_at 
                                  ? `Completed ${formatDistanceToNow(new Date(session.completed_at), { addSuffix: true })}` 
                                  : `Started ${formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}`}
                              </p>
                              <div className="flex justify-end mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/student/voice-practice/session?lessonId=${session.lesson?.id}`)}
                                >
                                  Practice Again
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No lesson-based practice yet.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => navigate('/student/lessons')}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Browse Lessons
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <History className="h-5 w-5 text-violet-500" /> Practice History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-slate-200 rounded"></div>
                        <div className="h-20 bg-slate-200 rounded"></div>
                      </div>
                    ) : completedSessions.length > 0 ? (
                      <div className="space-y-4">
                        {completedSessions.map((session) => (
                          <div key={session.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{session.topic}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Completed {formatDistanceToNow(new Date(session.completed_at!), { addSuffix: true })}
                                </p>
                                {session.duration_seconds && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Duration: {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                                  </p>
                                )}
                              </div>
                              <div className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">
                                Level {session.difficulty_level}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>No completed practice sessions yet.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={startNewPractice}
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Start Practicing
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <RecentFeedback feedback={recentFeedback || []} loading={isLoading} />
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default VoicePractice;
