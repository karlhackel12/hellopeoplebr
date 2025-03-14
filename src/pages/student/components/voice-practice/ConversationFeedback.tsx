
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, BarChart2, BookOpen, ZapIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from '@/components/ui/progress';

interface ConversationFeedbackProps {
  confidenceScore: number | null;
  rateConfidence: (score: number) => void;
  handleEndConversation: () => void;
  analyticsData?: {
    vocabulary?: {
      used: string[];
      unique: number;
      total: number;
    };
    grammar?: {
      score: number;
      errors: string[];
    };
    fluency?: {
      score: number;
      wordsPerMinute: number;
    };
    speakingTime?: number;
  };
  lessonTopics?: string[];
}

const ConversationFeedback: React.FC<ConversationFeedbackProps> = ({
  confidenceScore,
  rateConfidence,
  handleEndConversation,
  analyticsData,
  lessonTopics = []
}) => {
  const [activeTab, setActiveTab] = useState("confidence");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Session Feedback</CardTitle>
        <CardDescription>
          Rate your performance and review analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="confidence" className="flex gap-2">
              <Star className="h-4 w-4" />
              <span>Confidence</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex gap-2" disabled={!analyticsData}>
              <BarChart2 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex gap-2" disabled={lessonTopics.length === 0}>
              <BookOpen className="h-4 w-4" />
              <span>Topics</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="confidence">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Rate Your Confidence
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                How confident did you feel during this conversation practice?
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                  <Button
                    key={score}
                    variant={confidenceScore === score ? "default" : "outline"}
                    size="lg"
                    className="w-12 h-12 text-lg"
                    onClick={() => rateConfidence(score)}
                  >
                    {score}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            {analyticsData ? (
              <div className="space-y-4">
                {analyticsData.vocabulary && (
                  <div>
                    <h3 className="font-medium mb-2">Vocabulary Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Unique Words</span>
                        <span className="font-medium">{analyticsData.vocabulary.unique}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Words</span>
                        <span className="font-medium">{analyticsData.vocabulary.total}</span>
                      </div>
                      {analyticsData.vocabulary.used.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-1">Words you used:</p>
                          <div className="flex flex-wrap gap-1">
                            {analyticsData.vocabulary.used.slice(0, 10).map((word, i) => (
                              <div key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                                {word}
                              </div>
                            ))}
                            {analyticsData.vocabulary.used.length > 10 && (
                              <div className="px-2 py-0.5 bg-slate-50 text-slate-700 rounded text-xs">
                                +{analyticsData.vocabulary.used.length - 10} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {analyticsData.grammar && (
                  <div>
                    <h3 className="font-medium mb-2">Grammar Performance</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Score:</span>
                        <Progress value={analyticsData.grammar.score * 10} className="h-2 flex-1" />
                        <span className="font-medium">{analyticsData.grammar.score}/10</span>
                      </div>
                      {analyticsData.grammar.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-1">Common errors:</p>
                          <ul className="text-xs space-y-1 list-disc list-inside">
                            {analyticsData.grammar.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {analyticsData.fluency && (
                  <div>
                    <h3 className="font-medium mb-2">Fluency</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Score:</span>
                        <Progress value={analyticsData.fluency.score * 10} className="h-2 flex-1" />
                        <span className="font-medium">{analyticsData.fluency.score}/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Words per minute:</span>
                        <span className="font-medium">{analyticsData.fluency.wordsPerMinute}</span>
                      </div>
                      {analyticsData.speakingTime && (
                        <div className="flex justify-between text-sm">
                          <span>Total speaking time:</span>
                          <span className="font-medium">{Math.floor(analyticsData.speakingTime / 60)}m {analyticsData.speakingTime % 60}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Analytics data will be available after completing the conversation.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="topics">
            {lessonTopics.length > 0 ? (
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <ZapIcon className="h-5 w-5 text-amber-500" />
                  Topics Covered
                </h3>
                <ul className="space-y-2">
                  {lessonTopics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No specific topics were practiced in this session.
              </div>
            )}
          </TabsContent>
        </Tabs>
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
