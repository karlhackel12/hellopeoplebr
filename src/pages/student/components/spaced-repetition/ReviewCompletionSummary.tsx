
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';

interface ReviewCompletionSummaryProps {
  correctCount: number;
  totalReviewed: number;
  totalPointsEarned: number;
  onBack: () => void;
}

const Trophy: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
  </svg>
);

const ReviewCompletionSummary: React.FC<ReviewCompletionSummaryProps> = ({
  correctCount,
  totalReviewed,
  totalPointsEarned,
  onBack
}) => {
  const confettiRef = useRef<HTMLDivElement>(null);
  const percentCorrect = totalReviewed > 0 ? Math.round((correctCount / totalReviewed) * 100) : 0;
  
  // Trigger confetti animation for perfect score
  useEffect(() => {
    if (confettiRef.current && totalReviewed > 0 && correctCount === totalReviewed) {
      const rect = confettiRef.current.getBoundingClientRect();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight
        }
      });
    }
  }, [correctCount, totalReviewed]);
  
  return (
    <Card className="mx-auto max-w-2xl" ref={confettiRef}>
      <CardHeader className="text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardTitle className="text-2xl">Review Complete!</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6 pb-4 px-6">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
            <Trophy className="h-12 w-12 text-indigo-600" />
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-1">{totalPointsEarned} points earned</h2>
          <p className="text-muted-foreground">
            You've answered {correctCount} out of {totalReviewed} items correctly
          </p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Accuracy</span>
            <span>{percentCorrect}%</span>
          </div>
          <Progress value={percentCorrect} 
            className="h-3" 
            indicatorClassName={
              percentCorrect >= 80 ? "bg-green-500" : 
              percentCorrect >= 60 ? "bg-yellow-500" : 
              "bg-red-500"
            } 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{correctCount}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </div>
          
          <div className="border rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{totalReviewed - correctCount}</div>
            <div className="text-sm text-muted-foreground">Missed</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-slate-50 border-t p-4">
        <Button onClick={onBack} className="w-full">
          Return to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReviewCompletionSummary;
