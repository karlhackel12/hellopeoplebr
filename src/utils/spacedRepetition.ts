
/**
 * Spaced Repetition System using the SM-2 algorithm for optimizing memory retention
 */

// Quality response: 0-5 where:
// 0 = complete blackout, didn't remember at all
// 1 = incorrect response but recognized the correct answer
// 2 = incorrect response but upon seeing the answer it felt familiar
// 3 = correct response but with difficulty
// 4 = correct response after hesitation
// 5 = perfect response

export interface RepetitionItem {
  easeFactor: number;
  intervalDays: number;
  streak: number;
  nextReviewDate: Date;
}

/**
 * Calculate the next review date based on the SM-2 algorithm
 * @param qualityResponse User's quality of response (0-5)
 * @param previousEaseFactor Previous ease factor
 * @param previousInterval Previous interval in days
 * @param previousStreak Previous streak count
 * @returns RepetitionItem with updated values
 */
export function calculateNextReview(
  qualityResponse: number,
  previousEaseFactor: number = 2.5,
  previousInterval: number = 1,
  previousStreak: number = 0
): RepetitionItem {
  // Ensure quality response is within valid range
  qualityResponse = Math.min(5, Math.max(0, qualityResponse));
  
  let newEaseFactor = previousEaseFactor;
  let newInterval = previousInterval;
  let newStreak = previousStreak;
  
  // Calculate new ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // where q is the quality of response
  const easeDelta = 0.1 - (5 - qualityResponse) * (0.08 + (5 - qualityResponse) * 0.02);
  newEaseFactor = Math.max(1.3, previousEaseFactor + easeDelta);
  
  // Calculate the next interval and streak
  if (qualityResponse < 3) {
    // If the response was poor, we reset
    newInterval = 1;
    newStreak = 0;
  } else {
    // If the response was good, we increase the interval
    if (newStreak === 0) {
      newInterval = 1;
    } else if (newStreak === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(previousInterval * newEaseFactor);
    }
    newStreak += 1;
  }
  
  // Calculate the next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
  return {
    easeFactor: newEaseFactor,
    intervalDays: newInterval,
    streak: newStreak,
    nextReviewDate
  };
}

/**
 * Calculate points based on response time and quality
 * @param responseTimeMs Time taken to respond in milliseconds
 * @param qualityResponse Quality of the response (0-5)
 * @param maxTimeMs Maximum time allowed in milliseconds
 * @returns Points earned
 */
export function calculatePoints(
  responseTimeMs: number, 
  qualityResponse: number,
  maxTimeMs: number = 10000
): number {
  if (qualityResponse < 3) {
    // No points for incorrect answers
    return 0;
  }
  
  // Base points for correct answer
  const basePoints = 100;
  
  // Time bonus - the faster, the more points (up to double)
  const timeRatio = Math.min(1, 1 - (responseTimeMs / maxTimeMs));
  const timeBonus = timeRatio * 100;
  
  // Quality bonus - better quality, more points
  const qualityBonus = (qualityResponse - 3) * 50;
  
  // Calculate total points
  return Math.round(basePoints + timeBonus + qualityBonus);
}
