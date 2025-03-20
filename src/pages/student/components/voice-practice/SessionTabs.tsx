
import React from 'react';
import { Volume } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConversationPanel from './ConversationPanel';
import LessonContentPanel from './LessonContentPanel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SessionTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  sessionDetails: any;
  lessonData: any;
  isLessonLoading: boolean;
  messages: Message[];
  transcript: string;
  isRecording: boolean;
  isSpeaking: boolean;
  audioLevel: number;
  isComplete: boolean;
  toggleRecording: () => void;
  onComplete: () => void;
}

const SessionTabs: React.FC<SessionTabsProps> = ({
  activeTab,
  onTabChange,
  sessionDetails,
  lessonData,
  isLessonLoading,
  messages,
  transcript,
  isRecording,
  isSpeaking,
  audioLevel,
  isComplete,
  toggleRecording,
  onComplete,
}) => {
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={onTabChange}
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
        
        <ConversationPanel 
          messages={messages}
          transcript={transcript}
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
          isComplete={isComplete}
          toggleRecording={toggleRecording}
          onComplete={onComplete}
        />
      </TabsContent>
      
      <TabsContent value="lesson" className="mt-0 flex-1 flex flex-col overflow-hidden">
        <LessonContentPanel 
          lessonData={lessonData}
          isLoading={isLessonLoading}
          sessionDetails={sessionDetails}
          onBackToChat={() => onTabChange('conversation')}
        />
      </TabsContent>
    </Tabs>
  );
};

export default SessionTabs;
