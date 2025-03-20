
import React from 'react';
import { useParams } from 'react-router-dom';
import { useVoicePracticeSession } from './hooks/useVoicePracticeSession';
import SessionHeader from './components/voice-practice/SessionHeader';
import SessionTabs from './components/voice-practice/SessionTabs';
import SessionLoadingState from './components/voice-practice/SessionLoadingState';
import ExitPracticeDialog from './components/voice-practice/ExitPracticeDialog';

const VoicePracticeSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
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
        onToggleLesson={toggleLessonView}
        onEndPractice={handleCompleteSession}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SessionTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sessionDetails={sessionDetails}
          lessonData={lessonData}
          isLessonLoading={lessonLoading}
          messages={messages}
          transcript={transcript}
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          isComplete={isComplete}
          toggleRecording={toggleRecording}
          onComplete={handleCompleteSession}
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
