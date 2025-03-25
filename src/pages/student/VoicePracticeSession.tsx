
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVoicePracticeSession } from './hooks/useVoicePracticeSession';
import SessionHeader from './components/voice-practice/SessionHeader';
import SessionTabs from './components/voice-practice/SessionTabs';
import SessionLoadingState from './components/voice-practice/SessionLoadingState';
import ExitPracticeDialog from './components/voice-practice/ExitPracticeDialog';
import { useAnalytics, ANALYTICS_EVENTS } from '@/hooks/useAnalytics';

const VoicePracticeSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { trackEvent } = useAnalytics();
  
  const {
    sessionDetails,
    loading,
    isComplete,
    exitDialogOpen,
    setExitDialogOpen,
    activeTab,
    setActiveTab,
    lessonData,
    lessonLoading,
    isRecording,
    isSpeaking,
    audioLevel,
    transcript,
    messages,
    handleCompleteSession,
    toggleRecording,
    handleBackClick,
    handleExitConfirm,
    toggleLessonView,
  } = useVoicePracticeSession(sessionId);

  // Track session load and completion
  useEffect(() => {
    if (!loading && sessionDetails) {
      // Track session viewed
      trackEvent(ANALYTICS_EVENTS.STUDENT.VOICE_PRACTICE_STARTED, {
        session_id: sessionId,
        lesson_id: sessionDetails.lesson_id,
      });
    }
  }, [loading, sessionDetails, sessionId, trackEvent]);

  // Enhanced complete session handler with analytics
  const completeSessionWithAnalytics = async () => {
    if (sessionId && !isComplete) {
      trackEvent(ANALYTICS_EVENTS.STUDENT.VOICE_PRACTICE_COMPLETED, {
        session_id: sessionId,
        messages_count: messages.length,
        practice_duration_minutes: Math.round((Date.now() - (sessionDetails?.started_at ? new Date(sessionDetails.started_at).getTime() : Date.now())) / 60000)
      });
    }
    
    await handleCompleteSession();
  };

  // Enhanced toggle recording with analytics
  const handleToggleRecording = () => {
    toggleRecording();
    
    trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
      button: isRecording ? 'stop_recording' : 'start_recording',
      session_id: sessionId
    });
  };

  // Track tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    trackEvent(ANALYTICS_EVENTS.UI.NAVIGATION, {
      page: `voice_practice_${tab}`,
      session_id: sessionId
    });
  };

  if (loading) {
    return <SessionLoadingState />;
  }

  return (
    <div className="container px-4 py-5 max-w-4xl mx-auto h-[calc(100vh-50px)] flex flex-col">
      <SessionHeader 
        sessionDetails={sessionDetails}
        activeTab={activeTab}
        isComplete={isComplete}
        hasMessages={messages.length > 1}
        onBackClick={handleBackClick}
        onToggleLesson={() => {
          toggleLessonView();
          trackEvent(ANALYTICS_EVENTS.UI.BUTTON_CLICKED, {
            button: 'toggle_lesson_view',
            session_id: sessionId
          });
        }}
        onEndPractice={completeSessionWithAnalytics}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SessionTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          sessionDetails={sessionDetails}
          lessonData={lessonData}
          isLessonLoading={lessonLoading}
          messages={messages}
          transcript={transcript}
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          isComplete={isComplete}
          toggleRecording={handleToggleRecording}
          onComplete={completeSessionWithAnalytics}
        />
      </div>
      
      <ExitPracticeDialog 
        open={exitDialogOpen}
        onOpenChange={setExitDialogOpen}
        onConfirm={handleExitConfirm}
      />
    </div>
  );
};

export default VoicePracticeSession;
