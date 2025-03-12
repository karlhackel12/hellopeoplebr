
import React from 'react';
import { Seed, Sprout, LeafyGreen, Flower2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoaderDuration = 'quick' | 'standard' | 'extended';

interface GardenLoaderProps {
  duration?: LoaderDuration;
  className?: string;
}

const durationConfig = {
  quick: 'animate-[growth_800ms_ease-in-out_infinite]',
  standard: 'animate-[growth_2s_ease-in-out_infinite]',
  extended: 'animate-[growth_4s_ease-in-out_infinite]'
};

const GardenLoader: React.FC<GardenLoaderProps> = ({ 
  duration = 'standard',
  className 
}) => {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <div className={cn(
        "relative flex items-center justify-center",
        durationConfig[duration]
      )}>
        <Seed className="absolute h-6 w-6 opacity-0 growth-stage-1" />
        <Sprout className="absolute h-6 w-6 opacity-0 growth-stage-2" />
        <LeafyGreen className="absolute h-6 w-6 opacity-0 growth-stage-3" />
        <Flower2 className="absolute h-6 w-6 opacity-0 growth-stage-4" />
      </div>
    </div>
  );
};

export default GardenLoader;
