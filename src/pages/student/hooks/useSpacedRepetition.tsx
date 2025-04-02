
import { useUser } from './spaced-repetition/useUser';
import { useSpacedRepetitionDueItems } from './spaced-repetition/useSpacedRepetitionDueItems';
import { useSpacedRepetitionStats } from './spaced-repetition/useSpacedRepetitionStats';
import { useSpacedRepetitionPoints } from './spaced-repetition/useSpacedRepetitionPoints';
import { useSpacedRepetitionUserStats } from './spaced-repetition/useSpacedRepetitionUserStats';
import { useAddSpacedRepetitionItem } from './spaced-repetition/useAddSpacedRepetitionItem';
import { useAddQuestionsFromQuiz } from './spaced-repetition/useAddQuestionsFromQuiz';
import { useRecordReview } from './spaced-repetition/useRecordReview';

// Standardized ReviewResult interface
export interface ReviewResult {
  reviewStat: {
    id: string;
    item_id: string;
    user_id: string;
    quality_response: number;
    response_time_ms: number;
    points_earned: number;
    streak: number;
    interval_days: number;
    ease_factor: number;
    review_date: string;
  };
  points: number;
  nextReviewDate: Date;
}

export const useSpacedRepetition = () => {
  const { userId, isLoading: isLoadingUser } = useUser();
  const { dueItems, isLoading: isLoadingDueItems, refetch: refetchDueItems } = useSpacedRepetitionDueItems(userId);
  const { itemStats, isLoading: isLoadingStats } = useSpacedRepetitionStats(userId);
  const { totalPoints } = useSpacedRepetitionPoints(userId);
  const { userStats } = useSpacedRepetitionUserStats(userId);
  const { addItem } = useAddSpacedRepetitionItem(userId);
  const { addQuestionsFromQuiz } = useAddQuestionsFromQuiz(userId);
  const { recordReview } = useRecordReview(userId);

  // Combine all loading states
  const isLoading = isLoadingUser || isLoadingDueItems || isLoadingStats;

  return {
    dueItems,
    itemStats,
    totalPoints,
    userStats,
    isLoading,
    addItem,
    recordReview,
    addQuestionsFromQuiz,
    refetchDueItems
  };
};
