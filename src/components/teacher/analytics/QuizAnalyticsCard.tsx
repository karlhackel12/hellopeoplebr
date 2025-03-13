
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuizAnalytics } from '../hooks/quiz/useQuizAnalytics';
import { Progress } from '@/components/ui/progress';
import { Loader2, Award, BarChart3, Users, AlertTriangle } from 'lucide-react';

interface QuizAnalyticsCardProps {
  quizId: string;
  quizTitle: string;
}

const QuizAnalyticsCard: React.FC<QuizAnalyticsCardProps> = ({ quizId, quizTitle }) => {
  const analytics = useQuizAnalytics(quizId);

  if (analytics.loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Quiz Analytics
          </CardTitle>
          <CardDescription>
            Gathering performance data for {quizTitle}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const hasAttempts = analytics.totalAttempts > 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Quiz Analytics: {quizTitle}
        </CardTitle>
        <CardDescription>
          Performance metrics and insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAttempts ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-muted-foreground opacity-50" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No attempts yet</p>
              <p className="text-xs text-muted-foreground">
                Analytics will appear once students start taking this quiz
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <MetricCard 
                title="Total Attempts" 
                value={analytics.totalAttempts.toString()} 
                icon={<Users className="h-4 w-4" />}
              />
              <MetricCard 
                title="Pass Rate" 
                value={`${Math.round(analytics.passRate)}%`} 
                icon={<Award className="h-4 w-4" />}
              />
              <MetricCard 
                title="Avg. Score" 
                value={`${Math.round(analytics.averageScore)}%`} 
                icon={<BarChart3 className="h-4 w-4" />}
              />
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium">Completion Rate</h4>
              <div className="space-y-1">
                <Progress value={analytics.completionRate} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.round(analytics.completionRate)}% of students complete the quiz
                </p>
              </div>
            </div>

            {analytics.difficultQuestions.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-sm font-medium">Most Challenging Questions</h4>
                <div className="space-y-2">
                  {analytics.difficultQuestions.map((q) => (
                    <div key={q.questionId} className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="truncate max-w-[80%]">{q.questionText}</span>
                        <span className="font-medium">{Math.round(q.correctRate)}%</span>
                      </div>
                      <Progress value={q.correctRate} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Helper component for metrics
const MetricCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ 
  title, 
  value, 
  icon 
}) => {
  return (
    <div className="bg-muted/40 p-3 rounded-lg">
      <div className="flex justify-between items-start">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="bg-primary/10 p-1 rounded text-primary">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
};

export default QuizAnalyticsCard;
