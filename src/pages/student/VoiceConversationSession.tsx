import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, MessageSquare, Info, BarChart3, Star } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';
import StudentLayout from '@/components/layout/StudentLayout';
import { useLessonData } from './hooks/useLessonData';
import ConversationRecorder from './components/voice-practice/ConversationRecorder';
import ConversationDisplay from './components/voice-practice/ConversationDisplay';
import ScoreCards from './components/voice-practice/ScoreCards';
import { useVoiceConversation } from './hooks/useVoiceConversation';

const VoiceConversationSession: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const lessonIdParam = searchParams.get('lessonId');
  
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState("conversation");
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  
  const { lesson, lessonLoading } = useLessonData(lessonIdParam || undefined);
  
  const {
    messages,
    conversationId,
    isLoading,
    initConversation,
    sendMessage,
    endConversation
  } = useVoiceConversation(lessonIdParam || undefined);
  
  const lessonTopics = lesson ? [lesson.title] : [];
  const vocabularyItems: string[] = [];
  
  useEffect(() => {
    if (sessionId) {
      initConversation(sessionId);
    } else {
      initConversation();
    }
  }, [sessionId, initConversation]);
  
  const handleStartRecording = () => {
    setIsRecording(true);
  };
  
  const handleStopRecording = async (_audioBlob: Blob, transcript: string) => {
    setIsRecording(false);
    
    try {
      await sendMessage(transcript, lessonTopics, vocabularyItems, difficultyLevel);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to process your speech');
    }
  };
  
  const handleEndConversation = async () => {
    if (await endConversation(confidenceScore || undefined)) {
      toast.success('Conversation saved successfully');
      navigate('/student/voice-practice');
    }
  };
  
  const rateConfidence = (score: number) => {
    setConfidenceScore(score);
    toast.success(`You rated your confidence as ${score}/10`);
  };
  
  const handleGoBack = () => {
    navigate('/student/voice-practice');
  };
  
  const practiceTopic = lesson 
    ? `Conversation Practice: ${lesson.title}` 
    : 'General English Conversation Practice';

  return (
    <StudentLayout>
      <Helmet>
        <title>Voice Conversation | Teachly</title>
      </Helmet>
      
      <div className="container py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Voice Practice
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{practiceTopic}</CardTitle>
                <CardDescription>
                  {lesson 
                    ? `Practice conversation based on lesson content`
                    : `Free conversation practice to improve your speaking skills`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map(level => (
                  <Button
                    key={level}
                    size="sm"
                    variant={difficultyLevel === level ? "default" : "outline"}
                    onClick={() => setDifficultyLevel(level)}
                  >
                    Level {level}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Conversation Tips</AlertTitle>
              <AlertDescription>
                Speak naturally and try to keep the conversation flowing. The AI will adapt to your
                level and help you practice English. Click the microphone to start speaking.
              </AlertDescription>
            </Alert>
            
            {lesson && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Lesson Context:</h3>
                <div className="bg-slate-50 p-4 rounded-md text-sm max-h-32 overflow-y-auto">
                  {lesson.content?.slice(0, 300)}...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="conversation" className="flex gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Conversation</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex gap-2" disabled={messages.length === 0}>
              <BarChart3 className="h-4 w-4" />
              <span>Confidence</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="conversation">
            <div className="grid grid-cols-1 gap-6">
              <ConversationDisplay 
                messages={messages}
                isLoading={isLoading}
              />
              
              <ConversationRecorder 
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                maxDurationSeconds={120}
                isWaitingForResponse={isLoading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Rate Your Confidence
                </CardTitle>
                <CardDescription>
                  How confident did you feel during this conversation practice?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                    <Button
                      key={score}
                      variant={confidenceScore === score ? "default" : "outline"}
                      size="lg"
                      className="w-16 h-16 text-lg"
                      onClick={() => rateConfidence(score)}
                    >
                      {score}
                    </Button>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button onClick={handleEndConversation}>
                  End Conversation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
};

export default VoiceConversationSession;
