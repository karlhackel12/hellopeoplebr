
import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

interface StudentProfileButtonProps {
  studentId: string;
}

const StudentProfileButton: React.FC<StudentProfileButtonProps> = ({ 
  studentId
}) => {
  // Fetch detailed student profile data
  const { data: student, isLoading, refetch } = useQuery({
    queryKey: ['student-profile', studentId],
    queryFn: async () => {
      // First get student profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, created_at')
        .eq('id', studentId)
        .single();
      
      if (profileError) throw profileError;
      
      // Get onboarding data
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('user_onboarding')
        .select('current_step_index, completed_steps, last_updated')
        .eq('user_id', studentId)
        .maybeSingle();
      
      // Get lesson progress
      const { data: lessonProgress, error: lessonError } = await supabase
        .from('user_lesson_progress')
        .select('id, lesson_id, completed, completed_at, last_accessed_at')
        .eq('user_id', studentId);
      
      if (lessonError) throw lessonError;
      
      // Get quiz attempts
      const { data: quizAttempts, error: quizError } = await supabase
        .from('user_quiz_attempts')
        .select('id, quiz_id, score, passed, completed_at')
        .eq('user_id', studentId);
      
      if (quizError) throw quizError;
      
      // Combine all data
      return {
        ...profile,
        user_onboarding: onboardingData || null,
        user_lesson_progress: lessonProgress || [],
        user_quiz_attempts: quizAttempts || []
      };
    },
    enabled: false // Only load when dialog is opened
  });

  // Calculate onboarding progress
  const calculateProgress = () => {
    if (!student?.user_onboarding) return 0;
    const currentStep = student.user_onboarding.current_step_index || 0;
    const totalSteps = 7; // Total steps in onboarding
    return Math.round((currentStep / totalSteps) * 100);
  };

  // Calculate completion rates
  const lessonCompletionRate = student?.user_lesson_progress?.length 
    ? Math.round((student.user_lesson_progress.filter(lp => lp.completed).length / student.user_lesson_progress.length) * 100) 
    : 0;
    
  const quizPassRate = student?.user_quiz_attempts?.length 
    ? Math.round((student.user_quiz_attempts.filter(qa => qa.passed).length / student.user_quiz_attempts.length) * 100) 
    : 0;

  const handleOpenChange = (open: boolean) => {
    if (open) {
      refetch();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
              >
                <User className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>View student profile</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogDescription>
            View detailed information about this student
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="text-center py-4">Loading profile data...</div>
          ) : student ? (
            <>
              <div className="flex items-center gap-4">
                {student.avatar_url ? (
                  <img 
                    src={student.avatar_url} 
                    alt={`${student.first_name} ${student.last_name}`}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-medium">{student.first_name} {student.last_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Joined {format(new Date(student.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Onboarding Progress</span>
                    <span className="text-sm font-medium">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                  {student.user_onboarding?.last_updated && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active: {format(new Date(student.user_onboarding.last_updated), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Lesson Completion Rate</span>
                    <span className="text-sm font-medium">{lessonCompletionRate}%</span>
                  </div>
                  <Progress value={lessonCompletionRate} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {student.user_lesson_progress?.filter(lp => lp.completed).length || 0} of {student.user_lesson_progress?.length || 0} lessons completed
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Quiz Pass Rate</span>
                    <span className="text-sm font-medium">{quizPassRate}%</span>
                  </div>
                  <Progress value={quizPassRate} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {student.user_quiz_attempts?.filter(qa => qa.passed).length || 0} of {student.user_quiz_attempts?.length || 0} quizzes passed
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">Student profile not found</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfileButton;
