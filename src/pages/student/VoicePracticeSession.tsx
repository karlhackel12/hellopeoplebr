import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVoicePractice } from './hooks/useVoicePractice';
import { useLesson } from './hooks/lesson/useLesson';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PauseCircle, Send, X, BookOpen, MessageSquare, Info, ArrowLeft, Volume } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import VoiceWaveform from './components/voice-practice/VoiceWaveform';
import useVoiceRecorder from './hooks/useVoiceRecorder';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isPartial?: boolean;
}

const VoicePracticeSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const startTimeRef = useRef<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { completeSession } = useVoicePractice();
  const [activeTab, setActiveTab] = useState('conversation');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { data: lessonData, isLoading: lessonLoading } = useLesson(
    sessionDetails?.lesson_id || undefined
  );
  
  const {
    isRecording,
    startRecording,
    stopRecording,
    transcript,
    clearTranscript,
    audioLevel,
    hasRecordingPermission,
    requestPermission,
  } = useVoiceRecorder();
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, liveTranscript]);
  
  useEffect(() => {
    if (!sessionId) return;
    
    const fetchSessionDetails = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('voice_practice_sessions')
          .select(`
            id,
            topic,
            difficulty_level,
            started_at,
            completed_at,
            vocabulary_used,
            lesson_id,
            assignment_id,
            lesson:lessons(id, title, content)
          `)
          .eq('id', sessionId)
          .single();
        
        if (error) throw error;
        
        setSessionDetails(data);
        
        if (data.completed_at) {
          setIsComplete(true);
          const { data: messageData, error: messagesError } = await supabase
            .from('conversation_messages')
            .select('role, content, created_at')
            .eq('conversation_id', sessionId)
            .order('created_at', { ascending: true });
          
          if (!messagesError && messageData) {
            setMessages(messageData.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
              timestamp: new Date(msg.created_at)
            })));
          }
        } else {
          startTimeRef.current = new Date();
          setConversationId(sessionId);
          
          const welcomeMsg = getWelcomeMessage(data.difficulty_level, data.lesson?.title);
          setMessages([
            {
              role: 'assistant',
              content: welcomeMsg,
              timestamp: new Date()
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
        toast.error('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionDetails();
  }, [sessionId]);
  
  useEffect(() => {
    if (transcript && !isRecording) {
      setLiveTranscript('');
      setUserInput(transcript);
    } else if (transcript && isRecording) {
      setLiveTranscript(transcript);
    }
  }, [transcript, isRecording]);
  
  const getWelcomeMessage = (difficultyLevel: number, lessonTitle?: string) => {
    let baseMessage = '';
    
    switch (difficultyLevel) {
      case 1:
        baseMessage = "Hello! I'm your English conversation partner. Let's practice speaking together. Take your time and speak clearly.";
        break;
      case 2:
        baseMessage = "Hi there! I'm your English conversation partner. I'm here to help you practice your speaking skills.";
        break;
      case 3:
        baseMessage = "Welcome to our conversation practice! I'm your advanced English partner. I'll challenge you with sophisticated vocabulary and complex topics.";
        break;
      default:
        baseMessage = "Hello! I'm your English conversation partner.";
        break;
    }
    
    if (lessonTitle) {
      baseMessage += ` Today we'll be discussing topics related to "${lessonTitle}". `;
    }
    
    baseMessage += " What would you like to talk about today?";
    
    return baseMessage;
  };
  
  const handleSendMessage = async () => {
    if (!userInput.trim() || !conversationId) return;
    
    const userMessage = {
      role: 'user' as const,
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    clearTranscript();
    
    try {
      setAiSpeaking(true);
      
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: '...', 
          timestamp: new Date(),
          isPartial: true
        }
      ]);
      
      const { data, error } = await supabase.functions.invoke('voice-conversation', {
        body: {
          userTranscript: userMessage.content,
          conversationId,
          lessonTopics: sessionDetails.lesson ? [sessionDetails.lesson.title] : [],
          vocabularyItems: sessionDetails.vocabulary_used || [],
          difficulty: sessionDetails.difficulty_level,
          userId: (await supabase.auth.getUser()).data.user?.id,
          lessonId: sessionDetails.lesson_id,
          assignmentId: sessionDetails.assignment_id
        }
      });
      
      if (error) throw error;
      
      setMessages(prev => prev.filter(msg => !msg.isPartial));
      
      if (data.response) {
        const assistantMessage = {
          role: 'assistant' as const,
          content: data.response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
      
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      setMessages(prev => prev.filter(msg => !msg.isPartial));
      
      toast.error('Failed to send message');
    } finally {
      setAiSpeaking(false);
    }
  };
  
  const handleCompleteSession = async () => {
    if (!sessionId || !startTimeRef.current) return;
    
    try {
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000);
      
      await supabase.functions.invoke('voice-conversation', {
        body: {
          conversationId,
          markAsCompleted: true,
          userId: (await supabase.auth.getUser()).data.user?.id,
          lessonId: sessionDetails.lesson_id,
          assignmentId: sessionDetails.assignment_id
        }
      });
      
      await completeSession({
        sessionId,
        durationSeconds
      });
      
      toast.success('Practice session completed!');
      setIsComplete(true);
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    }
  };
  
  const toggleRecording = async () => {
    if (!hasRecordingPermission) {
      const granted = await requestPermission();
      if (!granted) {
        toast.error('Microphone permission is required for voice practice');
        return;
      }
    }
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
      clearTranscript();
      setLiveTranscript('');
    }
  };
  
  const renderLessonContent = () => {
    if (lessonLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }
    
    if (!lessonData) {
      return (
        <div className="text-center py-8">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Lesson Content</h3>
          <p className="text-sm text-muted-foreground">
            This practice session is not associated with any lesson content.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="border rounded-md p-4 bg-orange-50">
          <h3 className="font-medium text-lg mb-2">{lessonData.title}</h3>
          <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: lessonData.content }} />
        </div>
        
        {sessionDetails?.vocabulary_used && sessionDetails.vocabulary_used.length > 0 && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">Practice these vocabulary items:</h3>
            <div className="flex flex-wrap gap-2">
              {sessionDetails.vocabulary_used.map((word: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-orange-100">
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="container px-4 py-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="h-96">
            <div className="flex flex-col space-y-4 pt-4">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-16 w-3/4 ml-auto" />
              <Skeleton className="h-16 w-3/4" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-12 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-5 max-w-4xl mx-auto h-[calc(100vh-50px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          className="gap-1" 
          onClick={() => {
            if (!isComplete && messages.length > 1) {
              setExitDialogOpen(true);
            } else {
              navigate('/student/voice-practice');
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Practice Hub
        </Button>
        
        <div className="flex gap-2">
          {sessionDetails?.lesson && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab(activeTab === 'lesson' ? 'conversation' : 'lesson')}
              className={cn("flex items-center gap-1.5", activeTab === 'lesson' ? "bg-orange-100" : "")}
            >
              <BookOpen className="h-4 w-4 text-orange-500" />
              {activeTab === 'lesson' ? 'Hide Lesson' : 'Show Lesson'}
            </Button>
          )}
          
          {!isComplete && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCompleteSession}
              disabled={messages.length <= 1}
            >
              <PauseCircle className="h-4 w-4 mr-2" /> End Practice
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs 
          defaultValue="conversation" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full h-full flex flex-col"
        >
          <TabsContent value="conversation" className="mt-0 flex-1 flex flex-col">
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 text-white p-4 rounded-t-lg mb-0">
              <h1 className="text-xl font-bold tracking-tight">
                {sessionDetails?.lesson?.title || sessionDetails?.topic || 'Voice Practice'}
              </h1>
              <p className="text-sm opacity-90">
                {sessionDetails?.difficulty_level === 1 ? 'Beginner' : 
                 sessionDetails?.difficulty_level === 2 ? 'Intermediate' : 'Advanced'} Level Practice
                {sessionDetails?.lesson && ` • Based on ${sessionDetails.lesson.title}`}
              </p>
            </div>
            
            <div 
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto bg-gray-50"
            >
              <div className="flex flex-col space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex", 
                      message.role === 'user' ? "justify-end" : "justify-start",
                      message.isPartial ? "opacity-60" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-xl px-4 py-2.5", 
                        message.role === 'user'
                          ? "bg-orange-500 text-white rounded-tr-none"
                          : "bg-white shadow-sm text-gray-800 rounded-tl-none border",
                        message.isPartial ? "animate-pulse" : ""
                      )}
                    >
                      {message.role === 'assistant' && !message.isPartial && (
                        <div className="flex items-center gap-1.5 mb-1 text-xs opacity-70">
                          <Volume className="h-3 w-3 text-orange-500" />
                          AI Assistant
                        </div>
                      )}
                      <p>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {liveTranscript && (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl px-4 py-2.5 bg-orange-500 bg-opacity-50 text-white rounded-tr-none animate-pulse">
                      <p>{liveTranscript}</p>
                      <div className="flex justify-end mt-1">
                        <span className="inline-block h-2 w-2 bg-white rounded-full animate-pulse mr-1"></span>
                        <span className="inline-block h-2 w-2 bg-white rounded-full animate-pulse mr-1" style={{ animationDelay: '0.2s' }}></span>
                        <span className="inline-block h-2 w-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="border-t p-3 bg-white shadow-sm">
              {isComplete ? (
                <div className="w-full flex flex-col items-center justify-center py-4">
                  <p className="text-center mb-4">
                    This practice session has been completed.
                  </p>
                  <Button 
                    onClick={() => navigate('/student/voice-practice')}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Return to Practice Hub
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col w-full gap-2">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 relative">
                      <VoiceWaveform 
                        audioLevel={isRecording ? audioLevel : 0} 
                        isActive={isRecording} 
                        className="h-10"
                        color="orange"
                      />
                      {isRecording && (
                        <div className="absolute top-1 left-3">
                          <span className="inline-block h-2 w-2 bg-red-500 rounded-full animate-pulse mr-1"></span>
                          <span className="text-xs text-gray-600">Recording...</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      size="icon"
                      className={isRecording ? "" : "bg-orange-500 hover:bg-orange-600"}
                      onClick={toggleRecording}
                      disabled={aiSpeaking}
                    >
                      {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <textarea
                        className="w-full p-3 border rounded-md resize-none bg-background"
                        placeholder="Type or speak your message..."
                        rows={2}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        disabled={aiSpeaking}
                      />
                    </div>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 self-end"
                      onClick={handleSendMessage}
                      disabled={!userInput.trim() || aiSpeaking}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {aiSpeaking && (
                    <div className="w-full flex justify-center">
                      <span className="text-sm flex items-center gap-2 text-muted-foreground">
                        <span className="inline-block h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
                        AI is generating response...
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="lesson" className="mt-0 flex-1 flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 text-white p-4 rounded-t-lg flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Lesson Content
                </h1>
                {sessionDetails?.lesson && (
                  <p className="text-sm opacity-90">{sessionDetails.lesson.title}</p>
                )}
              </div>
              <Button 
                variant="outline"
                size="sm" 
                className="bg-white text-orange-600 hover:bg-white/90"
                onClick={() => setActiveTab('conversation')}
              >
                <MessageSquare className="h-4 w-4 mr-1" /> Back to Chat
              </Button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {renderLessonContent()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <AlertDialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Practice Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This session is not marked as complete. You can return to it later, but your progress won't be saved until you complete it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                setExitDialogOpen(false);
                navigate('/student/voice-practice');
              }}
            >
              Exit Without Completing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VoicePracticeSession;
