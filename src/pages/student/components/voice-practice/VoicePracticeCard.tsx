
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Clock, Award, Activity, MessageCircle, BarChart3, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface VoicePracticeCardProps {
  sessionCount: number;
  completedSessions: number;
  averageDuration: number;
  highestDifficulty: number;
  averageScores: {
    overall: number;
    grammar: number;
    fluency: number;
    vocabulary: number;
  };
  topicsCount?: number;
  loading?: boolean;
}

const VoicePracticeCard: React.FC<VoicePracticeCardProps> = ({
  sessionCount,
  completedSessions,
  averageDuration,
  highestDifficulty,
  averageScores,
  topicsCount = 0,
  loading = false
}) => {
  const navigate = useNavigate();
  
  const startPractice = () => {
    navigate('/student/voice-practice/session');
  };
  
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 text-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1 flex items-center gap-2">
              <Mic className="h-5 w-5" /> Conversation Practice
            </CardTitle>
            <CardDescription className="text-slate-100 opacity-90">
              Improve your speaking with AI conversations
            </CardDescription>
          </div>
          <div className="bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Award className="h-4 w-4 text-yellow-300" />
            <span className="font-bold">{highestDifficulty > 0 ? `Level ${highestDifficulty}` : 'New'}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        {loading ? (
          <div className="py-8 flex justify-center items-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-32 bg-slate-200 rounded mb-4"></div>
              <div className="h-4 w-48 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium">{completedSessions} / {sessionCount} conversations</span>
              </div>
              <Progress 
                value={sessionCount > 0 ? (completedSessions / sessionCount) * 100 : 0} 
                className="h-2" 
                indicatorClassName={completedSessions === sessionCount ? "bg-green-500" : "bg-violet-500"} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <BarChart3 className="h-5 w-5 text-blue-500 mb-1" />
                <div className="text-lg font-bold">{averageScores.grammar.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Grammar</div>
              </div>
              
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <Activity className="h-5 w-5 text-violet-500 mb-1" />
                <div className="text-lg font-bold">{averageScores.fluency.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Fluency</div>
              </div>
              
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <BookOpen className="h-5 w-5 text-indigo-500 mb-1" />
                <div className="text-lg font-bold">{averageScores.vocabulary.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Vocabulary</div>
              </div>
              
              <div className="border rounded-lg p-3 flex flex-col items-center justify-center">
                <MessageCircle className="h-5 w-5 text-amber-500 mb-1" />
                <div className="text-lg font-bold">{topicsCount || 0}</div>
                <div className="text-xs text-muted-foreground">Topics</div>
              </div>
              
              <div className="col-span-2 border rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">Average Duration</div>
                    <div className="text-xs text-muted-foreground">Per conversation</div>
                  </div>
                </div>
                <div className="text-lg font-bold">{Math.round(averageDuration || 0)}s</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-slate-50 px-6">
        <Button 
          onClick={startPractice} 
          className="w-full bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700"
          disabled={loading}
        >
          Start Conversation Practice
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VoicePracticeCard;
