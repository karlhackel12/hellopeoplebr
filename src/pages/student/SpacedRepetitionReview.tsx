
import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useSpacedRepetitionReview } from './hooks/useSpacedRepetitionReview';

// Import the components
import ReviewProgress from './components/spaced-repetition/ReviewProgress';
import ReviewQuestionCard from './components/spaced-repetition/ReviewQuestionCard';
import ReviewCompletionSummary from './components/spaced-repetition/ReviewCompletionSummary';

const SpacedRepetitionReview: React.FC = () => {
  const {
    dueItems,
    isLoading,
    currentItemIndex,
    showingAnswer,
    showingRating,
    selectedOption,
    points,
    reviewComplete,
    correctCount,
    totalReviewed,
    totalPointsEarned,
    isSubmitting,
    currentQuestion,
    handleSelectOption,
    handleShowAnswer,
    handleRateRecall,
    handleBack,
    handlePrevious
  } = useSpacedRepetitionReview();
  
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
