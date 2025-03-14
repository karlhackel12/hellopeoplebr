
import React from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface ConversationHeaderProps {
  practiceTopic: string;
  lesson?: { title: string; content?: string } | null;
  difficultyLevel: number;
  setDifficultyLevel: (level: number) => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  practiceTopic,
  lesson,
  difficultyLevel,
  setDifficultyLevel
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{practiceTopic}</CardTitle>
            <CardDescription>
              {lesson 
                ? `Practice conversation based on lesson content`
                : `Free conversation practice to improve your speaking skills`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(level => (
              <Button
                key={level}
                size="sm"
                variant={difficultyLevel === level ? "default" : "outline"}
                onClick={() => setDifficultyLevel(level)}
              >
                Level {level}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Conversation Tips</AlertTitle>
          <AlertDescription>
            Speak naturally and try to keep the conversation flowing. The AI will adapt to your
            level and help you practice English. Click the microphone to start speaking.
          </AlertDescription>
        </Alert>
        
        {lesson && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Lesson Context:</h3>
            <div className="bg-slate-50 p-4 rounded-md text-sm max-h-32 overflow-y-auto">
              {lesson.content?.slice(0, 300)}...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationHeader;
