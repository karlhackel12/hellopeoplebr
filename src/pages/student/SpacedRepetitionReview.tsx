
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import { useSpacedRepetition } from './hooks/useSpacedRepetition';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Timer, Star, ChevronLeft, ArrowLeft, ArrowRight, Zap, 
  ThumbsUp, ThumbsDown, X, Check
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Rating descriptions for SM-2 algorithm
const ratingDescriptions = [
  { value: 0, label: "Complete blackout", description: "I didn't remember at all" },
  { value: 1, label: "Incorrect response", description: "I recognized the answer though" },
  { value: 2, label: "Incorrect response", description: "But the answer feels familiar" },
  { value: 3, label: "Correct response", description: "But with significant difficulty" },
  { value: 4, label: "Correct response", description: "After some hesitation" },
  { value: 5, label: "Perfect response", description: "Immediate recall" }
];

const SpacedRepetitionReview: React.FC = () => {
  const navigate = useNavigate();
  const { dueItems, recordReview, isLoading, refetchDueItems } = useSpacedRepetition();
  
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [showingRating, setShowingRating] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [totalPointsEarned, setTotalPointsEarned] = useState(0);
  
  const confettiRef = useRef<HTMLDivElement>(null);
  
  // Reset state when items change
  useEffect(() => {
    if (!isLoading && dueItems && dueItems.length > 0) {
      setCurrentItemIndex(0);
      setShowingAnswer(false);
      setShowingRating(false);
      setSelectedOption(null);
      setStartTime(Date.now());
      setPoints(null);
      setReviewComplete(false);
      setCorrectCount(0);
      setTotalReviewed(0);
      setTotalPointsEarned(0);
    }
  }, [dueItems, isLoading]);
  
  // Redirect if no items
  useEffect(() => {
    if (!isLoading && (!dueItems || dueItems.length === 0)) {
      toast.info('No items due for review');
      navigate('/student/spaced-repetition');
    }
  }, [dueItems, isLoading, navigate]);
  
  // Trigger confetti animation for perfect score
  useEffect(() => {
    if (reviewComplete && confettiRef.current && totalReviewed > 0 && correctCount === totalReviewed) {
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
  }, [reviewComplete, correctCount, totalReviewed]);
  
  if (isLoading || !dueItems) {
    return (
      <StudentLayout>
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse space-y-4 w-full max-w-2xl">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-8"></div>
            <div className="h-64 bg-slate-200 rounded w-full"></div>
            <div className="h-12 bg-slate-200 rounded w-full"></div>
          </div>
        </div>
      </StudentLayout>
    );
  }
  
  const currentItem = dueItems[currentItemIndex];
  const currentQuestion = currentItem?.question;
  
  const handleSelectOption = (optionId: string) => {
    if (showingAnswer || showingRating) return;
    
    setSelectedOption(optionId);
    setShowingAnswer(true);
    
    // Add slight delay before showing rating to let user see the result
    setTimeout(() => {
      setShowingRating(true);
    }, 1000);
  };
  
  const isCorrectOption = (optionId: string): boolean => {
    if (!currentQuestion) return false;
    const option = currentQuestion.options?.find(opt => opt.id === optionId);
    return option?.is_correct || false;
  };
  
  const submitRating = async (rating: number) => {
    if (!currentItem) return;
    
    const endTime = Date.now();
    const responseTimeMs = startTime ? endTime - startTime : 5000;
    
    try {
      const result = await recordReview({
        itemId: currentItem.id,
        qualityResponse: rating,
        responseTimeMs
      });
      
      // Update stats
      setTotalReviewed(prev => prev + 1);
      if (rating >= 3) {
        setCorrectCount(prev => prev + 1);
      }
      
      if (result?.points) {
        setPoints(result.points);
        setTotalPointsEarned(prev => prev + result.points);
      }
      
      // Move to next question or complete
      if (currentItemIndex < dueItems.length - 1) {
        setTimeout(() => {
          setCurrentItemIndex(prevIndex => prevIndex + 1);
          setShowingAnswer(false);
          setShowingRating(false);
          setSelectedOption(null);
          setStartTime(Date.now());
          setPoints(null);
        }, 1500);
      } else {
        // All items reviewed
        setReviewComplete(true);
        refetchDueItems();
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast.error('Failed to record your response');
    }
  };
  
  const handleBack = () => {
    navigate('/student/spaced-repetition');
  };
  
  // Render review completion summary
  if (reviewComplete) {
    const percentCorrect = totalReviewed > 0 ? Math.round((correctCount / totalReviewed) * 100) : 0;
    
    return (
      <StudentLayout>
        <div className="container mx-auto p-4">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
          
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
              <Button onClick={handleBack} className="w-full">
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </StudentLayout>
    );
  }
  
  return (
    <StudentLayout>
      <div className="container mx-auto p-4">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
        
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Question {currentItemIndex + 1} of {dueItems.length}
          </div>
          {points !== null && (
            <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-sm font-medium">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              <span>+{points} points</span>
            </div>
          )}
        </div>
        
        <Progress 
          value={(currentItemIndex / dueItems.length) * 100} 
          className="h-2 mb-6" 
        />
        
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-6">
            {currentQuestion ? (
              <div>
                <h3 className="text-xl font-medium mb-6">{currentQuestion.question_text}</h3>
                
                <div className="space-y-3 my-6">
                  {currentQuestion.options?.map((option) => (
                    <Button
                      key={option.id}
                      variant={
                        showingAnswer 
                          ? option.is_correct 
                            ? "outline" 
                            : selectedOption === option.id 
                              ? "outline" 
                              : "ghost"
                          : "outline"
                      }
                      className={`w-full justify-start text-left h-auto py-3 px-4 ${
                        showingAnswer && (
                          option.is_correct 
                            ? "border-green-500 bg-green-50" 
                            : selectedOption === option.id 
                              ? "border-red-500 bg-red-50"
                              : ""
                        )
                      }`}
                      onClick={() => handleSelectOption(option.id)}
                      disabled={showingAnswer}
                    >
                      {option.option_text}
                      
                      {showingAnswer && option.is_correct && (
                        <Check className="ml-auto h-5 w-5 text-green-500" />
                      )}
                      
                      {showingAnswer && !option.is_correct && selectedOption === option.id && (
                        <X className="ml-auto h-5 w-5 text-red-500" />
                      )}
                    </Button>
                  ))}
                </div>
                
                {showingRating && (
                  <div className="mt-8 border-t pt-6">
                    <h4 className="text-sm font-medium mb-2">How would you rate your recall?</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ratingDescriptions.map((rating) => (
                        <Button
                          key={rating.value}
                          variant="outline"
                          className={`h-auto py-2 flex flex-col items-center ${
                            rating.value <= 2 ? "hover:border-red-500" : "hover:border-green-500"
                          }`}
                          onClick={() => submitRating(rating.value)}
                        >
                          <span className="text-lg">
                            {rating.value <= 2 ? (
                              <ThumbsDown className={`h-5 w-5 mb-1 ${rating.value === 0 ? "text-red-600" : "text-orange-500"}`} />
                            ) : (
                              <ThumbsUp className={`h-5 w-5 mb-1 ${rating.value === 5 ? "text-green-600" : "text-blue-500"}`} />
                            )}
                          </span>
                          <span className="font-medium text-sm">{rating.label}</span>
                          <span className="text-xs text-muted-foreground">{rating.description}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {!showingAnswer && !showingRating && (
                  <div className="flex justify-end">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Timer className="h-4 w-4" />
                      <span>Time recorded for scoring</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p>No question data available.</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="bg-slate-50 border-t px-6 py-4">
            <div className="flex justify-between items-center w-full">
              {currentItemIndex > 0 ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentItemIndex(prev => prev - 1);
                    setShowingAnswer(false);
                    setShowingRating(false);
                    setSelectedOption(null);
                    setStartTime(Date.now());
                    setPoints(null);
                  }}
                  disabled={showingRating}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
              ) : (
                <div></div>
              )}
              
              {!showingAnswer && !showingRating && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowingAnswer(true);
                    setTimeout(() => setShowingRating(true), 500);
                  }}
                >
                  Show Answer
                </Button>
              )}
              
              {showingAnswer && !showingRating && (
                <Button 
                  variant="default" 
                  onClick={() => setShowingRating(true)}
                >
                  Rate Recall <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </StudentLayout>
  );
};

// Define a trophy icon component
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

export default SpacedRepetitionReview;
