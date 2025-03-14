
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BarChart3 } from 'lucide-react';
import { ConversationMessage } from '../../hooks/useVoiceConversation';
import ConversationDisplay from './ConversationDisplay';
import ConversationRecorder from './ConversationRecorder';
import ConversationFeedback from './ConversationFeedback';

interface ConversationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  messages: ConversationMessage[];
  isLoading: boolean;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: (audioBlob: Blob, transcript: string) => void;
  confidenceScore: number | null;
  rateConfidence: (score: number) => void;
  handleEndConversation: () => void;
  liveTranscript?: string;
  isTranscribing?: boolean;
}

const ConversationTabs: React.FC<ConversationTabsProps> = ({
  activeTab,
  setActiveTab,
  messages,
  isLoading,
  isRecording,
  onStartRecording,
  onStopRecording,
  confidenceScore,
  rateConfidence,
  handleEndConversation,
  liveTranscript = '',
  isTranscribing = false
}) => {
  return (
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
            isTranscribing={isTranscribing}
            liveTranscript={liveTranscript}
          />
          
          <ConversationRecorder 
            isRecording={isRecording}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            maxDurationSeconds={120}
            isWaitingForResponse={isLoading}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="feedback">
        <ConversationFeedback
          confidenceScore={confidenceScore}
          rateConfidence={rateConfidence}
          handleEndConversation={handleEndConversation}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ConversationTabs;
