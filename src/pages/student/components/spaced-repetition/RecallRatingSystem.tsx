
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RecallRatingSystemProps {
  onRate: (rating: number) => void;
  disabled?: boolean;
}

const RecallRatingSystem: React.FC<RecallRatingSystemProps> = ({ onRate, disabled = false }) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  const ratings = [
    { value: 0, label: 'Esqueci Completamente', color: 'bg-red-500' },
    { value: 1, label: 'Lembrei com Muita Dificuldade', color: 'bg-red-400' },
    { value: 2, label: 'Lembrei com Dificuldade', color: 'bg-orange-400' },
    { value: 3, label: 'Lembrei Razoavelmente', color: 'bg-yellow-500' },
    { value: 4, label: 'Lembrei Bem', color: 'bg-green-400' },
    { value: 5, label: 'Lembrei Perfeitamente', color: 'bg-green-500' }
  ];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-1 h-10">
        {ratings.map((rating) => (
          <div 
            key={rating.value}
            className="flex-1 flex flex-col items-center"
            onMouseEnter={() => setHoveredRating(rating.value)}
            onMouseLeave={() => setHoveredRating(null)}
          >
            <div 
              className={cn(
                "w-full h-2 rounded transition-all",
                hoveredRating !== null && hoveredRating >= rating.value ? rating.color : 'bg-gray-200'
              )}
            />
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {ratings.map((rating) => (
          <Button
            key={rating.value}
            variant="outline"
            className={cn(
              "h-auto py-3 px-2 text-xs font-normal",
              hoveredRating === rating.value && "border-[#9b87f5] bg-purple-50"
            )}
            onClick={() => onRate(rating.value)}
            disabled={disabled}
            onMouseEnter={() => setHoveredRating(rating.value)}
            onMouseLeave={() => setHoveredRating(null)}
          >
            {rating.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RecallRatingSystem;
