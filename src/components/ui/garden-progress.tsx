
import React, { useEffect, useState } from 'react';
import { Sprout, LeafyGreen, Flower2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GardenProgressProps {
  value: number;
  className?: string;
  showParticles?: boolean;
}

const GardenProgress: React.FC<GardenProgressProps> = ({ 
  value, 
  className,
  showParticles = true
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);
  
  useEffect(() => {
    if (value !== previousValue) {
      setShouldAnimate(true);
      setPreviousValue(value);
      
      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [value, previousValue]);

  const getGrowthIcon = () => {
    if (value < 25) return <Sprout className="h-6 w-6" />;
    if (value < 75) return <LeafyGreen className="h-6 w-6" />;
    return <Flower2 className="h-6 w-6" />;
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Progress Circle */}
      <svg className="w-12 h-12 transform -rotate-90">
        <circle
          className="text-muted stroke-current"
          strokeWidth="2"
          fill="none"
          r="20"
          cx="24"
          cy="24"
        />
        <circle
          className="text-primary stroke-current transition-all duration-500 ease-in-out"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          r="20"
          cx="24"
          cy="24"
          strokeDasharray={`${value * 1.25}, 125.6`}
        />
      </svg>
      
      {/* Growth Icon */}
      <div className={cn(
        "absolute transform transition-transform duration-500",
        shouldAnimate && "animate-bounce"
      )}>
        {getGrowthIcon()}
      </div>
      
      {/* Celebration Particles */}
      {showParticles && shouldAnimate && value > 0 && value % 25 === 0 && (
        <div className="absolute inset-0">
          <Sparkles className="absolute top-0 right-0 h-4 w-4 text-primary animate-fade-out" />
          <Sparkles className="absolute bottom-0 left-0 h-4 w-4 text-primary animate-fade-out" />
          <Sparkles className="absolute top-0 left-0 h-4 w-4 text-primary animate-fade-out" />
          <Sparkles className="absolute bottom-0 right-0 h-4 w-4 text-primary animate-fade-out" />
        </div>
      )}
    </div>
  );
};

export default GardenProgress;
