
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

type TimeRange = '7d' | '30d' | '90d';

// Define a specific type for the chart data
interface ChartDataPoint {
  date: string;
  lessonCompletions: number;
  quizCompletions: number;
  spacedRepetitions: number;
}

const PerformanceChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const today = new Date();
        let startDate: Date;
        
        // Determine the start date based on the selected time range
        switch (timeRange) {
          case '7d':
            startDate = subDays(today, 7);
            break;
          case '30d':
            startDate = subDays(today, 30);
            break;
          case '90d':
            startDate = subDays(today, 90);
            break;
          default:
            startDate = subDays(today, 7);
        }

        // Format dates for database query
        const startDateStr = startDate.toISOString();
        const endDateStr = today.toISOString();

        // Fetch lesson completions
        const { data: lessonCompletions, error: lessonError } = await supabase
          .from('user_lesson_progress')
          .select('completed_at')
          .gte('completed_at', startDateStr)
          .lte('completed_at', endDateStr)
          .eq('completed', true);

        if (lessonError) {
          console.error('Error fetching lesson completions:', lessonError);
          return;
        }

        // Fetch quiz completions
        const { data: quizCompletions, error: quizError } = await supabase
          .from('user_quiz_attempts')
          .select('completed_at')
          .gte('completed_at', startDateStr)
          .lte('completed_at', endDateStr)
          .not('completed_at', 'is', null);

        if (quizError) {
          console.error('Error fetching quiz completions:', quizError);
          return;
        }

        // Fetch spaced repetition reviews
        const { data: spacedRepetitionReviews, error: spaceRepError } = await supabase
          .from('spaced_repetition_stats')
          .select('review_date')
          .gte('review_date', startDateStr)
          .lte('review_date', endDateStr);

        if (spaceRepError) {
          console.error('Error fetching spaced repetition reviews:', spaceRepError);
          return;
        }

        // Process data for the chart - group by date
        // Create map to collect counts by date
        const dateMap = new Map<string, { lessons: number, quizzes: number, repetitions: number }>();

        // Calculate number of days based on time range
        const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
        
        // Initialize all days with 0 counts
        for (let i = 0; i < daysCount; i++) {
          const date = subDays(today, daysCount - 1 - i);
          const dateKey = format(date, 'yyyy-MM-dd');
          dateMap.set(dateKey, { lessons: 0, quizzes: 0, repetitions: 0 });
        }

        // Count lesson completions by date
        lessonCompletions?.forEach(item => {
          if (item.completed_at) {
            const dateKey = format(new Date(item.completed_at), 'yyyy-MM-dd');
            const currentData = dateMap.get(dateKey) || { lessons: 0, quizzes: 0, repetitions: 0 };
            dateMap.set(dateKey, { ...currentData, lessons: currentData.lessons + 1 });
          }
        });

        // Count quiz completions by date
        quizCompletions?.forEach(item => {
          if (item.completed_at) {
            const dateKey = format(new Date(item.completed_at), 'yyyy-MM-dd');
            const currentData = dateMap.get(dateKey) || { lessons: 0, quizzes: 0, repetitions: 0 };
            dateMap.set(dateKey, { ...currentData, quizzes: currentData.quizzes + 1 });
          }
        });

        // Count spaced repetition reviews by date
        spacedRepetitionReviews?.forEach(item => {
          if (item.review_date) {
            const dateKey = format(new Date(item.review_date), 'yyyy-MM-dd');
            const currentData = dateMap.get(dateKey) || { lessons: 0, quizzes: 0, repetitions: 0 };
            dateMap.set(dateKey, { ...currentData, repetitions: currentData.repetitions + 1 });
          }
        });

        // Transform map to array and sort by date
        const formattedData = Array.from(dateMap.entries()).map(([date, counts]) => ({
          date,
          lessonCompletions: counts.lessons,
          quizCompletions: counts.quizzes,
          spacedRepetitions: counts.repetitions
        }));

        formattedData.sort((a, b) => a.date.localeCompare(b.date));
        
        // Format dates for display
        const finalData = formattedData.map(item => ({
          ...item,
          date: format(new Date(item.date), 'MMM dd') // Format date for display
        }));
        
        setChartData(finalData);
      } catch (error) {
        console.error('Error generating chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [timeRange]);

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Student Performance</CardTitle>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex items-center justify-center h-[350px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="lessonCompletions" 
                name="Lessons" 
                stackId="1"
                stroke="#8884d8" 
                fill="#8884d8" 
              />
              <Area 
                type="monotone" 
                dataKey="quizCompletions" 
                name="Quizzes" 
                stackId="1"
                stroke="#82ca9d" 
                fill="#82ca9d" 
              />
              <Area 
                type="monotone" 
                dataKey="spacedRepetitions" 
                name="Reviews" 
                stackId="1"
                stroke="#ffc658" 
                fill="#ffc658" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground">
            No data available for this time period
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
