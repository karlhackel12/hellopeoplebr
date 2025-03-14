
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Mic, BookOpen, History, MessageCircle, BarChart3, Users, Lightbulb, Clock, ArrowRight, CheckCircle, BookOpenCheck } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import StudentLayout from '@/components/layout/StudentLayout';
import VoicePracticeCard from './components/voice-practice/VoicePracticeCard';
import VoicePracticeAbout from './components/voice-practice/VoicePracticeAbout';
import RecentFeedback from './components/voice-practice/RecentFeedback';
import { useVoicePractice } from './hooks/useVoicePractice';
import { formatDistanceToNow } from 'date-fns';
import ProgressTracker from '@/components/teacher/preview/ProgressTracker';

const VoicePractice: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, recentFeedback, stats, isLoading } = useVoicePractice();
  const [activeTab, setActiveTab] = useState("practice");
  
  const startNewConversation = (topic?: string, lessonId?: string) => {
    const queryParams = new URLSearchParams();
    
    if (topic) {
      queryParams.append('topic', topic);
    }
    
    if (lessonId) {
      queryParams.append('lessonId', lessonId);
    }
    
    navigate(`/student/voice-practice/session?${queryParams.toString()}`);
  };
  
  // Filter required lessons (not marked as completed)
  const requiredLessons = sessions
    ?.filter(session => session.lesson && !session.completed_at)
    ?.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()) || [];
  
  // Filter completed lessons
  const completedSessions = sessions?.filter(session => session.completed_at) || [];
  
  // Group past conversations by topic
  const topicGroups = completedSessions.reduce((groups, session) => {
    const topic = session.topic || 'General Conversation';
    if (!groups[topic]) {
      groups[topic] = [];
    }
    groups[topic].push(session);
    return groups;
  }, {} as Record<string, typeof sessions>);
  
  return (
    <StudentLayout>
      <Helmet>
        <title>Voice Conversation Practice | Teachly</title>
      </Helmet>
      
      <div className="container py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Voice Conversation Practice</h1>
            <p className="text-muted-foreground">
              Improve your speaking skills with AI-guided conversation practice
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => startNewConversation('Free conversation')} className="flex gap-2">
              <MessageCircle className="h-4 w-4" />
              Start Conversation
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
            <Tabs defaultValue="practice" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="practice" className="flex gap-2">
                  <BookOpenCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Required Practice</span>
                  <span className="sm:hidden">Required</span>
                </TabsTrigger>
                <TabsTrigger value="topics" className="flex gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Conversation Topics</span>
                  <span className="sm:hidden">Topics</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Practice History</span>
                  <span className="sm:hidden">History</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="practice">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <BookOpenCheck className="h-5 w-5 text-blue-500" /> Required Conversation Practice
                    </CardTitle>
                    <CardDescription>
                      Complete these conversations to progress in your learning journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-slate-200 rounded"></div>
                        <div className="h-20 bg-slate-200 rounded"></div>
                      </div>
                    ) : requiredLessons.length > 0 ? (
                      <div className="space-y-4">
                        {requiredLessons.map((session) => (
                          <div key={session.id} className="border rounded-lg p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{session.lesson?.title}</h3>
                                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                                    Required
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Practice conversation based on this lesson content
                                </p>
                                <div className="flex mt-2 gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {session.started_at ? 
                                      `Started ${formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}` : 
                                      'Not started'}
                                  </Badge>
                                </div>
                              </div>
                              <Button 
                                onClick={() => startNewConversation(session.lesson?.title, session.lesson?.id)}
                                size="sm"
                                className="gap-1"
                              >
                                Practice
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <ProgressTracker 
                          completedSections={completedSessions.map(s => s.id)}
                          totalSections={completedSessions.length + requiredLessons.length}
                          customLabel={`${completedSessions.length} of ${completedSessions.length + requiredLessons.length} lessons completed`}
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>Great job! You've completed all required conversation practices.</p>
                        <div className="flex gap-2 justify-center mt-4">
                          <Button 
                            onClick={() => startNewConversation('Free conversation')}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Practice Anyway
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="topics">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-500" /> Conversation Topics
                    </CardTitle>
                    <CardDescription>
                      Choose a topic to practice conversation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-slate-200 rounded"></div>
                        <div className="h-20 bg-slate-200 rounded"></div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            Free-Form Conversation
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Have a natural conversation with the AI to practice your speaking skills.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <div 
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs cursor-pointer hover:bg-blue-100"
                              onClick={() => startNewConversation('Free conversation', undefined)}
                            >
                              Beginner
                            </div>
                            <div 
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs cursor-pointer hover:bg-blue-100"
                              onClick={() => startNewConversation('Free conversation', undefined)}
                            >
                              Intermediate
                            </div>
                            <div 
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs cursor-pointer hover:bg-blue-100"
                              onClick={() => startNewConversation('Free conversation', undefined)}
                            >
                              Advanced
                            </div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <Button 
                              size="sm"
                              onClick={() => startNewConversation('Free conversation', undefined)}
                            >
                              Start Conversation
                            </Button>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <h3 className="font-medium flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Popular Topics
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Choose a specific topic to practice conversation around.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {['Travel', 'Food & Dining', 'Work & Career', 'Hobbies', 'Family', 'Education', 'Technology', 'Health'].map(topic => (
                              <div 
                                key={topic}
                                className="px-2 py-1 bg-slate-50 text-slate-700 rounded-full text-xs cursor-pointer hover:bg-slate-100"
                                onClick={() => startNewConversation(topic, undefined)}
                              >
                                {topic}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {Object.keys(topicGroups).length > 0 && (
                          <div className="mt-6">
                            <h3 className="text-md font-medium mb-3">Recent Conversation Topics</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {Object.entries(topicGroups).slice(0, 4).map(([topic, sessions]) => (
                                <div key={topic} className="border rounded-lg p-4 cursor-pointer hover:bg-slate-50" onClick={() => startNewConversation(topic, undefined)}>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium">{topic}</h4>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {sessions.length} {sessions.length === 1 ? 'conversation' : 'conversations'}
                                      </p>
                                    </div>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">
                                      {sessions[0].difficulty_level > 2 ? 'Advanced' : sessions[0].difficulty_level > 1 ? 'Intermediate' : 'Beginner'}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <History className="h-5 w-5 text-violet-500" /> Conversation History
                    </CardTitle>
                    <CardDescription>
                      Review your past conversation practice sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-slate-200 rounded"></div>
                        <div className="h-20 bg-slate-200 rounded"></div>
                      </div>
                    ) : completedSessions.length > 0 ? (
                      <div className="space-y-4">
                        {completedSessions.slice(0, 10).map((session) => (
                          <div key={session.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{session.topic}</h3>
                                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Completed {formatDistanceToNow(new Date(session.completed_at!), { addSuffix: true })}
                                </p>
                                {session.duration_seconds && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Duration: {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                                  </p>
                                )}
                                {session.lesson && (
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    {session.lesson.title}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <div className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded">
                                  Level {session.difficulty_level}
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => navigate(`/student/voice-practice/session/${session.id}`)}
                                  >
                                    <BarChart3 className="h-3 w-3 text-slate-500" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-6 w-6"
                                    onClick={() => startNewConversation(session.topic, session.lesson?.id)}
                                  >
                                    <MessageCircle className="h-3 w-3 text-slate-500" />
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
                        <p>No completed conversation practice sessions yet.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => startNewConversation()}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
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
