
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Info, BookOpen, MessageCircle, PenTool } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConversationHeaderProps {
  practiceTopic: string;
  lesson?: { title: string; content?: string } | null;
  difficultyLevel: number;
  setDifficultyLevel: (level: number) => void;
  vocabularyItems?: string[];
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  practiceTopic,
  lesson,
  difficultyLevel,
  setDifficultyLevel,
  vocabularyItems = []
}) => {
  const [activeTab, setActiveTab] = useState("info");

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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="info" className="flex gap-2">
              <Info className="h-4 w-4" />
              <span>Tips</span>
            </TabsTrigger>
            <TabsTrigger value="lesson" className="flex gap-2" disabled={!lesson}>
              <BookOpen className="h-4 w-4" />
              <span>Lesson</span>
            </TabsTrigger>
            <TabsTrigger value="vocabulary" className="flex gap-2" disabled={vocabularyItems.length === 0}>
              <PenTool className="h-4 w-4" />
              <span>Vocabulary</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Conversation Tips</AlertTitle>
              <AlertDescription>
                Speak naturally and try to keep the conversation flowing. The AI will adapt to your
                level and help you practice English. Click the microphone to start speaking.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="lesson">
            {lesson && (
              <div>
                <h3 className="font-medium mb-2">Lesson Context:</h3>
                <div className="bg-slate-50 p-4 rounded-md text-sm max-h-48 overflow-y-auto">
                  {lesson.content?.slice(0, 500)}...
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="vocabulary">
            {vocabularyItems.length > 0 ? (
              <div>
                <h3 className="font-medium mb-2">Key Vocabulary:</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vocabularyItems.map((word, i) => (
                    <div key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No vocabulary items available for this session.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConversationHeader;
