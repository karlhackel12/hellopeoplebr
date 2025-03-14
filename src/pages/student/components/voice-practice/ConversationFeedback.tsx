
import React from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface ConversationFeedbackProps {
  confidenceScore: number | null;
  rateConfidence: (score: number) => void;
  handleEndConversation: () => void;
}

const ConversationFeedback: React.FC<ConversationFeedbackProps> = ({
  confidenceScore,
  rateConfidence,
  handleEndConversation
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Rate Your Confidence
        </CardTitle>
        <CardDescription>
          How confident did you feel during this conversation practice?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
            <Button
              key={score}
              variant={confidenceScore === score ? "default" : "outline"}
              size="lg"
              className="w-16 h-16 text-lg"
              onClick={() => rateConfidence(score)}
            >
              {score}
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        <Button onClick={handleEndConversation}>
          End Conversation
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConversationFeedback;
