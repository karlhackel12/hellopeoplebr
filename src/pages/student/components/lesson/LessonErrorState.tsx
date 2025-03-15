
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const LessonErrorState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Lição não encontrada</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        A lição solicitada não foi encontrada ou pode ter sido removida. Verifique se o link está correto ou volte para suas lições.
      </p>
      <Link to="/student/lessons">
        <Button variant="default">
          Voltar para minhas lições
        </Button>
      </Link>
    </div>
  );
};

export default LessonErrorState;
