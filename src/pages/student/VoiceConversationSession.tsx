
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import StudentLayout from '@/components/layout/StudentLayout';
import { useLessonData } from './hooks/useLessonData';
import { useVoiceConversation } from './hooks/useVoiceConversation';
import ConversationHeader from './components/voice-practice/ConversationHeader';
import ConversationTabs from './components/voice-practice/ConversationTabs';

const VoiceConversationSession: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const lessonIdParam = searchParams.get('lessonId');
  
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState("conversation");
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  
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
    setIsTranscribing(true);
    setLiveTranscript('');
  };
  
  const handleStopRecording = async (audioBlob: Blob, transcript: string) => {
    setIsRecording(false);
    setIsTranscribing(false);
    setLiveTranscript('');
    
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
        
        <ConversationHeader 
          practiceTopic={practiceTopic}
          lesson={lesson}
          difficultyLevel={difficultyLevel}
          setDifficultyLevel={setDifficultyLevel}
        />
        
        <ConversationTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          messages={messages}
          isLoading={isLoading}
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          confidenceScore={confidenceScore}
          rateConfidence={rateConfidence}
          handleEndConversation={handleEndConversation}
          liveTranscript={liveTranscript}
          isTranscribing={isTranscribing}
        />
      </div>
    </StudentLayout>
  );
};

export default VoiceConversationSession;
