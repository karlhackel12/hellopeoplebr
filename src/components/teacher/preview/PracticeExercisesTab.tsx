
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, Book, Award } from 'lucide-react';
import ProgressTracker from './ProgressTracker';

interface PracticeExercisesTabProps {
  isOnboarding?: boolean;
  completedSteps?: string[];
}

const PracticeExercisesTab: React.FC<PracticeExercisesTabProps> = ({ 
  isOnboarding = false,
  completedSteps = []
}) => {
  if (isOnboarding) {
    const totalOnboardingSteps = 7;
    const onboardingSteps = [
      'Create Account',
      'Complete Profile',
      'Connect with Teacher',
      'First Assignment',
      'Take Orientation',
      'Set Learning Goals',
      'View Progress Dashboard'
    ];
    
    const nextStep = onboardingSteps[completedSteps.length];
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Welcome to HelloPeople!</CardTitle>
            <CardDescription>
              Follow these steps to get started with your language learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {onboardingSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                    completedSteps.includes(step)
                      ? "border-primary bg-primary text-primary-foreground"
                      : index === completedSteps.length
                        ? "border-primary text-primary"
                        : "border-muted-foreground/20 text-muted-foreground"
                  )}>
                    {completedSteps.includes(step) ? (
                      <CheckCircle className="h-3.5 w-3.5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className={cn(
                      "text-sm font-medium leading-none",
                      completedSteps.includes(step)
                        ? "text-foreground line-through opacity-70"
                        : index === completedSteps.length
                          ? "text-foreground"
                          : "text-muted-foreground"
                    )}>
                      {step}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {completedSteps.length < totalOnboardingSteps && (
              <Button className="mt-6 w-full">
                Continue to {nextStep} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {completedSteps.length === totalOnboardingSteps && (
              <div className="mt-6 rounded-lg bg-primary/10 p-4 text-center">
                <Award className="mx-auto h-8 w-8 text-primary mb-2" />
                <p className="font-medium">Congratulations! You've completed all onboarding steps.</p>
                <Button className="mt-4" variant="outline">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Lightbulb className="mr-2 h-4 w-4 text-amber-500" />
                <span className="text-xs">Practice daily for best results</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Book className="mr-2 h-4 w-4 text-blue-500" />
                <span className="text-xs">Access learning materials</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Award className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-xs">{completedSteps.length} of {totalOnboardingSteps} steps completed</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <ProgressTracker 
          completedSections={completedSteps} 
          totalSections={totalOnboardingSteps}
          customLabel="Onboarding Progress"
        />
      </div>
    );
  }
  
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Practice exercises will be available after you save the lesson</p>
    </div>
  );
};

export default PracticeExercisesTab;

// Helper function for conditional classnames
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};
