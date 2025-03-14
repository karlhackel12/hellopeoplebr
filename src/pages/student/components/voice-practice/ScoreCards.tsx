
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { VolumeX, Volume2, Zap } from 'lucide-react';

interface ScoreCardsProps {
  scores: {
    overall: number;
    pronunciation: number;
    grammar: number;
    fluency: number;
  };
}

const ScoreCards: React.FC<ScoreCardsProps> = ({ scores }) => {
  // Helper function to determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-blue-500';
    if (score >= 4) return 'text-amber-500';
    return 'text-red-500';
  };

  // Helper function to determine background color based on score
  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-50';
    if (score >= 6) return 'bg-blue-50';
    if (score >= 4) return 'bg-amber-50';
    return 'bg-red-50';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={getScoreBgColor(scores.overall)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Overall</h3>
              <p className="text-sm text-muted-foreground">Your overall speaking score</p>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(scores.overall)}`}>
              {scores.overall.toFixed(1)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={getScoreBgColor(scores.pronunciation)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Pronunciation</h3>
              <p className="text-sm text-muted-foreground">Clarity and accuracy</p>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(scores.pronunciation)}`}>
              {scores.pronunciation.toFixed(1)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={getScoreBgColor(scores.grammar)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Grammar</h3>
              <p className="text-sm text-muted-foreground">Sentence structure</p>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(scores.grammar)}`}>
              {scores.grammar.toFixed(1)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={getScoreBgColor(scores.fluency)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Fluency</h3>
              <p className="text-sm text-muted-foreground">Smoothness and pace</p>
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(scores.fluency)}`}>
              {scores.fluency.toFixed(1)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreCards;
