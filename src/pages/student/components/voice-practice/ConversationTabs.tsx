
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BarChart3, BookOpen, Lightbulb, Check, AlertCircle } from 'lucide-react';
import { ConversationMessage } from '../../hooks/useVoiceConversation';
import ConversationDisplay from './ConversationDisplay';
import ConversationRecorder from './ConversationRecorder';
import ConversationFeedback from './ConversationFeedback';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  minTurnsRequired?: number;
  currentTurns?: number;
  isCompleted?: boolean;
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
  suggestedResponses = [],
  minTurnsRequired = 3,
  currentTurns = 0,
  isCompleted = false
}) => {
  const requirementProgress = Math.min(100, (currentTurns / minTurnsRequired) * 100);
  const canComplete = currentTurns >= minTurnsRequired;
  
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
          
          {!isCompleted && (
            <ConversationRecorder 
              isRecording={isRecording}
              onStartRecording={onStartRecording}
              onStopRecording={onStopRecording}
              maxDurationSeconds={120}
              isWaitingForResponse={isLoading}
            />
          )}
          
          {/* Completion Requirements Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {canComplete ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  Completion Requirements
                </span>
                <Badge 
                  variant={canComplete ? "default" : "outline"}
                  className={canComplete ? "bg-green-100 text-green-700 border-green-200" : ""}
                >
                  {currentTurns} / {minTurnsRequired} turns
                </Badge>
              </CardTitle>
              <Progress 
                value={requirementProgress} 
                className="h-1" 
                indicatorClassName={canComplete ? "bg-green-500" : "bg-amber-500"} 
              />
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                {canComplete 
                  ? `You've reached the minimum requirement of ${minTurnsRequired} conversation turns. You can end the conversation now or continue practicing.` 
                  : `Complete at least ${minTurnsRequired} conversation turns to mark this practice as complete.`}
              </p>
            </CardContent>
            <CardFooter className="border-t pt-3 pb-3">
              <Button 
                onClick={handleEndConversation}
                disabled={!canComplete || isCompleted}
                className="w-full"
                variant={isCompleted ? "outline" : "default"}
              >
                {isCompleted ? "Completed" : "Complete Conversation Practice"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="feedback">
        <ConversationFeedback
          confidenceScore={confidenceScore}
          rateConfidence={rateConfidence}
          handleEndConversation={handleEndConversation}
          analyticsData={analyticsData}
          lessonTopics={lessonTopics}
          canComplete={canComplete}
          isCompleted={isCompleted}
        />
      </TabsContent>
      
      <TabsContent value="suggestions">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Suggested Responses
            </CardTitle>
            <CardDescription>
              Not sure what to say? Here are some ideas to help keep the conversation going.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestedResponses.length > 0 ? (
              <div className="space-y-3">
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
