
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Lightbulb, BarChart, Target } from 'lucide-react';

const VoicePracticeAbout: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" /> About Voice Practice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <div className="flex gap-3">
          <div className="mt-1 flex-shrink-0">
            <Mic className="h-5 w-5 text-blue-500" />
          </div>
          <p>
            <strong className="text-foreground">Real-time Feedback.</strong> Practice speaking with our AI tutor and receive immediate, personalized feedback on your pronunciation, grammar, and fluency.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="mt-1 flex-shrink-0">
            <BarChart className="h-5 w-5 text-violet-500" />
          </div>
          <p>
            <strong className="text-foreground">Track Your Progress.</strong> Each practice session builds your confidence and skills. Watch your scores improve over time with detailed analytics.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="mt-1 flex-shrink-0">
            <Target className="h-5 w-5 text-green-500" />
          </div>
          <p>
            <strong className="text-foreground">Adaptive Difficulty.</strong> As your speaking skills improve, the system gradually increases the difficulty to keep you challenged and growing.
          </p>
        </div>
        
        <p className="pt-2">
          Start with a short practice session based on your recent lessons. Just click "Start Voice Practice" to begin speaking practice with our AI tutor.
        </p>
      </CardContent>
    </Card>
  );
};

export default VoicePracticeAbout;
