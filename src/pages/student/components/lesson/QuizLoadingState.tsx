
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const QuizLoadingState: React.FC = () => {
  return (
    <Card className="border shadow-sm">
      <CardContent className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary/70" />
          <p className="text-muted-foreground">Carregando dados do quiz...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizLoadingState;
