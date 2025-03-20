
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVoicePractice } from './hooks/useVoicePractice';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PauseCircle, Send, X } from 'lucide-react';
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

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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
  const startTimeRef = useRef<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { completeSession } = useVoicePractice();
  
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
        
        // Check if already complete
        if (data.completed_at) {
          setIsComplete(true);
          // Fetch conversation history
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
          // Set start time if this is a new session
          startTimeRef.current = new Date();
          setConversationId(sessionId);
          
          // Add welcome message
          const welcomeMsg = getWelcomeMessage(data.difficulty_level);
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
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (transcript && !isRecording) {
      setUserInput(transcript);
    }
  }, [transcript, isRecording]);
  
  const getWelcomeMessage = (difficultyLevel: number) => {
    switch (difficultyLevel) {
      case 1:
        return "Hello! I'm your English conversation partner. Let's practice speaking together. Take your time and speak clearly. What would you like to talk about today?";
      case 2:
        return "Hi there! I'm your English conversation partner. I'm here to help you practice your speaking skills. What topic would you like to discuss today?";
      case 3:
        return "Welcome to our conversation practice! I'm your advanced English partner. I'll challenge you with sophisticated vocabulary and complex topics. What would you like to explore in our discussion today?";
      default:
        return "Hello! I'm your English conversation partner. What would you like to talk about today?";
    }
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
      
      // Call the Supabase Edge Function for voice conversation
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
      
      // Mark the conversation as completed
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
    }
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
    <div className="container px-4 py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {sessionDetails?.lesson?.title || sessionDetails?.topic || 'Voice Practice'}
        </h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            if (!isComplete && messages.length > 1) {
              setExitDialogOpen(true);
            } else {
              navigate('/student/voice-practice');
            }
          }}
        >
          <X className="h-4 w-4 mr-2" /> Exit Practice
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {sessionDetails?.difficulty_level === 1 ? 'Beginner' : 
             sessionDetails?.difficulty_level === 2 ? 'Intermediate' : 'Advanced'} Level Practice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {sessionDetails?.lesson 
              ? `Practicing conversation related to: ${sessionDetails.lesson.title}`
              : 'Free conversation practice on ' + sessionDetails?.topic}
          </p>
          {sessionDetails?.vocabulary_used && sessionDetails.vocabulary_used.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Vocabulary focus:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {sessionDetails.vocabulary_used.map((word: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto p-6">
            <div className="flex flex-col space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t p-4">
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
            <div className="flex flex-col w-full gap-4">
              <div className="flex items-center gap-2">
                <VoiceWaveform 
                  audioLevel={isRecording ? audioLevel : 0} 
                  isActive={isRecording} 
                  className="h-12"
                  color="orange"
                />
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
                  {transcript && isRecording && (
                    <div className="absolute bottom-2 right-2">
                      <span className="inline-block h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || aiSpeaking}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCompleteSession}
                    disabled={messages.length <= 1 || aiSpeaking}
                  >
                    <PauseCircle className="h-4 w-4" />
                  </Button>
                </div>
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
        </CardFooter>
      </Card>
      
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
