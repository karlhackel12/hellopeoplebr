
import React from 'react';
import { Loader2 } from 'lucide-react';

const LessonLoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
    </div>
  );
};

export default LessonLoadingState;
