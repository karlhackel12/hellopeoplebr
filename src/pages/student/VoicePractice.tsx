
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, BookOpen, History, Plus, MessageCircle, BarChart3, Users, Lightbulb } from 'lucide-react';
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
  
  const startNewPractice = (type: 'normal' | 'conversation' = 'normal') => {
    if (type === 'conversation') {
      navigate('/student/voice-practice/session?mode=conversation');
    } else {
      navigate('/student/voice-practice/session');
    }
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
              Improve your speaking skills with AI-guided practice sessions and conversations
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => startNewPractice('conversation')} 
              className="flex gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              New Conversation
            </Button>
            <Button onClick={() => startNewPractice('normal')} className="flex gap-2">
              <Mic className="h-4 w-4" />
              New Practice
            </Button>
          </div>
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
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="due" className="flex gap-2">
                  <Mic className="h-4 w-4" />
                  <span className="hidden sm:inline">Due Practice</span>
                  <span className="sm:hidden">Due</span>
                </TabsTrigger>
                <TabsTrigger value="conversations" className="flex gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Conversations</span>
                  <span className="sm:hidden">Chats</span>
                </TabsTrigger>
                <TabsTrigger value="lessons" className="flex gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Lessons</span>
                  <span className="sm:hidden">Learn</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                  <span className="sm:hidden">Past</span>
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
                        <div className="flex gap-2 justify-center mt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => startNewPractice('conversation')}
                            className="flex gap-2"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Start Conversation
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => startNewPractice('normal')}
                          >
                            <Mic className="h-4 w-4 mr-2" />
                            Start Practice
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="conversations">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-500" /> Conversation Practice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-slate-200 rounded"></div>
                        <div className="h-20 bg-slate-200 rounded"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            Practice Conversation
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Have a natural conversation with the AI to practice your speaking skills.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">Beginner</div>
                            <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">Intermediate</div>
                            <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">Advanced</div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <Button 
                              size="sm"
                              onClick={() => startNewPractice('conversation')}
                            >
                              Start Conversation
                            </Button>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-violet-500" />
                            Lesson-based Conversation
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Practice conversations related to your recent lessons and vocabulary.
                          </p>
                          <div className="flex justify-end mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate('/student/lessons')}
                            >
                              Browse Lessons
                            </Button>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Topic-based Conversation
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Choose a specific topic to practice conversation around.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <div className="px-2 py-1 bg-slate-50 text-slate-700 rounded-full text-xs cursor-pointer hover:bg-slate-100">
                              Travel
                            </div>
                            <div className="px-2 py-1 bg-slate-50 text-slate-700 rounded-full text-xs cursor-pointer hover:bg-slate-100">
                              Food & Dining
                            </div>
                            <div className="px-2 py-1 bg-slate-50 text-slate-700 rounded-full text-xs cursor-pointer hover:bg-slate-100">
                              Work & Career
                            </div>
                            <div className="px-2 py-1 bg-slate-50 text-slate-700 rounded-full text-xs cursor-pointer hover:bg-slate-100">
                              Hobbies
                            </div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate('/student/voice-practice/session?mode=conversation&topic=custom')}
                            >
                              Choose Topic
                            </Button>
                          </div>
                        </div>
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
                              <div className="flex justify-end mt-2 gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/student/voice-practice/session?lessonId=${session.lesson?.id}`)}
                                >
                                  Practice
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => navigate(`/student/voice-practice/session?lessonId=${session.lesson?.id}&mode=conversation`)}
                                >
                                  Conversation
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
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{session.topic}</h3>
                                  {session.topic.includes("Conversation") && (
                                    <Badge variant="default" className="bg-green-100 text-green-700">
                                      <MessageCircle className="h-3 w-3 mr-1" />
                                      Conversation
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Completed {formatDistanceToNow(new Date(session.completed_at!), { addSuffix: true })}
                                </p>
                                {session.duration_seconds && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Duration: {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">
                                  Level {session.difficulty_level}
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <BarChart3 className="h-3 w-3 text-slate-500" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <Mic className="h-3 w-3 text-slate-500" />
                                  </Button>
                                </div>
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
                          onClick={() => startNewPractice()}
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
