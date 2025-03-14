
import { useUser } from './spaced-repetition/useUser';
import { useSpacedRepetitionDueItems } from './spaced-repetition/useSpacedRepetitionDueItems';
import { useSpacedRepetitionStats } from './spaced-repetition/useSpacedRepetitionStats';
import { useSpacedRepetitionPoints } from './spaced-repetition/useSpacedRepetitionPoints';
import { useSpacedRepetitionUserStats } from './spaced-repetition/useSpacedRepetitionUserStats';
import { useAddSpacedRepetitionItem } from './spaced-repetition/useAddSpacedRepetitionItem';
import { useAddQuestionsFromQuiz } from './spaced-repetition/useAddQuestionsFromQuiz';
import { useRecordReview } from './spaced-repetition/useRecordReview';

export interface ReviewResult {
  reviewStat: any;
  points: number;
  nextReviewDate: Date;
}

export const useSpacedRepetition = () => {
  const { userId } = useUser();
  const { dueItems, isLoading: isLoadingDueItems, refetch: refetchDueItems } = useSpacedRepetitionDueItems(userId);
  const { itemStats, isLoading: isLoadingStats } = useSpacedRepetitionStats(userId);
  const { totalPoints } = useSpacedRepetitionPoints(userId);
  const { userStats } = useSpacedRepetitionUserStats(userId);
  const { addItem } = useAddSpacedRepetitionItem(userId);
  const { addQuestionsFromQuiz } = useAddQuestionsFromQuiz(userId);
  const { recordReview } = useRecordReview(userId);

  return {
    dueItems,
    itemStats,
    totalPoints,
    userStats,
    isLoading: isLoadingDueItems || isLoadingStats,
    addItem,
    recordReview,
    addQuestionsFromQuiz,
    refetchDueItems
  };
};
