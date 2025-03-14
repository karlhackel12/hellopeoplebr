
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BarChart3, BookOpen, Lightbulb } from 'lucide-react';
import { ConversationMessage } from '../../hooks/useVoiceConversation';
import ConversationDisplay from './ConversationDisplay';
import ConversationRecorder from './ConversationRecorder';
import ConversationFeedback from './ConversationFeedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  analyticsData?: any;
  activeVocabulary?: string[];
  lessonTopics?: string[];
  suggestedResponses?: string[];
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
  isTranscribing = false,
  analyticsData,
  activeVocabulary = [],
  lessonTopics = [],
  suggestedResponses = []
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="conversation" className="flex gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Conversation</span>
        </TabsTrigger>
        <TabsTrigger value="feedback" className="flex gap-2" disabled={messages.length === 0}>
          <BarChart3 className="h-4 w-4" />
          <span>Feedback</span>
        </TabsTrigger>
        <TabsTrigger value="suggestions" className="flex gap-2" disabled={suggestedResponses.length === 0}>
          <Lightbulb className="h-4 w-4" />
          <span>Help</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="conversation">
        <div className="grid grid-cols-1 gap-6">
          <ConversationDisplay 
            messages={messages}
            isLoading={isLoading}
            isTranscribing={isTranscribing}
            liveTranscript={liveTranscript}
            activeVocabulary={activeVocabulary}
            highlightTopics={true}
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
          analyticsData={analyticsData}
          lessonTopics={lessonTopics}
        />
      </TabsContent>
      
      <TabsContent value="suggestions">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Suggested Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestedResponses.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Not sure what to say? Here are some suggestions you can try:
                </p>
                {suggestedResponses.map((suggestion, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-md border hover:bg-slate-100 cursor-pointer transition-colors">
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Suggestions will appear here as you practice.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ConversationTabs;
