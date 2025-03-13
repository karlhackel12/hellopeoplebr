
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface QuestionDifficulty {
  questionId: string;
  questionText: string;
  successRate: number;
}

interface QuizAnalyticsCardProps {
  title: string;
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
  questionDifficulty: QuestionDifficulty[];
}

const QuizAnalyticsCard: React.FC<QuizAnalyticsCardProps> = ({
  title,
  totalAttempts,
  averageScore,
  completionRate,
  questionDifficulty
}) => {
  // Prepare chart data
  const chartData = questionDifficulty.map((q, index) => ({
    id: q.questionId,
    name: `Q${index + 1}`,
    rate: Math.round(q.successRate),
    fullText: q.questionText
  }));
  
  // Define color based on success rate
  const getBarColor = (rate: number) => {
    if (rate >= 80) return '#10b981'; // green
    if (rate >= 60) return '#22c55e'; // green-500
    if (rate >= 40) return '#eab308'; // yellow-500
    if (rate >= 20) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalAttempts}</p>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(averageScore)}%</p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
          </div>
          
          {/* Question Performance Chart */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Question Performance</h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 shadow-lg border rounded">
                            <p className="text-sm font-medium">{data.fullText}</p>
                            <p className="text-sm text-muted-foreground">
                              Success rate: {data.rate}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="rate" fill="#10b981">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizAnalyticsCard;
