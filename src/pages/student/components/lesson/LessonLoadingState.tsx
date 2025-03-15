
import React from 'react';
import { Loader2 } from 'lucide-react';

const LessonLoadingState: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-24">
      <Loader2 className="h-10 w-10 animate-spin text-primary/70 mb-4" />
      <p className="text-muted-foreground animate-pulse">Carregando conteúdo da lição...</p>
    </div>
  );
};

export default LessonLoadingState;
