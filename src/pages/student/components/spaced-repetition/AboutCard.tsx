
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Trophy, Clock, Info } from 'lucide-react';

const AboutCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Info className="h-5 w-5" /> About Spaced Repetition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <p>
            <strong>Spaced Repetition</strong> is a learning technique that incorporates increasing time intervals 
            between reviews of previously learned material to exploit the psychological spacing effect.
          </p>
          <div className="flex items-start gap-2">
            <Brain className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
            <p>
              The system automatically schedules reviews based on how well you remember each item, 
              showing you difficult content more frequently and easy content less often.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Trophy className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
            <p>
              Earn points for each correctly answered question. The faster you answer and the 
              better your recall, the more points you'll receive.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
            <p>
              Just a few minutes of review each day can dramatically improve your long-term retention
              of the material compared to cramming.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutCard;
