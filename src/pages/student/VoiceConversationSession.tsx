import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistance } from 'date-fns';
import StudentLayout from '@/components/layout/StudentLayout';
import { useLessonData } from './hooks/useLessonData';
import { useVoiceConversation } from './hooks/useVoiceConversation';
import ConversationHeader from './components/voice-practice/ConversationHeader';
import ConversationTabs from './components/voice-practice/ConversationTabs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useVoicePractice } from './hooks/useVoicePractice';
import { supabase } from '@/integrations/supabase/client';

const VoiceConversationSession: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const lessonIdParam = searchParams.get('lessonId');
  const topicParam = searchParams.get('topic');
  const assignmentIdParam = searchParams.get('assignmentId');
  
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
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  
  const startTimeRef = useRef<Date | null>(null);
  
  const { lesson, lessonLoading } = useLessonData(lessonIdParam || undefined);
  const { completeSession } = useVoicePractice();
  
  const {
    messages,
    conversationId,
    isLoading,
    analyticsData: conversationAnalytics,
    initConversation,
    sendMessage,
    endConversation,
    analyzeConversation
  } = useVoiceConversation(lessonIdParam || undefined, assignmentIdParam || undefined);
  
  useEffect(() => {
    const fetchAssignmentData = async () => {
      if (assignmentIdParam) {
        const { data, error } = await supabase
          .from('student_assignments')
          .select('*')
          .eq('id', assignmentIdParam)
          .single();
          
        if (!error && data) {
          setAssignmentData(data);
        }
      }
    };
    
    fetchAssignmentData();
  }, [assignmentIdParam]);
  
  useEffect(() => {
    const userMessageCount = messages.filter(m => m.role === 'user').length;
    setMinMessageCountReached(userMessageCount >= 3);
  }, [messages]);
  
  const [minMessageCountReached, setMinMessageCountReached] = useState(false);
  
  useEffect(() => {
    if (sessionId) {
      initConversation(sessionId);
    } else {
      initConversation();
    }
  }, [sessionId, initConversation]);
  
  useEffect(() => {
    if (lesson) {
      const content = lesson.content || '';
      const words = content
        .split(/\s+/)
        .filter(word => word.length > 4)
        .filter(word => /^[A-Za-z]+$/.test(word))
        .map(word => word.toLowerCase())
        .filter((value, index, self) => self.indexOf(value) === index)
        .slice(0, 10);
      
      setActiveVocabulary(words);
      
      const topics = [
        lesson.title,
        'Key Grammar Points',
        'Vocabulary Usage',
        'Pronunciation Practice'
      ];
      
      setLessonTopics(topics);
      
      generateSuggestedResponses(content);
    } else if (topicParam) {
      setLessonTopics([topicParam]);
      generateGenericSuggestions(topicParam);
    }
  }, [lesson, topicParam]);
  
  useEffect(() => {
    if (conversationAnalytics) {
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
        speakingTime: conversationAnalytics.user_speaking_time_seconds || calculateTotalSpeakingTime(),
        conversationTurns: messages.filter(m => m.role === 'user').length
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
    return messages.filter(m => m.role === 'user').length * 15;
  };
  
  const generateSuggestedResponses = (content: string) => {
    const genericSuggestions = [
      "Could you explain that in more detail?",
      "I'm not sure I understand. Can you clarify?",
      "That's interesting! What do you think about...?",
      "How does this relate to real-life situations?",
      "Can you give me an example of that?"
    ];
    
    setSuggestedResponses(genericSuggestions);
  };
  
  const generateGenericSuggestions = (topic: string) => {
    const topicSuggestions: Record<string, string[]> = {
      'Travel': [
        "What's your favorite place you've traveled to?",
        "Do you prefer beach vacations or city trips?",
        "What's on your travel bucket list?",
        "How do you usually plan your trips?"
      ],
      'Food & Dining': [
        "What's your favorite cuisine?",
        "Do you enjoy cooking at home?",
        "Have you tried any interesting restaurants lately?",
        "What's a dish you'd like to learn how to make?"
      ],
      'Work & Career': [
        "What do you do for work?",
        "What do you enjoy most about your job?",
        "What skills are important in your field?",
        "How has your industry changed recently?"
      ],
      'default': [
        "What do you find interesting about this topic?",
        "Could you tell me more about your experience with this?",
        "What would you like to learn about this subject?",
        "Do you have any questions about this topic?"
      ]
    };
    
    const suggestions = topicSuggestions[topic] || topicSuggestions['default'];
    setSuggestedResponses(suggestions);
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
      await sendMessage(transcript, lessonTopics, activeVocabulary, difficultyLevel);
      
      if (messages.length % 3 === 0) {
        const analyticsResult = await analyzeConversation();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to process your speech');
    }
  };
  
  const handleEndConversation = async () => {
    if (conversationId) {
      const success = await endConversation(
        confidenceScore || undefined, 
        lessonIdParam || undefined,
        assignmentIdParam || undefined
      );
      
      if (success) {
        if (lessonIdParam && lesson) {
          try {
            await completeSession({
              sessionId: conversationId,
              durationSeconds: calculateTotalSpeakingTime()
            });
            
            toast.success(`Practice for "${lesson.title}" marked as completed!`);
          } catch (error) {
            console.error('Error completing session:', error);
            toast.error('Failed to mark lesson as completed');
          }
        } else if (assignmentIdParam && assignmentData) {
          toast.success(`Assignment "${assignmentData.title}" completed!`);
        } else {
          toast.success('Conversation saved successfully');
        }
        
        setSessionCompleted(true);
        
        setTimeout(() => {
          navigate('/student/voice-practice');
        }, 3000);
      }
    }
  };
  
  const rateConfidence = (score: number) => {
    setConfidenceScore(score);
    toast.success(`You rated your confidence as ${score}/10`);
  };
  
  const handleGoBack = () => {
    if (messages.length > 0 && !sessionCompleted) {
      const confirm = window.confirm('Are you sure you want to leave? Your conversation progress will be saved, but not marked as completed.');
      if (!confirm) return;
    }
    
    navigate('/student/voice-practice');
  };
  
  const practiceTopic = assignmentData?.title || 
    (lesson ? `Conversation Practice: ${lesson.title}` : 
      (topicParam || 'General English Conversation Practice'));

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
        
        {assignmentData && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <AlertTitle>Assignment Conversation Practice</AlertTitle>
            <AlertDescription>
              You're completing a required conversation practice for the assignment: "{assignmentData.title}". 
              {assignmentData.due_date && (
                <span> Due {formatDistance(new Date(assignmentData.due_date), new Date(), { addSuffix: true })}.</span>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {sessionCompleted && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Practice Completed!</AlertTitle>
            <AlertDescription>
              Great job! Your conversation practice has been saved and marked as completed.
              {lesson && (
                <span> You've completed the practice for "{lesson.title}".</span>
              )}
              {assignmentData && (
                <span> You've completed the assignment "{assignmentData.title}".</span>
              )}
            </AlertDescription>
          </Alert>
        )}
        
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
          minTurnsRequired={3}
          currentTurns={messages.filter(m => m.role === 'user').length}
          isCompleted={sessionCompleted}
        />
      </div>
    </StudentLayout>
  );
};

export default VoiceConversationSession;
