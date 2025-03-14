
import React, { useState, useEffect, useRef } from 'react';
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
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const [activeVocabulary, setActiveVocabulary] = useState<string[]>([]);
  const [lessonTopics, setLessonTopics] = useState<string[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
  const startTimeRef = useRef<Date | null>(null);
  
  const { lesson, lessonLoading } = useLessonData(lessonIdParam || undefined);
  
  const {
    messages,
    conversationId,
    isLoading,
    analyticsData: conversationAnalytics,
    initConversation,
    sendMessage,
    endConversation,
    analyzeConversation
  } = useVoiceConversation(lessonIdParam || undefined);
  
  useEffect(() => {
    if (sessionId) {
      initConversation(sessionId);
    } else {
      initConversation();
    }
  }, [sessionId, initConversation]);
  
  // Extract vocabulary and topics from lesson
  useEffect(() => {
    if (lesson) {
      // Example extraction logic - in a real app this would be more sophisticated
      // and might come from a structured field in the lesson
      
      // Extract some vocabulary words from content
      const content = lesson.content || '';
      const words = content
        .split(/\s+/)
        .filter(word => word.length > 4)
        .filter(word => /^[A-Za-z]+$/.test(word))
        .map(word => word.toLowerCase())
        .filter((value, index, self) => self.indexOf(value) === index)
        .slice(0, 10);
      
      setActiveVocabulary(words);
      
      // Extract topics from lesson title or content
      // In a real app, these would likely be stored in the lesson metadata
      const topics = [
        lesson.title,
        'Key Grammar Points',
        'Vocabulary Usage',
        'Pronunciation Practice'
      ];
      
      setLessonTopics(topics);
      
      // Generate some suggested responses based on lesson content
      generateSuggestedResponses(content);
    }
  }, [lesson]);
  
  // Update analytics data when it changes
  useEffect(() => {
    if (conversationAnalytics) {
      // Transform the analytics data into the format expected by the feedback component
      setAnalyticsData({
        vocabulary: {
          used: activeVocabulary.filter(word => 
            messages.some(m => m.role === 'user' && m.content.toLowerCase().includes(word))
          ),
          unique: conversationAnalytics.vocabulary_count || 0,
          total: messages.filter(m => m.role === 'user').reduce((count, m) => count + m.content.split(/\s+/).length, 0)
        },
        grammar: {
          score: conversationAnalytics.grammar_quality ? conversationAnalytics.grammar_quality / 10 : 7.5,
          errors: []
        },
        fluency: {
          score: conversationAnalytics.fluency_score ? conversationAnalytics.fluency_score / 10 : 7.0,
          wordsPerMinute: calculateWordsPerMinute()
        },
        speakingTime: conversationAnalytics.user_speaking_time_seconds || calculateTotalSpeakingTime()
      });
    }
  }, [conversationAnalytics, messages, activeVocabulary]);
  
  const calculateWordsPerMinute = () => {
    const userMessages = messages.filter(m => m.role === 'user');
    const totalWords = userMessages.reduce((count, m) => count + m.content.split(/\s+/).length, 0);
    const totalMinutes = calculateTotalSpeakingTime() / 60;
    return totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0;
  };
  
  const calculateTotalSpeakingTime = () => {
    // In a real app, this would be tracked more accurately
    return messages.filter(m => m.role === 'user').length * 15; // Estimate 15 seconds per message
  };
  
  const generateSuggestedResponses = (content: string) => {
    // In a real app, this would use AI to generate contextual suggestions
    // Here we're just providing generic suggestions
    const genericSuggestions = [
      "Could you explain that in more detail?",
      "I'm not sure I understand. Can you clarify?",
      "That's interesting! What do you think about...?",
      "How does this relate to real-life situations?",
      "Can you give me an example of that?"
    ];
    
    setSuggestedResponses(genericSuggestions);
  };
  
  const handleStartRecording = () => {
    setIsRecording(true);
    setIsTranscribing(true);
    setLiveTranscript('');
    startTimeRef.current = new Date();
  };
  
  const handleStopRecording = async (audioBlob: Blob, transcript: string) => {
    setIsRecording(false);
    setIsTranscribing(false);
    setLiveTranscript('');
    
    try {
      // In a real app, we would send the actual audio blob
      // Here we're just using the mock transcript from ConversationRecorder
      await sendMessage(transcript, lessonTopics, activeVocabulary, difficultyLevel);
      
      // After a few messages, analyze the conversation
      if (messages.length % 3 === 0) {
        const analyticsResult = await analyzeConversation();
        // Analytics will be picked up by the useEffect
      }
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
          vocabularyItems={activeVocabulary}
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
          analyticsData={analyticsData}
          activeVocabulary={activeVocabulary}
          lessonTopics={lessonTopics}
          suggestedResponses={suggestedResponses}
        />
      </div>
    </StudentLayout>
  );
};

export default VoiceConversationSession;
