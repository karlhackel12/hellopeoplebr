
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

// Rating descriptions for SM-2 algorithm
const ratingDescriptions = [
  { value: 0, label: "Complete blackout", description: "I didn't remember at all" },
  { value: 1, label: "Incorrect response", description: "I recognized the answer though" },
  { value: 2, label: "Incorrect response", description: "But the answer feels familiar" },
  { value: 3, label: "Correct response", description: "But with significant difficulty" },
  { value: 4, label: "Correct response", description: "After some hesitation" },
  { value: 5, label: "Perfect response", description: "Immediate recall" }
];

interface RecallRatingSystemProps {
  onRateRecall: (rating: number) => void;
  isSubmitting: boolean;
}

const RecallRatingSystem: React.FC<RecallRatingSystemProps> = ({ 
  onRateRecall, 
  isSubmitting 
}) => {
  return (
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
            onClick={() => onRateRecall(rating.value)}
            disabled={isSubmitting}
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
  );
};

export default RecallRatingSystem;
