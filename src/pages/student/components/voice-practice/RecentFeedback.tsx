
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Star, Clock, BookOpen, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { VoicePracticeFeedback } from '../../hooks/useVoicePractice';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RecentFeedbackProps {
  feedback: VoicePracticeFeedback[];
  loading?: boolean;
}

const RecentFeedback: React.FC<RecentFeedbackProps> = ({ feedback, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" /> Recent Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" /> Conversation Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feedback && feedback.length > 0 ? (
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              {((item.pronunciation_score || 0) + (item.grammar_score || 0) + (item.fluency_score || 0)) / 3 > 0 
                                ? (((item.pronunciation_score || 0) + (item.grammar_score || 0) + (item.fluency_score || 0)) / 3).toFixed(1) 
                                : "N/A"}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Overall score</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {item.grammar_score && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                                <span>G: {item.grammar_score.toFixed(1)}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Grammar score</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {item.fluency_score && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-xs">
                                <span>F: {item.fluency_score.toFixed(1)}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Fluency score</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {item.pronunciation_score && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                                <span>P: {item.pronunciation_score.toFixed(1)}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Pronunciation score</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{item.feedback_text}</p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 text-xs px-2 py-0.5">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Conversation
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No feedback yet. Start a conversation practice!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentFeedback;
