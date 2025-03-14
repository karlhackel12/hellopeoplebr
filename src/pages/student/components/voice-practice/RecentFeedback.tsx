
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { VoicePracticeFeedback } from '../../hooks/useVoicePractice';

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
          <MessageSquare className="h-5 w-5 text-blue-500" /> Recent Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feedback && feedback.length > 0 ? (
          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {item.pronunciation_score && item.grammar_score && item.fluency_score && (
                        <div className="flex items-center bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          {((item.pronunciation_score + item.grammar_score + item.fluency_score) / 3).toFixed(1)}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.feedback_text}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No feedback yet. Start a practice session!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentFeedback;
