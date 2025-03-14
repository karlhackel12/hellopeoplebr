
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Activity, 
  BarChart3, 
  Clock, 
  MessageCircle,
  BookOpen,
  Check,
  AlertCircle
} from 'lucide-react';

interface ConversationFeedbackProps {
  confidenceScore: number | null;
  rateConfidence: (score: number) => void;
  handleEndConversation: () => void;
  analyticsData?: any;
  lessonTopics?: string[];
  canComplete?: boolean;
  isCompleted?: boolean;
}

const ConversationFeedback: React.FC<ConversationFeedbackProps> = ({
  confidenceScore,
  rateConfidence,
  handleEndConversation,
  analyticsData,
  lessonTopics = [],
  canComplete = false,
  isCompleted = false
}) => {
  const renderScore = (score: number, maxScore: number = 10) => {
    const percentage = (score / maxScore) * 100;
    const getColor = () => {
      if (percentage >= 80) return 'bg-green-500';
      if (percentage >= 60) return 'bg-amber-500';
      return 'bg-red-500';
    };
    
    return (
      <Progress value={percentage} className="h-1.5" indicatorClassName={getColor()} />
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Rate your confidence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            How confident do you feel?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Rate your confidence in this conversation from 1 to 10.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[2, 4, 6, 8, 10].map(score => (
              <Button
                key={score}
                variant={confidenceScore === score ? "default" : "outline"}
                className={`h-10 ${confidenceScore === score ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                onClick={() => rateConfidence(score)}
                disabled={isCompleted}
              >
                {score}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            {canComplete ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
            Completion Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">
              {isCompleted ? "Completed" : canComplete ? "Ready to complete" : "In progress"}
            </span>
            <Badge 
              variant={isCompleted ? "default" : canComplete ? "outline" : "secondary"}
              className={isCompleted ? "bg-green-100 text-green-700 border-green-200" : ""}
            >
              {isCompleted ? "Finished" : canComplete ? "Requirements met" : "Need more practice"}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-6 h-6 flex items-center justify-center">
                {analyticsData?.conversationTurns >= 3 ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div className="ml-2 flex-1">
                <p className="text-sm">At least 3 conversational turns</p>
                <p className="text-xs text-muted-foreground">
                  {analyticsData?.conversationTurns || 0} / 3 turns completed
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-6 h-6 flex items-center justify-center">
                {confidenceScore ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <div className="ml-2 flex-1">
                <p className="text-sm">Rate your confidence</p>
                <p className="text-xs text-muted-foreground">
                  {confidenceScore ? `Rated ${confidenceScore}/10` : "Not yet rated"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-3">
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
      
      {/* Analytics data */}
      {analyticsData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Conversation Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Grammar Score */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Grammar Quality</span>
                <span className="text-sm">{(analyticsData.grammar.score * 10).toFixed(1)}/10</span>
              </div>
              {renderScore(analyticsData.grammar.score)}
            </div>
            
            {/* Fluency Score */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Speaking Fluency</span>
                <span className="text-sm">{(analyticsData.fluency.score * 10).toFixed(1)}/10</span>
              </div>
              {renderScore(analyticsData.fluency.score)}
            </div>
            
            {/* Vocabulary Usage */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Vocabulary Usage</span>
                <span className="text-sm">{analyticsData.vocabulary.used.length}/{analyticsData.vocabulary.unique} words</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {analyticsData.vocabulary.used.map((word: string, i: number) => (
                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Speaking Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <Clock className="h-5 w-5 text-slate-400 mb-1" />
                <div className="text-lg font-semibold">{Math.round(analyticsData.speakingTime)}s</div>
                <div className="text-xs text-muted-foreground">Speaking Time</div>
              </div>
              
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <BarChart3 className="h-5 w-5 text-slate-400 mb-1" />
                <div className="text-lg font-semibold">{analyticsData.fluency.wordsPerMinute}</div>
                <div className="text-xs text-muted-foreground">Words per Minute</div>
              </div>
              
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <MessageCircle className="h-5 w-5 text-slate-400 mb-1" />
                <div className="text-lg font-semibold">{analyticsData.conversationTurns || analyticsData.vocabulary.total}</div>
                <div className="text-xs text-muted-foreground">Total Responses</div>
              </div>
              
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <BookOpen className="h-5 w-5 text-slate-400 mb-1" />
                <div className="text-lg font-semibold">{lessonTopics.length}</div>
                <div className="text-xs text-muted-foreground">Topics Covered</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConversationFeedback;
