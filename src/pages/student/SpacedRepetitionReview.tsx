
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '@/components/layout/StudentLayout';
import { useSpacedRepetition } from './hooks/useSpacedRepetition';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

// Import the new components
import ReviewProgress from './components/spaced-repetition/ReviewProgress';
import ReviewQuestionCard from './components/spaced-repetition/ReviewQuestionCard';
import ReviewCompletionSummary from './components/spaced-repetition/ReviewCompletionSummary';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const currentItem = dueItems?.[currentItemIndex];
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
  
  const handleShowAnswer = () => {
    setShowingAnswer(true);
    setTimeout(() => setShowingRating(true), 500);
  };
  
  const handleRateRecall = async (rating: number) => {
    // Special case for when clicking "Rate Recall" button, which passes -1
    if (rating === -1) {
      setShowingRating(true);
      return;
    }
    
    if (!currentItem || isSubmitting) return;
    
    setIsSubmitting(true);
    const endTime = Date.now();
    const responseTimeMs = startTime ? endTime - startTime : 5000;
    
    try {
      // Use await to properly handle the Promise
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
      
      // Now we can safely access result.points
      if (result && result.points) {
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
          setIsSubmitting(false);
        }, 1500);
      } else {
        // All items reviewed
        setReviewComplete(true);
        refetchDueItems();
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast.error('Failed to record your response');
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    navigate('/student/spaced-repetition');
  };
  
  const handlePrevious = () => {
    setCurrentItemIndex(prev => prev - 1);
    setShowingAnswer(false);
    setShowingRating(false);
    setSelectedOption(null);
    setStartTime(Date.now());
    setPoints(null);
  };
  
  return (
    <StudentLayout>
      <div className="container mx-auto p-4">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
        
        {reviewComplete ? (
          <ReviewCompletionSummary
            correctCount={correctCount}
            totalReviewed={totalReviewed}
            totalPointsEarned={totalPointsEarned}
            onBack={handleBack}
          />
        ) : (
          <>
            <ReviewProgress
              currentItemIndex={currentItemIndex}
              totalItems={dueItems.length}
              points={points}
            />
            
            <ReviewQuestionCard
              currentQuestion={currentQuestion}
              selectedOption={selectedOption}
              showingAnswer={showingAnswer}
              showingRating={showingRating}
              isSubmitting={isSubmitting}
              currentItemIndex={currentItemIndex}
              totalItems={dueItems.length}
              points={points}
              onSelectOption={handleSelectOption}
              onShowAnswer={handleShowAnswer}
              onRateRecall={handleRateRecall}
              onPrevious={handlePrevious}
            />
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default SpacedRepetitionReview;
